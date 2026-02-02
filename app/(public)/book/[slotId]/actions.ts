"use server";

import { createClient } from "@/lib/supabase/server";
import { bookingSchema } from "@/lib/validations/booking";
import { redirect } from "next/navigation";

export async function submitBooking(slotId: string, formData: FormData) {
  const raw = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    age_or_grade: formData.get("age_or_grade") || undefined,
    goal: formData.get("goal"),
    experience_level: formData.get("experience_level"),
    preferred_messenger: formData.get("preferred_messenger"),
    consent: formData.get("consent") === "on",
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_slot_id: slotId,
    p_full_name: parsed.data.full_name,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_age_or_grade: parsed.data.age_or_grade ?? null,
    p_goal: parsed.data.goal,
    p_experience_level: parsed.data.experience_level,
    p_preferred_messenger: parsed.data.preferred_messenger,
    p_consent: parsed.data.consent,
  });

  if (error) {
    if (error.code === "P0001" && error.message.includes("slot_not_available")) {
      return { error: { _form: ["Этот слот уже занят. Выберите другое время."] } };
    }
    if (error.code === "P0001" && error.message.includes("slot_not_found")) {
      return { error: { _form: ["Слот не найден."] } };
    }
    return { error: { _form: [error.message] } };
  }

  redirect("/thanks");
}
