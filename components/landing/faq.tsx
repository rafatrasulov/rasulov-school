import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Как проходит первый урок?",
    a: "Первый урок — знакомство и диагностика: обсудим цели, текущий уровень и формат занятий. Длительность как у выбранного слота (обычно 60 минут).",
  },
  {
    q: "Нужна ли камера и микрофон?",
    a: "Да. Урок идёт в формате видеозвонка (Zoom или аналог). Нужны стабильный интернет, камера и микрофон.",
  },
  {
    q: "Как оплачивать занятия?",
    a: "После подтверждения записи обсудим удобный способ оплаты (банковский перевод, СБП и т.д.). Оплата — по договорённости до или после урока.",
  },
  {
    q: "Можно ли перенести или отменить урок?",
    a: "Да. Предупредите заранее (лучше за сутки), и мы перенесём занятие на другой слот.",
  },
];

export function FAQ() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold text-center text-foreground md:text-4xl">
          Частые вопросы
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          Ответы на типичные вопросы об уроках и записи.
        </p>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {faqs.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
