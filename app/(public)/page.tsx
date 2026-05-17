import { getPosts } from "@/lib/queries/post.queries";
import { getCategories } from "@/lib/queries/category.queries";
import { PostList } from "@/components/blog/post-list";
import { Pagination } from "@/components/blog/pagination";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = { title: "VBlog — Chia sẻ kiến thức" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const [{ posts, total, pageSize }, categories] = await Promise.all([
    getPosts(page),
    getCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài viết mới nhất</h1>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <PostList posts={posts} />
      <Pagination total={total} pageSize={pageSize} current={page} basePath="/" />
    </div>
  );
}

