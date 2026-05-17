"use server";

import { cookies } from "next/headers";

const ALLOWED_LOCALES = ["vi", "en", "ja"];

export async function setLocale(locale: string): Promise<void> {
  if (!ALLOWED_LOCALES.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}
