import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ChevronLeft, FolderOpen } from "lucide-react";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: section } = await supabase
    .from("sections")
    .select("id, title")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!section) notFound();

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, order")
    .eq("section_id", id)
    .eq("published", true)
    .order("order", { ascending: true });

  return (
    <div className="container mx-auto max-w-6xl">
      <Breadcrumbs items={[{ label: section.title }]} />
      <h1 className="text-2xl font-bold text-foreground">{section.title}</h1>
      <p className="mt-2 text-muted-foreground">Темы предмета</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(topics ?? []).length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border p-6 text-center sm:col-span-2 lg:col-span-3">
            <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">В этом предмете пока нет тем.</p>
          </Card>
        ) : (
          (topics ?? []).map((topic) => (
            <Card key={topic.id} className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4">
                <Button asChild variant="ghost" className="w-full justify-start rounded-xl h-auto py-3 font-medium" size="lg">
                  <Link href={`/dashboard/sections/${id}/topics/${topic.id}`}>
                    {topic.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
