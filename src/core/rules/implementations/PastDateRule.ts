import { Result } from "../../shared/Result";
import type { Rule, RuleViolation } from "../Rule";
import type { RuleContext } from "../RuleContext";
import type { BookingCandidate } from "../BookingCandidate";

/**
 * "evaluatedAt" ile eşit veya ondan önceki bir slotStart, artık geçmiş
 * sayılır — eşitlik durumunu da reddeder (tam o an rezervasyon açılamaz).
 */
export class PastDateRule implements Rule<BookingCandidate> {
  readonly name = "PastDateRule";

  evaluate(context: RuleContext<BookingCandidate>): Result<void, RuleViolation> {
    const { subject, evaluatedAt } = context;

    if (subject.slotStart > evaluatedAt) {
      return Result.ok(undefined);
    }

    return Result.fail({
      rule: this.name,
      message: "Geçmiş bir tarih ve saat için randevu oluşturulamaz.",
    });
  }
}
