import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, ClipboardList, FileText, Home, LogOut, User, Users } from "lucide-react";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ data: profile }, { data: firstTeacher }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("profiles").select("id").eq("role", "teacher").order("created_at", { ascending: true }).limit(1).maybeSingle(),
  ]);

  if (profile?.role !== "teacher") {
    redirect("/admin/login");
  }

  const isFirstTeacher = firstTeacher?.id === user.id;

  const navBtn = "w-full justify-start gap-3 rounded-xl text-base hover:bg-primary/10 hover:text-primary";
  const iconClass = "h-5 w-5 shrink-0";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border bg-muted/30 md:bg-card p-5">
        <nav className="flex flex-row md:flex-col gap-1">
          <span className="hidden md:block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Образование</span>
          <Link href="/admin/sections">
            <Button variant="ghost" className={navBtn} size="default">
              <BookOpen className={iconClass} />
              Предметы
            </Button>
          </Link>
          <Link href="/admin/diagnostic">
            <Button variant="ghost" className={navBtn} size="default">
              <ClipboardList className={iconClass} />
              Диагностика
            </Button>
          </Link>
          <span className="hidden md:block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Запись</span>
          <Link href="/admin/slots">
            <Button variant="ghost" className={navBtn} size="default">
              <Calendar className={iconClass} />
              Слоты
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="ghost" className={navBtn} size="default">
              <FileText className={iconClass} />
              Заявки
            </Button>
          </Link>
          <span className="hidden md:block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Ученики</span>
          <Link href="/admin/students">
            <Button variant="ghost" className={navBtn} size="default">
              <Users className={iconClass} />
              Все ученики
            </Button>
          </Link>
          <span className="hidden md:block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Аккаунт</span>
          <Link href="/admin/profile">
            <Button variant="ghost" className={navBtn} size="default">
              <User className={iconClass} />
              Профиль
            </Button>
          </Link>
          <div className="flex-1" />
          <form action={logout}>
            <Button type="submit" variant="ghost" className={`${navBtn} text-muted-foreground`} size="default">
              <LogOut className={iconClass} />
              Выход
            </Button>
          </form>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
