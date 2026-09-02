'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RichTextEditor from '@/components/RichTextEditor';
import { API_URL } from '@/lib/knowledge-api';
import { authFetch as fetch } from '@/lib/auth-client';
import { hasRichTextContent } from '@/lib/rich-text';

type DraftMetadata = {
  title: string;
  summary: string;
  key_points: string[];
  learning_directions: string[];
  category_id: number;
  category_name: string;
};

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  async function generateMetadata(): Promise<DraftMetadata | null> {
    setStatus('AI가 제목·요약·핵심 내용·학습 방향을 만들고 있습니다...');
    try {
      const response = await fetch(`${API_URL}/api/rag/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: title.trim() || null }),
      });
      if (response.status === 401) {
        setStatus('로그인이 만료되었습니다. 다시 로그인한 뒤 시도해주세요.');
        return null;
      }
      if (!response.ok) {
        const detail = await response.text();
        setStatus(`AI 분석 실패 (${response.status})${detail ? `: ${detail}` : ''}`);
        return null;
      }
      return response.json();
    } catch {
      setStatus('AI 분석 요청이 브라우저에서 차단됐습니다. localhost:3000으로 접속하거나 서버 상태를 확인해주세요.');
      return null;
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!hasRichTextContent(content)) {
      alert('게시할 본문을 입력해주세요.');
      return;
    }

    setSaving(true);
    const metadata = await generateMetadata();
    if (!metadata) {
      setSaving(false);
      return;
    }

    setStatus(`학습 정리 생성 완료 · ${metadata.category_name} · 게시 중...`);
    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: metadata.title,
        summary: metadata.summary,
        keyPoints: JSON.stringify(metadata.key_points),
        learningDirections: JSON.stringify(metadata.learning_directions),
        categoryId: Number(metadata.category_id),
        content,
        tags: '',
      }),
    });
    setSaving(false);

    if (response.ok) {
      const post = await response.json();
      router.push(`/posts/${post.id}`);
      router.refresh();
    } else if (response.status === 401) {
      setStatus('로그인이 만료되었습니다. 다시 로그인해주세요.');
    } else {
      const detail = await response.text();
      setStatus(`게시물 등록 실패 (${response.status})${detail ? `: ${detail}` : ''}`);
    }
  }

  return <div className="portal-page"><Header/><main className="portal-main">
    <div className="mb-7"><span className="mono text-[11px] text-[#06b6d4]">AI KNOWLEDGE INGESTION</span><h1 className="mt-2 text-3xl font-bold text-[#002045]">새 게시물 올리기</h1><p className="mt-2 text-sm text-[#545f72]">제목은 선택 사항입니다. AI가 요약, 핵심 내용, 학습 방향과 실제 주제 카테고리를 자동으로 생성합니다.</p></div>
    <form onSubmit={submit} className="space-y-5">
      <section className="panel p-6"><label><span className="mb-2 block text-sm font-semibold">제목 <span className="font-normal text-[#667080]">(선택)</span></span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className="field" placeholder="비워두면 AI가 본문을 보고 자동으로 작성합니다"/></label></section>
      <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#e0e3e5] bg-[#f2f4f6] px-5 py-3"><span className="mono text-xs font-bold text-[#1a365d]">POST CONTENT *</span><span className="mono text-[10px] text-[#545f72]">TITLE · SUMMARY · CATEGORY AUTO</span></div><RichTextEditor value={content} onChange={setContent}/></section>
      <div className="flex flex-wrap items-center gap-3">{status && <span className="mono text-xs text-[#008aa3]">{status}</span>}<div className="ml-auto flex gap-3"><button type="button" onClick={() => router.back()} className="btn-secondary">취소</button><button disabled={saving} className="btn-primary">{saving ? 'AI 생성 및 등록 중...' : 'AI 자동 작성 후 게시'}</button></div></div>
    </form>
  </main><Footer/></div>;
}
