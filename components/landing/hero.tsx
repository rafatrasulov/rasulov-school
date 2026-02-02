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
    <section className="relative w-full min-h-[75vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/40 via-white to-primary/10">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(13,148,136,0.15),transparent_60%)]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.1),transparent_60%)]" aria-hidden />
      
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ 
          backgroundImage: "radial-gradient(rgba(13,148,136,0.25) 1px, transparent 1px)", 
          backgroundSize: "32px 32px" 
        }}
        aria-hidden
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center animate-fade-in">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold gradient-text leading-tight mb-8">
          {title}
        </h1>
        <p className="text-2xl sm:text-3xl md:text-4xl text-foreground/80 max-w-4xl mx-auto leading-relaxed font-medium">
          {subtitle}
        </p>
        <div className="mt-14">
          <Button 
            asChild 
            size="lg" 
            className="glass-strong hover:scale-110 transition-all duration-300 px-12 py-8 text-xl rounded-2xl shadow-2xl hover:shadow-primary/40 bg-primary hover:bg-primary/90"
          >
            <Link href="#calendar">{cta_text}</Link>
          </Button>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" aria-hidden />
    </section>
  );
}
