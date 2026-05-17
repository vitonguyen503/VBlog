"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { addComment } from "@/lib/actions/comment.actions";
import type { CommentWithProfile } from "@/lib/queries/comment.queries";

const MAX_LEN = 2000;

type Props = {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onSuccess: (comment: CommentWithProfile) => void;
  onCancel?: () => void;
};

export function CommentForm({ postId, parentId, placeholder, onSuccess, onCancel }: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("comment");

  const handleSubmit = () => {
    if (!content.trim() || content.length > MAX_LEN) return;
    setError(null);
    startTransition(async () => {
      try {
        const comment = await addComment(postId, content, parentId);
        setContent("");
        onSuccess(comment);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("placeholder"));
      }
    });
  };

  const overLimit = content.length > MAX_LEN;

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder ?? t("placeholder")}
        rows={3}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${overLimit ? "text-red-500" : "text-gray-400"}`}>
          {content.length} / {MAX_LEN}
        </span>
        <div className="flex gap-2 items-center">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1"
            >
              {t("cancel")}
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || overLimit || isPending}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isPending ? t("sending") : t("send")}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
