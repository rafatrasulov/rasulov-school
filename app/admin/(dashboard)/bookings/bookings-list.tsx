"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBookingStatus } from "./actions";
import type { BookingStatus } from "@/lib/database.types";

const statusLabels: Record<BookingStatus, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  done: "Проведена",
  cancelled: "Отменена",
};

const experienceLabels: Record<string, string> = {
  beginner: "Начинающий",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const messengerLabels: Record<string, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "Email",
};

interface SlotRow {
  start_time: string;
  duration_minutes: number;
}

interface BookingRow {
  id: string;
  slot_id: string;
  full_name: string;
  email: string;
  phone: string;
  age_or_grade: string | null;
  goal: string;
  experience_level: string;
  preferred_messenger: string;
  consent: boolean;
  status: BookingStatus;
  created_at: string;
  slots: SlotRow | SlotRow[] | null;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function slotDisplay(slots: SlotRow | SlotRow[] | null): string {
  if (!slots) return "—";
  const s = Array.isArray(slots) ? slots[0] : slots;
  if (!s) return "—";
  return formatDateTime(s.start_time) + ", " + s.duration_minutes + " мин";
}

interface BookingsListProps {
  bookings: BookingRow[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  const [detail, setDetail] = useState<BookingRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleStatusChange(bookingId: string, status: BookingStatus) {
    setError(null);
    const result = await updateBookingStatus(bookingId, status);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    setDetail((prev) => (prev?.id === bookingId ? { ...prev, status } : prev));
  }

  if (bookings.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-8 text-center">
        Пока нет заявок.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Дата заявки</th>
              <th className="text-left p-4 font-medium">Слот</th>
              <th className="text-left p-4 font-medium">Имя</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Статус</th>
              <th className="text-right p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0">
                <td className="p-4">{formatDateTime(b.created_at)}</td>
                <td className="p-4">
                  {slotDisplay(b.slots)}
                </td>
                <td className="p-4">{b.full_name}</td>
                <td className="p-4">{b.email}</td>
                <td className="p-4">{statusLabels[b.status]}</td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setDetail(b)}
                  >
                    Подробнее
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заявка</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 mt-2">
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Имя</dt>
                  <dd className="font-medium">{detail.full_name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{detail.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Телефон</dt>
                  <dd className="font-medium">{detail.phone}</dd>
                </div>
                {detail.age_or_grade && (
                  <div>
                    <dt className="text-muted-foreground">Класс / возраст</dt>
                    <dd className="font-medium">{detail.age_or_grade}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Цель занятий</dt>
                  <dd className="font-medium whitespace-pre-wrap">{detail.goal}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Уровень</dt>
                  <dd className="font-medium">{experienceLabels[detail.experience_level] ?? detail.experience_level}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Способ связи</dt>
                  <dd className="font-medium">{messengerLabels[detail.preferred_messenger] ?? detail.preferred_messenger}</dd>
                </div>
              </dl>
              <div className="pt-2 border-t border-border">
                <label className="text-sm text-muted-foreground block mb-2">Изменить статус</label>
                <Select
                  value={detail.status}
                  onValueChange={(value) => handleStatusChange(detail.id, value as BookingStatus)}
                >
                  <SelectTrigger className="rounded-xl w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{statusLabels.new}</SelectItem>
                    <SelectItem value="confirmed">{statusLabels.confirmed}</SelectItem>
                    <SelectItem value="done">{statusLabels.done}</SelectItem>
                    <SelectItem value="cancelled">{statusLabels.cancelled}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
