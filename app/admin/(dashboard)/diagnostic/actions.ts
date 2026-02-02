"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDiagnosticTopic(formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Введите название темы" };
  const description = (formData.get("description") as string)?.trim() || null;
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const published = formData.get("published") === "on";
  const { error } = await supabase.from("diagnostic_topics").insert({ title, description, order, published });
  if (error) return { error: error.message };
  revalidatePath("/admin/diagnostic");
  revalidatePath("/diagnostic");
  return { success: true };
}

export async function updateDiagnosticTopic(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : undefined;
  const published = formData.get("published") === "on";
  const updates: Record<string, unknown> = { published };
  if (title != null) updates.title = title;
  if (description != null) updates.description = description;
  if (order != null) updates.order = order;
  const { error } = await supabase.from("diagnostic_topics").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/diagnostic");
  revalidatePath("/diagnostic");
  return { success: true };
}

export async function deleteDiagnosticTopic(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("diagnostic_topics").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/diagnostic");
  revalidatePath("/diagnostic");
  return { success: true };
}

export async function createDiagnosticQuestion(topicId: string, formData: FormData) {
  const supabase = await createClient();
  const text = (formData.get("text") as string)?.trim();
  if (!text) return { error: "Введите текст вопроса" };
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const { error } = await supabase.from("diagnostic_questions").insert({ diagnostic_topic_id: topicId, text, order });
  if (error) return { error: error.message };
  revalidatePath("/admin/diagnostic");
  revalidatePath("/diagnostic");
  return { success: true };
}

export async function updateDiagnosticQuestion(questionId: string, topicId: string, formData: FormData) {
  const supabase = await createClient();
  const text = (formData.get("text") as string)?.trim();
  const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : undefined;
  const updates: Record<string, unknown> = {};
  if (text != null) updates.text = text;
  if (order != null) updates.order = order;
  const { error } = await supabase.from("diagnostic_questions").update(updates).eq("id", questionId);
  if (error) return { error: error.message };
  revalidatePath("/admin/diagnostic");
  revalidatePath("/diagnostic");
  return { success: true };
}

export async function deleteDiagnosticQuestion(questionId: string, topicId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("diagnostic_questions").delete().eq("id", questionId);
  if (error) return { error: error.message };
  revalidatePath("/admin/diagnostic");
  revalidatePath("/diagnostic");
  return { success: true };
}
