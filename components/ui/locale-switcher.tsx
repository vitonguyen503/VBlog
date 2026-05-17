"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/lib/actions/locale.actions";

const LOCALES = [
  { code: "vi", flag: "🇻🇳" },
  { code: "en", flag: "🇬🇧" },
  { code: "ja", flag: "🇯🇵" },
];

export function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currentLocale = useLocale();
  const t = useTranslations("locale");

  const handleChange = (code: string) => {
    if (code === currentLocale) return;
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-0.5" aria-label="Language switcher">
      {LOCALES.map(({ code, flag }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          disabled={isPending}
          title={t(code as "vi" | "en" | "ja")}
          className={`text-base px-1 py-0.5 rounded transition-opacity disabled:cursor-wait ${
            currentLocale === code
              ? "opacity-100"
              : "opacity-35 hover:opacity-70"
          }`}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
