import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/editor/post-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Viết bài mới" };

export default async function WritePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/write");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Bài viết mới</h1>
      <PostForm categories={categories ?? []} />
    </div>
  );
}
