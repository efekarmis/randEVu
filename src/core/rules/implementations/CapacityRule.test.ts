import { describe, expect, it } from "vitest";
import { CapacityRule } from "./CapacityRule";
import type { BookingCandidate } from "../BookingCandidate";

const EVALUATED_AT = new Date("2026-01-01T00:00:00.000Z");

function candidateWithGuestCount(guestCount: number): BookingCandidate {
  return { guestCount, slotStart: EVALUATED_AT, selectedOfferings: [] };
}

describe("CapacityRule", () => {
  it("varsayılan maksimum kapasiteyi (4) aşan misafir sayısını reddeder", () => {
    const rule = new CapacityRule();

    const result = rule.evaluate({ subject: candidateWithGuestCount(5), evaluatedAt: EVALUATED_AT });

    expect(result.isFailure).toBe(true);
  });

  it("maksimum kapasiteye eşit veya altındaki misafir sayısını kabul eder", () => {
    const rule = new CapacityRule();

    const result = rule.evaluate({ subject: candidateWithGuestCount(4), evaluatedAt: EVALUATED_AT });

    expect(result.isSuccess).toBe(true);
  });

  it("özel bir maksimum kapasiteyle yapılandırılabilir", () => {
    const rule = new CapacityRule(2);

    const result = rule.evaluate({ subject: candidateWithGuestCount(3), evaluatedAt: EVALUATED_AT });

    expect(result.isFailure).toBe(true);
  });
});
