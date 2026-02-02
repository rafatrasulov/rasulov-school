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
    <div className="glass rounded-xl p-8 md:p-10 hover:scale-[1.01] transition-all duration-300">
      <h2 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
      <p className="mt-3 text-lg text-muted-foreground">{description}</p>
      <Accordion type="single" collapsible className="mt-10 w-full">
        {items.map((item, i) => (
          <AccordionItem 
            key={i} 
            value={String(i)} 
            className="border-white/10 hover:bg-white/5 rounded-lg px-4 transition-colors"
          >
            <AccordionTrigger className="text-left font-semibold py-5 text-lg hover:text-primary transition-colors">
              {item.q ?? ""}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
              {item.a ?? ""}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
