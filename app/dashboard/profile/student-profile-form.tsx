"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStudentProfile } from "./actions";

type ProfileRow = {
  full_name: string | null;
  avatar_url: string | null;
  grade: number | null;
} | null;

const GRADES = [5, 6, 7, 8, 9, 10, 11];

export function StudentProfileForm({ profile }: { profile: ProfileRow }) {
  const [error, setError] = useState<string | null>(null);
  const [grade, setGrade] = useState<string>(profile?.grade != null ? String(profile.grade) : "");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("grade", grade);
    const result = await updateStudentProfile(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="mt-8 rounded-2xl border-border max-w-2xl">
      <CardHeader>
        <h2 className="text-lg font-semibold">Имя, фото, класс</h2>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="full_name">Имя</Label>
            <Input
              id="full_name"
              name="full_name"
              className="rounded-xl"
              placeholder="Ваше имя"
              defaultValue={profile?.full_name ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Фото</Label>
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
            <Label htmlFor="grade">Класс (5–11)</Label>
            <Select name="grade" value={grade} onValueChange={setGrade}>
              <SelectTrigger id="grade" className="rounded-xl w-full">
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    {g} класс
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="rounded-xl">
            Сохранить
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
