import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Profile } from "@/lib/database.types";

interface AboutTeacherProps {
  teacher: Profile | null;
  title?: string;
}

const FALLBACK_NAME = "Расулов Рафат Абульфатович";
const FALLBACK_BIO = "Авторская онлайн-школа RasulovSchool — индивидуальные занятия по математике для школьников: от базового уровня до подготовки к ОГЭ, ЕГЭ и олимпиадам. Работаю на результат: разбираем темы по шагам, закрепляем практикой и контролируем прогресс. Формат занятий — онлайн, в удобное для вас время.";

export function AboutTeacher({ teacher, title = "Об учителе" }: AboutTeacherProps) {
  const name = teacher?.full_name?.trim() || FALLBACK_NAME;
  const experience = teacher?.experience?.trim();
  const bio = teacher?.bio?.trim() || FALLBACK_BIO;
  const avatarUrl = teacher?.avatar_url?.trim();

  return (
    <Card className="h-full rounded-3xl border-2 border-primary/10 bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          {title}
        </h2>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-6">
        {avatarUrl && (
          <div className="relative shrink-0 w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
          <p className="text-primary font-medium">Репетитор по математике</p>
          {experience && (
            <p className="text-sm text-muted-foreground">{experience}</p>
          )}
          <p className="text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      </CardContent>
    </Card>
  );
}
