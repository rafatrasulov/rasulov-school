import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionForm } from "./section-form";
import { SectionsList } from "./sections-list";
import { Plus } from "lucide-react";

export default async function AdminSectionsPage() {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from("sections")
    .select("id, title, order, published, grade, created_at")
    .order("order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-foreground">Разделы курса</h1>
        <SectionForm trigger={<Button className="rounded-xl gap-2"><Plus className="h-4 w-4" />Создать раздел</Button>} />
      </div>
      <p className="mt-1 text-muted-foreground">
        Разделы видны ученикам в личном кабинете. Добавляйте темы и задания внутри раздела.
      </p>
      <div className="mt-8">
        <SectionsList sections={sections ?? []} />
      </div>
    </div>
  );
}
