import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/landing/hero";
import { SlotCalendar } from "@/components/landing/slot-calendar";
import type { Profile, Slot } from "@/lib/database.types";

function getSlotsDateRange() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

type LandingBlockType = "hero" | "about_teacher" | "benefits" | "stepper" | "calendar" | "faq";

interface LandingBlockRow {
  id: string;
  type: LandingBlockType;
  order: number;
  visible: boolean;
  props: Record<string, unknown>;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { start, end } = getSlotsDateRange();

  const [
    { data: blocks },
    { data: slots },
    { data: teacher },
  ] = await Promise.all([
    supabase
      .from("landing_blocks")
      .select("id, type, order, visible, props")
      .eq("visible", true)
      .order("order", { ascending: true }),
    supabase
      .from("slots")
      .select("id, start_time, duration_minutes, type, status, capacity, created_at, updated_at")
      .in("status", ["free", "booked"])
      .gte("start_time", start)
      .lt("start_time", end)
      .order("start_time", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, experience, bio")
      .eq("role", "teacher")
      .limit(1)
      .maybeSingle(),
  ]);

  const visibleBlocks = (blocks ?? []) as LandingBlockRow[];

  if (visibleBlocks.length === 0) {
    return (
      <main className="min-h-screen">
        <Hero teacher={teacher as Profile | null} slots={slots as Slot[] ?? []} />
        <section className="w-full py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-secondary/30 via-white to-primary/5" id="calendar">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(13,148,136,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px'}} aria-hidden />
          <SlotCalendar 
            slots={slots as Slot[] ?? []} 
            title="Свободные слоты"
            description="Выберите удобное время и нажмите «Записаться»."
            rangeEnd={end}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {visibleBlocks.map((block, index) => {
        const props = (block.props || {}) as Record<string, unknown>;
        const isEven = index % 2 === 0;
        
        const sectionBg = isEven 
          ? "bg-gradient-to-br from-secondary/30 via-white to-primary/5"
          : "bg-white";
        
        const pattern = isEven
          ? <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(13,148,136,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px'}} aria-hidden />
          : <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.03),transparent_70%)]" aria-hidden />;
        
        switch (block.type) {
          case "hero":
            return (
              <Hero
                key={block.id}
                title={props.title as string | undefined}
                subtitle={props.subtitle as string | undefined}
                teacher={teacher as Profile | null}
                slots={slots as Slot[] ?? []}
              />
            );
          case "calendar":
            return (
              <section 
                key={block.id} 
                className={`w-full py-16 md:py-24 relative overflow-hidden ${sectionBg}`}
                id="calendar"
              >
                {pattern}
                <SlotCalendar
                  slots={slots as Slot[] ?? []}
                  title={(props.title as string) ?? "Свободные слоты"}
                  description={(props.description as string) ?? "Выберите удобное время и нажмите «Записаться»."}
                  rangeEnd={end}
                />
              </section>
            );
          case "benefits":
          case "stepper":
          case "faq":
          case "about_teacher":
            return null;
          default:
            return null;
        }
      })}
    </main>
  );
}
