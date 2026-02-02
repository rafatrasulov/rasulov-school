"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Slot } from "@/lib/database.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

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

function formatDayHeader(date: Date): { name: string; date: string } {
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return {
    name: DAY_NAMES[dayIndex],
    date: date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    }),
  };
}

function calculateSlotPosition(startTime: string): { top: number; height: number; time: string } {
  const date = new Date(startTime);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const totalMinutesFrom8 = (hours - 8) * 60 + minutes;
  const pixelsPerMinute = 64 / 60; // 64px = 1 hour
  const top = totalMinutesFrom8 * pixelsPerMinute;
  
  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  return { top, height: 60, time }; // Default 60 minutes
}

interface SlotCalendarProps {
  slots: Slot[];
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
}

export function SlotCalendar({ 
  slots, 
  title = "Свободные слоты", 
  description = "Выберите удобное время и нажмите «Записаться».", 
  headerAction 
}: SlotCalendarProps) {
  const today = useMemo(() => getWeekStart(new Date()), []);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

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
    return map;
  }, [slots, weekDays]);

  const canGoPrev = weekOffset > 0;
  const canGoNext = weekOffset < 2;

  return (
    <div id="calendar" className="glass rounded-xl overflow-hidden scroll-mt-20">
      {(title || description || headerAction) ? (
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 border-b border-white/10">
          <div>
            {title ? (
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-2 text-lg text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction}
        </div>
      ) : null}

      <div className="p-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg glass hover:bg-primary/20"
            onClick={() => setWeekOffset((o) => o - 1)}
            disabled={!canGoPrev}
            aria-label="Предыдущая неделя"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="min-w-[220px] text-center font-semibold text-foreground text-lg">
            {weekStart.getDate()}.{weekStart.getMonth() + 1} — {weekDays[6].getDate()}.{weekDays[6].getMonth() + 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg glass hover:bg-primary/20"
            onClick={() => setWeekOffset((o) => o + 1)}
            disabled={!canGoNext}
            aria-label="Следующая неделя"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop view: all 7 days */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Day headers */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-primary/20 mb-2">
              <div className="p-3 text-xs text-muted-foreground border-r border-primary/20">Время</div>
              {weekDays.map((day, idx) => {
                const header = formatDayHeader(day);
                return (
                  <div key={formatDateKey(day)} className={cn("p-3 text-center", idx < 6 && "border-r border-primary/20")}>
                    <div className="text-sm text-muted-foreground mb-1">{header.name}</div>
                    <div className="text-xl font-bold text-foreground">{header.date}</div>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)]">
              {/* Left column: hours */}
              <div className="border-r border-primary/20">
                {HOURS.map((hour, idx) => (
                  <div key={hour} className={cn("h-16 p-2 text-sm text-muted-foreground", idx < HOURS.length - 1 && "border-b border-primary/10")}>
                    {hour}:00
                  </div>
                ))}
              </div>

              {/* Day columns with slots */}
              {weekDays.map((day, dayIdx) => {
                const dayKey = formatDateKey(day);
                const daySlots = slotsByDay[dayKey] ?? [];
                
                return (
                  <div key={dayKey} className={cn("relative", dayIdx < 6 && "border-r border-primary/20")}>
                    {/* Background hour lines */}
                    {HOURS.map((hour, hourIdx) => (
                      <div key={hour} className={cn("h-16", hourIdx < HOURS.length - 1 && "border-b border-primary/10")} />
                    ))}

                    {/* Slots positioned absolutely */}
                    {daySlots.map((slot) => {
                      if (slot.status === "cancelled") return null;
                      const position = calculateSlotPosition(slot.start_time);
                      const isFree = slot.status === "free";
                      
                      return isFree ? (
                        <Link
                          key={slot.id}
                          href={`/book/${slot.id}`}
                          className={cn(
                            "absolute left-1 right-1 rounded-lg p-2 text-xs overflow-hidden",
                            "bg-gradient-to-br from-primary/90 to-primary cursor-pointer",
                            "hover:scale-105 hover:shadow-lg hover:shadow-primary/50",
                            "transition-all duration-300 flex flex-col justify-center"
                          )}
                          style={{ 
                            top: `${position.top}px`, 
                            height: `${position.height}px`,
                            minHeight: `${position.height}px`,
                            maxHeight: `${position.height}px`
                          }}
                        >
                          <div className="font-bold text-primary-foreground truncate">{position.time}</div>
                          <div className="text-xs text-primary-foreground/90 truncate">{slot.duration_minutes} мин</div>
                        </Link>
                      ) : (
                        <div
                          key={slot.id}
                          className="absolute left-1 right-1 rounded-lg p-2 text-xs bg-muted/60 text-muted-foreground cursor-not-allowed flex flex-col justify-center overflow-hidden"
                          style={{ 
                            top: `${position.top}px`, 
                            height: `${position.height}px`,
                            minHeight: `${position.height}px`,
                            maxHeight: `${position.height}px`
                          }}
                        >
                          <div className="font-semibold truncate">{position.time}</div>
                          <div className="text-xs opacity-70 truncate">Занято</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile view: one day at a time */}
        <div className="md:hidden">
          {/* Day selector - sticky */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-6 px-6 pb-4 border-b border-primary/10 mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {weekDays.map((day, idx) => {
                const header = formatDayHeader(day);
                return (
                  <button
                    key={formatDateKey(day)}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={cn(
                      "glass px-4 py-2 rounded-lg shrink-0 transition-all border",
                      idx === selectedDayIndex 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                        : "border-primary/20 hover:border-primary/40"
                    )}
                  >
                    <div className={cn("text-xs font-medium", idx === selectedDayIndex ? "text-primary-foreground" : "text-muted-foreground")}>{header.name}</div>
                    <div className="text-sm font-bold">{header.date}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show selected day's slots */}
          {(() => {
            const day = weekDays[selectedDayIndex];
            const dayKey = formatDateKey(day);
            const daySlots = slotsByDay[dayKey] ?? [];
            
            return (
              <div className="border border-primary/20 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[70px_1fr]">
                  <div className="border-r border-primary/20 bg-muted/30">
                    {HOURS.map((hour, idx) => (
                      <div key={hour} className={cn("h-16 p-2 text-xs text-muted-foreground font-medium flex items-center justify-center", idx < HOURS.length - 1 && "border-b border-primary/10")}>
                        {hour}:00
                      </div>
                    ))}
                  </div>

                  <div className="relative bg-background">
                    {HOURS.map((hour, idx) => (
                      <div key={hour} className={cn("h-16", idx < HOURS.length - 1 && "border-b border-primary/10")} />
                    ))}

                    {daySlots.map((slot) => {
                      if (slot.status === "cancelled") return null;
                      const position = calculateSlotPosition(slot.start_time);
                      const isFree = slot.status === "free";
                      
                      return isFree ? (
                        <Link
                          key={slot.id}
                          href={`/book/${slot.id}`}
                          className="absolute left-2 right-2 rounded-lg p-3 text-sm bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary active:scale-95 transition-all flex flex-col justify-center shadow-md border border-primary/30"
                          style={{ 
                            top: `${position.top}px`, 
                            height: `${position.height}px`,
                            minHeight: `${position.height}px`,
                            maxHeight: `${position.height}px`
                          }}
                        >
                          <div className="font-bold text-primary-foreground truncate">{position.time}</div>
                          <div className="text-xs text-primary-foreground/90 truncate">{slot.duration_minutes} мин</div>
                        </Link>
                      ) : (
                        <div
                          key={slot.id}
                          className="absolute left-2 right-2 rounded-lg p-3 text-sm bg-muted/80 text-muted-foreground flex flex-col justify-center border border-border"
                          style={{ 
                            top: `${position.top}px`, 
                            height: `${position.height}px`,
                            minHeight: `${position.height}px`,
                            maxHeight: `${position.height}px`
                          }}
                        >
                          <div className="font-semibold truncate">{position.time}</div>
                          <div className="text-xs opacity-70 truncate">Занято</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
