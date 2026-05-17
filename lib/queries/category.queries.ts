import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();
  return data ?? null;
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("slug");
  return (data ?? []).map((c) => c.slug);
}
