"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import type { Category } from "@/lib/types/database";
import { Editor } from "./editor";
import { createPost, updatePost, deletePost } from "@/lib/actions/post.actions";

type Props = {
  postId?: string;
  initialData?: {
    title: string;
    content_json: JSONContent | null;
    excerpt: string | null;
    category_id: number | null;
    language: "vi" | "en" | "ja";
    tags: string[];
    status: "draft" | "published";
  };
  categories: Category[];
};

export function PostForm({ postId, initialData, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState<JSONContent | null>(
    initialData?.content_json ?? null
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id?.toString() ?? ""
  );
  const [language, setLanguage] = useState<"vi" | "en" | "ja">(
    initialData?.language ?? "vi"
  );
  const [tagInput, setTagInput] = useState(
    initialData?.tags.join(", ") ?? ""
  );

  const getTags = () =>
    tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

  const handleSave = (status: "draft" | "published") => {
    if (!title.trim()) { setError("Tiêu đề không được để trống"); return; }
    if (!content) { setError("Nội dung không được để trống"); return; }
    setError(null);

    startTransition(async () => {
      try {
        const payload = {
          title,
          content_json: content,
          excerpt: excerpt || null,
          category_id: categoryId ? Number(categoryId) : null,
          language,
          status,
          tags: getTags(),
        };

        if (postId) {
          await updatePost(postId, payload);
          router.refresh();
        } else {
          const result = await createPost(payload);
          router.push(`/edit/${result.id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      }
    });
  };

  const handleDelete = () => {
    if (!postId || !confirm("Xác nhận xóa bài viết này?")) return;
    startTransition(async () => {
      try {
        await deletePost(postId);
        router.push("/my-posts");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Xóa thất bại");
      }
    });
  };

  const currentStatus = initialData?.status ?? "draft";

  return (
    <div className="space-y-6 max-w-4xl">
      {postId && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              currentStatus === "published"
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentStatus === "published" ? "bg-green-500" : "bg-amber-400"
              }`}
            />
            {currentStatus === "published" ? "Đã đăng" : "Bản nháp — chưa công khai"}
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded px-3 py-2">
          {error}
        </p>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề bài viết..."
        className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
      />

      <Editor
        initialContent={initialData?.content_json}
        onChange={setContent}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1.5 text-sm"
          >
            <option value="">— Không có —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Ngôn ngữ</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "vi" | "en" | "ja")}
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1.5 text-sm"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">
            Tags <span className="font-normal">(phân cách bằng dấu phẩy)</span>
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="react, nextjs, tips"
            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">
          Tóm tắt <span className="font-normal">(tùy chọn, tối đa 300 ký tự)</span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Mô tả ngắn về bài viết..."
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => handleSave("draft")}
          disabled={isPending}
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Đang lưu..." : "Lưu nháp"}
        </button>
        <button
          type="button"
          onClick={() => handleSave("published")}
          disabled={isPending}
          className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Đang xử lý..." : "Đăng bài"}
        </button>
        {postId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="ml-auto text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            Xóa bài
          </button>
        )}
      </div>
    </div>
  );
}
