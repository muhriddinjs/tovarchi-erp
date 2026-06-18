'use server'

import { revalidatePath } from 'next/cache'
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

  // ASOSIY O'ZGARISH SHU YERDA:
  if (error) {
    // 1. Vercel server loglari uchun haqiqiy xatoni konsolga chiqaramiz
    console.error("Supabase'dan haqiqiy xato keldi:", error.message)

    // 2. Ekranga (UI) qotirilgan matn emas, haqiqiy xato matnini qaytaramiz
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}