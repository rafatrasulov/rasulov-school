import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-white to-secondary/30 border-t border-primary/10 py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(13,148,136,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px'}} aria-hidden />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Колонка 1: О школе */}
          <div className="space-y-5 animate-slide-up">
            <h3 className="text-4xl md:text-5xl font-bold gradient-text">
              RasulovSchool
            </h3>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Онлайн-школа математики. Индивидуальные занятия с репетитором для школьников 5–11 классов.
            </p>
          </div>
          
          {/* Колонка 2: Ссылки */}
          <div className="space-y-5 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h4 className="text-2xl md:text-3xl font-bold text-foreground">Предметы</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/#calendar" className="text-xl text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300">
                📅 Записаться на урок
              </Link>
              <Link href="/diagnostic" className="text-xl text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300">
                📝 Диагностика
              </Link>
              <Link href="/login" className="text-xl text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300">
                👤 Личный кабинет
              </Link>
              <Link href="/admin/login" className="text-xl text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300">
                🔑 Вход для учителя
              </Link>
            </nav>
          </div>
          
          {/* Колонка 3: Контакты */}
          <div className="space-y-5 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h4 className="text-2xl md:text-3xl font-bold text-foreground">Контакты</h4>
            <div className="space-y-3">
              <p className="text-xl text-muted-foreground">
                📧 info@rasulovschool.ru
              </p>
              <p className="text-xl text-muted-foreground">
                Онлайн-занятия по всему миру
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-10 border-t border-primary/10 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
          <p className="text-lg text-muted-foreground">
            © {new Date().getFullYear()} RasulovSchool. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
