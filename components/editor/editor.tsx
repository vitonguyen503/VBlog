"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import type { JSONContent } from "@tiptap/react";
import { EditorToolbar } from "./editor-toolbar";

const lowlight = createLowlight(common);

type Props = {
  initialContent?: JSONContent | null;
  onChange: (content: JSONContent) => void;
};

export function Editor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image.configure({ allowBase64: false, inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: "Bắt đầu viết bài của bạn..." }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialContent ?? undefined,
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-gray dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
