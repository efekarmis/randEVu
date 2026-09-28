import { BookingWizard } from "@/components/booking/BookingWizard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-10 sm:px-6">
          <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">randEVu</p>
          <h1 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Kahve ve sohbete bekleriz ☕
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Uygun bir gün ve saat seç, ne içmek/yemek istediğini söyle — randevun anında onaylansın.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <BookingWizard />
      </main>
    </div>
  );
}
