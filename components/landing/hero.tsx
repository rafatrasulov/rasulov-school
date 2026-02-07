"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AboutTeacher } from "@/components/landing/about-teacher";
import type { Profile, Slot } from "@/lib/database.types";

type HeroProps = {
  title?: string;
  subtitle?: string;
  teacher?: Profile | null;
  slots?: Slot[];
};

const DEFAULTS = {
  title: "RasulovSchool",
  subtitle: "Репетитор по математике. 5–11 классы — от основ до ОГЭ и ЕГЭ.",
};

export function Hero(props?: HeroProps | null) {
  const title = props?.title ?? DEFAULTS.title;
  const subtitle = props?.subtitle ?? DEFAULTS.subtitle;
  const teacher = props?.teacher ?? null;
  const slots = props?.slots ?? [];
  
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
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center animate-fade-in">
        <h1 className="text-[clamp(2rem,10vw,6rem)] sm:text-7xl md:text-8xl lg:text-9xl font-bold gradient-text leading-tight mb-6 sm:mb-8">
          {title}
        </h1>
        <p className="text-[clamp(0.9rem,4vw,1.25rem)] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-foreground/80 max-w-4xl mx-auto leading-relaxed font-medium">
          {subtitle}
        </p>
        
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* 1. Наши преподаватели */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 px-8 py-6 text-lg rounded-xl shadow-xl"
              >
                👨‍🏫 Наши преподаватели
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl gradient-text">Наши преподаватели</DialogTitle>
              </DialogHeader>
              <div className="mt-6">
                <AboutTeacher teacher={teacher} />
              </div>
            </DialogContent>
          </Dialog>

          {/* 2. Записаться на урок */}
          <Button 
            asChild
            size="lg" 
            className="bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 transition-all duration-300 px-8 py-6 text-lg rounded-xl shadow-xl"
          >
            <Link 
              href="#calendar"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              📅 Записаться на урок
            </Link>
          </Button>

          {/* 3. Войти в личный кабинет */}
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="hover:bg-primary/10 hover:scale-105 transition-all duration-300 px-8 py-6 text-lg rounded-xl border-2"
          >
            <Link href="/login">🔐 Личный кабинет</Link>
          </Button>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" aria-hidden />
    </section>
  );
}
