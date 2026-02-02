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
    <main className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto max-w-2xl px-6">
        <div className="glass rounded-xl p-8 md:p-10 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground gradient-text">
            Запись на урок
          </h1>
          <div className="mt-4 glass-strong rounded-lg p-4">
            <p className="text-lg text-muted-foreground">
              {formatSlotDateTime(slot.start_time)}
            </p>
            <p className="text-sm text-primary font-medium mt-1">
              Длительность: {slot.duration_minutes} минут
            </p>
          </div>
          <div className="mt-8">
            <BookingForm slotId={slotId} />
          </div>
          <div className="mt-6">
            <Button asChild variant="ghost" size="default" className="rounded-lg hover:bg-primary/20">
              <Link href="/#calendar">← Выбрать другое время</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
