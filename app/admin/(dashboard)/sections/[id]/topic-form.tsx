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
import { Checkbox } from "@/components/ui/checkbox";
import { createTopic } from "./actions";

export function TopicForm({ sectionId, trigger }: { sectionId: string; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createTopic(sectionId, formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая тема</DialogTitle>
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
            <Label htmlFor="order">Порядок</Label>
            <Input id="order" name="order" type="number" defaultValue={0} className="rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="published" name="published" value="on" />
            <Label htmlFor="published">Опубликовать</Label>
          </div>
          <Button type="submit" className="w-full rounded-xl">Создать</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
