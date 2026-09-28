import { Result } from "../../shared/Result";
import type { Rule, RuleViolation } from "../Rule";
import type { RuleContext } from "../RuleContext";
import type { BookingCandidate } from "../BookingCandidate";

const HOUR_IN_MS = 60 * 60 * 1000;

/**
 * Her ikramın hazırlık süresi (leadTimeHours) veritabanından gelen dinamik bir
 * değerdir; bu kural belirli bir ürünü değil, "evaluatedAt → slotStart" farkını
 * her seçili ikramın kendi leadTimeHours değeriyle karşılaştırır.
 */
export class LeadTimeRule implements Rule<BookingCandidate> {
  readonly name = "LeadTimeRule";

  evaluate(context: RuleContext<BookingCandidate>): Result<void, RuleViolation> {
    const { subject, evaluatedAt } = context;
    const hoursUntilSlot = (subject.slotStart.getTime() - evaluatedAt.getTime()) / HOUR_IN_MS;

    const insufficientOffering = subject.selectedOfferings.find(
      (offering) => hoursUntilSlot < offering.leadTimeHours,
    );

    if (!insufficientOffering) {
      return Result.ok(undefined);
    }

    return Result.fail({
      rule: this.name,
      message: `"${insufficientOffering.name}" için hazırlık süresi yetersiz: en az ${insufficientOffering.leadTimeHours} saat önceden seçilmelidir.`,
    });
  }
}
