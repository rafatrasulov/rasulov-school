import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DEFAULT_FAQS = [
  { q: "Как проходит первый урок?", a: "Первый урок — знакомство и диагностика: обсудим цели, текущий уровень и формат занятий. Длительность как у выбранного слота (обычно 60 минут)." },
  { q: "Нужна ли камера и микрофон?", a: "Да. Урок идёт в формате видеозвонка (Zoom или аналог). Нужны стабильный интернет, камера и микрофон." },
  { q: "Как оплачивать занятия?", a: "После подтверждения записи обсудим удобный способ оплаты (банковский перевод, СБП и т.д.). Оплата — по договорённости до или после урока." },
  { q: "Можно ли перенести или отменить урок?", a: "Да. Предупредите заранее (лучше за сутки), и мы перенесём занятие на другой слот." },
];

type FAQProps = {
  title?: string;
  description?: string;
  items?: Array<{ q?: string; a?: string }>;
};

export function FAQ(props?: FAQProps | null) {
  const title = props?.title ?? "Частые вопросы";
  const description = props?.description ?? "Ответы на типичные вопросы об уроках и записи.";
  const items = Array.isArray(props?.items) && props.items.length > 0 ? props.items : DEFAULT_FAQS;
  return (
    <div className="rounded-3xl border-2 border-primary/10 bg-card p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <Accordion type="single" collapsible className="mt-8 w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={String(i)} className="border-border">
            <AccordionTrigger className="text-left font-medium py-4">{item.q ?? ""}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">{item.a ?? ""}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
