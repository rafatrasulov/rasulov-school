"use client";

import { useState, useEffect } from "react";
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
import { updateLandingBlock } from "./actions";

type BlockRow = {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  props: Record<string, unknown>;
};

export function BlockEditForm({
  block,
  onClose,
  onSaved,
}: {
  block: BlockRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [props, setProps] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (block) setProps(block.props || {});
  }, [block]);

  if (!block) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await updateLandingBlock(block.id, { props });
    if (result?.error) {
      setError(result.error);
      return;
    }
    onSaved();
  }

  const set = (key: string, value: unknown) => setProps((p) => ({ ...p, [key]: value }));

  return (
    <Dialog open={!!block} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать блок: {block.type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          {block.type === "hero" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  value={(props.title as string) ?? ""}
                  onChange={(e) => set("title", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Подзаголовок</Label>
                <Input
                  id="subtitle"
                  value={(props.subtitle as string) ?? ""}
                  onChange={(e) => set("subtitle", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_text">Текст кнопки</Label>
                <Input
                  id="cta_text"
                  value={(props.cta_text as string) ?? ""}
                  onChange={(e) => set("cta_text", e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </>
          )}
          {(block.type === "about_teacher" || block.type === "calendar") && (
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={(props.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
                className="rounded-xl"
              />
              {block.type === "calendar" && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    value={(props.description as string) ?? ""}
                    onChange={(e) => set("description", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              )}
            </div>
          )}
          {(block.type === "benefits" || block.type === "stepper" || block.type === "faq") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input
                  id="title"
                  value={(props.title as string) ?? ""}
                  onChange={(e) => set("title", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание (подзаголовок)</Label>
                <Input
                  id="description"
                  value={(props.description as string) ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="items">
                  {block.type === "benefits" && "Пункты (JSON: массив {title, description})"}
                  {block.type === "stepper" && "Шаги (JSON: массив {title, description})"}
                  {block.type === "faq" && "Вопросы (JSON: массив {q, a})"}
                </Label>
                <Textarea
                  id="items"
                  rows={10}
                  className="rounded-xl font-mono text-sm resize-y"
                  value={
                    block.type === "stepper"
                      ? JSON.stringify((props.steps as unknown[]) ?? [], null, 2)
                      : JSON.stringify((props.items as unknown[]) ?? [], null, 2)
                  }
                  onChange={(e) => {
                    try {
                      const arr = JSON.parse(e.target.value || "[]");
                      if (block.type === "stepper") set("steps", arr);
                      else set("items", arr);
                    } catch {
                      // ignore invalid json while typing
                    }
                  }}
                />
              </div>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="rounded-xl">Сохранить</Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
