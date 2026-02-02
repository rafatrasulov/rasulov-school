"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLandingBlock(id: string, updates: { visible?: boolean; order?: number; props?: Record<string, unknown> }) {
  const supabase = await createClient();
  const { error } = await supabase.from("landing_blocks").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/landing");
  revalidatePath("/");
  return { success: true };
}

export async function moveLandingBlock(id: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: block } = await supabase.from("landing_blocks").select("id, order").eq("id", id).single();
  if (!block) return { error: "Блок не найден" };
  const { data: all } = await supabase.from("landing_blocks").select("id, order").order("order", { ascending: true });
  if (!all || all.length < 2) return { success: true };
  const idx = all.findIndex((b) => b.id === id);
  if (idx < 0) return { error: "Блок не найден" };
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return { success: true };
  const other = all[swapIdx];
  await supabase.from("landing_blocks").update({ order: other.order }).eq("id", id);
  await supabase.from("landing_blocks").update({ order: block.order }).eq("id", other!.id);
  revalidatePath("/admin/landing");
  revalidatePath("/");
  return { success: true };
}
