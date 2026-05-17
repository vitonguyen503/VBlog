"use server";

import { createClient } from "@/lib/supabase/server";
import type { CommentWithProfile } from "@/lib/queries/comment.queries";

export async function addComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<CommentWithProfile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 2000) throw new Error("Nội dung không hợp lệ (1–2000 ký tự)");

  if (parentId) {
    const { data: parent } = await supabase
      .from("comments")
      .select("post_id")
      .eq("id", parentId)
      .single();
    if (!parent || parent.post_id !== postId) throw new Error("Parent comment không hợp lệ");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, content: trimmed, parent_id: parentId ?? null })
    .select("id")
    .single();

  if (insertError || !inserted) throw new Error("Không thể thêm bình luận");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("comments") as any)
    .select("id, content, parent_id, created_at, author_id, post_id, profiles!author_id(id, display_name, avatar_url, username)")
    .eq("id", inserted.id)
    .single();

  return data as unknown as CommentWithProfile;
}

export async function deleteComment(commentId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new Error("Không có quyền xóa hoặc bình luận không tồn tại");
}
