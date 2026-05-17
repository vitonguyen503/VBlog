"use client";

import type { Editor } from "@tiptap/react";
import { ImageUploadButton } from "./image-upload";

type Props = { editor: Editor | null };

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-sm font-mono ${
        active
          ? "bg-gray-200 dark:bg-gray-600"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5" />;
}

export function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const addLink = () => {
    if (editor.state.selection.empty) return;
    const url = window.prompt("Nhập URL:");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <strong>B</strong>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <em>I</em>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Gạch ngang">
        <s>S</s>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
        `c`
      </Btn>
      <Sep />
      {([1, 2, 3] as const).map((level) => (
        <Btn
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          active={editor.isActive("heading", { level })}
          title={`Heading ${level}`}
        >
          H{level}
        </Btn>
      ))}
      <Sep />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Danh sách">
        •—
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Danh sách số">
        1—
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Trích dẫn">
        ❝
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
        {"</>"}
      </Btn>
      <Btn onClick={addLink} active={editor.isActive("link")} title="Link">
        🔗
      </Btn>
      <Sep />
      <ImageUploadButton editor={editor} />
    </div>
  );
}
