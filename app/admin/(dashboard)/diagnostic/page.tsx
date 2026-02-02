import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiagnosticTopicForm } from "./diagnostic-topic-form";
import { DiagnosticTopicsList } from "./diagnostic-topics-list";
import { SubmissionsList } from "./submissions-list";
import { Plus, ChevronLeft } from "lucide-react";

export default async function AdminDiagnosticPage() {
  const supabase = await createClient();
  const { data: topics } = await supabase
    .from("diagnostic_topics")
    .select("id, title, description, order, published, created_at")
    .order("order", { ascending: true });

  const { data: submissions } = await supabase
    .from("diagnostic_submissions")
    .select("id, diagnostic_topic_id, user_id, type, answers, free_text, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-foreground">Диагностика</h1>
        <DiagnosticTopicForm trigger={<Button className="rounded-xl gap-2"><Plus className="h-4 w-4" />Добавить тему</Button>} />
      </div>
      <p className="mt-1 text-muted-foreground">
        Темы диагностики и вопросы по ним. Ученики проходят анкету по теме или пишут свободный текст.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Темы диагностики</h2>
        <DiagnosticTopicsList topics={topics ?? []} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Последние отправки</h2>
        <SubmissionsList submissions={submissions ?? []} topics={topics ?? []} />
      </section>
    </div>
  );
}
