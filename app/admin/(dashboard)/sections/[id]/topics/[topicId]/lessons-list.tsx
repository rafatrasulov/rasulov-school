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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { updateLesson, deleteLesson } from "./actions";

interface LessonRow {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order: number;
  published: boolean;
}

export function LessonsList({
  topicId,
  sectionId,
  lessons,
}: {
  topicId: string;
  sectionId: string;
  lessons: LessonRow[];
}) {
  const [editing, setEditing] = useState<LessonRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    const result = await updateLesson(editing.id, topicId, sectionId, formData);
    if (result?.error) setError(result.error);
    else {
      setEditing(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить урок?")) return;
    const result = await deleteLesson(id, topicId, sectionId);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  if (lessons.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">
        Нет уроков. Добавьте первый урок.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <ul className="space-y-2">
        {lessons.map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded-xl border border-border p-4">
            <span className="font-medium">{l.title}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setEditing(l)}>Изменить</Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(l.id)}>Удалить</Button>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать урок</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Название *</Label>
                <Input id="edit_title" name="title" defaultValue={editing.title} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_content">Текст урока</Label>
                <Textarea id="edit_content" name="content" rows={5} defaultValue={editing.content ?? ""} className="rounded-xl resize-none font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_video_url">Ссылка на видео</Label>
                <Input id="edit_video_url" name="video_url" type="url" defaultValue={editing.video_url ?? ""} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_order">Порядок</Label>
                <Input id="edit_order" name="order" type="number" defaultValue={editing.order} className="rounded-xl" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="edit_published" name="published" value="on" defaultChecked={editing.published} />
                <Label htmlFor="edit_published">Опубликовать</Label>
              </div>
              <Button type="submit" className="w-full rounded-xl">Сохранить</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
