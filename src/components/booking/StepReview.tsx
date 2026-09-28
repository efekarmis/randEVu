"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Offering } from "@/core/domain/Offering";
import type { BookingDraft } from "./types";

interface StepReviewProps {
  draft: BookingDraft;
  offerings: readonly Offering[];
  submitting: boolean;
  onSubmit: () => void;
}

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function StepReview({ draft, offerings, submitting, onSubmit }: StepReviewProps) {
  const selectedOfferings = offerings.filter((offering) =>
    draft.selectedOfferingIds.includes(offering.id),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son kontrol ☕</CardTitle>
        <CardDescription>Her şey doğru görünüyorsa randevuyu onayla.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Ne zaman</span>
          <span className="text-right font-medium">
            {draft.slotStart ? dateTimeFormatter.format(draft.slotStart) : "—"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Misafir</span>
          <span className="text-right font-medium">
            {draft.guestName} · {draft.guestCount} kişi
          </span>
        </div>
        {draft.bringsContribution && draft.guestContribution ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Katkı</span>
            <span className="text-right font-medium">{draft.guestContribution}</span>
          </div>
        ) : null}
        <Separator />
        <div>
          <p className="mb-1 text-muted-foreground">İkramlar</p>
          {selectedOfferings.length > 0 ? (
            <ul className="grid gap-1">
              {selectedOfferings.map((offering) => (
                <li key={offering.id} className="font-medium">
                  {offering.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">Sadece sohbet için geliyorum 🙂</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onSubmit} disabled={submitting} size="lg">
          {submitting ? "Gönderiliyor..." : "Randevuyu Onayla"}
        </Button>
      </CardFooter>
    </Card>
  );
}
