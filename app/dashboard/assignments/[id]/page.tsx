import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssignmentForm } from "./assignment-form";
import { ContentWithMath } from "@/components/content-with-math";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

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

  return (
    <div className="container mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="rounded-xl mb-4 gap-2">
        <Link href={topic ? `/dashboard/sections/${topic.section_id}/topics/${topic.id}` : "/dashboard"}>
          <ChevronLeft className="h-4 w-4" />
          Назад к теме
        </Link>
      </Button>

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
    </div>
  );
}
