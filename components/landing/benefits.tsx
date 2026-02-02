import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator, Target, Users, Zap } from "lucide-react";

const items = [
  {
    icon: Target,
    title: "Индивидуальный план",
    description: "Программа под ваши цели: школа, ОГЭ, ЕГЭ или олимпиады.",
  },
  {
    icon: Calculator,
    title: "Понятные объяснения",
    description: "Сложные темы — простым языком, с примерами и формулами.",
  },
  {
    icon: Users,
    title: "Один на один",
    description: "Полное внимание ученику, без отвлечений и спешки.",
  },
  {
    icon: Zap,
    title: "Онлайн-формат",
    description: "Удобное время и место: занимайтесь из дома в комфорте.",
  },
];

export function Benefits() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold text-center text-foreground md:text-4xl">
          Почему стоит заниматься
        </h2>
        <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
          Системные занятия с репетитором дают результат быстрее, чем самостоятельная подготовка.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.title}
              className="rounded-2xl border-border/50 shadow-sm bg-card"
            >
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
