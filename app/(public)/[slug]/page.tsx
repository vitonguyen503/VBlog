import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug } from "@/lib/queries/post.queries";
import { createClient } from "@/lib/supabase/server";
import { PostHeader } from "@/components/blog/post-header";
import { PostContent } from "@/components/blog/post-content";
import { CommentThread } from "@/components/comment/comment-thread";
import type { Metadata } from "next";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      authors: post.profiles?.display_name
        ? [post.profiles.display_name]
        : undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [post, supabase] = await Promise.all([getPostBySlug(slug), createClient()]);
  if (!post) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-3xl mx-auto">
      {post.cover_image_url && (
        <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            width={900}
            height={506}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      )}

      <PostHeader post={post} />
      <PostContent content={post.content_json} />

      <CommentThread
        postId={post.id}
        postAuthorId={post.author_id}
        currentUserId={user?.id}
      />
    </div>
  );
}
