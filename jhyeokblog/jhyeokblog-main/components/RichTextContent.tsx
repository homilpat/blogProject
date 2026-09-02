'use client';

import dynamic from 'next/dynamic';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import '@uiw/react-markdown-preview/markdown.css';

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((module) => module.default),
  { ssr: false },
);

function HtmlContent({ content }: { content: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit, Image.configure({ allowBase64: false }), TableKit],
    content,
    editorProps: { attributes: { class: 'rich-post-content' } },
  });

  return <EditorContent editor={editor} />;
}

export default function RichTextContent({ content }: { content: string }) {
  if (/<[a-z][\s\S]*>/i.test(content)) return <HtmlContent content={content} />;
  return <MarkdownPreview source={content} style={{ background: 'transparent' }} />;
}
