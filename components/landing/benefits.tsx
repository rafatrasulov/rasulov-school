import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="h-full rounded-3xl border-2 border-primary/10 bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-2xl bg-muted/50 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                {ICONS[i % ICONS.length] && (() => {
                  const Icon = ICONS[i % ICONS.length];
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title ?? ""}</h3>
                <p className="text-sm text-muted-foreground">{item.description ?? ""}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
