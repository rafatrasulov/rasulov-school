"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSection, deleteSection } from "./actions";

const GRADES = [5, 6, 7, 8, 9, 10, 11];

interface SectionRow {
  id: string;
  title: string;
  order: number;
  published: boolean;
  grade: number | null;
  created_at: string;
}

export function SectionsList({ sections }: { sections: SectionRow[] }) {
  const [editing, setEditing] = useState<SectionRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grade, setGrade] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    setGrade(editing?.grade != null ? String(editing.grade) : "all");
  }, [editing]);

  async function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError(null);
    formData.set("grade", grade === "all" ? "" : grade);
    const result = await updateSection(editing.id, formData);
    if (result?.error) setError(result.error);
    else {
      setEditing(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить раздел? Будут удалены все темы, уроки и задания внутри.")) return;
    const result = await deleteSection(id);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  if (sections.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-8 text-center">
        Нет разделов. Создайте первый раздел.
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
              <th className="text-left p-4 font-medium">Класс</th>
              <th className="text-left p-4 font-medium">Порядок</th>
              <th className="text-left p-4 font-medium">Опубликован</th>
              <th className="text-right p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">
                  <Link href={`/admin/sections/${s.id}`} className="text-primary hover:underline">
                    {s.title}
                  </Link>
                </td>
                <td className="p-4">{s.grade != null ? `${s.grade} кл.` : "—"}</td>
                <td className="p-4">{s.order}</td>
                <td className="p-4">{s.published ? "Да" : "Нет"}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setEditing(s)}>
                    Изменить
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(s.id)}>
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать раздел</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Название *</Label>
                <Input id="edit_title" name="title" defaultValue={editing.title} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Класс (5–11)</Label>
                <Select
                  value={editing.grade != null ? String(editing.grade) : "all"}
                  onValueChange={setGrade}
                >
                  <SelectTrigger className="rounded-xl w-full">
                    <SelectValue placeholder="Все классы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все классы</SelectItem>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {g} класс
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
