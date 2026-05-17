import Link from "next/link";

export default function WriterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 px-3">
          Writer
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/write"
            className="rounded-md px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Viết bài mới
          </Link>
          <Link
            href="/my-posts"
            className="rounded-md px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Bài của tôi
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
