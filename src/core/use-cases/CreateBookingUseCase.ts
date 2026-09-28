import { randomUUID } from "node:crypto";
import { Result } from "../shared/Result";
import type { Booking, SelectedOffering } from "../domain/Booking";
import type { BookingRepository, NotificationService, OfferingRepository } from "../ports";
import {
  RuleEngine,
  type BookingCandidate,
  type BookingCandidateOffering,
  type RuleViolation,
} from "../rules";
import { CapacityRule, LeadTimeRule } from "../rules/implementations";

export interface CreateBookingInput {
  readonly guestName: string;
  readonly guestCount: number;
  readonly slotStart: Date;
  readonly slotEnd: Date;
  readonly selections: readonly SelectedOffering[];
  readonly guestContribution?: string;
}

export type CreateBookingError =
  | { readonly type: "unknown-offering"; readonly offeringId: string }
  | { readonly type: "rule-violation"; readonly violations: readonly RuleViolation[] }
  | { readonly type: "slot-conflict"; readonly message: string };

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly offeringRepository: OfferingRepository,
    private readonly notificationService: NotificationService,
    private readonly generateId: () => string = randomUUID,
  ) {}

  async execute(
    input: CreateBookingInput,
    now: Date = new Date(),
  ): Promise<Result<Booking, CreateBookingError>> {
    const offerings = await this.offeringRepository.findOfferings();
    const offeringById = new Map(offerings.map((offering) => [offering.id, offering]));

    const candidateOfferings: BookingCandidateOffering[] = [];
    for (const selection of input.selections) {
      const offering = offeringById.get(selection.offeringId);
      if (!offering) {
        return Result.fail({ type: "unknown-offering", offeringId: selection.offeringId });
      }

      candidateOfferings.push({
        offeringId: offering.id,
        name: offering.name,
        leadTimeHours: offering.leadTimeHours,
        quantity: selection.quantity,
      });
    }

    const candidate: BookingCandidate = {
      guestCount: input.guestCount,
      slotStart: input.slotStart,
      selectedOfferings: candidateOfferings,
    };

    const ruleEngine = new RuleEngine<BookingCandidate>([new CapacityRule(), new LeadTimeRule()]);
    const ruleResult = ruleEngine.run(candidate, now);

    if (ruleResult.isFailure) {
      return Result.fail({ type: "rule-violation", violations: ruleResult.error });
    }

    const hasConflict = await this.bookingRepository.hasConflictingBooking(
      input.slotStart,
      input.slotEnd,
    );
    if (hasConflict) {
      return Result.fail({
        type: "slot-conflict",
        message: "Seçilen zaman aralığı başka bir randevuyla çakışıyor.",
      });
    }

    const booking: Booking = {
      id: this.generateId(),
      guestName: input.guestName,
      guestCount: input.guestCount,
      slotStart: input.slotStart,
      slotEnd: input.slotEnd,
      selectedOfferings: input.selections,
      guestContribution: input.guestContribution,
      createdAt: now,
    };

    await this.bookingRepository.save(booking);

    // Bildirim, randevunun onayından bağımsızdır (Opsiyon A) — başarısız olsa
    // da booking kaydı zaten oluşmuştur; bu yüzden Result burada iletilmez.
    const notificationResult = await this.notificationService.notifyBookingConfirmed(booking);
    if (notificationResult.isFailure) {
      console.error("Randevu bildirimi gönderilemedi:", notificationResult.error);
    }

    return Result.ok(booking);
  }
}
