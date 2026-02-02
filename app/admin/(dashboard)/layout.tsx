import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, LogOut } from "lucide-react";
import { logout } from "../actions";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border bg-card p-4">
        <nav className="flex flex-row md:flex-col gap-2">
          <Link href="/admin/slots">
            <Button variant="ghost" className="w-full justify-start gap-2 rounded-xl" size="sm">
              <Calendar className="h-4 w-4" />
              Слоты
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="ghost" className="w-full justify-start gap-2 rounded-xl" size="sm">
              <FileText className="h-4 w-4" />
              Заявки
            </Button>
          </Link>
          <div className="flex-1" />
          <form action={logout}>
            <Button type="submit" variant="ghost" className="w-full justify-start gap-2 rounded-xl text-muted-foreground" size="sm">
              <LogOut className="h-4 w-4" />
              Выход
            </Button>
          </form>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
