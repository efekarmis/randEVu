import { Result } from "../shared/Result";
import type { Rule, RuleViolation } from "./Rule";
import type { RuleContext } from "./RuleContext";

/**
 * Verilen Rule listesini bir subject üzerinde sırayla işletir. Tek bir kural
 * ihlalinde bile `throw` atılmaz — tüm ihlaller toplanıp Result.fail ile
 * döndürülür ki çağıran taraf (use case) hepsini birden kullanıcıya gösterebilsin.
 */
export class RuleEngine<TSubject> {
  constructor(private readonly rules: readonly Rule<TSubject>[]) {}

  run(subject: TSubject, evaluatedAt: Date = new Date()): Result<void, readonly RuleViolation[]> {
    const context: RuleContext<TSubject> = { subject, evaluatedAt };

    const violations = this.rules
      .map((rule) => rule.evaluate(context))
      .filter((result) => result.isFailure)
      .map((result) => result.error);

    return violations.length === 0 ? Result.ok(undefined) : Result.fail(violations);
  }
}
