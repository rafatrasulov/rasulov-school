"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Slot } from "@/lib/database.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

interface SlotCalendarProps {
  slots: Slot[];
}

export function SlotCalendar({ slots }: SlotCalendarProps) {
  const today = useMemo(() => getWeekStart(new Date()), []);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [today, weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const slotsByDay = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    weekDays.forEach((day) => {
      map[formatDateKey(day)] = [];
    });
    slots.forEach((slot) => {
      const key = formatDateKey(new Date(slot.start_time));
      if (key in map) {
        map[key].push(slot);
      }
    });
    weekDays.forEach((day) => {
      const key = formatDateKey(day);
      if (map[key]) {
        map[key].sort(
          (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      }
    });
    return map;
  }, [slots, weekDays]);

  const canGoPrev = weekOffset > 0;
  const canGoNext = weekOffset < 2;

  return (
    <section id="calendar" className="py-16 md:py-24 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold text-center text-foreground md:text-4xl">
          Свободные слоты
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          Выберите удобное время и нажмите «Записаться».
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((o) => o - 1)}
            disabled={!canGoPrev}
            aria-label="Предыдущая неделя"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[200px] text-center font-medium text-foreground">
            Неделя {weekStart.getDate()}.{weekStart.getMonth() + 1} —{" "}
            {weekDays[6].getDate()}.{weekDays[6].getMonth() + 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((o) => o + 1)}
            disabled={!canGoNext}
            aria-label="Следующая неделя"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {weekDays.map((day) => {
            const key = formatDateKey(day);
            const daySlots = slotsByDay[key] ?? [];
            return (
              <Card
                key={key}
                className="rounded-2xl border-border/50 shadow-sm bg-card"
              >
                <CardHeader className="pb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {DAY_NAMES[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {formatDayHeader(day)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет слотов</p>
                  ) : (
                    daySlots.map((slot) => (
                      <Button
                        key={slot.id}
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl"
                      >
                        <Link href={`/book/${slot.id}`}>
                          {formatSlotTime(slot.start_time)} — {slot.duration_minutes} мин
                        </Link>
                      </Button>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
