const steps = [
  {
    step: 1,
    title: "Выберите время",
    description: "Посмотрите свободные слоты в календаре и нажмите «Записаться» у удобного времени.",
  },
  {
    step: 2,
    title: "Заполните анкету",
    description: "Укажите имя, контакты и цель занятий — так я смогу подготовиться к первому уроку.",
  },
  {
    step: 3,
    title: "Подтверждение",
    description: "Я свяжусь с вами в выбранном мессенджере и подтвержу запись.",
  },
  {
    step: 4,
    title: "Урок онлайн",
    description: "Встречаемся в Zoom или другом удобном формате. Длительность — по вашему слоту.",
  },
];

export function Stepper() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold text-center text-foreground md:text-4xl">
          Как проходит урок
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          От записи до занятия — четыре простых шага.
        </p>
        <div className="mt-12 space-y-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative flex gap-6">
              {index < steps.length - 1 && (
                <div
                  className="absolute left-5 top-12 bottom-0 w-px -mb-8 bg-border"
                  aria-hidden
                />
              )}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-semibold text-primary">
                {item.step}
              </div>
              <div className="pb-8">
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
