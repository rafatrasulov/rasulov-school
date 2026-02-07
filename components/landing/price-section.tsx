"use client";

export function PriceSection() {
  return (
    <section className="relative w-full py-12 md:py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" aria-hidden />
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(rgba(13,148,136,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} aria-hidden />
      <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6">
        <div className="glass rounded-2xl p-6 sm:p-8 md:p-10 text-center border border-primary/10 shadow-xl shadow-primary/5">
          <p className="text-base sm:text-lg md:text-xl text-foreground/90 font-medium mb-4 sm:mb-5">
            Успей записываться на онлайн-занятие — выбирай свободные слоты ниже
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
              от 600 до 900 ₽
            </span>
            <span className="text-base sm:text-lg text-muted-foreground">
              за занятие
            </span>
          </div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
            Стоимость зависит от темы и класса
          </p>
        </div>
      </div>
    </section>
  );
}
