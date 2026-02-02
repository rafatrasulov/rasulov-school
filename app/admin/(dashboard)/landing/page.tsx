import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingBlocksList } from "./landing-blocks-list";

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: "Hero (заголовок)",
  about_teacher: "Об учителе",
  benefits: "Почему стоит заниматься",
  stepper: "Как проходит урок",
  calendar: "Свободные слоты",
  faq: "Частые вопросы",
};

export default async function AdminLandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: firstTeacher } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "teacher")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstTeacher?.id !== user.id) {
    redirect("/admin");
  }

  const { data: blocks } = await supabase
    .from("landing_blocks")
    .select("id, type, order, visible, props")
    .order("order", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Главная страница</h1>
      <p className="mt-1 text-muted-foreground">
        Порядок и видимость блоков, редактирование текстов. Изменения отображаются на главной.
      </p>
      <LandingBlocksList
        blocks={blocks ?? []}
        typeLabels={BLOCK_TYPE_LABELS}
      />
    </div>
  );
}
