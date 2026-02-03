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
  type: AssignmentType,
  options: unknown
): number | null {
  if (!correctAnswer) return null;

  const userNorm = normalizeAnswer(userAnswer);
  const correctNorm = normalizeAnswer(correctAnswer);

  if (!userNorm) return 0;

  // Для single_choice и multiple_choice: проверяем соответствие value ИЛИ label
  if (type === "single_choice" || type === "multiple_choice") {
    const opts = Array.isArray(options) ? options : [];
    
    // Проверяем прямое совпадение
    if (userNorm === correctNorm) return 100;
    
    // Ищем вариант, у которого value = userAnswer
    const selectedOption = opts.find((opt: any) => {
      const optValue = normalizeAnswer(opt.value ?? opt.label);
      return optValue === userNorm;
    });
    
    if (selectedOption) {
      const optLabel = normalizeAnswer(selectedOption.label);
      const optValue = normalizeAnswer(selectedOption.value ?? selectedOption.label);
      
      // Проверяем, совпадает ли correct_answer с label или value
      if (correctNorm === optLabel || correctNorm === optValue) {
        return 100;
      }
    }
    
    return 0;
  }

  // Для text, fraction - точное совпадение
  if (type === "text" || type === "fraction") {
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
    .select("correct_answer, options")
    .eq("id", assignmentId)
    .single();

  // Автоматическая проверка
  const score = assignment?.correct_answer
    ? checkAnswer(answer, assignment.correct_answer, type, assignment.options)
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
