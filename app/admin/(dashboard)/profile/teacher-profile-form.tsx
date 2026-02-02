"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateTeacherProfile } from "./actions";

type ProfileRow = {
  full_name: string | null;
  avatar_url: string | null;
  experience: string | null;
  bio: string | null;
} | null;

export function TeacherProfileForm({ profile }: { profile: ProfileRow }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updateTeacherProfile(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="mt-8 rounded-2xl border-border max-w-2xl">
      <CardHeader>
        <h2 className="text-lg font-semibold">Имя, фото, опыт</h2>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="full_name">ФИО (имя, фамилия, отчество)</Label>
            <Input
              id="full_name"
              name="full_name"
              className="rounded-xl"
              placeholder="Расулов Рафат Абульфатович"
              defaultValue={profile?.full_name ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Фото (аватар)</Label>
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              className="rounded-xl"
            />
            {profile?.avatar_url && (
              <p className="text-sm text-muted-foreground">
                Текущее фото:{" "}
                <a href={profile.avatar_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  посмотреть
                </a>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Опыт (кратко)</Label>
            <Input
              id="experience"
              name="experience"
              className="rounded-xl"
              placeholder="Например: 15 лет, подготовка к ОГЭ и ЕГЭ"
              defaultValue={profile?.experience ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">О себе (текст на главной)</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={5}
              className="rounded-xl resize-none"
              placeholder="Кратко о формате занятий и подходе..."
              defaultValue={profile?.bio ?? ""}
            />
          </div>
          <Button type="submit" className="rounded-xl">
            Сохранить
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
