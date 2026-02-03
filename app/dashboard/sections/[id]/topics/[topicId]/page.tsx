import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileQuestion, Play } from "lucide-react";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id: sectionId, topicId } = await params;
  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, section_id")
    .eq("id", topicId)
    .eq("section_id", sectionId)
    .eq("published", true)
    .single();

  if (!topic) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, video_url, content, order")
    .eq("topic_id", topicId)
    .eq("published", true)
    .order("order", { ascending: true });

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, type, order")
    .eq("topic_id", topicId)
    .eq("published", true)
    .order("order", { ascending: true });

  // Fetch submissions for current user
  const { data: { user } } = await supabase.auth.getUser();
  const submissionsMap = new Map<string, { score: number | null }>();
  
  if (user && assignments && assignments.length > 0) {
    const assignmentIds = assignments.map(a => a.id);
    const { data: submissions } = await supabase
      .from("assignment_submissions")
      .select("assignment_id, score")
      .eq("user_id", user.id)
      .in("assignment_id", assignmentIds);
    
    if (submissions) {
      submissions.forEach(sub => {
        submissionsMap.set(sub.assignment_id, { score: sub.score });
      });
    }
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <Button asChild variant="ghost" size="sm" className="rounded-xl mb-4 gap-2">
        <Link href={`/dashboard/sections/${sectionId}`}>
          <ChevronLeft className="h-4 w-4" />
          Назад к разделу
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
      <p className="mt-2 text-muted-foreground">Уроки и задания по теме</p>

      {(lessons ?? []).length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Уроки</h2>
          <div className="space-y-3">
            {(lessons ?? []).map((lesson) => (
              <Card key={lesson.id} className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {lesson.video_url && (
                      <Play className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {lesson.content && (
                    <div className="prose prose-sm max-w-none text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  )}
                  {lesson.video_url && (
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Смотреть видео
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(assignments ?? []).length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">Задания</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(assignments ?? []).map((a) => {
              const submission = submissionsMap.get(a.id);
              return (
                <Card key={a.id} className="rounded-2xl border-border/50 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{a.title}</span>
                      {submission ? (
                        submission.score !== null ? (
                          <Badge variant="success" className="shrink-0">
                            Оценено: {submission.score}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0">
                            Выполнено
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          Не выполнено
                        </Badge>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full justify-start gap-2 rounded-xl" size="sm">
                      <Link href={`/dashboard/assignments/${a.id}`}>
                        <FileQuestion className="h-4 w-4 shrink-0" />
                        Открыть задание
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {(lessons ?? []).length === 0 && (assignments ?? []).length === 0 && (
        <Card className="mt-8 rounded-2xl border-dashed border-border p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">В этой теме пока нет уроков и заданий.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
