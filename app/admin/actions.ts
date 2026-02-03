"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type AdminLoginResult = { error?: string } | { redirect: true };

export async function adminLogin(formData: FormData): Promise<AdminLoginResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { error: "Введите email и пароль." };
  }
  const supabase = await createClient();
  const { error: err } = await supabase.auth.signInWithPassword({ email, password });
  if (err) {
    return {
      error: err.message === "Invalid login credentials" ? "Неверный email или пароль." : err.message,
    };
  }
  // Проверку роли не делаем здесь: в этом запросе cookies сессии могут ещё не быть доступны для RLS.
  // Роль проверяется в layout админки при загрузке /admin/slots — там куки уже есть.
  return { redirect: true };
}
