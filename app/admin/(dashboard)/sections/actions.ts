"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSection(formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Введите название раздела" };
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const published = formData.get("published") === "on";
  const gradeStr = (formData.get("grade") as string)?.trim();
  const isAllOrEmpty = !gradeStr || gradeStr === "all";
  const grade = !isAllOrEmpty ? parseInt(gradeStr, 10) : null;
  const validGrade = grade != null && grade >= 5 && grade <= 11 ? grade : null;
  const { error } = await supabase.from("sections").insert({ title, order, published, grade: validGrade });
  if (error) return { error: error.message };
  revalidatePath("/admin/sections");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSection(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : undefined;
  const published = formData.get("published") === "on";
  const gradeStr = (formData.get("grade") as string)?.trim();
  const isAllOrEmpty = !gradeStr || gradeStr === "all";
  const grade = !isAllOrEmpty ? parseInt(gradeStr, 10) : null;
  const validGrade = grade != null && grade >= 5 && grade <= 11 ? grade : null;
  const updates: Record<string, unknown> = { published, grade: validGrade };
  if (title != null) updates.title = title;
  if (order != null) updates.order = order;
  const { error } = await supabase.from("sections").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sections");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sections");
  revalidatePath("/dashboard");
  return { success: true };
}
