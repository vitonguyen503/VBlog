import { createClient } from "@/lib/supabase/server";

export type PostAuthor = {
  display_name: string | null;
  avatar_url: string | null;
  username: string;
};

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  language: string;
  published_at: string | null;
  profiles: PostAuthor | null;
  categories: { name: string; slug: string } | null;
  post_tags: { tags: { name: string; slug: string } | null }[];
};

export type PostDetail = PostListItem & {
  content_json: unknown;
  author_id: string;
};

export const PAGE_SIZE = 12;

const POST_SELECT = [
  "id, title, slug, excerpt, cover_image_url, language, published_at",
  "profiles!author_id(display_name, avatar_url, username)",
  "categories(name, slug)",
  "post_tags(tags(name, slug))",
].join(", ");

type QueryResult = { data: unknown[] | null; count: number | null; error: unknown };

async function queryPosts(
  filters: (q: ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>) => ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>,
  page: number
): Promise<{ posts: PostListItem[]; total: number; pageSize: number }> {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base = (supabase.from("posts") as any).select(POST_SELECT, { count: "exact" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = (await (filters(base) as any)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)) as QueryResult;

  if (error) throw error;
  return { posts: (data ?? []) as PostListItem[], total: count ?? 0, pageSize: PAGE_SIZE };
}

export async function getPosts(page = 1) {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from("posts") as any)
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (error) throw error;
  return { posts: (data ?? []) as PostListItem[], total: (count ?? 0) as number, pageSize: PAGE_SIZE };
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("posts") as any)
    .select(`${POST_SELECT}, content_json, author_id`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !data) return null;
  return data as PostDetail;
}

export async function getPostsByCategory(categorySlug: string, page = 1) {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", categorySlug)
    .single();
  if (!category) return null;

  const offset = (page - 1) * PAGE_SIZE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from("posts") as any)
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (error) throw error;
  return { category, posts: (data ?? []) as PostListItem[], total: (count ?? 0) as number, pageSize: PAGE_SIZE };
}

export async function getPostsByTag(tagSlug: string, page = 1) {
  const supabase = await createClient();
  const { data: tag } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", tagSlug)
    .single();
  if (!tag) return null;

  const { data: postTagRows } = await supabase
    .from("post_tags")
    .select("post_id")
    .eq("tag_id", tag.id);
  const ids = (postTagRows ?? []).map((pt) => pt.post_id);
  if (!ids.length) return { tag, posts: [] as PostListItem[], total: 0, pageSize: PAGE_SIZE };

  const offset = (page - 1) * PAGE_SIZE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, count, error } = await (supabase.from("posts") as any)
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .in("id", ids)
    .order("published_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (error) throw error;
  return { tag, posts: (data ?? []) as PostListItem[], total: (count ?? 0) as number, pageSize: PAGE_SIZE };
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("slug").eq("status", "published");
  return (data ?? []).map((p) => p.slug);
}

// Estimate read time in minutes from Tiptap JSON
export function estimateReadTime(contentJson: unknown): number {
  if (!contentJson || typeof contentJson !== "object") return 1;
  const text = extractText(contentJson as Record<string, unknown>);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function extractText(node: Record<string, unknown>): string {
  if (node.text) return String(node.text) + " ";
  if (!Array.isArray(node.content)) return "";
  return (node.content as Record<string, unknown>[]).map(extractText).join("");
}

// ignore queryPosts helper (unused but kept to avoid linting noise)
void queryPosts;
