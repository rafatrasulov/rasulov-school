"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ASSIGNMENT_IMAGES_BUCKET = "assignment-images";

async function uploadAssignmentImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  topicId: string,
  file: File
): Promise<string | { error: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const path = `assignments/${topicId}/${crypto.randomUUID()}.${safeExt}`;
  const { error } = await supabase.storage
    .from(ASSIGNMENT_IMAGES_BUCKET)
    .upload(path, file, { upsert: false });
  if (error) return { error: `Ошибка загрузки фото: ${error.message}` };
  const { data } = supabase.storage.from(ASSIGNMENT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createLesson(topicId: string, sectionId: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Введите название урока" };
  const content = (formData.get("content") as string) || null;
  const video_url = (formData.get("video_url") as string)?.trim() || null;
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const published = formData.get("published") === "on";
  const { error } = await supabase.from("lessons").insert({ topic_id: topicId, title, content, video_url, order, published });
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}/topics/${topicId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateLesson(lessonId: string, topicId: string, sectionId: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string) || null;
  const video_url = (formData.get("video_url") as string)?.trim() || null;
  const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : undefined;
  const published = formData.get("published") === "on";
  const updates: Record<string, unknown> = { published };
  if (title != null) updates.title = title;
  if (content != null) updates.content = content;
  if (video_url != null) updates.video_url = video_url;
  if (order != null) updates.order = order;
  const { error } = await supabase.from("lessons").update(updates).eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}/topics/${topicId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteLesson(lessonId: string, topicId: string, sectionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}/topics/${topicId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createAssignment(topicId: string, sectionId: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Введите название задания" };
  const type = (formData.get("type") as "text" | "single_choice" | "multiple_choice" | "fraction" | "file_upload") || "text";
  const content = (formData.get("content") as string) || null;
  let image_url = (formData.get("image_url") as string)?.trim() || null;
  const imageFile = formData.get("image_file") as File | null;
  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadAssignmentImage(supabase, topicId, imageFile);
    if (typeof uploaded === "object") return uploaded;
    image_url = uploaded;
  }
  const correct_answer = (formData.get("correct_answer") as string)?.trim() || null;
  const optionsStr = (formData.get("options") as string)?.trim();
  let options: unknown = null;
  if (optionsStr) {
    try {
      options = JSON.parse(optionsStr);
    } catch {
      options = optionsStr;
    }
  }
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const published = formData.get("published") === "on";
  const { error } = await supabase.from("assignments").insert({
    topic_id: topicId, title, type, content, image_url, correct_answer, options, order, published,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}/topics/${topicId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAssignment(
  assignmentId: string,
  topicId: string,
  sectionId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  const type = formData.get("type") as "text" | "single_choice" | "multiple_choice" | "fraction" | "file_upload" | null;
  const content = (formData.get("content") as string) || null;
  let image_url = (formData.get("image_url") as string)?.trim() || null;
  const imageFile = formData.get("image_file") as File | null;
  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadAssignmentImage(supabase, topicId, imageFile);
    if (typeof uploaded === "object") return uploaded;
    image_url = uploaded;
  }
  const correct_answer = (formData.get("correct_answer") as string)?.trim() || null;
  const optionsStr = (formData.get("options") as string)?.trim();
  let options: unknown = null;
  if (optionsStr) {
    try {
      options = JSON.parse(optionsStr);
    } catch {
      options = optionsStr;
    }
  }
  const order = formData.get("order") ? parseInt(formData.get("order") as string, 10) : undefined;
  const published = formData.get("published") === "on";
  const updates: Record<string, unknown> = { published };
  if (title != null) updates.title = title;
  if (type != null) updates.type = type;
  if (content != null) updates.content = content;
  if (image_url != null) updates.image_url = image_url;
  if (correct_answer != null) updates.correct_answer = correct_answer;
  if (options != null) updates.options = options;
  if (order != null) updates.order = order;
  const { error } = await supabase.from("assignments").update(updates).eq("id", assignmentId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}/topics/${topicId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAssignment(assignmentId: string, topicId: string, sectionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/sections/${sectionId}/topics/${topicId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
