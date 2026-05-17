import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/react";

const EXTENSIONS = [StarterKit, ImageExt, LinkExt];

type Props = { content: unknown };

export function PostContent({ content }: Props) {
  if (!content || typeof content !== "object") return null;

  let html = "";
  try {
    html = generateHTML(content as JSONContent, EXTENSIONS);
  } catch {
    return null;
  }

  return (
    <article
      className="prose prose-gray dark:prose-invert max-w-none
        prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-img:rounded-lg prose-pre:bg-gray-900 prose-pre:text-gray-100"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
