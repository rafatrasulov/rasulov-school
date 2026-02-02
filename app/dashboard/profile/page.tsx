import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { StudentProfileForm } from "./student-profile-form";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, grade")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="rounded-xl mb-4 gap-2">
        <Link href="/dashboard">
          <ChevronLeft className="h-4 w-4" />
          В кабинет
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-foreground">Мой профиль</h1>
      <p className="mt-1 text-muted-foreground">
        Имя, фото и класс — для отображения в кабинете.
      </p>
      <StudentProfileForm profile={profile} />
    </div>
  );
}
