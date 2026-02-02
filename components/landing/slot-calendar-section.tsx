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
        <Button variant="outline" size="default" className="rounded-xl gap-2 shrink-0">
          <CalendarDays className="h-5 w-5" />
          Все слоты
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title ?? "Свободные слоты"}</DialogTitle>
        </DialogHeader>
        <SlotCalendar
          slots={slots}
          title=""
          description=""
        />
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
