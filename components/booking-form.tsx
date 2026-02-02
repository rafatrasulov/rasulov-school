"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitBooking } from "@/app/(public)/book/[slotId]/actions";
import { useActionState, useState } from "react";

const experienceLabels: Record<string, string> = {
  beginner: "Начинающий",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const messengerLabels: Record<string, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "Email",
};

interface BookingFormProps {
  slotId: string;
}

export function BookingForm({ slotId }: BookingFormProps) {
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [preferredMessenger, setPreferredMessenger] = useState("telegram");
  const [state, formAction] = useActionState(
    async (_prev: { error?: Record<string, string[] | undefined> }, formData: FormData) => {
      formData.set("experience_level", experienceLevel);
      formData.set("preferred_messenger", preferredMessenger);
      const result = await submitBooking(slotId, formData);
      return result ?? _prev;
    },
    {} as { error?: Record<string, string[] | undefined> }
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error?._form && (
        <div className="glass-strong rounded-lg p-4 text-sm text-destructive border border-destructive/30">
          {state.error._form.join(" ")}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Имя и фамилия *</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            placeholder="Иван Иванов"
            className="rounded-xl"
          />
          {state?.error?.full_name && (
            <p className="text-sm text-destructive">{state.error.full_name[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="ivan@example.com"
            className="rounded-xl"
          />
          {state?.error?.email && (
            <p className="text-sm text-destructive">{state.error.email[0]}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Телефон *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+7 999 123-45-67"
          className="rounded-xl"
        />
        {state?.error?.phone && (
          <p className="text-sm text-destructive">{state.error.phone[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="age_or_grade">Класс или возраст (необязательно)</Label>
        <Input
          id="age_or_grade"
          name="age_or_grade"
          placeholder="9 класс или 15 лет"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Цель занятий *</Label>
        <Textarea
          id="goal"
          name="goal"
          required
          placeholder="Подготовка к ОГЭ, подтянуть алгебру, олимпиады..."
          rows={4}
          className="rounded-xl resize-none"
        />
        {state?.error?.goal && (
          <p className="text-sm text-destructive">{state.error.goal[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Уровень *</Label>
        <Select name="experience_level" value={experienceLevel} onValueChange={setExperienceLevel} required>
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Выберите уровень" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(experienceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.error?.experience_level && (
          <p className="text-sm text-destructive">
            {state.error.experience_level[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Удобный способ связи *</Label>
        <Select name="preferred_messenger" value={preferredMessenger} onValueChange={setPreferredMessenger} required>
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Выберите мессенджер" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(messengerLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.error?.preferred_messenger && (
          <p className="text-sm text-destructive">
            {state.error.preferred_messenger[0]}
          </p>
        )}
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="consent" name="consent" required aria-describedby="consent-desc" />
        <div className="space-y-1">
          <Label htmlFor="consent" id="consent-desc" className="font-normal text-muted-foreground cursor-pointer">
            Даю согласие на обработку персональных данных для связи и записи на урок *
          </Label>
          {state?.error?.consent && (
            <p className="text-sm text-destructive">{state.error.consent[0]}</p>
          )}
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full rounded-lg glass-strong hover:bg-primary hover:scale-105 transition-all duration-300 py-6 text-lg">
        Отправить заявку
      </Button>
    </form>
  );
}
