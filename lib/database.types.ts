export type SlotType = "trial" | "regular";
export type SlotStatus = "free" | "booked" | "cancelled";
export type BookingStatus = "new" | "confirmed" | "done" | "cancelled";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type PreferredMessenger = "telegram" | "whatsapp" | "email";

export interface Profile {
  id: string;
  role: "teacher" | "student";
  avatar_url: string | null;
  full_name: string | null;
  experience: string | null;
  bio: string | null;
  grade: number | null;
  created_at: string;
  updated_at: string;
}

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

export type AssignmentType = "text" | "single_choice" | "multiple_choice" | "fraction" | "file_upload";

export interface Section {
  id: string;
  title: string;
  order: number;
  published: boolean;
  grade: number | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  section_id: string;
  title: string;
  order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  topic_id: string;
  lesson_id: string | null;
  title: string;
  type: AssignmentType;
  content: string | null;
  image_url: string | null;
  correct_answer: string | null;
  options: unknown;
  order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type LandingBlockType = "hero" | "about_teacher" | "benefits" | "stepper" | "calendar" | "faq";

export interface LandingBlock {
  id: string;
  type: LandingBlockType;
  order: number;
  visible: boolean;
  props: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
