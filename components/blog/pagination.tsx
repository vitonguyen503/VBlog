import Link from "next/link";

type Props = {
  total: number;
  pageSize: number;
  current: number;
  basePath: string;
};

export function Pagination({ total, pageSize, current, basePath }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const sep = basePath.includes("?") ? "&" : "?";
    return `${basePath}${sep}page=${p}`;
  };

  return (
    <nav className="flex items-center justify-center gap-4 py-10" aria-label="Phân trang">
      {current > 1 ? (
        <Link
          href={buildUrl(current - 1)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ← Trang trước
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm text-gray-300 dark:text-gray-600">← Trang trước</span>
      )}

      <span className="text-sm text-gray-500">
        {current} / {totalPages}
      </span>

      {current < totalPages ? (
        <Link
          href={buildUrl(current + 1)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Trang sau →
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm text-gray-300 dark:text-gray-600">Trang sau →</span>
      )}
    </nav>
  );
}
