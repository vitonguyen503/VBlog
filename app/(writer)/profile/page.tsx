import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hồ sơ" };

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Hồ sơ của bạn</h1>

      <div className="flex items-center gap-4 mb-8">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name ?? profile.username}
            className="h-16 w-16 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-semibold">
            {(profile.display_name ?? profile.username)[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold">{profile.display_name ?? profile.username}</p>
          <p className="text-sm text-gray-500">@{profile.username}</p>
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
