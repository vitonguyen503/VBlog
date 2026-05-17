"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CommentWithProfile } from "@/lib/queries/comment.queries";
import { deleteComment } from "@/lib/actions/comment.actions";
import { CommentForm } from "./comment-form";

type Props = {
  comment: CommentWithProfile;
  replies?: CommentWithProfile[];
  postId: string;
  currentUserId?: string;
  isPostAuthor: boolean;
  onReplyAdded: (comment: CommentWithProfile) => void;
  onDeleted: (id: string) => void;
};

export function CommentItem({
  comment,
  replies = [],
  postId,
  currentUserId,
  isPostAuthor,
  onReplyAdded,
  onDeleted,
}: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("comment");
  const tTime = useTranslations("time");

  const relativeTime = (date: string | null): string => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return tTime("justNow");
    if (mins < 60) return tTime("minutesAgo", { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return tTime("hoursAgo", { n: hours });
    const days = Math.floor(hours / 24);
    if (days < 30) return tTime("daysAgo", { n: days });
    return new Date(date).toLocaleDateString();
  };

  const displayName =
    comment.profiles?.display_name ?? comment.profiles?.username ?? "Ẩn danh";
  const canDelete =
    currentUserId &&
    (currentUserId === comment.author_id || isPostAuthor);
  const isTopLevel = !comment.parent_id;

  const handleDelete = async () => {
    if (!confirm("Xác nhận xóa bình luận này?")) return;
    setIsDeleting(true);
    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {comment.profiles?.avatar_url ? (
          <Image
            src={comment.profiles.avatar_url}
            alt={displayName}
            width={32}
            height={32}
            className="rounded-full shrink-0 mt-0.5 object-cover"
            style={{ width: 32, height: 32 }}
          />
        ) : (
          <span className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
            {displayName[0]}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-gray-400">{relativeTime(comment.created_at)}</span>
          </div>

          <p className="text-sm mt-1 whitespace-pre-wrap break-words leading-relaxed">
            {comment.content}
          </p>

          <div className="flex items-center gap-3 mt-2">
            {currentUserId && isTopLevel && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showReplyForm ? t("cancel") : t("reply")}
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? t("deleting") : t("delete")}
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                placeholder={`Trả lời ${displayName}...`}
                onSuccess={(c) => {
                  setShowReplyForm(false);
                  onReplyAdded(c);
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-11 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              isPostAuthor={isPostAuthor}
              onReplyAdded={onReplyAdded}
              onDeleted={onDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
