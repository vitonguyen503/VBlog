import { notFound } from "next/navigation";
import { getPostsByCategory } from "@/lib/queries/post.queries";
import { PostList } from "@/components/blog/post-list";
import { Pagination } from "@/components/blog/pagination";
import type { Metadata } from "next";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPostsByCategory(slug);
  if (!result) return {};
  return { title: `${result.category.name} — VBlog` };
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const [{ slug }, { page: pageStr }] = await Promise.all([params, searchParams]);
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const result = await getPostsByCategory(slug, page);
  if (!result) notFound();

  const { category, posts, total, pageSize } = result;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{total} bài viết</p>
      </div>
      <PostList posts={posts} />
      <Pagination
        total={total}
        pageSize={pageSize}
        current={page}
        basePath={`/category/${slug}`}
      />
    </div>
  );
}
