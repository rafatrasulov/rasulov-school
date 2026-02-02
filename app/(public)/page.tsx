import { createClient } from "@/lib/supabase/server";
import { AboutTeacher } from "@/components/landing/about-teacher";
import { Benefits } from "@/components/landing/benefits";
import { FAQ } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { SlotCalendarSection } from "@/components/landing/slot-calendar-section";
import { Stepper } from "@/components/landing/stepper";
import type { Profile } from "@/lib/database.types";

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
  const { start, end } = getWeekBounds(0);

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
        <Hero />
        <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10">
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <AboutTeacher teacher={teacher as Profile | null} />
            </div>
            <div className="lg:col-span-7">
              <Benefits />
            </div>
            <div className="lg:col-span-4">
              <Stepper />
            </div>
            <div className="lg:col-span-8">
              <SlotCalendarSection slots={slots ?? []} />
            </div>
            <div className="lg:col-span-12">
              <FAQ />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {visibleBlocks.map((block) => {
        const props = (block.props || {}) as Record<string, unknown>;
        switch (block.type) {
          case "hero":
            return (
              <Hero
                key={block.id}
                title={props.title as string | undefined}
                subtitle={props.subtitle as string | undefined}
                cta_text={props.cta_text as string | undefined}
              />
            );
          case "about_teacher":
            return (
              <div key={block.id} className="container mx-auto max-w-7xl px-4 py-4 md:py-6">
                <AboutTeacher
                  teacher={teacher as Profile | null}
                  title={(props.title as string) ?? "Об учителе"}
                />
              </div>
            );
          case "benefits":
            return (
              <div key={block.id} className="container mx-auto max-w-7xl px-4 py-4 md:py-6">
                <Benefits
                  title={props.title as string | undefined}
                  description={props.description as string | undefined}
                  items={props.items as Array<{ title?: string; description?: string }> | undefined}
                />
              </div>
            );
          case "stepper":
            return (
              <div key={block.id} className="container mx-auto max-w-7xl px-4 py-4 md:py-6">
                <Stepper
                  title={props.title as string | undefined}
                  description={props.description as string | undefined}
                  steps={props.steps as Array<{ title?: string; description?: string }> | undefined}
                />
              </div>
            );
          case "calendar":
            return (
              <div key={block.id} className="container mx-auto max-w-7xl px-4 py-4 md:py-6">
                <SlotCalendarSection
                  slots={slots ?? []}
                  title={(props.title as string) ?? "Свободные слоты"}
                  description={(props.description as string) ?? "Выберите удобное время и нажмите «Записаться»."}
                />
              </div>
            );
          case "faq":
            return (
              <div key={block.id} className="container mx-auto max-w-7xl px-4 py-4 md:py-6">
                <FAQ
                  title={props.title as string | undefined}
                  description={props.description as string | undefined}
                  items={props.items as Array<{ q?: string; a?: string }> | undefined}
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </main>
  );
}
