"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateSubmissionScore } from "./actions";
import type { AssignmentType } from "@/lib/database.types";

interface SubmissionRow {
  id: string;
  assignment_id: string;
  user_id: string;
  answer: string | null;
  answer_json: unknown;
  score: number | null;
  teacher_feedback: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface SubmissionsListProps {
  submissions: SubmissionRow[];
  assignmentType: AssignmentType;
  correctAnswer: string | null;
}

export function SubmissionsList({
  submissions,
  assignmentType,
  correctAnswer,
}: SubmissionsListProps) {
  const [detail, setDetail] = useState<SubmissionRow | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGrade() {
    if (!detail) return;
    setError(null);
    setLoading(true);

    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum)) {
      setError("Введите корректное число");
      setLoading(false);
      return;
    }

    const result = await updateSubmissionScore(detail.id, scoreNum, feedback || null);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setDetail(null);
    setScore("");
    setFeedback("");
    router.refresh();
  }

  function checkAnswer(submission: SubmissionRow): boolean | null {
    if (!correctAnswer) return null;
    
    const normalizeAnswer = (str: string | null) => 
      (str ?? "").toLowerCase().trim().replace(/\s+/g, " ");

    if (assignmentType === "single_choice" || assignmentType === "multiple_choice") {
      return normalizeAnswer(submission.answer) === normalizeAnswer(correctAnswer);
    }
    
    if (assignmentType === "fraction" || assignmentType === "text") {
      return normalizeAnswer(submission.answer) === normalizeAnswer(correctAnswer);
    }

    return null;
  }

  if (submissions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Пока нет ответов от учеников.
      </p>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Ученик</th>
              <th className="text-left p-4 font-medium">Ответ</th>
              <th className="text-left p-4 font-medium">Правильно</th>
              <th className="text-left p-4 font-medium">Оценка</th>
              <th className="text-left p-4 font-medium">Дата</th>
              <th className="text-right p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const isCorrect = checkAnswer(s);
              return (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="p-4 font-medium">
                    {s.profiles?.full_name || s.profiles?.email || "—"}
                  </td>
                  <td className="p-4">
                    <span className="line-clamp-2">
                      {s.answer || "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    {isCorrect === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : isCorrect ? (
                      <span className="text-green-600 font-medium">✓ Да</span>
                    ) : (
                      <span className="text-destructive font-medium">✗ Нет</span>
                    )}
                  </td>
                  <td className="p-4">
                    {s.score != null ? (
                      <span className="font-semibold text-primary">
                        {s.score}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => {
                        setDetail(s);
                        setScore(s.score?.toString() ?? "");
                        setFeedback(s.teacher_feedback ?? "");
                        setError(null);
                      }}
                    >
                      Оценить
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Оценка ответа</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Ученик</p>
                <p className="font-medium">
                  {detail.profiles?.full_name || detail.profiles?.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Ответ</p>
                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <p className="whitespace-pre-wrap">{detail.answer || "—"}</p>
                </div>
              </div>

              {correctAnswer && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Правильный ответ
                  </p>
                  <div className="rounded-xl border border-primary/30 p-4 bg-primary/5">
                    <p className="font-medium">{correctAnswer}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl p-3 text-sm bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="score">Оценка (балл)</Label>
                <Input
                  id="score"
                  type="number"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0-100"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Комментарий ученику</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Объяснение ошибок, рекомендации..."
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setDetail(null)}
                  className="rounded-xl"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleGrade}
                  disabled={loading}
                  className="rounded-xl"
                >
                  {loading ? "Сохранение..." : "Сохранить оценку"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
