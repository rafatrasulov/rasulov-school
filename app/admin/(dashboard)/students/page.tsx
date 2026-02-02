import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, email, grade, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Ученики</h1>
      <p className="mt-1 text-muted-foreground">
        Список всех зарегистрированных учеников.
      </p>

      <Card className="mt-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle>Всего учеников: {students?.length ?? 0}</CardTitle>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Пока нет зарегистрированных учеников.
            </p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium">Имя</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Класс</th>
                    <th className="text-left p-4 font-medium">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-4 font-medium">
                        {student.full_name || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="p-4">
                        {student.grade ? `${student.grade} класс` : "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
