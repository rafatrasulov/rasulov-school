"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const AVATAR_BUCKET = "avatars";

export async function updateTeacherProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Необходимо войти" };

  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const experience = (formData.get("experience") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const file = formData.get("avatar") as File | null;

  let avatar_url: string | null = null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true });
    if (uploadError) {
      return { error: `Ошибка загрузки фото: ${uploadError.message}` };
    }
    const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    avatar_url = urlData.publicUrl;
  }

  const updates: Record<string, unknown> = { full_name, experience, bio };
  if (avatar_url != null) updates.avatar_url = avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/profile");
  revalidatePath("/");
  return { success: true };
}
