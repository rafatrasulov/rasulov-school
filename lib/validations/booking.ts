import { z } from "zod";

export const bookingSchema = z.object({
  full_name: z.string().min(2, "Укажите имя"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Укажите телефон"),
  age_or_grade: z.string().optional(),
  goal: z.string().min(10, "Опишите цель занятий (минимум 10 символов)"),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  preferred_messenger: z.enum(["telegram", "whatsapp", "email"]),
  consent: z.literal(true, { message: "Необходимо согласие на обработку данных" }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
