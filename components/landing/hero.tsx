import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroProps = {
  title?: string;
  subtitle?: string;
  cta_text?: string;
};

const DEFAULTS = {
  title: "RasulovSchool",
  subtitle: "Репетитор по математике. 5–11 классы — от основ до ОГЭ и ЕГЭ.",
  cta_text: "Записаться на урок",
};

export function Hero(props?: HeroProps | null) {
  const title = props?.title ?? DEFAULTS.title;
  const subtitle = props?.subtitle ?? DEFAULTS.subtitle;
  const cta_text = props?.cta_text ?? DEFAULTS.cta_text;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--bento-highlight)] to-background py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(var(--math-grid) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--math-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--math-grid)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" aria-hidden />
      <div className="container relative mx-auto max-w-7xl px-4 w-full text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground md:text-2xl">
          {subtitle}
        </p>
        <div className="mt-12">
          <Button asChild size="lg" className="rounded-2xl shadow-lg px-10 py-6 text-lg">
            <Link href="#calendar">{cta_text}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
