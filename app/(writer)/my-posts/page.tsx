import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bài của tôi" };

export default async function MyPostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-posts");

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, status, language, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bài của tôi</h1>
        <Link
          href="/write"
          className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 text-sm font-medium hover:opacity-90"
        >
          + Viết bài mới
        </Link>
      </div>

      {!posts?.length ? (
        <p className="text-gray-500 dark:text-gray-400">
          Chưa có bài viết nào.{" "}
          <Link href="/write" className="underline">
            Bắt đầu viết ngay
          </Link>
          !
        </p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const isDraft = post.status !== "published";
            return (
              <div
                key={post.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                  isDraft
                    ? "border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    : "border-green-200 dark:border-green-900 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full self-center ${
                      isDraft ? "bg-amber-400" : "bg-green-500"
                    }`}
                  />
                  <div>
                    <Link
                      href={`/edit/${post.id}`}
                      className={`font-medium hover:underline ${
                        isDraft ? "text-gray-600 dark:text-gray-400" : ""
                      }`}
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString("vi-VN")
                        : ""}{" "}
                      · {post.language.toUpperCase()}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    isDraft
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                  }`}
                >
                  {isDraft ? "Nháp" : "Đã đăng"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

