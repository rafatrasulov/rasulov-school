import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SlotForm } from "./slot-form";
import { SlotsList } from "./slots-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminSlotsPage() {
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("slots")
    .select("id, start_time, duration_minutes, type, status, capacity, created_at")
    .order("start_time", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Слоты</h1>
        <SlotForm trigger={<Button className="rounded-xl"><Plus className="h-4 w-4 mr-2" />Создать слот</Button>} />
      </div>
      <p className="mt-1 text-muted-foreground">
        Управление свободными и занятыми слотами для записи на уроки.
      </p>
      <div className="mt-8">
        <SlotsList slots={slots ?? []} />
      </div>
    </div>
  );
}
