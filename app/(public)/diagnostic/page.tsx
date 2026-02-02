import { createClient } from "@/lib/supabase/server";
import { DiagnosticForm } from "./diagnostic-form";

export default async function DiagnosticPage() {
  const supabase = await createClient();
  const { data: topics } = await supabase
    .from("diagnostic_topics")
    .select("id, title, description")
    .eq("published", true)
    .order("order", { ascending: true });

  return (
    <main className="min-h-[70vh] py-12 md:py-20">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-2xl font-bold text-foreground">Диагностика</h1>
        <p className="mt-2 text-muted-foreground">
          Пройдите анкету по теме или напишите, что вам не понятно. Результаты увидит учитель.
        </p>
        <div className="mt-8">
          <DiagnosticForm topics={topics ?? []} />
        </div>
      </div>
    </main>
  );
}
