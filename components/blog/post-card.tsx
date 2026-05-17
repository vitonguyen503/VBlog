import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { PostListItem } from "@/lib/queries/post.queries";
import { TagBadge } from "./tag-badge";

const LANG_LABEL: Record<string, string> = { vi: "VI", en: "EN", ja: "JA" };

type Props = { post: PostListItem };

export async function PostCard({ post }: Props) {
  const t = await getTranslations("time");
  const tags = post.post_tags.flatMap((pt) => (pt.tags ? [pt.tags] : []));

  const relativeTime = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return t("today");
    if (days === 1) return t("yesterday");
    if (days < 7) return t("daysAgo", { n: days });
    if (days < 30) return t("weeksAgo", { n: Math.floor(days / 7) });
    if (days < 365) return t("monthsAgo", { n: Math.floor(days / 30) });
    return new Date(date).toLocaleDateString();
  };

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md dark:hover:shadow-gray-900 transition-shadow">
      {post.cover_image_url && (
        <Link href={`/${post.slug}`} className="block aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            width={640}
            height={360}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}

      <div className="flex flex-col gap-3 p-4 flex-1">
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

        <Link href={`/${post.slug}`}>
          <h2 className="font-semibold text-base leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{post.excerpt}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          {post.profiles?.avatar_url ? (
            <Image
              src={post.profiles.avatar_url}
              alt={post.profiles.display_name ?? ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
              {(post.profiles?.display_name ?? "?")[0]}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {post.profiles?.display_name ?? post.profiles?.username ?? "Ẩn danh"}
          </span>
          {post.published_at && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-xs text-gray-400">{relativeTime(post.published_at)}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
