import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/booking-form";
import { Button } from "@/components/ui/button";

function formatSlotDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function BookSlotPage({
  params,
}: {
  params: Promise<{ slotId: string }>;
}) {
  const { slotId } = await params;
  const supabase = await createClient();

  const { data: slot, error } = await supabase
    .from("slots")
    .select("id, start_time, duration_minutes, status")
    .eq("id", slotId)
    .single();

  if (error || !slot) notFound();
  if (slot.status !== "free") notFound();

  return (
    <main className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto max-w-xl px-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-foreground">
            Запись на урок
          </h1>
          <p className="mt-2 text-muted-foreground">
            {formatSlotDateTime(slot.start_time)}, {slot.duration_minutes} мин
          </p>
          <div className="mt-8">
            <BookingForm slotId={slotId} />
          </div>
          <div className="mt-6">
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link href="/#calendar">← Выбрать другое время</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
