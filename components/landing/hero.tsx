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
    <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_50%)]" />
      
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ 
          backgroundImage: "radial-gradient(rgba(6,182,212,0.3) 1px, transparent 1px)", 
          backgroundSize: "32px 32px" 
        }}
        aria-hidden
      />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center animate-fade-in">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold gradient-text leading-tight">
          {title}
        </h1>
        <p className="mt-8 text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-12">
          <Button 
            asChild 
            size="lg" 
            className="glass-strong hover:scale-105 transition-all duration-300 px-10 py-7 text-lg rounded-xl hover:shadow-2xl hover:shadow-primary/50"
          >
            <Link href="#calendar">{cta_text}</Link>
          </Button>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
