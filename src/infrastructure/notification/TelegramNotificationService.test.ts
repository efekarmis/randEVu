import { describe, expect, it } from "vitest";
import { TelegramNotificationService } from "./TelegramNotificationService";
import type { Booking } from "../../core/domain/Booking";

const booking: Booking = {
  id: "booking-1",
  guestName: "Ayşe",
  guestCount: 2,
  slotStart: new Date("2026-01-02T18:00:00.000Z"),
  slotEnd: new Date("2026-01-02T19:00:00.000Z"),
  selectedOfferings: [{ offeringId: "cold-brew", quantity: 1 }],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("TelegramNotificationService", () => {
  it("sendMessage başarılı olduğunda Result.ok döner ve doğru endpoint'i çağırır", async () => {
    let calledUrl: string | undefined;
    let calledInit: RequestInit | undefined;
    const fetchImpl: typeof fetch = async (input, init) => {
      calledUrl = input.toString();
      calledInit = init;
      return new Response(null, { status: 200 });
    };
    const service = new TelegramNotificationService("token", "chat-id", fetchImpl);

    const result = await service.notifyBookingConfirmed(booking);

    expect(result.isSuccess).toBe(true);
    expect(calledUrl).toBe("https://api.telegram.org/bottoken/sendMessage");
    expect(JSON.parse(calledInit?.body as string)).toMatchObject({ chat_id: "chat-id" });
  });

  it("Telegram API hata durumu döndürürse Result.fail döner", async () => {
    const fetchImpl: typeof fetch = async () => new Response(null, { status: 401 });
    const service = new TelegramNotificationService("token", "chat-id", fetchImpl);

    const result = await service.notifyBookingConfirmed(booking);

    expect(result.isFailure).toBe(true);
  });

  it("ağ hatası fırlatılırsa yakalanır ve Result.fail döner", async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error("network down");
    };
    const service = new TelegramNotificationService("token", "chat-id", fetchImpl);

    const result = await service.notifyBookingConfirmed(booking);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.error.reason).toBe("network down");
    }
  });
});
