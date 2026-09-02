'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { API_URL } from '@/lib/knowledge-api';
import { saveAuth } from '@/lib/auth-client';

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage('');
    const response = await fetch(`${API_URL}/api/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mode === 'login' ? { username, password } : { username, email, password }) });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setMessage(data.message || '인증에 실패했습니다.'); return; }
    saveAuth(data); router.push('/'); router.refresh();
  }

  return <div className="portal-page"><Header/><main className="portal-main grid min-h-[calc(100vh-130px)] place-items-center"><div className="panel w-full max-w-md overflow-hidden"><div className="border-b border-[#c4c6cf] bg-[#f2f4f6] p-6"><span className="mono text-[11px] text-[#06b6d4]">SECURE ACCESS</span><h1 className="mt-2 text-2xl font-bold text-[#002045]">{mode === 'login' ? 'Engineer Login' : 'Create Account'}</h1><p className="mt-2 text-sm text-[#545f72]">Spring Security 보호 세션에 접속합니다.</p></div><form onSubmit={submit} className="space-y-5 p-6">{message&&<p className="border-l-2 border-red-600 bg-red-50 p-3 text-xs text-red-800">{message}</p>}<label><span className="mb-2 block mono text-[11px] text-[#545f72]">USERNAME</span><input value={username} onChange={e=>setUsername(e.target.value)} required minLength={3} className="field"/></label>{mode==='register'&&<label><span className="mb-2 block mono text-[11px] text-[#545f72]">EMAIL</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="field"/></label>}<label><span className="mb-2 block mono text-[11px] text-[#545f72]">PASSWORD</span><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required minLength={mode==='register'?10:1} className="field"/></label><button disabled={loading} className="btn-primary w-full">{loading?'처리 중...':mode==='login'?'로그인':'계정 생성'}</button><button type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setMessage('')}} className="w-full text-sm text-blue-700 hover:underline">{mode==='login'?'일반 사용자 계정 만들기':'기존 계정으로 로그인'}</button></form></div></main><Footer/></div>;
}
