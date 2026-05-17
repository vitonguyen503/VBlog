"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import type { Database, Json } from "@/lib/types/database";

export type PostInput = {
  title: string;
  content_json: Json;
  excerpt?: string | null;
  category_id?: number | null;
  language: "vi" | "en" | "ja";
  status: "draft" | "published";
  tags?: string[];
};

async function makeUniqueSlug(
  supabase: SupabaseClient<Database>,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title) || "post";
  let slug = base;
  let n = 2;
  while (true) {
    let q = supabase.from("posts").select("id").eq("slug", slug);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

async function syncPostTags(
  supabase: SupabaseClient<Database>,
  postId: string,
  tagNames: string[]
): Promise<void> {
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (!tagNames.length) return;

  const upsertData = tagNames.map((name) => ({
    name: name.trim().slice(0, 50),
    slug: slugify(name.trim()) || name.trim().toLowerCase(),
  }));

  const { data: tags } = await supabase
    .from("tags")
    .upsert(upsertData, { onConflict: "slug", ignoreDuplicates: false })
    .select("id");

  if (!tags?.length) return;
  await supabase
    .from("post_tags")
    .insert(tags.map((t) => ({ post_id: postId, tag_id: t.id })));
}

export async function createPost(
  input: PostInput
): Promise<{ id: string; slug: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const slug = await makeUniqueSlug(supabase, input.title);
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      slug,
      content_json: input.content_json,
      excerpt: input.excerpt ?? null,
      category_id: input.category_id ?? null,
      language: input.language,
      status: input.status,
      author_id: user.id,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await syncPostTags(supabase, post.id, input.tags ?? []);

  if (input.status === "published") {
    revalidateTag("posts");
    revalidatePath("/");
  }
  return post;
}

export async function updatePost(
  id: string,
  input: Partial<PostInput>
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { data: existing } = await supabase
    .from("posts")
    .select("author_id, slug, status")
    .eq("id", id)
    .single();
  if (!existing || existing.author_id !== user.id) throw new Error("Forbidden");

  const { tags, ...rest } = input;
  type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
  const updates: PostUpdate = { ...rest };

  if (input.title) {
    updates.slug = await makeUniqueSlug(supabase, input.title, id);
  }
  if (input.status === "published" && existing.status !== "published") {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("posts").update(updates).eq("id", id);
  if (error) throw new Error(error.message);

  if (tags !== undefined) await syncPostTags(supabase, id, tags);

  if (input.status === "published") {
    revalidateTag("posts");
    revalidatePath(`/post/${updates.slug ?? existing.slug}`);
    revalidatePath("/");
  }
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) throw new Error(error.message);

  revalidateTag("posts");
  revalidatePath("/");
}
