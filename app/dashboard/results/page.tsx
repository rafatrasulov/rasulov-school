import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, ChevronRight } from "lucide-react";

export default async function DashboardResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from("assignment_submissions")
    .select(`
      id,
      assignment_id,
      score,
      teacher_feedback,
      updated_at,
      assignments!inner(
        id,
        title,
        topic_id,
        topics!inner(id, title, section_id, sections!inner(id, title))
      )
    `)
    .eq("user_id", user.id)
    .not("score", "is", null)
    .order("updated_at", { ascending: false });

  const submissions = (rows ?? []).map((r) => {
    const a = r.assignments as unknown as { id: string; title: string; topic_id: string; topics: { id: string; title: string; section_id: string; sections: { id: string; title: string } } };
    const topic = a?.topics;
    const section = topic?.sections;
    return {
      id: r.id,
      assignment_id: r.assignment_id,
      assignmentTitle: a?.title ?? "—",
      topicTitle: topic?.title ?? "—",
      sectionId: section?.id,
      sectionTitle: section?.title ?? "—",
      score: r.score,
      teacher_feedback: r.teacher_feedback,
      updated_at: r.updated_at,
    };
  });

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-foreground">Результаты работ</h1>
      <p className="mt-2 text-muted-foreground">
        Оценки и комментарии учителя по вашим заданиям.
      </p>

      {submissions.length === 0 ? (
        <Card className="mt-8 rounded-2xl border-dashed border-border p-8 text-center">
          <CardContent>
            <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Пока нет проверенных работ. Выполняйте задания в разделах предметов — после проверки учителем здесь появится оценка и комментарий.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/dashboard">К предметам</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {submissions.map((s) => (
            <Card key={s.id} className="rounded-2xl border-border/50 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {s.sectionTitle} · {s.topicTitle}
                    </p>
                    <CardTitle className="text-lg mt-1">{s.assignmentTitle}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xl font-bold text-primary">{s.score}</span>
                    <span className="text-sm text-muted-foreground">баллов</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {s.teacher_feedback && (
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                    <p className="text-sm font-medium text-primary mb-1">Комментарий учителя:</p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{s.teacher_feedback}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Проверено: {new Date(s.updated_at).toLocaleString("ru-RU")}</span>
                  <Button asChild variant="ghost" size="sm" className="rounded-lg gap-1">
                    <Link href={`/dashboard/assignments/${s.assignment_id}`}>
                      Открыть задание
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
