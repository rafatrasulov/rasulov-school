import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: sections }] = await Promise.all([
    user ? supabase.from("profiles").select("grade").eq("id", user.id).single() : Promise.resolve({ data: null }),
    supabase
      .from("sections")
      .select("id, title, order, published, grade")
      .eq("published", true)
      .order("order", { ascending: true }),
  ]);

  const studentGrade = profile?.grade ?? null;
  const filteredSections = (sections ?? []).filter(
    (s) => s.grade == null || studentGrade == null || s.grade === studentGrade
  );

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-foreground">Личный кабинет</h1>
      <p className="mt-2 text-muted-foreground">
        Разделы курса по вашему классу. Выберите раздел, чтобы перейти к темам и заданиям.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSections.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border p-8 text-center sm:col-span-2 lg:col-span-3">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Пока нет разделов для вашего класса. Укажите класс в профиле или подождите, пока учитель добавит разделы.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSections.map((section) => (
            <Card key={section.id} className="rounded-2xl border-border/50 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  {section.grade != null && (
                    <span className="rounded-lg bg-primary/15 w-fit px-2 py-0.5 text-sm font-medium text-primary">
                      {section.grade} класс
                    </span>
                  )}
                  <Button asChild variant="outline" className="w-full justify-start rounded-xl h-auto py-4 text-left font-semibold" size="lg">
                    <Link href={`/dashboard/sections/${section.id}`}>
                      {section.title}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild className="rounded-xl">
          <Link href="/#calendar">Записаться на урок</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </div>
  );
}
