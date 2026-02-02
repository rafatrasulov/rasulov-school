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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSlot, deleteSlot } from "./actions";
import type { Slot } from "@/lib/database.types";

const typeLabels: Record<string, string> = {
  trial: "Пробный",
  regular: "Обычный",
};
const statusLabels: Record<string, string> = {
  free: "Свободен",
  booked: "Занят",
  cancelled: "Отменён",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SlotRow = Pick<Slot, "id" | "start_time" | "duration_minutes" | "type" | "status" | "capacity" | "created_at">;

interface SlotsListProps {
  slots: SlotRow[];
}

export function SlotsList({ slots }: SlotsListProps) {
  const [editing, setEditing] = useState<SlotRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    const result = await updateSlot(editing.id, formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить этот слот?")) return;
    setDeletingId(id);
    const result = await deleteSlot(id);
    setDeletingId(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const toLocalDatetime = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  if (slots.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-8 text-center">
        Нет слотов. Создайте первый слот.
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
              <th className="text-left p-4 font-medium">Дата и время</th>
              <th className="text-left p-4 font-medium">Длительность</th>
              <th className="text-left p-4 font-medium">Тип</th>
              <th className="text-left p-4 font-medium">Статус</th>
              <th className="text-right p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id} className="border-b border-border last:border-0">
                <td className="p-4">{formatDateTime(slot.start_time)}</td>
                <td className="p-4">{slot.duration_minutes} мин</td>
                <td className="p-4">{typeLabels[slot.type] ?? slot.type}</td>
                <td className="p-4">{statusLabels[slot.status] ?? slot.status}</td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setEditing(slot)}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-destructive hover:text-destructive"
                    onClick={() => handleDelete(slot.id)}
                    disabled={deletingId === slot.id}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать слот</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_time">Дата и время *</Label>
                <Input
                  id="edit_start_time"
                  name="start_time"
                  type="datetime-local"
                  required
                  defaultValue={toLocalDatetime(editing.start_time)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_duration_minutes">Длительность (мин) *</Label>
                <Input
                  id="edit_duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min={15}
                  step={15}
                  defaultValue={editing.duration_minutes}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Тип</Label>
                <Select name="type" defaultValue={editing.type}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Пробный</SelectItem>
                    <SelectItem value="regular">Обычный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select name="status" defaultValue={editing.status}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Свободен</SelectItem>
                    <SelectItem value="booked">Занят</SelectItem>
                    <SelectItem value="cancelled">Отменён</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_capacity">Вместимость</Label>
                <Input
                  id="edit_capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  defaultValue={editing.capacity}
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                Сохранить
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
