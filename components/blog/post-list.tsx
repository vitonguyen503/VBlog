import type { PostListItem } from "@/lib/queries/post.queries";
import { PostCard } from "./post-card";

type Props = { posts: PostListItem[] };

export function PostList({ posts }: Props) {
  if (!posts.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-20">
        Chưa có bài viết nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
