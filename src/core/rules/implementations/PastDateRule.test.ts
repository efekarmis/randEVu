import { describe, expect, it } from "vitest";
import { PastDateRule } from "./PastDateRule";
import type { BookingCandidate } from "../BookingCandidate";

const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z");

function candidateWithSlotStart(slotStart: Date): BookingCandidate {
  return { guestCount: 1, slotStart, selectedOfferings: [] };
}

describe("PastDateRule", () => {
  const rule = new PastDateRule();

  it("gelecekteki bir slotStart için başarılıdır", () => {
    const candidate = candidateWithSlotStart(new Date(EVALUATED_AT.getTime() + 60 * 60 * 1000));

    const result = rule.evaluate({ subject: candidate, evaluatedAt: EVALUATED_AT });

    expect(result.isSuccess).toBe(true);
  });

  it("geçmişteki bir slotStart için ihlal döner", () => {
    const candidate = candidateWithSlotStart(new Date(EVALUATED_AT.getTime() - 60 * 60 * 1000));

    const result = rule.evaluate({ subject: candidate, evaluatedAt: EVALUATED_AT });

    expect(result.isFailure).toBe(true);
    expect(result.error.rule).toBe("PastDateRule");
  });

  it("evaluatedAt ile tam eşit slotStart için de ihlal döner", () => {
    const candidate = candidateWithSlotStart(new Date(EVALUATED_AT.getTime()));

    const result = rule.evaluate({ subject: candidate, evaluatedAt: EVALUATED_AT });

    expect(result.isFailure).toBe(true);
  });
});
