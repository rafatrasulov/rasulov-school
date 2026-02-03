import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssignmentForm } from "./assignment-form";
import { ContentWithMath } from "@/components/content-with-math";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, type, content, image_url, options, topic_id")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!assignment) notFound();

  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, section_id")
    .eq("id", assignment.topic_id)
    .single();

  let section = null;
  if (topic) {
    const { data } = await supabase
      .from("sections")
      .select("id, title")
      .eq("id", topic.section_id)
      .single();
    section = data;
  }

  // Fetch submission for current user
  const { data: { user } } = await supabase.auth.getUser();
  let submission = null;
  if (user) {
    const { data } = await supabase
      .from("assignment_submissions")
      .select("id, answer, score, teacher_feedback, created_at, updated_at")
      .eq("assignment_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    submission = data;
  }

  return (
    <div className="container mx-auto max-w-3xl">
      {topic && section && (
        <Breadcrumbs items={[
          { label: section.title, href: `/dashboard/sections/${topic.section_id}` },
          { label: topic.title, href: `/dashboard/sections/${topic.section_id}/topics/${topic.id}` },
          { label: assignment.title }
        ]} />
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <h1 className="text-xl font-bold text-foreground">{assignment.title}</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignment.content && (
            <div className="prose prose-sm max-w-none text-foreground">
              <ContentWithMath content={assignment.content} />
            </div>
          )}
          {assignment.image_url && (
            <img src={assignment.image_url} alt="К заданию" className="rounded-xl max-w-full h-auto border border-border" />
          )}
          <AssignmentForm assignmentId={assignment.id} type={assignment.type} options={assignment.options} />
        </CardContent>
      </Card>

      {submission && (
        <Card className="mt-6 rounded-2xl border-primary/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {submission.score !== null && submission.score >= 50 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : submission.score !== null ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : null}
              Результат проверки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.score !== null && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <span className="text-sm font-medium">Оценка:</span>
                <span className="text-2xl font-bold text-primary">
                  {submission.score}
                </span>
              </div>
            )}

            {submission.score === null && (
              <div className="p-4 rounded-xl bg-muted/50 text-muted-foreground">
                Ваш ответ отправлен на проверку учителю.
              </div>
            )}

            {submission.teacher_feedback && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium mb-2 text-primary">
                  Комментарий учителя:
                </p>
                <p className="whitespace-pre-wrap text-foreground">
                  {submission.teacher_feedback}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Отправлено: {new Date(submission.created_at).toLocaleString("ru-RU")}</span>
              {submission.updated_at !== submission.created_at && (
                <span>Проверено: {new Date(submission.updated_at).toLocaleString("ru-RU")}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
