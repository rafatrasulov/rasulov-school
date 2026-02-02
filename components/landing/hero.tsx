import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      {/* Light grid background (opacity 3–6%) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative mx-auto max-w-5xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Математика с репетитором
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
          Авторская онлайн-школа. Индивидуальные уроки — от основ до олимпиад.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="rounded-2xl shadow-lg px-8">
            <Link href="#calendar">Записаться на урок</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
