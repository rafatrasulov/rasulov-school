"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Menu, X, Calendar, ClipboardList, LogIn, UserPlus, Key } from "lucide-react";

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/#calendar", label: "Записаться", icon: Calendar },
    { href: "/diagnostic", label: "Диагностика", icon: ClipboardList },
    { href: "/login", label: "Вход", icon: LogIn },
    { href: "/register", label: "Регистрация", icon: UserPlus },
    { href: "/admin/login", label: "Вход для учителя", icon: Key, outlined: true },
  ];

  return (
    <header className="glass-strong sticky top-0 z-50 h-16 border-b border-white/10">
      <div className="container mx-auto max-w-7xl h-full flex items-center justify-between gap-4 px-6">
        <Link href="/" className="shrink-0 font-bold text-xl md:text-2xl gradient-text">
          RasulovSchool
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={item.outlined ? "outline" : "ghost"}
              size="default"
              className="rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden ml-auto glass p-2.5 rounded-lg hover:bg-primary/20 transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile drawer */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="fixed inset-y-0 right-0 left-auto w-[300px] max-w-[85vw] glass-strong rounded-l-2xl p-6 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
            <button
              className="absolute top-6 right-6 glass p-2 rounded-lg hover:bg-destructive/20 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" />
            </button>

            <nav className="flex flex-col gap-3 mt-16">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`glass p-4 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-3 ${
                      item.outlined ? "border-primary/50" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
