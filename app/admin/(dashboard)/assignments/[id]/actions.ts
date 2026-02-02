"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSubmissionScore(
  submissionId: string,
  score: number
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Не авторизован" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    return { error: "Доступ запрещен" };
  }

  const { error } = await supabase
    .from("assignment_submissions")
    .update({ score })
    .eq("id", submissionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/assignments/[id]", "page");
  return {};
}
