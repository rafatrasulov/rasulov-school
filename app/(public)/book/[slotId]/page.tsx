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

  const [
    { data: slot, error },
    { data: { user } }
  ] = await Promise.all([
    supabase
      .from("slots")
      .select("id, start_time, duration_minutes, status")
      .eq("id", slotId)
      .single(),
    supabase.auth.getUser()
  ]);

  if (error || !slot) notFound();
  if (slot.status !== "free") notFound();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, grade, role")
      .eq("id", user.id)
      .eq("role", "student")
      .maybeSingle();
    if (data) {
      profile = {
        full_name: data.full_name || "",
        email: user.email || "",
        grade: data.grade,
      };
    }
  }

  // Fetch topics for authenticated users
  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, section_id, sections!inner(title)")
    .eq("published", true)
    .order("section_id")
    .order("order");

  return (
    <main className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-secondary/20 to-white relative overflow-hidden">
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(13,148,136,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px'}} aria-hidden />
      
      <div className="relative container mx-auto max-w-2xl px-6">
        <div className="glass rounded-2xl p-8 md:p-12 animate-slide-up shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Запись на урок
          </h1>
          <div className="glass-strong rounded-xl p-5 border border-primary/20">
            <p className="text-xl text-foreground font-medium">
              {formatSlotDateTime(slot.start_time)}
            </p>
            <p className="text-lg text-primary font-semibold mt-2">
              Длительность: {slot.duration_minutes} минут
            </p>
          </div>
          <div className="mt-8">
            <BookingForm slotId={slotId} profile={profile} topics={topics ?? []} />
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
