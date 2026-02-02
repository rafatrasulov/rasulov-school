"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Неверный email или пароль." : err.message);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role === "teacher") {
      await supabase.auth.signOut();
      setError("Для входа учителя используйте кнопку «Вход для учителя». ");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-secondary/20 to-white relative overflow-hidden">
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(13,148,136,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px'}} aria-hidden />
      
      <div className="relative w-full max-w-md glass rounded-2xl p-8 md:p-10 animate-slide-up shadow-xl">
        <h1 className="text-4xl font-bold gradient-text">Вход для ученика</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Введите email и пароль от учётной записи.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="glass-strong rounded-lg p-3 text-sm text-destructive border border-destructive/30">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <Button type="submit" className="w-full rounded-lg glass-strong hover:bg-primary hover:scale-105 transition-all py-6 text-lg" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
        <p className="mt-6 text-center text-base text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-primary hover:text-accent transition-colors font-medium">
            Регистрация
          </Link>
        </p>
        <p className="mt-3 text-center text-base text-muted-foreground">
          <Link href="/" className="text-primary hover:text-accent transition-colors font-medium">
            На главную
          </Link>
        </p>
      </div>
    </main>
  );
}
