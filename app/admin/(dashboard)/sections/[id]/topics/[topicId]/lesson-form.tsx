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
import { createLesson } from "./actions";

export function LessonForm({
  topicId,
  sectionId,
  trigger,
}: {
  topicId: string;
  sectionId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createLesson(topicId, sectionId, formData);
    if (result?.error) setError(result.error);
    else {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый урок</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input id="title" name="title" required className="rounded-xl" placeholder="Название урока" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Текст урока (HTML)</Label>
            <Textarea id="content" name="content" rows={5} className="rounded-xl resize-none font-mono text-sm" placeholder="<p>Текст урока...</p>" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_url">Ссылка на видео (YouTube и т.д.)</Label>
            <Input id="video_url" name="video_url" type="url" className="rounded-xl" placeholder="https://..." />
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
