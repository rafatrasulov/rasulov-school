import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DiagnosticQuestionForm } from "../diagnostic-question-form";
import { DiagnosticQuestionsList } from "../diagnostic-questions-list";
import { ChevronLeft, Plus } from "lucide-react";

export default async function AdminDiagnosticTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: topic } = await supabase
    .from("diagnostic_topics")
    .select("id, title, description")
    .eq("id", id)
    .single();

  if (!topic) notFound();

  const { data: questions } = await supabase
    .from("diagnostic_questions")
    .select("id, text, order, created_at")
    .eq("diagnostic_topic_id", id)
    .order("order", { ascending: true });

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="rounded-xl mb-4 gap-2">
        <Link href="/admin/diagnostic">
          <ChevronLeft className="h-4 w-4" />
          К диагностике
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
      {topic.description && (
        <p className="mt-2 text-muted-foreground">{topic.description}</p>
      )}
      <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-foreground">Вопросы анкеты</h2>
        <DiagnosticQuestionForm topicId={id} trigger={<Button className="rounded-xl gap-2"><Plus className="h-4 w-4" />Добавить вопрос</Button>} />
      </div>
      <div className="mt-4">
        <DiagnosticQuestionsList topicId={id} questions={questions ?? []} />
      </div>
    </div>
  );
}
