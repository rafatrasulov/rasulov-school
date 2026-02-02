"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AssignmentType } from "@/lib/database.types";
import { submitAssignment } from "./actions";

interface AssignmentFormProps {
  assignmentId: string;
  type: AssignmentType;
  options: unknown;
}

export function AssignmentForm({ assignmentId, type, options }: AssignmentFormProps) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; score?: number | null } | null>(null);
  const router = useRouter();

  const opts = Array.isArray(options) ? options : (options as { label?: string; value?: string }[] | null) ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const result = await submitAssignment(assignmentId, answer, type);
    setLoading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }

    if (result.score !== undefined && result.score !== null) {
      const scoreText = result.score === 100 
        ? "Ответ правильный! 🎉" 
        : result.score === 0 
        ? "Ответ неправильный. Попробуйте еще раз." 
        : `Ответ оценен на ${result.score} баллов.`;
      setMessage({ type: result.score > 0 ? "success" : "error", text: scoreText, score: result.score });
    } else {
      setMessage({ type: "success", text: "Ответ сохранён и отправлен на проверку учителю." });
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
      {message && (
        <div
          className={`rounded-xl p-3 text-sm ${
            message.type === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}
      {(type === "text" || type === "fraction") && (
        <div className="space-y-2">
          <Label htmlFor="answer">
            {type === "fraction" ? "Ответ (дробь, например 1/2 или 0.5)" : "Ваш ответ"}
          </Label>
          <Input
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={type === "fraction" ? "1/2" : "Введите ответ"}
            className="rounded-xl"
          />
        </div>
      )}
      {type === "single_choice" && opts.length > 0 && (
        <div className="space-y-2">
          <Label>Выберите ответ</Label>
          <div className="space-y-2">
            {opts.map((opt: { label?: string; value?: string }, i: number) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value={opt.value ?? opt.label ?? ""}
                  checked={answer === (opt.value ?? opt.label ?? "")}
                  onChange={() => setAnswer(opt.value ?? opt.label ?? "")}
                  className="rounded-full"
                />
                <span>{opt.label ?? opt.value}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {type === "multiple_choice" && opts.length > 0 && (
        <div className="space-y-2">
          <Label>Выберите один или несколько ответов</Label>
          <div className="space-y-2">
            {opts.map((opt: { label?: string; value?: string }, i: number) => {
              const val = opt.value ?? opt.label ?? "";
              const checked = answer.split(",").includes(val);
              return (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const arr = answer ? answer.split(",") : [];
                      if (arr.includes(val)) setAnswer(arr.filter((x) => x !== val).join(","));
                      else setAnswer([...arr, val].join(","));
                    }}
                    className="rounded"
                  />
                  <span>{opt.label ?? opt.value}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      {type === "file_upload" && (
        <div className="space-y-2">
          <Label>Ответ (текстом или опишите загруженный файл)</Label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Опишите ответ или прикрепите ссылку на файл"
            rows={3}
            className="rounded-xl resize-none"
          />
        </div>
      )}
      <Button type="submit" className="rounded-xl" disabled={loading}>
        {loading ? "Сохранение..." : "Отправить ответ"}
      </Button>
    </form>
  );
}
