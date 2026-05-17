import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { PostDetail } from "@/lib/queries/post.queries";
import { TagBadge } from "./tag-badge";
import { estimateReadTime } from "@/lib/queries/post.queries";

const LANG_LABEL: Record<string, string> = { vi: "Tiếng Việt", en: "English", ja: "日本語" };

type Props = { post: PostDetail };

export async function PostHeader({ post }: Props) {
  const tags = post.post_tags.flatMap((pt) => (pt.tags ? [pt.tags] : []));
  const readTime = estimateReadTime(post.content_json);
  const t = await getTranslations("post");

  return (
    <header className="mb-8 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900">
          {LANG_LABEL[post.language] ?? post.language}
        </span>
        {post.categories && (
          <Link
            href={`/category/${post.categories.slug}`}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {post.categories.name}
          </Link>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{post.title}</h1>

      {post.excerpt && (
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">{post.excerpt}</p>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        {post.profiles?.avatar_url ? (
          <Image
            src={post.profiles.avatar_url}
            alt={post.profiles.display_name ?? ""}
            width={36}
            height={36}
            className="rounded-full"
          />
        ) : (
          <span className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500">
            {(post.profiles?.display_name ?? "?")[0]}
          </span>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {post.profiles?.display_name ?? post.profiles?.username ?? "Ẩn danh"}
          </span>
          <span className="text-xs text-gray-400">
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
            {" · "}
            {t("readTime", { n: readTime })}
          </span>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
          ))}
        </div>
      )}
    </header>
  );
}
