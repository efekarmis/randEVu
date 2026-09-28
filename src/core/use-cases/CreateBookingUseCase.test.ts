import { beforeEach, describe, expect, it } from "vitest";
import { CreateBookingUseCase } from "./CreateBookingUseCase";
import {
  FakeNotificationService,
  InMemoryBookingRepository,
  InMemoryOfferingRepository,
} from "../testing";
import type { Booking } from "../domain/Booking";
import type { Offering } from "../domain/Offering";

const NOW = new Date("2026-01-01T00:00:00.000Z");

const coldBrew: Offering = {
  id: "cold-brew",
  categoryId: "beverages",
  name: "Cold Brew",
  leadTimeHours: 24,
};

function hoursFromNow(hours: number): Date {
  return new Date(NOW.getTime() + hours * 60 * 60 * 1000);
}

describe("CreateBookingUseCase", () => {
  let bookingRepository: InMemoryBookingRepository;
  let offeringRepository: InMemoryOfferingRepository;
  let notificationService: FakeNotificationService;
  let useCase: CreateBookingUseCase;
  let idCounter: number;

  beforeEach(() => {
    bookingRepository = new InMemoryBookingRepository();
    offeringRepository = new InMemoryOfferingRepository([], [coldBrew]);
    notificationService = new FakeNotificationService();
    idCounter = 0;
    useCase = new CreateBookingUseCase(
      bookingRepository,
      offeringRepository,
      notificationService,
      () => `booking-${++idCounter}`,
    );
  });

  it("kurallar geçerse randevuyu kaydeder ve bildirimi tetikler", async () => {
    const slotStart = hoursFromNow(25);

    const result = await useCase.execute(
      {
        guestName: "Ayşe",
        guestCount: 2,
        slotStart,
        slotEnd: hoursFromNow(26),
        selections: [{ offeringId: "cold-brew", quantity: 1 }],
      },
      NOW,
    );

    expect(result.isSuccess).toBe(true);
    expect(bookingRepository.all).toHaveLength(1);
    expect(notificationService.notified).toHaveLength(1);
  });

  it("lead time yetersizse Result.fail döner ve kaydetmez", async () => {
    const result = await useCase.execute(
      {
        guestName: "Ayşe",
        guestCount: 2,
        slotStart: hoursFromNow(2),
        slotEnd: hoursFromNow(3),
        selections: [{ offeringId: "cold-brew", quantity: 1 }],
      },
      NOW,
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.type).toBe("rule-violation");
      if (result.error.type === "rule-violation") {
        expect(result.error.violations.some((violation) => violation.rule === "LeadTimeRule")).toBe(
          true,
        );
      }
    }
    expect(bookingRepository.all).toHaveLength(0);
    expect(notificationService.notified).toHaveLength(0);
  });

  it("kapasite aşılırsa Result.fail döner", async () => {
    const result = await useCase.execute(
      {
        guestName: "Ayşe",
        guestCount: 5,
        slotStart: hoursFromNow(48),
        slotEnd: hoursFromNow(49),
        selections: [],
      },
      NOW,
    );

    expect(result.isFailure).toBe(true);
    expect(bookingRepository.all).toHaveLength(0);
  });

  it("bilinmeyen bir offering seçilirse Result.fail döner", async () => {
    const result = await useCase.execute(
      {
        guestName: "Ayşe",
        guestCount: 1,
        slotStart: hoursFromNow(48),
        slotEnd: hoursFromNow(49),
        selections: [{ offeringId: "unknown", quantity: 1 }],
      },
      NOW,
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error).toEqual({ type: "unknown-offering", offeringId: "unknown" });
    }
  });

  it("çakışan bir randevu varsa Result.fail döner ve yeni kaydı oluşturmaz", async () => {
    const existingBooking: Booking = {
      id: "existing",
      guestName: "Mehmet",
      guestCount: 1,
      slotStart: hoursFromNow(48),
      slotEnd: hoursFromNow(49),
      selectedOfferings: [],
      createdAt: NOW,
    };
    await bookingRepository.save(existingBooking);

    const result = await useCase.execute(
      {
        guestName: "Ayşe",
        guestCount: 1,
        slotStart: hoursFromNow(48.5),
        slotEnd: hoursFromNow(49.5),
        selections: [],
      },
      NOW,
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.type).toBe("slot-conflict");
    }
    expect(bookingRepository.all).toHaveLength(1);
    expect(notificationService.notified).toHaveLength(0);
  });

  it("bildirim başarısız olsa da randevu kaydı bozulmaz", async () => {
    notificationService.shouldFail = true;

    const result = await useCase.execute(
      {
        guestName: "Ayşe",
        guestCount: 1,
        slotStart: hoursFromNow(48),
        slotEnd: hoursFromNow(49),
        selections: [{ offeringId: "cold-brew", quantity: 1 }],
      },
      NOW,
    );

    expect(result.isSuccess).toBe(true);
    expect(bookingRepository.all).toHaveLength(1);
  });
});
