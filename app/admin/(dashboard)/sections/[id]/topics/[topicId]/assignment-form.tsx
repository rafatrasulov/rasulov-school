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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAssignment } from "./actions";
import { Plus, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  text: "Текст",
  single_choice: "Один вариант",
  multiple_choice: "Несколько вариантов",
  fraction: "Дробь",
  file_upload: "Файл / текст",
};

type OptionItem = { label: string; value: string };

export function AssignmentForm({
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
  const [type, setType] = useState<string>("text");
  const [options, setOptions] = useState<OptionItem[]>([{ label: "", value: "" }]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const router = useRouter();

  const showOptions = type === "single_choice" || type === "multiple_choice";

  function addOption() {
    setOptions((prev) => [...prev, { label: "", value: "" }]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateOption(index: number, field: "label" | "value", value: string) {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "label" && !next[index].value) next[index].value = value.replace(/\s+/g, "_").slice(0, 32) || String(index);
      return next;
    });
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("type", type);
    if (showOptions) {
      const opts = options
        .filter((o) => o.label.trim())
        .map((o) => ({ label: o.label.trim(), value: (o.value || o.label).trim().replace(/\s+/g, "_") || "v" }));
      formData.set("options", JSON.stringify(opts));
      formData.set("correct_answer", correctAnswer);
    }
    const result = await createAssignment(topicId, sectionId, formData);
    if (result?.error) setError(result.error);
    else {
      setOpen(false);
      setOptions([{ label: "", value: "" }]);
      setCorrectAnswer("");
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новое задание</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input id="title" name="title" required className="rounded-xl" placeholder="Название задания" />
          </div>
          <div className="space-y-2">
            <Label>Тип ответа</Label>
            <Select name="type" value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Условие (LaTeX: $формула$ или $$блок$$)</Label>
            <Textarea id="content" name="content" rows={4} className="rounded-xl resize-none font-mono text-sm" placeholder="Найдите $x$ в уравнении $2x + 1 = 5$" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Ссылка на картинку задания</Label>
            <Input id="image_url" name="image_url" type="url" className="rounded-xl" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_file">Загрузить фото</Label>
            <Input id="image_file" name="image_file" type="file" accept="image/*" className="rounded-xl" />
            <p className="text-xs text-muted-foreground">Если загрузите фото, оно будет использовано вместо ссылки.</p>
          </div>
          {showOptions ? (
            <div className="space-y-2">
              <Label htmlFor="correct_answer_select">Правильный ответ *</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer} required>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Выберите правильный ответ" />
                </SelectTrigger>
                <SelectContent>
                  {options
                    .filter(opt => opt.label.trim())
                    .map((opt, i) => {
                      const value = (opt.value || opt.label).trim().replace(/\s+/g, "_") || "v";
                      return (
                        <SelectItem key={i} value={value}>
                          {opt.label}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Выберите правильный вариант из списка выше.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="correct_answer">Правильный ответ (для проверки)</Label>
              <Input id="correct_answer" name="correct_answer" className="rounded-xl" placeholder="Для дробей: 1/2 или 0.5" />
            </div>
          )}
          {showOptions && (
            <div className="space-y-2">
              <Label>Варианты ответа</Label>
              {options.map((opt, index) => (
                <div key={index} className="flex gap-2 items-center rounded-xl border border-border p-2">
                  <Input
                    placeholder="Текст варианта"
                    value={opt.label}
                    onChange={(e) => updateOption(index, "label", e.target.value)}
                    className="rounded-lg flex-1"
                  />
                  <Input
                    placeholder="Значение (опц.)"
                    value={opt.value}
                    onChange={(e) => updateOption(index, "value", e.target.value)}
                    className="rounded-lg w-28"
                  />
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeOption(index)} aria-label="Удалить вариант">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="rounded-xl gap-1" onClick={addOption}>
                <Plus className="h-4 w-4" />
                Добавить вариант
              </Button>
            </div>
          )}
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
