export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {year} VBlog — Chia sẻ kiến thức.
      </div>
    </footer>
  );
}
