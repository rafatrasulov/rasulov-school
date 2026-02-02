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
        <section className="w-full py-16 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 animate-slide-up">
              <div className="lg:col-span-5">
                <AboutTeacher teacher={teacher as Profile | null} />
              </div>
              <div className="lg:col-span-7">
                <Benefits />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 animate-slide-up">
              <div className="lg:col-span-4">
                <Stepper />
              </div>
              <div className="lg:col-span-8">
                <SlotCalendarSection slots={slots ?? []} />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-6 animate-slide-up">
            <FAQ />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {visibleBlocks.map((block, index) => {
        const props = (block.props || {}) as Record<string, unknown>;
        const isEven = index % 2 === 0;
        
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
              <section 
                key={block.id} 
                className={`w-full py-16 md:py-20 ${isEven ? 'bg-gradient-to-b from-background via-muted/20 to-background' : ''}`}
              >
                <div className="max-w-7xl mx-auto px-6 animate-slide-up">
                  <AboutTeacher
                    teacher={teacher as Profile | null}
                    title={(props.title as string) ?? "Об учителе"}
                  />
                </div>
              </section>
            );
          case "benefits":
            return (
              <section 
                key={block.id} 
                className={`w-full py-16 md:py-20 ${isEven ? 'bg-gradient-to-b from-background via-muted/20 to-background' : ''}`}
              >
                <div className="max-w-7xl mx-auto px-6 animate-slide-up">
                  <Benefits
                    title={props.title as string | undefined}
                    description={props.description as string | undefined}
                    items={props.items as Array<{ title?: string; description?: string }> | undefined}
                  />
                </div>
              </section>
            );
          case "stepper":
            return (
              <section 
                key={block.id} 
                className={`w-full py-16 md:py-20 ${isEven ? 'bg-gradient-to-b from-background via-muted/20 to-background' : ''}`}
              >
                <div className="max-w-7xl mx-auto px-6 animate-slide-up">
                  <Stepper
                    title={props.title as string | undefined}
                    description={props.description as string | undefined}
                    steps={props.steps as Array<{ title?: string; description?: string }> | undefined}
                  />
                </div>
              </section>
            );
          case "calendar":
            return (
              <section 
                key={block.id} 
                className={`w-full py-16 md:py-20 ${isEven ? 'bg-gradient-to-b from-background via-muted/20 to-background' : ''}`}
              >
                <div className="max-w-7xl mx-auto px-6 animate-slide-up">
                  <SlotCalendarSection
                    slots={slots ?? []}
                    title={(props.title as string) ?? "Свободные слоты"}
                    description={(props.description as string) ?? "Выберите удобное время и нажмите «Записаться»."}
                  />
                </div>
              </section>
            );
          case "faq":
            return (
              <section 
                key={block.id} 
                className={`w-full py-16 md:py-20 ${isEven ? 'bg-gradient-to-b from-background to-muted/20' : ''}`}
              >
                <div className="max-w-7xl mx-auto px-6 animate-slide-up">
                  <FAQ
                    title={props.title as string | undefined}
                    description={props.description as string | undefined}
                    items={props.items as Array<{ q?: string; a?: string }> | undefined}
                  />
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </main>
  );
}
