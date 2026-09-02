'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RichTextEditor from '@/components/RichTextEditor';
import { API_URL, Category, fetchCategories } from '@/lib/knowledge-api';
import { authFetch as fetch } from '@/lib/auth-client';
import { hasRichTextContent } from '@/lib/rich-text';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [learningDirections, setLearningDirections] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchCategories(), fetch(`${API_URL}/api/posts/${id}`).then((response) => response.json())]).then(([availableCategories, post]) => {
      setCategories(availableCategories); setTitle(post.title); setSummary(post.summary || ''); setKeyPoints(post.keyPoints || ''); setLearningDirections(post.learningDirections || ''); setContent(post.content); setCategoryId(String(post.categoryId));
    });
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !hasRichTextContent(content)) {
      alert('제목과 본문을 입력해주세요.');
      return;
    }
    setSaving(true);
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary, keyPoints, learningDirections, content, categoryId: Number(categoryId), tags: '' }),
    });
    setSaving(false);
    if (response.ok) router.push(`/posts/${id}`); else alert('수정에 실패했습니다.');
  }

  return <div className="portal-page"><Header/><main className="portal-main">
    <span className="mono text-[11px] text-[#06b6d4]">DOCUMENT REVISION</span><h1 className="mt-2 text-3xl font-bold text-[#002045]">게시물 수정</h1><p className="mt-2 text-sm text-[#545f72]">이미지를 이동하거나 크기를 조절한 뒤 저장할 수 있습니다.</p>
    <form onSubmit={submit} className="mt-7 space-y-5">
      <section className="panel grid gap-5 p-6 md:grid-cols-2"><label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">제목 *</span><input required value={title} onChange={(event) => setTitle(event.target.value)} className="field"/></label><label><span className="mb-2 block text-sm font-semibold">요약</span><input value={summary} onChange={(event) => setSummary(event.target.value)} className="field"/></label><label><span className="mb-2 block text-sm font-semibold">지식 분류</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></section>
      <section className="panel overflow-hidden"><div className="border-b border-[#e0e3e5] bg-[#f2f4f6] px-5 py-3 mono text-xs font-bold">TECHNICAL CONTENT</div><RichTextEditor value={content} onChange={setContent}/></section>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => router.back()} className="btn-secondary">취소</button><button disabled={saving} className="btn-primary">{saving ? '재색인 중...' : '수정 및 재색인'}</button></div>
    </form>
  </main><Footer/></div>;
}
