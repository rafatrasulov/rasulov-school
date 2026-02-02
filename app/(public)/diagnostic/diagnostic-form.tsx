"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface Topic {
  id: string;
  title: string;
  description: string | null;
}

export function DiagnosticForm({ topics }: { topics: Topic[] }) {
  const [mode, setMode] = useState<"topic" | "free">("topic");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [questions, setQuestions] = useState<{ id: string; text: string; order: number }[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  async function loadQuestions(topicId: string) {
    setLoadingQuestions(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("diagnostic_questions")
      .select("id, text, order")
      .eq("diagnostic_topic_id", topicId)
      .order("order", { ascending: true });
    setQuestions(data ?? []);
    setAnswers({});
    setLoadingQuestions(false);
  }

  async function handleSubmitTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTopicId || questions.length === 0) {
      setMessage({ type: "error", text: "Выберите тему и дождитесь загрузки вопросов." });
      return;
    }
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("diagnostic_submissions").insert({
      diagnostic_topic_id: selectedTopicId,
      user_id: user?.id ?? null,
      type: "topic",
      answers: answers,
    });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Анкета отправлена. Спасибо!" });
    setAnswers({});
    router.refresh();
  }

  async function handleSubmitFree(e: React.FormEvent) {
    e.preventDefault();
    if (!freeText.trim()) {
      setMessage({ type: "error", text: "Напишите, что вам не понятно." });
      return;
    }
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("diagnostic_submissions").insert({
      diagnostic_topic_id: null,
      user_id: user?.id ?? null,
      type: "free_text",
      free_text: freeText.trim(),
    });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Сообщение отправлено. Учитель свяжется с вами." });
    setFreeText("");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-4 flex-wrap">
        <Button
          variant={mode === "topic" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => { setMode("topic"); setSelectedTopicId(""); setQuestions([]); setMessage(null); }}
        >
          По теме (анкета)
        </Button>
        <Button
          variant={mode === "free" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => { setMode("free"); setMessage(null); }}
        >
          Написать, что не понятно
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 text-sm ${
            message.type === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {mode === "topic" && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Выберите тему</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Тема диагностики</Label>
              <Select
                value={selectedTopicId}
                onValueChange={(v) => {
                  setSelectedTopicId(v);
                  if (v) loadQuestions(v);
                }}
              >
                <SelectTrigger className="rounded-xl w-full">
                  <SelectValue placeholder="Выберите тему" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {topics.find((t) => t.id === selectedTopicId)?.description && (
                <p className="text-sm text-muted-foreground">
                  {topics.find((t) => t.id === selectedTopicId)?.description}
                </p>
              )}
            </div>
            {loadingQuestions && <p className="text-sm text-muted-foreground">Загрузка вопросов...</p>}
            {!loadingQuestions && questions.length > 0 && (
              <form onSubmit={handleSubmitTopic} className="space-y-4 pt-4 border-t border-border">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label htmlFor={`q-${q.id}`}>{q.text}</Label>
                    <Input
                      id={`q-${q.id}`}
                      value={answers[q.id] ?? ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      className="rounded-xl"
                      placeholder="Ваш ответ"
                    />
                  </div>
                ))}
                <Button type="submit" className="rounded-xl w-full" disabled={loading}>
                  {loading ? "Отправка..." : "Отправить анкету"}
                </Button>
              </form>
            )}
            {!loadingQuestions && selectedTopicId && questions.length === 0 && (
              <p className="text-sm text-muted-foreground">В этой теме пока нет вопросов.</p>
            )}
          </CardContent>
        </Card>
      )}

      {mode === "free" && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Что вам не понятно?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Опишите своими словами тему или задачу. Учитель увидит ваше сообщение.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitFree} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="free_text">Ваше сообщение</Label>
                <Textarea
                  id="free_text"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  rows={5}
                  className="rounded-xl resize-none"
                  placeholder="Например: не понимаю, как решать квадратные уравнения..."
                />
              </div>
              <Button type="submit" className="rounded-xl w-full" disabled={loading}>
                {loading ? "Отправка..." : "Отправить"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">На главную</Link>
      </p>
    </div>
  );
}
