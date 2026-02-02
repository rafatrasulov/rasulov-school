import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThanksPage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-foreground">Спасибо!</h1>
        <p className="mt-4 text-muted-foreground">
          Ваша заявка отправлена. Я свяжусь с вами в выбранном мессенджере для подтверждения записи.
        </p>
        <Button asChild className="mt-8 rounded-xl">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </main>
  );
}
