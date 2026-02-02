"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { updateDiagnosticTopic, deleteDiagnosticTopic } from "./actions";

interface TopicRow {
  id: string;
  title: string;
  description: string | null;
  order: number;
  published: boolean;
  created_at: string;
}

export function DiagnosticTopicsList({ topics }: { topics: TopicRow[] }) {
  const [editing, setEditing] = useState<TopicRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    const result = await updateDiagnosticTopic(editing.id, formData);
    if (result?.error) setError(result.error);
    else {
      setEditing(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить тему диагностики? Будут удалены все вопросы и ответы по ней.")) return;
    const result = await deleteDiagnosticTopic(id);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  if (topics.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-8 text-center">
        Нет тем. Добавьте первую тему диагностики.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Название</th>
              <th className="text-left p-4 font-medium">Порядок</th>
              <th className="text-left p-4 font-medium">Опубликован</th>
              <th className="text-right p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">
                  <Link href={`/admin/diagnostic/${t.id}`} className="text-primary hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="p-4">{t.order}</td>
                <td className="p-4">{t.published ? "Да" : "Нет"}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setEditing(t)}>Изменить</Button>
                  <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>Удалить</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать тему</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Название *</Label>
                <Input id="edit_title" name="title" defaultValue={editing.title} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Описание</Label>
                <Textarea id="edit_description" name="description" rows={2} defaultValue={editing.description ?? ""} className="rounded-xl resize-none" />
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
