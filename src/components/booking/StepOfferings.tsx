"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Category } from "@/core/domain/Category";
import type { Offering } from "@/core/domain/Offering";
import type { BookingDraft } from "./types";

interface StepOfferingsProps {
  categories: readonly Category[];
  offerings: readonly Offering[];
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
}

function hoursUntil(slotStart: Date, now: Date): number {
  return (slotStart.getTime() - now.getTime()) / (60 * 60 * 1000);
}

export function StepOfferings({ categories, offerings, draft, onChange }: StepOfferingsProps) {
  const now = new Date();
  const hoursUntilSlot = draft.slotStart ? hoursUntil(draft.slotStart, now) : Number.POSITIVE_INFINITY;

  const offeringsByCategory = new Map<string, Offering[]>();
  for (const offering of offerings) {
    const list = offeringsByCategory.get(offering.categoryId) ?? [];
    list.push(offering);
    offeringsByCategory.set(offering.categoryId, list);
  }

  // Kullanıcı Adım 1'e dönüp daha erken bir saat seçerse, artık hazırlık
  // süresine yetişmeyen seçimler sessizce elenir (sunucudaki LeadTimeRule
  // zaten reddeder, ama burada baştan engellemek daha iyi bir deneyim).
  useEffect(() => {
    const stillValid = draft.selectedOfferingIds.filter((id) => {
      const offering = offerings.find((candidate) => candidate.id === id);
      return offering ? hoursUntilSlot >= offering.leadTimeHours : false;
    });

    if (stillValid.length !== draft.selectedOfferingIds.length) {
      onChange({ selectedOfferingIds: stillValid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoursUntilSlot, offerings]);

  function isSelected(offeringId: string) {
    return draft.selectedOfferingIds.includes(offeringId);
  }

  function selectSingle(categoryOfferingIds: string[], offeringId: string) {
    onChange({
      selectedOfferingIds: [
        ...draft.selectedOfferingIds.filter((id) => !categoryOfferingIds.includes(id)),
        offeringId,
      ],
    });
  }

  function toggleMulti(offeringId: string) {
    onChange({
      selectedOfferingIds: isSelected(offeringId)
        ? draft.selectedOfferingIds.filter((id) => id !== offeringId)
        : [...draft.selectedOfferingIds, offeringId],
    });
  }

  if (categories.length === 0) {
    return <p className="text-muted-foreground">Şu an tanımlı bir ikram/aktivite yok.</p>;
  }

  return (
    <div className="grid gap-4">
      {categories.map((category) => {
        const categoryOfferings = offeringsByCategory.get(category.id) ?? [];
        if (categoryOfferings.length === 0) {
          return null;
        }
        const categoryOfferingIds = categoryOfferings.map((offering) => offering.id);
        const selectedSingleValue = categoryOfferingIds.find((id) => isSelected(id)) ?? "";

        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {category.selectionType === "single" ? (
                <RadioGroup
                  value={selectedSingleValue}
                  onValueChange={(value: string) => selectSingle(categoryOfferingIds, value)}
                  className="gap-3"
                >
                  {categoryOfferings.map((offering) => {
                    const locked = hoursUntilSlot < offering.leadTimeHours;
                    return (
                      <div key={offering.id} className="flex items-start gap-2">
                        <RadioGroupItem
                          value={offering.id}
                          id={offering.id}
                          disabled={locked}
                          className="mt-0.5"
                        />
                        <OfferingLabel offering={offering} locked={locked} />
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                <div className="grid gap-3">
                  {categoryOfferings.map((offering) => {
                    const locked = hoursUntilSlot < offering.leadTimeHours;
                    return (
                      <div key={offering.id} className="flex items-start gap-2">
                        <Checkbox
                          id={offering.id}
                          checked={isSelected(offering.id)}
                          disabled={locked}
                          onCheckedChange={() => toggleMulti(offering.id)}
                          className="mt-0.5"
                        />
                        <OfferingLabel offering={offering} locked={locked} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function OfferingLabel({ offering, locked }: { offering: Offering; locked: boolean }) {
  return (
    <Label htmlFor={offering.id} className="flex-col items-start gap-0.5 font-normal">
      <span>{offering.name}</span>
      {locked ? (
        <span className="text-xs text-destructive">
          ⏳ {offering.leadTimeHours} saatlik hazırlık süresi var, bu saate yetişmez!
        </span>
      ) : offering.description ? (
        <span className="text-xs text-muted-foreground">{offering.description}</span>
      ) : null}
    </Label>
  );
}
