import { Result } from "../../shared/Result";
import type { Rule, RuleViolation } from "../Rule";
import type { RuleContext } from "../RuleContext";
import type { BookingCandidate } from "../BookingCandidate";

/**
 * Ev sahibinin maksimum misafir kapasitesi sabit kodlanmış bir enum değil,
 * kural örneklenirken verilen bir yapılandırma değeridir (varsayılan: 4).
 */
export class CapacityRule implements Rule<BookingCandidate> {
  readonly name = "CapacityRule";

  constructor(private readonly maxGuestCount: number = 4) {}

  evaluate(context: RuleContext<BookingCandidate>): Result<void, RuleViolation> {
    const { subject } = context;

    if (subject.guestCount <= this.maxGuestCount) {
      return Result.ok(undefined);
    }

    return Result.fail({
      rule: this.name,
      message: `Misafir sayısı en fazla ${this.maxGuestCount} kişi olabilir (girilen: ${subject.guestCount}).`,
    });
  }
}
