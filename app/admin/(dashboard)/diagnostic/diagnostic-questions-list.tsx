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
import { updateDiagnosticQuestion, deleteDiagnosticQuestion } from "./actions";

interface QuestionRow {
  id: string;
  text: string;
  order: number;
  created_at: string;
}

export function DiagnosticQuestionsList({
  topicId,
  questions,
}: {
  topicId: string;
  questions: QuestionRow[];
}) {
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    const result = await updateDiagnosticQuestion(editing.id, topicId, formData);
    if (result?.error) setError(result.error);
    else {
      setEditing(null);
      router.refresh();
    }
  }

  async function handleDelete(questionId: string) {
    if (!confirm("Удалить вопрос?")) return;
    const result = await deleteDiagnosticQuestion(questionId, topicId);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  if (questions.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">
        Нет вопросов. Добавьте первый вопрос анкеты.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <ul className="space-y-2">
        {questions.map((q) => (
          <li key={q.id} className="flex items-center justify-between rounded-xl border border-border p-4">
            <span className="font-medium">{q.text}</span>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setEditing(q)}>Изменить</Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(q.id)}>Удалить</Button>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать вопрос</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_text">Текст вопроса *</Label>
                <Textarea id="edit_text" name="text" required rows={3} defaultValue={editing.text} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_order">Порядок</Label>
                <Input id="edit_order" name="order" type="number" defaultValue={editing.order} className="rounded-xl" />
              </div>
              <Button type="submit" className="w-full rounded-xl">Сохранить</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
