"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SlotStatus, SlotType } from "@/lib/database.types";

export async function createSlot(formData: FormData) {
  const supabase = await createClient();
  const startTime = formData.get("start_time") as string;
  const durationMinutes = parseInt(formData.get("duration_minutes") as string, 10);
  const type = (formData.get("type") as SlotType) || "trial";
  const status = (formData.get("status") as SlotStatus) || "free";
  const capacity = parseInt(formData.get("capacity") as string, 10) || 1;

  if (!startTime || durationMinutes <= 0) {
    return { error: "Укажите дату/время и длительность" };
  }

  const { error } = await supabase.from("slots").insert({
    start_time: new Date(startTime).toISOString(),
    duration_minutes: durationMinutes,
    type,
    status,
    capacity: capacity >= 1 ? capacity : 1,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/slots");
  revalidatePath("/");
  return { success: true };
}

export async function updateSlot(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();
  const startTime = formData.get("start_time") as string;
  const durationMinutes = formData.get("duration_minutes")
    ? parseInt(formData.get("duration_minutes") as string, 10)
    : undefined;
  const type = formData.get("type") as SlotType | null;
  const status = formData.get("status") as SlotStatus | null;
  const capacity = formData.get("capacity") ? parseInt(formData.get("capacity") as string, 10) : undefined;

  const updates: Record<string, unknown> = {};
  if (startTime) updates.start_time = new Date(startTime).toISOString();
  if (durationMinutes != null && durationMinutes > 0) updates.duration_minutes = durationMinutes;
  if (type) updates.type = type;
  if (status) updates.status = status;
  if (capacity != null && capacity >= 1) updates.capacity = capacity;

  const { error } = await supabase.from("slots").update(updates).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/slots");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSlot(id: string) {
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("slot_id", id)
    .limit(1)
    .single();

  if (booking) {
    return { error: "Нельзя удалить слот с заявкой. Сначала отмените заявку." };
  }

  const { error } = await supabase.from("slots").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/slots");
  revalidatePath("/");
  return { success: true };
}
