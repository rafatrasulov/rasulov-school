"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTopic(sectionId: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Введите название темы" };
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const published = formData.get("published") === "on";
  const { error } = await supabase.from("topics").insert({ section_id: sectionId, title, order, published });
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTopic(topicId: string, sectionId: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : undefined;
  const published = formData.get("published") === "on";
  const updates: Record<string, unknown> = { published };
  if (title != null) updates.title = title;
  if (order != null) updates.order = order;
  const { error } = await supabase.from("topics").update(updates).eq("id", topicId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTopic(topicId: string, sectionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
