import { createClient } from "@/lib/supabase/server";
import { BookingsList } from "./bookings-list";

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(`
      id,
      slot_id,
      full_name,
      email,
      phone,
      age_or_grade,
      goal,
      experience_level,
      preferred_messenger,
      consent,
      status,
      created_at,
      slots ( start_time, duration_minutes )
    `)
    .order("created_at", { ascending: false });

  const bookings = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Заявки</h1>
      <p className="mt-1 text-muted-foreground">
        Список заявок на уроки. Меняйте статус и просматривайте анкеты.
      </p>
      <div className="mt-8">
        <BookingsList bookings={bookings} />
      </div>
    </div>
  );
}
