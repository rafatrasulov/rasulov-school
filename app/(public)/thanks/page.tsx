import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ThanksPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 bg-gradient-to-b from-secondary/20 to-white relative overflow-hidden">
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(13,148,136,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px'}} aria-hidden />
      
      <div className="relative glass rounded-2xl p-10 md:p-14 text-center max-w-2xl animate-slide-up shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="glass-strong rounded-full p-6">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Спасибо!</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Ваша заявка отправлена. Я свяжусь с вами в выбранном мессенджере для подтверждения записи.
        </p>
        <Button asChild className="rounded-lg glass-strong hover:bg-primary hover:scale-105 transition-all px-8 py-6 text-lg">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </main>
  );
}
