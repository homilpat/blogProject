'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/auth?error=' + encodeURIComponent(error.message))
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect('/auth?error=' + encodeURIComponent(error.message))
  }

  // 성공 시 이메일 확인 안내 메시지와 함께 인증 페이지로 리다이렉트
  redirect('/auth?message=' + encodeURIComponent('가입하신 이메일로 인증 링크가 발송되었습니다. 메일함을 확인해주세요.'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
