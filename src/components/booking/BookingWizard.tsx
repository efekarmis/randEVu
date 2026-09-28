"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/core/domain/Category";
import type { Offering } from "@/core/domain/Offering";
import { fetchOfferingsCatalog, submitBooking } from "@/lib/api";
import { GuestTicket } from "./GuestTicket";
import { StepDateTime } from "./StepDateTime";
import { StepGuestInfo } from "./StepGuestInfo";
import { StepOfferings } from "./StepOfferings";
import { StepReview } from "./StepReview";
import { INITIAL_DRAFT, MAX_GUEST_COUNT, type BookingDraft } from "./types";

const STEPS = ["Tarih & Saat", "Misafir Bilgileri", "İkramlar", "Özet"] as const;

type CatalogStatus = "loading" | "error" | "ready";

export function BookingWizard() {
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>("loading");
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [offerings, setOfferings] = useState<readonly Offering[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>(INITIAL_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchOfferingsCatalog()
      .then((catalog) => {
        if (cancelled) {
          return;
        }
        setCategories(catalog.categories);
        setOfferings(catalog.offerings);
        setCatalogStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const isCurrentStepValid = (() => {
    switch (stepIndex) {
      case 0:
        return Boolean(draft.slotStart && draft.slotEnd);
      case 1:
        return (
          draft.guestName.trim().length > 0 &&
          draft.guestCount >= 1 &&
          draft.guestCount <= MAX_GUEST_COUNT &&
          (!draft.bringsContribution || draft.guestContribution.trim().length > 0)
        );
      default:
        return true;
    }
  })();

  async function handleSubmit() {
    if (!draft.slotStart || !draft.slotEnd) {
      return;
    }

    setSubmitting(true);
    const result = await submitBooking({
      guestName: draft.guestName.trim(),
      guestCount: draft.guestCount,
      slotStart: draft.slotStart,
      slotEnd: draft.slotEnd,
      selections: draft.selectedOfferingIds.map((offeringId) => ({ offeringId, quantity: 1 })),
      guestContribution: draft.bringsContribution ? draft.guestContribution.trim() : undefined,
    });
    setSubmitting(false);

    if (result.ok) {
      setConfirmedBookingId(result.id);
      toast.success("Randevun onaylandı! ☕");
      return;
    }

    if (result.status === 409) {
      toast.error("Bu saat az önce dolmuş olabilir", { description: result.error });
    } else if (result.status === 422 || result.status === 400) {
      toast.error("Bu haliyle olmuyor", { description: result.error });
    } else {
      toast.error("Bir şeyler ters gitti", { description: result.error });
    }
  }

  if (confirmedBookingId) {
    return <GuestTicket bookingId={confirmedBookingId} draft={draft} offerings={offerings} />;
  }

  if (catalogStatus === "loading") {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (catalogStatus === "error") {
    return (
      <p className="text-destructive">İkramlar yüklenemedi. Sayfayı yenileyip tekrar dener misin?</p>
    );
  }

  return (
    <div className="grid gap-6">
      <ol className="flex flex-wrap gap-2 text-sm">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1",
              index === stepIndex
                ? "border-primary bg-primary/10 font-medium text-primary"
                : index < stepIndex
                  ? "border-border text-muted-foreground"
                  : "border-border/50 text-muted-foreground/50",
            )}
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs">
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {stepIndex === 0 ? <StepDateTime draft={draft} onChange={updateDraft} /> : null}
      {stepIndex === 1 ? <StepGuestInfo draft={draft} onChange={updateDraft} /> : null}
      {stepIndex === 2 ? (
        <StepOfferings
          categories={categories}
          offerings={offerings}
          draft={draft}
          onChange={updateDraft}
        />
      ) : null}
      {stepIndex === 3 ? (
        <StepReview draft={draft} offerings={offerings} submitting={submitting} onSubmit={handleSubmit} />
      ) : null}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
          disabled={stepIndex === 0}
        >
          Geri
        </Button>
        {stepIndex < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStepIndex((index) => Math.min(STEPS.length - 1, index + 1))}
            disabled={!isCurrentStepValid}
          >
            İleri
          </Button>
        ) : null}
      </div>
    </div>
  );
}
