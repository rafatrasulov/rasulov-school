import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/landing/public-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { count: gradedResultsCount }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, grade, role").eq("id", user.id).single(),
    supabase.from("assignment_submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("score", "is", null),
  ]);

  if (profile?.role === "teacher") {
    redirect("/admin/slots");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader user={user} profile={profile} showDashboardLink gradedResultsCount={gradedResultsCount ?? 0} />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
