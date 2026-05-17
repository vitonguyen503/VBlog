"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ display_name: displayName || null, bio: bio || null })
        .eq("id", profile.id);

      if (updateError) {
        setError("Cập nhật thất bại. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 rounded-lg px-3 py-2">
          Hồ sơ đã được cập nhật.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="display_name">
          Tên hiển thị
        </label>
        <input
          id="display_name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={80}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={profile.username}
          disabled
          className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400">Username không thể thay đổi.</p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="bio">
          Giới thiệu
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          rows={4}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{bio.length}/300</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
