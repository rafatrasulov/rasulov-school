import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 max-w-7xl w-full items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 font-semibold text-foreground text-xl md:text-2xl">
          RasulovSchool
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <Button asChild variant="ghost" size="default" className="rounded-xl text-base" aria-label="Записаться на урок">
            <Link href="/#calendar">Записаться</Link>
          </Button>
          <Button asChild variant="ghost" size="default" className="rounded-xl text-base" aria-label="Диагностика">
            <Link href="/diagnostic">Диагностика</Link>
          </Button>
          <Button asChild variant="ghost" size="default" className="rounded-xl text-base" aria-label="Вход для ученика">
            <Link href="/login">Вход</Link>
          </Button>
          <Button asChild variant="ghost" size="default" className="rounded-xl text-base" aria-label="Регистрация ученика">
            <Link href="/register">Регистрация</Link>
          </Button>
          <Button asChild variant="outline" size="default" className="rounded-xl text-base" aria-label="Вход для учителя">
            <Link href="/admin/login">Вход для учителя</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
