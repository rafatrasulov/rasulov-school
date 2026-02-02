import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "teacher") {
    redirect("/admin/slots");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-foreground">
            RasulovSchool — Личный кабинет
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-xl gap-2">
              <Link href="/dashboard/profile">
                <User className="h-4 w-4" />
                Профиль
              </Link>
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm" className="rounded-xl gap-2">
                <LogOut className="h-4 w-4" />
                Выход
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
