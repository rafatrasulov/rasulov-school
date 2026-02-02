"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SlotCalendar } from "@/components/landing/slot-calendar";
import type { Slot } from "@/lib/database.types";
import { CalendarDays } from "lucide-react";

interface SlotCalendarSectionProps {
  slots: Slot[];
  title?: string;
  description?: string;
}

export function SlotCalendarSection({ slots, title, description }: SlotCalendarSectionProps) {
  const [open, setOpen] = useState(false);

  const headerAction = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="rounded-lg gap-2 shrink-0 glass hover:bg-primary/20">
          <CalendarDays className="h-5 w-5" />
          Все слоты
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title ?? "Свободные слоты"}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <SlotCalendar
            slots={slots}
            title=""
            description=""
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <SlotCalendar
      slots={slots}
      title={title}
      description={description}
      headerAction={headerAction}
    />
  );
}
