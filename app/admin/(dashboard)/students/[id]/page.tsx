import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Mail, GraduationCap, Calendar, FileCheck2, TrendingUp } from "lucide-react";

export default async function AdminStudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = await params;
  const supabase = await createClient();

  // Verify teacher access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") notFound();

  // Fetch student data
  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name, email, grade, avatar_url, created_at")
    .eq("id", studentId)
    .eq("role", "student")
    .single();

  if (!student) notFound();

  // Fetch bookings
  const { data: bookingsRaw } = await supabase
    .from("bookings")
    .select(`
      id,
      slot_id,
      goal,
      details,
      status,
      created_at,
      slots(start_time, duration_minutes),
      topics(title)
    `)
    .eq("email", student.email)
    .order("created_at", { ascending: false });

  const bookings = bookingsRaw?.map(b => ({
    ...b,
    slots: Array.isArray(b.slots) ? b.slots[0] : b.slots,
    topics: Array.isArray(b.topics) ? b.topics[0] : b.topics
  })) ?? [];

  // Fetch submissions
  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select(`
      id,
      assignment_id,
      score,
      created_at,
      assignments(
        title,
        topic_id,
        topics(
          title,
          section_id,
          sections(title)
        )
      )
    `)
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  // Calculate statistics
  const totalSubmissions = submissions?.length ?? 0;
  const gradedSubmissions = submissions?.filter(s => s.score !== null) ?? [];
  const averageScore = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((acc, s) => acc + (s.score ?? 0), 0) / gradedSubmissions.length
    : 0;

  return (
    <div>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="rounded-xl mb-4 gap-2"
      >
        <Link href="/admin/students">
          <ChevronLeft className="h-4 w-4" />
          Назад к списку учеников
        </Link>
      </Button>

      <div className="space-y-6">
        {/* Student Info Card */}
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">
              {student.full_name || student.email}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{student.email}</p>
                </div>
              </div>
              {student.grade && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Класс</p>
                    <p className="font-medium">{student.grade} класс</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Регистрация</p>
                  <p className="font-medium">
                    {new Date(student.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-xl border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4" />
                Всего заданий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSubmissions}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Оценено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {gradedSubmissions.length}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Средний балл
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {averageScore > 0 ? averageScore.toFixed(1) : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings History */}
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle>История бронирований</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет бронирований
              </p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-medium">Дата и время</th>
                      <th className="text-left p-4 font-medium">Тема</th>
                      <th className="text-left p-4 font-medium">Цель/Детали</th>
                      <th className="text-left p-4 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="p-4">
                          {booking.slots && new Date(booking.slots.start_time).toLocaleString("ru-RU")}
                        </td>
                        <td className="p-4">
                          {booking.topics?.title || "—"}
                        </td>
                        <td className="p-4">
                          <span className="line-clamp-2">
                            {booking.details || booking.goal || "—"}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "success"
                                : booking.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {booking.status === "confirmed"
                              ? "Подтверждено"
                              : booking.status === "cancelled"
                              ? "Отменено"
                              : "Новое"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle>Выполненные задания</CardTitle>
          </CardHeader>
          <CardContent>
            {!submissions || submissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет выполненных заданий
              </p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 font-medium">Задание</th>
                      <th className="text-left p-4 font-medium">Раздел / Тема</th>
                      <th className="text-left p-4 font-medium">Оценка</th>
                      <th className="text-left p-4 font-medium">Дата</th>
                      <th className="text-right p-4 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub: any) => {
                      const assignment = Array.isArray(sub.assignments) ? sub.assignments[0] : sub.assignments;
                      const topic = assignment?.topics && (Array.isArray(assignment.topics) ? assignment.topics[0] : assignment.topics);
                      const section = topic?.sections && (Array.isArray(topic.sections) ? topic.sections[0] : topic.sections);
                      
                      return (
                        <tr
                          key={sub.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-4 font-medium">
                            {assignment?.title || "—"}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {section?.title && topic?.title
                              ? `${section.title} / ${topic.title}`
                              : "—"}
                          </td>
                          <td className="p-4">
                            {sub.score !== null ? (
                              <span className="font-semibold text-primary">
                                {sub.score}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(sub.created_at).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="rounded-lg"
                            >
                              <Link href={`/admin/assignments/${sub.assignment_id}`}>
                                Просмотр
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
