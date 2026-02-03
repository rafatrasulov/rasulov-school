import { z } from "zod";

export const bookingSchema = z.object({
  full_name: z.string().min(2, "Укажите имя"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Укажите телефон"),
  age_or_grade: z.string().optional(),
  goal: z.string().min(10, "Опишите цель занятий (минимум 10 символов)").optional(),
  details: z.string().min(10, "Опишите, что именно непонятно (минимум 10 символов)").optional(),
  topic_id: z.string().uuid().optional(),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  preferred_messenger: z.enum(["telegram", "whatsapp", "email"]),
  consent: z.literal(true, { message: "Необходимо согласие на обработку данных" }),
}).refine(
  (data) => data.goal || data.details,
  {
    message: "Укажите либо цель занятий, либо детали того, что непонятно",
    path: ["goal"],
  }
);

export type BookingFormData = z.infer<typeof bookingSchema>;
