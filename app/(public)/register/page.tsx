"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function StudentRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert(
        { id: data.user.id, role: "student" },
        { onConflict: "id" }
      );
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-muted/20 to-background">
      <div className="w-full max-w-md glass rounded-xl p-8 animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text">Регистрация ученика</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Создайте учётную запись, чтобы пользоваться личным кабинетом.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="glass-strong rounded-lg p-3 text-sm text-destructive border border-destructive/30">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Имя (необязательно)</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Иванов"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="password">Пароль *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Минимум 6 символов"
              className="rounded-xl"
            />
          </div>
          <Button type="submit" className="w-full rounded-lg glass-strong hover:bg-primary hover:scale-105 transition-all py-6 text-lg" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
        <p className="mt-6 text-center text-base text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:text-accent transition-colors font-medium">
            Вход
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
