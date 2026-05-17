import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/editor/post-form";
import type { Metadata } from "next";
import type { JSONContent } from "@tiptap/react";

export const metadata: Metadata = { title: "Chỉnh sửa bài viết" };

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/edit/${id}`);

  const [{ data: post }, { data: categories }, { data: postTags }] =
    await Promise.all([
      supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("author_id", user.id)
        .single(),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("post_tags")
        .select("tag_id, tags(name)")
        .eq("post_id", id),
    ]);

  if (!post) notFound();

  const tags = (postTags ?? []).flatMap((pt) => {
    const t = pt.tags as { name: string } | null;
    return t ? [t.name] : [];
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Chỉnh sửa bài viết</h1>
      <PostForm
        postId={id}
        initialData={{
          title: post.title,
          content_json: post.content_json as JSONContent | null,
          excerpt: post.excerpt,
          category_id: post.category_id,
          language: post.language as "vi" | "en" | "ja",
          tags,
          status: post.status as "draft" | "published",
        }}
        categories={categories ?? []}
      />
    </div>
  );
}
