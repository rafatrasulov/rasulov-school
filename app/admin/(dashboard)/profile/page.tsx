import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeacherProfileForm } from "./teacher-profile-form";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, experience, bio")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Профиль учителя</h1>
      <p className="mt-1 text-muted-foreground">
        Эти данные отображаются на главной странице сайта.
      </p>
      <TeacherProfileForm profile={profile} />
    </div>
  );
}
