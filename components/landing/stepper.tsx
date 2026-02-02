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
    <div className="glass rounded-xl p-8 h-full hover:scale-[1.01] transition-all duration-300">
      <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
      <p className="mt-3 text-lg text-muted-foreground">{description}</p>
      <div className="mt-10 space-y-8">
        {steps.map((item, index) => (
          <div key={index} className="relative flex gap-5 group">
            {index < steps.length - 1 && (
              <div 
                className="absolute left-5 top-12 bottom-0 w-0.5 -mb-8 bg-gradient-to-b from-primary to-transparent" 
                aria-hidden 
              />
            )}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-1">{item.title ?? ""}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description ?? ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
