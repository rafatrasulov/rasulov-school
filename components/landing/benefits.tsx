import { Calculator, Target, Users, Zap } from "lucide-react";

const ICONS = [Target, Calculator, Users, Zap];

const DEFAULT_ITEMS = [
  { title: "Индивидуальный план", description: "Программа под ваши цели: школа, ОГЭ, ЕГЭ или олимпиады." },
  { title: "Понятные объяснения", description: "Сложные темы — простым языком, с примерами и формулами." },
  { title: "Один на один", description: "Полное внимание ученику, без отвлечений и спешки." },
  { title: "Онлайн-формат", description: "Удобное время и место: занимайтесь из дома в комфорте." },
];

type BenefitsProps = {
  title?: string;
  description?: string;
  items?: Array<{ title?: string; description?: string }>;
};

export function Benefits(props?: BenefitsProps | null) {
  const title = props?.title ?? "Почему стоит заниматься";
  const description = props?.description ?? "Системные занятия с репетитором дают результат быстрее.";
  const items = Array.isArray(props?.items) && props.items.length > 0 ? props.items : DEFAULT_ITEMS;
  
  return (
    <div className="glass rounded-xl p-8 hover:scale-[1.01] transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={i}
              className="glass-strong rounded-xl p-5 hover:bg-primary/10 transition-all duration-300 group"
            >
              <div className="flex gap-4 items-start">
                <div className="glass rounded-lg p-3 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{item.title ?? ""}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description ?? ""}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
