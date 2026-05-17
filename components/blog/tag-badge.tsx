import Link from "next/link";

type Props = { name: string; slug: string };

export function TagBadge({ name, slug }: Props) {
  return (
    <Link
      href={`/tag/${slug}`}
      className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      #{name}
    </Link>
  );
}
