"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Menu,
  X,
  Calendar,
  ClipboardList,
  LogIn,
  UserPlus,
  Key,
  User,
  LogOut,
  Home,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions";
import { Badge } from "@/components/ui/badge";

export interface SiteHeaderProfile {
  full_name: string | null;
  email: string | null;
  grade: number | null;
  role: string;
}

interface PublicHeaderProps {
  user?: { id: string } | null;
  profile?: SiteHeaderProfile | null;
  showDashboardLink?: boolean;
  gradedResultsCount?: number;
}

export function PublicHeader({ user = null, profile = null, showDashboardLink = false, gradedResultsCount = 0 }: PublicHeaderProps) {
  const [open, setOpen] = useState(false);
  const isStudent = user && profile?.role === "student";
  const displayName =
    isStudent && profile
      ? (profile.full_name?.trim() || profile.email || "Профиль").split(/\s+/)[0] || "Профиль"
      : null;
  const gradeLabel = isStudent && profile?.grade != null ? `${profile.grade} кл.` : null;

  const commonNav = [
    { href: "/#calendar", label: "Записаться", icon: Calendar },
    { href: "/diagnostic", label: "Диагностика", icon: ClipboardList },
  ];

  const guestNav = [
    { href: "/login", label: "Вход", icon: LogIn },
    { href: "/register", label: "Регистрация", icon: UserPlus },
    { href: "/admin/login", label: "Вход для учителя", icon: Key, outlined: true },
  ];

  const desktopAuthBlock = isStudent ? (
    <div className="hidden md:flex items-center gap-2">
      {gradeLabel && (
        <span className="text-sm text-muted-foreground hidden lg:inline">{gradeLabel}</span>
      )}
      <span className="text-sm font-medium max-w-[120px] truncate" title={displayName ?? undefined}>
        {displayName}
      </span>
      <Button asChild variant="ghost" size="default" className="rounded-lg hover:bg-primary/10">
        <Link href="/dashboard/profile">
          <User className="h-4 w-4 mr-1.5" />
          Профиль
        </Link>
      </Button>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="default" className="rounded-lg gap-1.5">
          <LogOut className="h-4 w-4" />
          Выход
        </Button>
      </form>
    </div>
  ) : (
    <div className="hidden md:flex items-center gap-3">
      {guestNav.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={item.outlined ? "outline" : "ghost"}
          size="default"
          className={cn(
            "rounded-lg transition-all duration-300",
            "hover:bg-primary/10"
          )}
        >
          <Link href={item.href}>{item.label}</Link>
        </Button>
      ))}
    </div>
  );

  const mobileAuthBlock = isStudent ? (
    <>
      <Link
        href="/dashboard/profile"
        className="glass p-4 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-3"
        onClick={() => setOpen(false)}
      >
        <User className="h-5 w-5 text-primary" />
        <span className="font-medium">Профиль</span>
      </Link>
      <form action={signOut} className="w-full">
        <button
          type="submit"
          className="w-full glass p-4 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-3 text-left border border-primary/30"
          onClick={() => setOpen(false)}
        >
          <LogOut className="h-5 w-5 text-primary" />
          <span className="font-medium">Выход</span>
        </button>
      </form>
    </>
  ) : (
    guestNav.map((item) => {
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`glass p-4 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-3 ${
            item.outlined ? "border border-primary/50" : ""
          }`}
          onClick={() => setOpen(false)}
        >
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium">{item.label}</span>
        </Link>
      );
    })
  );

  return (
    <header className="glass-strong sticky top-0 z-50 h-16 border-b border-white/10">
      <div className="container mx-auto max-w-7xl h-full flex items-center justify-between gap-4 px-6">
        <Link href="/" className="shrink-0 font-bold text-xl md:text-2xl gradient-text">
          RasulovSchool
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {commonNav.map((item) => {
            const isBooking = item.href === "/#calendar";
            return (
              <Button
                key={item.href}
                asChild
                variant={isBooking ? "default" : "ghost"}
                size="default"
                className={cn(
                  "rounded-lg transition-all duration-300",
                  isBooking
                    ? "bg-primary hover:bg-primary/90 hover:scale-105 shadow-lg hover:shadow-primary/30"
                    : "hover:bg-primary/10"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
          {showDashboardLink && (
            <Button asChild variant="ghost" size="default" className="rounded-lg hover:bg-primary/10">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-1.5" />
                Личный кабинет
              </Link>
            </Button>
          )}
          {isStudent && (
            <Button asChild variant="ghost" size="default" className="rounded-lg hover:bg-primary/10 relative">
              <Link href="/dashboard/results" className="flex items-center gap-1.5">
                <FileCheck className="h-4 w-4" />
                Результаты работ
                {gradedResultsCount > 0 && (
                  <Badge variant="default" className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 text-xs">
                    {gradedResultsCount > 99 ? "99+" : gradedResultsCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}
          {desktopAuthBlock}
        </nav>

        <button
          className="md:hidden ml-auto glass p-2.5 rounded-lg hover:bg-primary/20 transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            showCloseButton={false}
            className="fixed inset-y-0 right-0 left-auto top-0 translate-x-0 translate-y-0 h-full w-[300px] max-w-[85vw] glass-strong rounded-l-2xl rounded-r-none p-6 m-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right border-l border-y-0 border-r-0"
          >
            <button
              className="absolute top-6 right-6 glass p-2 rounded-lg hover:bg-destructive/20 transition-colors z-10"
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>

            <nav className="flex flex-col gap-3 mt-16">
              {commonNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="glass p-4 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-3"
                    onClick={() => {
                      setOpen(false);
                      if (item.href.startsWith("/#")) {
                        setTimeout(() => {
                          const id = item.href.split("#")[1];
                          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              {showDashboardLink && (
                <Link
                  href="/dashboard"
                  className="glass p-4 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-3"
                  onClick={() => setOpen(false)}
                >
                  <Home className="h-5 w-5 text-primary" />
                  <span className="font-medium">Личный кабинет</span>
                </Link>
              )}
              {isStudent && (
                <Link
                  href="/dashboard/results"
                  className="glass p-4 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-3"
                  onClick={() => setOpen(false)}
                >
                  <FileCheck className="h-5 w-5 text-primary" />
                  <span className="font-medium">Результаты работ</span>
                  {gradedResultsCount > 0 && (
                    <Badge variant="default" className="ml-auto h-5 min-w-5 rounded-full px-1.5 text-xs">
                      {gradedResultsCount > 99 ? "99+" : gradedResultsCount}
                    </Badge>
                  )}
                </Link>
              )}
              {isStudent && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {displayName}
                  {gradeLabel && ` · ${gradeLabel}`}
                </div>
              )}
              {mobileAuthBlock}
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
