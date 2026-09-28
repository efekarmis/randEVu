/**
 * Bir kuralın değerlendirildiği andaki bağlamı taşır. `evaluatedAt`, kuralların
 * kendi içinde `new Date()` çağırmasını engeller — böylece Lead Time gibi zamana
 * bağlı kurallar deterministik ve test edilebilir kalır.
 */
export interface RuleContext<TSubject> {
  readonly subject: TSubject;
  readonly evaluatedAt: Date;
}
