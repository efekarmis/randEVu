import type { Result } from "../shared/Result";
import type { RuleContext } from "./RuleContext";

export interface RuleViolation {
  readonly rule: string;
  readonly message: string;
}

/**
 * Specification Pattern: her iş kuralı tek sorumluluğa sahip, bağımsız bir
 * Rule olarak yazılır. Use case içinde spagetti if-else yerine bir dizi
 * Rule, RuleEngine tarafından sırayla işletilir.
 */
export interface Rule<TSubject> {
  readonly name: string;
  evaluate(context: RuleContext<TSubject>): Result<void, RuleViolation>;
}
