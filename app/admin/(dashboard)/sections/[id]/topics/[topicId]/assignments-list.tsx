"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAssignment, deleteAssignment } from "./actions";
import { Plus, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  text: "Текст",
  single_choice: "Один вариант",
  multiple_choice: "Несколько",
  fraction: "Дробь",
  file_upload: "Файл",
};

type OptionItem = { label: string; value: string };

interface AssignmentRow {
  id: string;
  title: string;
  type: string;
  order: number;
  published: boolean;
  content?: string | null;
  image_url?: string | null;
  correct_answer?: string | null;
  options?: unknown;
}

function parseOptions(opts: unknown): OptionItem[] {
  if (Array.isArray(opts) && opts.length > 0) {
    return opts.map((o) => ({
      label: typeof o?.label === "string" ? o.label : String(o?.value ?? ""),
      value: typeof o?.value === "string" ? o.value : String(o?.label ?? "").replace(/\s+/g, "_") || "v",
    }));
  }
  return [{ label: "", value: "" }];
}

export function AssignmentsList({
  topicId,
  sectionId,
  assignments,
}: {
  topicId: string;
  sectionId: string;
  assignments: AssignmentRow[];
}) {
  const [editing, setEditing] = useState<AssignmentRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<string>("text");
  const [options, setOptions] = useState<OptionItem[]>([{ label: "", value: "" }]);
  const router = useRouter();

  const showOptions = type === "single_choice" || type === "multiple_choice";

  useEffect(() => {
    if (editing && showOptions) {
      setOptions(parseOptions(editing.options));
    } else if (editing && !showOptions) {
      setOptions([{ label: "", value: "" }]);
    }
  }, [editing, showOptions]);

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

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    formData.set("type", type);
    const result = await updateAssignment(editing.id, topicId, sectionId, formData);
    if (result && 'error' in result) setError(result.error);
    else {
      setEditing(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить задание?")) return;
    const result = await deleteAssignment(id, topicId, sectionId);
    if (result && 'error' in result) setError(result.error);
    else router.refresh();
  }

  if (assignments.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">
        Нет заданий. Добавьте первое задание.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <ul className="space-y-2">
        {assignments.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-xl border border-border p-4">
            <span className="font-medium">{a.title}</span>
            <span className="text-sm text-muted-foreground">{TYPE_LABELS[a.type] ?? a.type}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => { setEditing(a); setType(a.type); }}>Изменить</Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}>Удалить</Button>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать задание</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Название *</Label>
                <Input id="edit_title" name="title" defaultValue={editing.title} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Тип</Label>
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
                <Label htmlFor="edit_content">Условие (LaTeX)</Label>
                <Textarea id="edit_content" name="content" rows={4} defaultValue={editing.content ?? ""} className="rounded-xl resize-none font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_image_url">Ссылка на картинку</Label>
                <Input id="edit_image_url" name="image_url" type="url" defaultValue={editing.image_url ?? ""} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_image_file">Загрузить фото</Label>
                <Input id="edit_image_file" name="image_file" type="file" accept="image/*" className="rounded-xl" />
                <p className="text-xs text-muted-foreground">Если загрузите фото, оно будет использовано вместо ссылки.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_correct_answer">Правильный ответ</Label>
                <Input id="edit_correct_answer" name="correct_answer" defaultValue={editing.correct_answer ?? ""} className="rounded-xl" />
              </div>
              {!showOptions && <input type="hidden" name="options" value="[]" />}
              {showOptions && (
                <div className="space-y-2">
                  <input type="hidden" name="options" value={JSON.stringify(options.filter((o) => o.label.trim()).map((o) => ({ label: o.label.trim(), value: (o.value || o.label).trim().replace(/\s+/g, "_") || "v" })))} />
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
