"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "../actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return adminLogin(formData);
    },
    null as { error?: string } | { redirect: true } | null
  );

  useEffect(() => {
    if (state && "redirect" in state && state.redirect) {
      window.location.href = "/admin/slots";
    }
  }, [state]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Вход для учителя</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Введите email и пароль от учётной записи.
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          {state && "error" in state && state.error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="teacher@example.com"
              className="rounded-xl"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-xl"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
            {isPending ? "Вход..." : "Войти"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            На главную
          </Link>
        </p>
      </div>
    </main>
  );
}
