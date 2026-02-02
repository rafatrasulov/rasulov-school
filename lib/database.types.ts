export type SlotType = "trial" | "regular";
export type SlotStatus = "free" | "booked" | "cancelled";
export type BookingStatus = "new" | "confirmed" | "done" | "cancelled";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type PreferredMessenger = "telegram" | "whatsapp" | "email";

export interface Slot {
  id: string;
  start_time: string;
  duration_minutes: number;
  type: SlotType;
  status: SlotStatus;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  full_name: string;
  email: string;
  phone: string;
  age_or_grade: string | null;
  goal: string;
  experience_level: ExperienceLevel;
  preferred_messenger: PreferredMessenger;
  consent: boolean;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface SlotWithBooking extends Slot {
  bookings?: Booking[];
}
