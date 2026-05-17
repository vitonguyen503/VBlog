import { createClient } from "@/lib/supabase/server";

export async function getTagBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();
  return data ?? null;
}
