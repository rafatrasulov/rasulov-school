import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { SubmissionsList } from "./submissions-list";

export default async function AdminAssignmentSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, type, content, correct_answer, topic_id")
    .eq("id", id)
    .single();

  if (!assignment) notFound();

  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, section_id")
    .eq("id", assignment.topic_id)
    .single();

  const { data: submissionsRaw } = await supabase
    .from("assignment_submissions")
    .select(`
      id,
      assignment_id,
      user_id,
      answer,
      answer_json,
      score,
      created_at,
      updated_at,
      profiles!assignment_submissions_user_id_fkey(full_name, email)
    `)
    .eq("assignment_id", id)
    .order("created_at", { ascending: false });

  const submissions = submissionsRaw?.map(s => ({
    ...s,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
  })) ?? [];

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student");

  const totalStudents = students?.length ?? 0;
  const submittedCount = submissions.length;
  const gradedCount = submissions.filter(s => s.score != null).length;
  const avgScore = submissions.length > 0
    ? submissions
        .filter(s => s.score != null)
        .reduce((acc, s) => acc + (s.score ?? 0), 0) / (gradedCount || 1)
    : 0;

  return (
    <div>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="rounded-xl mb-4 gap-2"
      >
        <Link
          href={
            topic
              ? `/admin/sections/${topic.section_id}/topics/${topic.id}`
              : "/admin/sections"
          }
        >
          <ChevronLeft className="h-4 w-4" />
          Назад к теме
        </Link>
      </Button>

      <h1 className="text-2xl font-bold text-foreground">
        Ответы: {assignment.title}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Просмотр и оценивание ответов учеников.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="rounded-xl border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего учеников
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Выполнили
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {submittedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Оценено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {gradedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средний балл
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgScore > 0 ? avgScore.toFixed(1) : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle>Ответы учеников</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsList
            submissions={submissions}
            assignmentType={assignment.type}
            correctAnswer={assignment.correct_answer}
          />
        </CardContent>
      </Card>
    </div>
  );
}
