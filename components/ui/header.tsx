import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LocaleSwitcher } from "./locale-switcher";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          VBlog
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {t("home")}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
