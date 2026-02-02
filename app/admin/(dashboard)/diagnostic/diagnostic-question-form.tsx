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
import { createDiagnosticQuestion } from "./actions";

export function DiagnosticQuestionForm({
  topicId,
  trigger,
}: {
  topicId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("topicId", topicId);
    const result = await createDiagnosticQuestion(topicId, formData);
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
          <DialogTitle>Новый вопрос</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="text">Текст вопроса *</Label>
            <Textarea id="text" name="text" required rows={3} className="rounded-xl resize-none" placeholder="Вопрос анкеты" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Порядок</Label>
            <Input id="order" name="order" type="number" defaultValue={0} className="rounded-xl" />
          </div>
          <Button type="submit" className="w-full rounded-xl">Создать</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
