import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LessonForm } from "./lesson-form";
import { AssignmentForm } from "./assignment-form";
import { LessonsList } from "./lessons-list";
import { AssignmentsList } from "./assignments-list";
import { AdminBreadcrumbs } from "@/components/admin-breadcrumbs";
import { ChevronLeft, Plus } from "lucide-react";

export default async function AdminTopicDetailPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id: sectionId, topicId } = await params;
  const supabase = await createClient();

  const { data: section } = await supabase.from("sections").select("id, title").eq("id", sectionId).single();
  const { data: topic } = await supabase.from("topics").select("id, title").eq("id", topicId).eq("section_id", sectionId).single();
  if (!section || !topic) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, content, video_url, order, published")
    .eq("topic_id", topicId)
    .order("order", { ascending: true });

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, type, order, published, content, image_url, correct_answer, options")
    .eq("topic_id", topicId)
    .order("order", { ascending: true });

  return (
    <div>
      <AdminBreadcrumbs items={[
        { label: section.title, href: `/admin/sections/${sectionId}` },
        { label: topic.title }
      ]} />
      <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
      <p className="mt-1 text-muted-foreground">Уроки и задания по теме.</p>

      <section className="mt-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Уроки</h2>
          <LessonForm topicId={topicId} sectionId={sectionId} trigger={<Button className="rounded-xl gap-2"><Plus className="h-4 w-4" />Добавить урок</Button>} />
        </div>
        <LessonsList topicId={topicId} sectionId={sectionId} lessons={lessons ?? []} />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Задания</h2>
          <AssignmentForm topicId={topicId} sectionId={sectionId} trigger={<Button className="rounded-xl gap-2"><Plus className="h-4 w-4" />Добавить задание</Button>} />
        </div>
        <AssignmentsList topicId={topicId} sectionId={sectionId} assignments={assignments ?? []} />
      </section>
    </div>
  );
}
