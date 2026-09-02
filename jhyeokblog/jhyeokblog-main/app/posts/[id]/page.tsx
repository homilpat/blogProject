'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RichTextContent from '@/components/RichTextContent';
import { API_URL } from '@/lib/knowledge-api';
import { authFetch as fetch } from '@/lib/auth-client';

type Post = { id: number; title: string; summary?: string; content: string; tags?: string; categoryName?: string; createdAt: string; viewCount?: number; isIndexedInRag?: boolean };

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/posts/${id}`).then((response) => response.ok ? response.json() : Promise.reject()).then(setPost).catch(() => setPost(null)).finally(() => setLoading(false));
  }, [id]);

  async function reindex() {
    setAction('재색인 중...');
    const response = await fetch(`${API_URL}/api/posts/${id}/reindex`, { method: 'POST' });
    setAction(response.ok ? '재색인을 요청했습니다.' : '재색인에 실패했습니다.');
  }

  async function remove() {
    if (!confirm('이 게시물과 RAG 벡터를 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return;
    const response = await fetch(`${API_URL}/api/posts/${id}`, { method: 'DELETE' });
    if (response.ok) router.push('/'); else setAction('삭제에 실패했습니다.');
  }

  return <div className="portal-page"><Header/><main className="portal-main">
    {loading ? <div className="panel py-20 text-center mono text-sm">LOADING DOCUMENT...</div> : !post ? <div className="panel py-20 text-center">게시물을 찾을 수 없습니다.</div> :
      <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
        <article className="panel overflow-hidden"><header className="border-b border-[#e0e3e5] bg-[#f2f4f6] p-7"><div className="flex flex-wrap items-center gap-3"><span className="border border-sky-200 bg-sky-100 px-2 py-1 mono text-[11px] text-sky-800">{post.categoryName || '미분류'}</span><span className="mono text-[11px] text-[#545f72]">DOC-{String(post.id).padStart(5, '0')}</span></div><h1 className="mt-5 text-3xl font-bold leading-tight text-[#002045]">{post.title}</h1>{post.summary && <p className="mt-4 text-base leading-6 text-[#43474e]">{post.summary}</p>}</header><div className="p-8"><RichTextContent content={post.content}/></div></article>
        <aside className="space-y-4"><section className="panel p-4"><h2 className="mono text-xs font-bold text-[#1a365d]">DOCUMENT STATUS</h2><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><dt className="text-[#545f72]">RAG Index</dt><dd className={`font-bold ${post.isIndexedInRag ? 'text-emerald-700' : 'text-amber-700'}`}>{post.isIndexedInRag ? 'ACTIVE' : 'PENDING'}</dd></div><div className="flex justify-between"><dt>Views</dt><dd className="mono">{post.viewCount || 0}</dd></div><div className="flex justify-between"><dt>Published</dt><dd className="mono">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</dd></div></dl></section><section className="panel space-y-2 p-4"><Link href={`/posts/${id}/edit`} className="btn-primary block text-center text-sm">게시물 수정</Link><button onClick={reindex} className="btn-secondary w-full text-sm">RAG 재색인</button><button onClick={remove} className="w-full rounded-[4px] border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">게시물 삭제</button>{action && <p className="pt-2 text-xs text-[#545f72]">{action}</p>}</section></aside>
      </div>}
  </main><Footer/></div>;
}
