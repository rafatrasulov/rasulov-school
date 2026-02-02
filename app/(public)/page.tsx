import { createClient } from "@/lib/supabase/server";
import { Benefits } from "@/components/landing/benefits";
import { FAQ } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { SlotCalendar } from "@/components/landing/slot-calendar";
import { Stepper } from "@/components/landing/stepper";

function getWeekBounds(weekOffset: number) {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 21); // 3 weeks
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function HomePage() {
  const supabase = await createClient();
  const { start, end } = getWeekBounds(0);

  const { data: slots } = await supabase
    .from("slots")
    .select("id, start_time, duration_minutes, type, status, capacity, created_at, updated_at")
    .eq("status", "free")
    .gte("start_time", start)
    .lt("start_time", end)
    .order("start_time", { ascending: true });

  return (
    <main>
      <Hero />
      <Benefits />
      <Stepper />
      <SlotCalendar slots={slots ?? []} />
      <FAQ />
    </main>
  );
}
