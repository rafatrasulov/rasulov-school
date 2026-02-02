"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AssignmentType } from "@/lib/database.types";

function normalizeAnswer(str: string | null): string {
  return (str ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}

function checkAnswer(
  userAnswer: string | null,
  correctAnswer: string | null,
  type: AssignmentType
): number | null {
  if (!correctAnswer) return null;

  const userNorm = normalizeAnswer(userAnswer);
  const correctNorm = normalizeAnswer(correctAnswer);

  if (!userNorm) return 0;

  // Для single_choice, multiple_choice, text, fraction - точное совпадение
  if (
    type === "single_choice" ||
    type === "multiple_choice" ||
    type === "text" ||
    type === "fraction"
  ) {
    return userNorm === correctNorm ? 100 : 0;
  }

  // Для file_upload автоматическая проверка не применяется
  return null;
}

export async function submitAssignment(
  assignmentId: string,
  answer: string,
  type: AssignmentType
): Promise<{ error?: string; score?: number | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Нужно войти в аккаунт." };
  }

  // Получаем правильный ответ из БД
  const { data: assignment } = await supabase
    .from("assignments")
    .select("correct_answer")
    .eq("id", assignmentId)
    .single();

  // Автоматическая проверка
  const score = assignment?.correct_answer
    ? checkAnswer(answer, assignment.correct_answer, type)
    : null;

  const { error } = await supabase.from("assignment_submissions").upsert(
    {
      assignment_id: assignmentId,
      user_id: user.id,
      answer: answer || null,
      answer_json:
        type === "single_choice" || type === "multiple_choice"
          ? { value: answer }
          : null,
      score: score,
    },
    { onConflict: "assignment_id,user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/assignments/[id]", "page");
  return { score };
}
