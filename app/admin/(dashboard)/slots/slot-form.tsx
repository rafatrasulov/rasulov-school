"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createSlot } from "./actions";

export function SlotForm({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const defaultDateTime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 60);
    return d.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый слот</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData: FormData) => {
            const result = await createSlot(formData);
            if (result?.error) setError(result.error);
            else {
              setOpen(false);
              router.refresh();
            }
          }}
          className="space-y-4 mt-4"
        >
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="start_time">Дата и время *</Label>
            <Input
              id="start_time"
              name="start_time"
              type="datetime-local"
              required
              defaultValue={defaultDateTime()}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Длительность (мин) *</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min={15}
              step={15}
              defaultValue={60}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select name="type" defaultValue="trial">
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
            <Select name="status" defaultValue="free">
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
            <Label htmlFor="capacity">Вместимость</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={1}
              className="rounded-xl"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl">
            Создать
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
