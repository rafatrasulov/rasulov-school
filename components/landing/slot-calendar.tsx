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
  title?: string;
  description?: string;
  /** Optional action (e.g. "Все слоты" button) rendered next to the title */
  headerAction?: React.ReactNode;
}

export function SlotCalendar({ slots, title = "Свободные слоты", description = "Выберите удобное время и нажмите «Записаться».", headerAction }: SlotCalendarProps) {
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
    <div id="calendar" className="rounded-3xl border-2 border-primary/10 bg-card p-6 shadow-sm scroll-mt-20">
      {(title || description || headerAction) ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {title ? (
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-2 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-xl"
          onClick={() => setWeekOffset((o) => o - 1)}
          disabled={!canGoPrev}
          aria-label="Предыдущая неделя"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="min-w-[200px] text-center font-medium text-foreground text-base md:text-lg">
          Неделя {weekStart.getDate()}.{weekStart.getMonth() + 1} —{" "}
          {weekDays[6].getDate()}.{weekDays[6].getMonth() + 1}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-xl"
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={!canGoNext}
          aria-label="Следующая неделя"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
        {weekDays.map((day) => {
          const key = formatDateKey(day);
          const daySlots = slotsByDay[key] ?? [];
          return (
            <Card
              key={key}
              className="rounded-2xl border-border/50 shadow-sm bg-muted/30 p-4 md:p-5"
            >
              <CardHeader className="p-0 pb-3">
                <div className="text-sm font-medium text-muted-foreground">
                  {DAY_NAMES[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                </div>
                <div className="text-xl font-semibold text-foreground">
                  {formatDayHeader(day)}
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {daySlots.length === 0 ? (
                  <p className="text-muted-foreground py-2 text-sm">Нет слотов</p>
                ) : (
                  daySlots.map((slot) => {
                    const isFree = slot.status === "free";
                    if (slot.status === "cancelled") return null;
                    return isFree ? (
                      <Button
                        key={slot.id}
                        asChild
                        size="default"
                        className="w-full rounded-xl py-5 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href={`/book/${slot.id}`}>
                          {formatSlotTime(slot.start_time)} — {slot.duration_minutes} мин
                        </Link>
                      </Button>
                    ) : (
                      <div
                        key={slot.id}
                        className="w-full rounded-xl py-5 px-4 text-base font-medium bg-muted text-muted-foreground border border-border text-center"
                      >
                        {formatSlotTime(slot.start_time)} — {slot.duration_minutes} мин · Занято
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
