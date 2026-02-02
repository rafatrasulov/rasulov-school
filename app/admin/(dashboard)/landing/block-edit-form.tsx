"use client";

import { useEffect, useMemo, useState } from "react";
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

// ✅ Server action result type (matches your union error)
type ActionResult = { error: string } | { success: boolean };

// ✅ Type guard fixes: "Property 'error' does not exist on type ... "
function hasError(result: ActionResult | undefined | null): result is { error: string } {
  return !!result && "error" in result;
}

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
    if (block) setProps(block.props ?? {});
  }, [block]);

  const blockId = block?.id ?? "";
  const blockType = block?.type ?? "";

  const set = (key: string, value: unknown) =>
    setProps((p) => ({ ...p, [key]: value }));

  const itemsText = useMemo(() => {
    if (!block) return "";
    if (blockType === "stepper") {
      return JSON.stringify((props.steps as unknown[]) ?? [], null, 2);
    }
    return JSON.stringify((props.items as unknown[]) ?? [], null, 2);
  }, [block, blockType, props.items, props.steps]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!block) return;

    setError(null);

    const result = (await updateLandingBlock(block.id, { props })) as
      | ActionResult
      | undefined;

    if (hasError(result)) {
      setError(result.error);
      return;
    }

    // success path
    onSaved();
  }

  if (!block) return null;

  return (
    <Dialog open={!!block} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать блок: {blockType}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {blockType === "hero" && (
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

          {(blockType === "about_teacher" || blockType === "calendar") && (
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={(props.title as string) ?? ""}
                onChange={(e) => set("title", e.target.value)}
                className="rounded-xl"
              />

              {blockType === "calendar" && (
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

          {(blockType === "benefits" ||
            blockType === "stepper" ||
            blockType === "faq") && (
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
                  {blockType === "benefits" &&
                    "Пункты (JSON: массив {title, description})"}
                  {blockType === "stepper" &&
                    "Шаги (JSON: массив {title, description})"}
                  {blockType === "faq" && "Вопросы (JSON: массив {q, a})"}
                </Label>

                <Textarea
                  id="items"
                  rows={10}
                  className="rounded-xl font-mono text-sm resize-y"
                  value={itemsText}
                  onChange={(e) => {
                    const raw = e.target.value;

                    // ✅ allow editing freely; only update props when JSON becomes valid
                    try {
                      const arr = JSON.parse(raw || "[]");
                      if (blockType === "stepper") set("steps", arr);
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
            <Button type="submit" className="rounded-xl">
              Сохранить
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={onClose}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
