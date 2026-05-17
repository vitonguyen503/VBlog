"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("userMenu");

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  if (!mounted) return <div className="h-8 w-8" aria-hidden />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md px-3 py-1.5 text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity"
      >
        {t("signIn")}
      </Link>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const displayName = (user.user_metadata?.full_name as string) ?? user.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Mở menu người dùng"
        className="flex items-center rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName ?? "avatar"}
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold">
            {displayName?.[0]?.toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-52 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link
            href="/write"
            onClick={() => setOpen(false)}
            className="flex px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("write")}
          </Link>
          <Link
            href="/my-posts"
            onClick={() => setOpen(false)}
            className="flex px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("myPosts")}
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("profile")}
          </Link>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t("signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
