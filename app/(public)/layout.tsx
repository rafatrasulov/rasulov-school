import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/landing/public-header";
import { Footer } from "@/components/landing/footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile: { full_name: string | null; email: string | null; grade: number | null; role: string } | null = null;
  let gradedResultsCount = 0;
  if (user) {
    const [{ data: profileData }, { count }] = await Promise.all([
      supabase.from("profiles").select("full_name, email, grade, role").eq("id", user.id).single(),
      supabase.from("assignment_submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("score", "is", null),
    ]);
    profile = profileData ?? null;
    gradedResultsCount = count ?? 0;
  }
  return (
    <>
      <PublicHeader user={user ?? null} profile={profile} gradedResultsCount={gradedResultsCount} />
      {children}
      <Footer />
    </>
  );
}
