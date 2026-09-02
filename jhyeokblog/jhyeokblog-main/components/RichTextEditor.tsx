'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TableKit } from '@tiptap/extension-table';
import { authFetch } from '@/lib/auth-client';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeContent(value: string) {
  if (!value.trim()) return '<p></p>';
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`)
    .join('');
}

export default function RichTextEditor({ value, onChange }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function uploadImages(files: File[]) {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (!images.length || !editor) return;

    setUploading(true);
    setMessage('이미지 업로드 중...');
    try {
      for (const file of images) {
        const body = new FormData();
        body.append('file', file);
        const response = await authFetch('/api/uploads/images', { method: 'POST', body });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || '이미지 업로드에 실패했습니다.');
        editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      }
      setMessage('이미지를 잡아 문단 사이로 이동하거나 모서리에서 크기를 조절하세요.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      Image.configure({
        allowBase64: false,
        resize: {
          enabled: true,
          minWidth: 120,
          minHeight: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({ placeholder: '본문을 입력하거나 이미지를 끌어다 놓으세요.' }),
    ],
    content: normalizeContent(value),
    editorProps: {
      attributes: { class: 'rich-editor-content' },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []);
        if (!files.some((file) => file.type.startsWith('image/'))) return false;
        event.preventDefault();
        void uploadImages(files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        if (!files.some((file) => file.type.startsWith('image/'))) return false;
        event.preventDefault();
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (position) editor?.chain().focus().setTextSelection(position.pos).run();
        void uploadImages(files);
        return true;
      },
    },
    onUpdate: ({ editor: updatedEditor }) => onChange(updatedEditor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const next = normalizeContent(value);
    if (editor.getHTML() !== next) editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  function chooseImages(event: ChangeEvent<HTMLInputElement>) {
    void uploadImages(Array.from(event.target.files || []));
    event.target.value = '';
  }

  if (!editor) return <div className="rich-editor-loading">편집기 불러오는 중...</div>;

  const tool = (active: boolean) => `editor-tool${active ? ' is-active' : ''}`;

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        <button type="button" className={tool(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>굵게</button>
        <button type="button" className={tool(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>기울임</button>
        <button type="button" className={tool(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>제목</button>
        <button type="button" className={tool(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>목록</button>
        <button type="button" className={tool(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>인용</button>
        <button type="button" className={tool(editor.isActive('table'))} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>＋ 표</button>
        {editor.isActive('table') && <>
          <button type="button" className="editor-tool" onClick={() => editor.chain().focus().addRowAfter().run()}>행 추가</button>
          <button type="button" className="editor-tool" onClick={() => editor.chain().focus().deleteRow().run()}>행 삭제</button>
          <button type="button" className="editor-tool" onClick={() => editor.chain().focus().addColumnAfter().run()}>열 추가</button>
          <button type="button" className="editor-tool" onClick={() => editor.chain().focus().deleteColumn().run()}>열 삭제</button>
          <button type="button" className="editor-tool" onClick={() => editor.chain().focus().deleteTable().run()}>표 삭제</button>
        </>}
        <button type="button" className="editor-tool editor-image-button" disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? '업로드 중...' : '＋ 이미지'}
        </button>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/gif" multiple hidden onChange={chooseImages} />
      </div>
      <EditorContent editor={editor} />
      <div className="rich-editor-help">{message || 'JPG, PNG, GIF · 최대 10MB · 드래그앤드롭과 붙여넣기 지원'}</div>
    </div>
  );
}
