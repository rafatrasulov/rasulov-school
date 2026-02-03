import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TopicForm } from "./topic-form";
import { TopicsList } from "./topics-list";
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";
import { ChevronLeft, Plus } from "lucide-react";

export default async function AdminSectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: section } = await supabase.from("sections").select("id, title").eq("id", id).single();
  if (!section) notFound();

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, order, published, created_at")
    .eq("section_id", id)
    .order("order", { ascending: true });

  return (
    <div>
      <AdminBreadcrumbs items={[{ label: section.title }]} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-foreground">{section.title}</h1>
        <TopicForm sectionId={id} trigger={<Button className="rounded-xl gap-2"><Plus className="h-4 w-4" />Добавить тему</Button>} />
      </div>
      <p className="mt-1 text-muted-foreground">Темы предмета. В каждой теме — уроки и задания.</p>
      <div className="mt-8">
        <TopicsList sectionId={id} topics={topics ?? []} />
      </div>
    </div>
  );
}
