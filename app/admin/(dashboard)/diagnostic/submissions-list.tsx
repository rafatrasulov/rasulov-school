"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubmissionRow {
  id: string;
  diagnostic_topic_id: string | null;
  user_id: string | null;
  type: string;
  answers: unknown;
  free_text: string | null;
  created_at: string;
}

interface TopicRow {
  id: string;
  title: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionsList({
  submissions,
  topics,
}: {
  submissions: SubmissionRow[];
  topics: TopicRow[];
}) {
  const [detail, setDetail] = useState<SubmissionRow | null>(null);

  if (submissions.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">
        Пока нет отправок.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Дата</th>
              <th className="text-left p-4 font-medium">Тип</th>
              <th className="text-left p-4 font-medium">Тема / текст</th>
              <th className="text-right p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="p-4">{formatDateTime(s.created_at)}</td>
                <td className="p-4">{s.type === "free_text" ? "Свободный текст" : "По теме"}</td>
                <td className="p-4">
                  {s.type === "free_text"
                    ? (s.free_text ?? "").slice(0, 60) + ((s.free_text?.length ?? 0) > 60 ? "…" : "")
                    : topics.find((t) => t.id === s.diagnostic_topic_id)?.title ?? "—"}
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setDetail(s)}>
                    Подробнее
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Отправка диагностики</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                {formatDateTime(detail.created_at)} · {detail.type === "free_text" ? "Свободный текст" : "По теме"}
              </p>
              {detail.type === "free_text" && detail.free_text && (
                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Текст</p>
                  <p className="whitespace-pre-wrap">{detail.free_text}</p>
                </div>
              )}
              {detail.type === "topic" && detail.answers != null && typeof detail.answers === "object" ? (
                <div className="rounded-xl border border-border p-4 bg-muted/30 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Ответы по теме</p>
                  {Object.entries(detail.answers as Record<string, string>).map(([qId, ans]) => (
                    <div key={qId}>
                      <p className="text-xs text-muted-foreground">Вопрос ID: {qId}</p>
                      <p className="font-medium">{ans}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
