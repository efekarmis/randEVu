import { describe, expect, it } from "vitest";
import { LeadTimeRule } from "./LeadTimeRule";
import type { BookingCandidate } from "../BookingCandidate";

const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z");

function candidateWithHoursUntilSlot(hours: number, leadTimeHours: number): BookingCandidate {
  const slotStart = new Date(EVALUATED_AT.getTime() + hours * 60 * 60 * 1000);

  return {
    guestCount: 1,
    slotStart,
    selectedOfferings: [{ offeringId: "cold-brew", name: "Cold Brew", leadTimeHours, quantity: 1 }],
  };
}

describe("LeadTimeRule", () => {
  const rule = new LeadTimeRule();

  it("hazırlık süresi yetersizse ihlal döner (2 saat kala, 24 saatlik ikram)", () => {
    const candidate = candidateWithHoursUntilSlot(2, 24);

    const result = rule.evaluate({ subject: candidate, evaluatedAt: EVALUATED_AT });

    expect(result.isFailure).toBe(true);
    expect(result.error.rule).toBe("LeadTimeRule");
  });

  it("hazırlık süresi tam yeterliyse başarılı döner (25 saat var, 24 saatlik ikram)", () => {
    const candidate = candidateWithHoursUntilSlot(25, 24);

    const result = rule.evaluate({ subject: candidate, evaluatedAt: EVALUATED_AT });

    expect(result.isSuccess).toBe(true);
  });

  it("seçili ikram yoksa her zaman başarılıdır", () => {
    const candidate: BookingCandidate = {
      guestCount: 1,
      slotStart: EVALUATED_AT,
      selectedOfferings: [],
    };

    const result = rule.evaluate({ subject: candidate, evaluatedAt: EVALUATED_AT });

    expect(result.isSuccess).toBe(true);
  });
});
