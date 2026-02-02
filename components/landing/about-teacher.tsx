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
    <div className="glass rounded-xl p-8 hover:scale-[1.01] transition-all duration-300">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        {title}
      </h2>
      <div className="flex flex-col sm:flex-row gap-6">
        {avatarUrl && (
          <div className="relative shrink-0 w-32 h-32 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">{name}</h3>
          <p className="text-primary font-medium text-lg">Репетитор по математике</p>
          {experience && (
            <p className="text-sm text-accent">{experience}</p>
          )}
          <p className="text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      </div>
    </div>
  );
}
