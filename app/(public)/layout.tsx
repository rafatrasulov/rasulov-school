import { PublicHeader } from "@/components/landing/public-header";
import { Footer } from "@/components/landing/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      {children}
      <Footer />
    </>
  );
}
