"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { CommentWithProfile } from "@/lib/queries/comment.queries";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";

const COMMENT_SELECT =
  "id, content, parent_id, created_at, author_id, post_id, profiles!author_id(id, display_name, avatar_url, username)";

type Props = {
  postId: string;
  postAuthorId: string;
  currentUserId?: string;
};

export function CommentThread({ postId, postAuthorId, currentUserId }: Props) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("comment");

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("comments") as any)
      .select(COMMENT_SELECT)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: unknown[] | null }) => {
        setComments((data ?? []) as CommentWithProfile[]);
        setLoading(false);
      });
  }, [postId]);

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => !!c.parent_id);
  const isPostAuthor = currentUserId === postAuthorId;

  const handleAdded = (comment: CommentWithProfile) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-8">
      <h2 className="text-lg font-semibold">
        {loading ? t("title") : t("count", { n: comments.length })}
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">{t("loading")}</p>
      ) : (
        <div className="space-y-6">
          {topLevel.length === 0 && (
            <p className="text-sm text-gray-400">{t("empty")}</p>
          )}
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              replies={replies.filter((r) => r.parent_id === comment.id)}
              currentUserId={currentUserId}
              isPostAuthor={isPostAuthor}
              onReplyAdded={handleAdded}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      <div className="pt-2">
        {currentUserId ? (
          <CommentForm postId={postId} onSuccess={handleAdded} />
        ) : (
          <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg px-4 py-3">
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {t("loginCta")}
            </Link>{" "}
            {t("loginSuffix")}
          </p>
        )}
      </div>
    </section>
  );
}
