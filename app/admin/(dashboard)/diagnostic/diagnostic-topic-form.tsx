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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createDiagnosticTopic } from "./actions";

export function DiagnosticTopicForm({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createDiagnosticTopic(formData);
    if (result?.error) setError(result.error);
    else {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая тема диагностики</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input id="title" name="title" required className="rounded-xl" placeholder="Например: Квадратные уравнения" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea id="description" name="description" rows={2} className="rounded-xl resize-none" placeholder="Краткое описание темы" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Порядок</Label>
            <Input id="order" name="order" type="number" defaultValue={0} className="rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="published" name="published" value="on" />
            <Label htmlFor="published">Опубликовать (видно на странице диагностики)</Label>
          </div>
          <Button type="submit" className="w-full rounded-xl">Создать</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
