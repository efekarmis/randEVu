import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Offering } from "@/core/domain/Offering";
import type { BookingDraft } from "./types";

interface GuestTicketProps {
  bookingId: string;
  draft: BookingDraft;
  offerings: readonly Offering[];
}

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function GuestTicket({ bookingId, draft, offerings }: GuestTicketProps) {
  const selectedOfferings = offerings.filter((offering) =>
    draft.selectedOfferingIds.includes(offering.id),
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="relative overflow-visible border-2 border-dashed border-primary/40 py-0 shadow-lg">
        <div className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-background ring-1 ring-foreground/10" />
        <div className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-background ring-1 ring-foreground/10" />
        <CardContent className="grid gap-4 p-6 text-center">
          <div className="grid gap-1">
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
              Dijital Misafir Bileti
            </p>
            <h2 className="font-heading text-2xl font-semibold text-primary">☕ randEVu</h2>
          </div>

          <Separator />

          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Sayın</p>
            <p className="text-xl font-semibold">{draft.guestName}</p>
            <p className="text-sm text-muted-foreground">{draft.guestCount} kişilik rezervasyon</p>
          </div>

          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Ne zaman</p>
            <p className="text-lg font-medium">
              {draft.slotStart ? dateTimeFormatter.format(draft.slotStart) : "—"}
            </p>
          </div>

          {selectedOfferings.length > 0 ? (
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">İkramlar</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {selectedOfferings.map((offering) => (
                  <Badge key={offering.id} variant="secondary">
                    {offering.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {draft.bringsContribution && draft.guestContribution ? (
            <p className="text-sm text-muted-foreground">
              🎁 Getirdiği: <span className="text-foreground">{draft.guestContribution}</span>
            </p>
          ) : null}

          <Separator />

          <div className="grid gap-1">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Rezervasyon Kodu</p>
            <p className="font-mono text-sm break-all">{bookingId}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Bu bileti ekran görüntüsü alıp saklayabilirsin. Görüşürüz! 👋
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
