import { createClient } from "@/lib/supabase/server";

export type CommentProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string;
};

export type CommentWithProfile = {
  id: string;
  content: string;
  parent_id: string | null;
  created_at: string | null;
  author_id: string;
  post_id: string;
  profiles: CommentProfile | null;
};

export async function getCommentCount(postId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);
  return count ?? 0;
}
