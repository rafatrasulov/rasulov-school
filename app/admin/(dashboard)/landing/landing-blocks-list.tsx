"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { updateLandingBlock, moveLandingBlock } from "./actions";
import { BlockEditForm } from "./block-edit-form";

type BlockRow = {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  props: Record<string, unknown>;
};

export function LandingBlocksList({
  blocks,
  typeLabels,
}: {
  blocks: BlockRow[];
  typeLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<BlockRow | null>(null);

  async function handleVisibleChange(block: BlockRow, checked: boolean) {
    await updateLandingBlock(block.id, { visible: checked });
    router.refresh();
  }

  async function handleMove(block: BlockRow, direction: "up" | "down") {
    await moveLandingBlock(block.id, direction);
    router.refresh();
  }

  if (blocks.length === 0) {
    return (
      <p className="mt-8 text-muted-foreground rounded-2xl border border-dashed border-border p-8 text-center">
        Нет блоков. Выполните миграцию 007_landing_blocks.sql в Supabase.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <Checkbox
            id={`visible-${block.id}`}
            checked={block.visible}
            onCheckedChange={(checked) => handleVisibleChange(block, checked === true)}
          />
          <label htmlFor={`visible-${block.id}`} className="text-sm font-medium cursor-pointer">
            Показывать
          </label>
          <span className="text-muted-foreground font-mono text-sm">{block.order}</span>
          <span className="font-medium">{typeLabels[block.type] ?? block.type}</span>
          <div className="flex gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => handleMove(block, "up")}
              disabled={index === 0}
              aria-label="Вверх"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => handleMove(block, "down")}
              disabled={index === blocks.length - 1}
              aria-label="Вниз"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg gap-2"
              onClick={() => setEditing(block)}
            >
              <Pencil className="h-4 w-4" />
              Редактировать
            </Button>
          </div>
        </div>
      ))}
      <BlockEditForm
        block={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </div>
  );
}
