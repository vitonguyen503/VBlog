"use client";

import { useRef } from "react";
import type { Editor } from "@tiptap/react";
import { createClient } from "@/lib/supabase/client";

type Props = { editor: Editor };

export function ImageUploadButton({ editor }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File tối đa 5MB");
      return;
    }

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `inline/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, file);

    if (error) {
      alert("Upload thất bại: " + error.message);
      return;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    editor.chain().focus().setImage({ src: data.publicUrl }).run();
    e.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        title="Chèn ảnh"
        onClick={() => inputRef.current?.click()}
        className="px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        🖼
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
