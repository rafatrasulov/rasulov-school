const DEFAULT_STEPS = [
  { title: "Выберите время", description: "Свободные слоты в календаре — нажмите «Записаться»." },
  { title: "Заполните анкету", description: "Имя, контакты и цель занятий." },
  { title: "Подтверждение", description: "Свяжусь в мессенджере и подтвержу запись." },
  { title: "Урок онлайн", description: "Zoom или другой формат. Длительность — по слоту." },
];

type StepperProps = {
  title?: string;
  description?: string;
  steps?: Array<{ title?: string; description?: string }>;
};

export function Stepper(props?: StepperProps | null) {
  const title = props?.title ?? "Как проходит урок";
  const description = props?.description ?? "Четыре простых шага.";
  const steps = Array.isArray(props?.steps) && props.steps.length > 0 ? props.steps : DEFAULT_STEPS;
  return (
    <div className="rounded-3xl border-2 border-primary/10 bg-card p-6 shadow-sm h-full">
      <h2 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-8 space-y-6">
        {steps.map((item, index) => (
          <div key={index} className="relative flex gap-4">
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-px -mb-6 bg-border" aria-hidden />
            )}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{item.title ?? ""}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description ?? ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
