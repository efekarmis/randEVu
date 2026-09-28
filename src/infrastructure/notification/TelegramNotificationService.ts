import { Result } from "../../core/shared/Result";
import type { Booking } from "../../core/domain/Booking";
import type { NotificationError, NotificationService } from "../../core/ports/NotificationService";

const TELEGRAM_API_BASE = "https://api.telegram.org";

function formatBookingMessage(booking: Booking): string {
  const offeringsSummary =
    booking.selectedOfferings
      .map((selection) => `${selection.offeringId} x${selection.quantity}`)
      .join(", ") || "—";

  const lines = [
    "🎉 Yeni randevu onaylandı!",
    `Misafir: ${booking.guestName} (${booking.guestCount} kişi)`,
    `Saat: ${booking.slotStart.toLocaleString("tr-TR")}`,
    `İkramlar: ${offeringsSummary}`,
    booking.guestContribution ? `Katkı: ${booking.guestContribution}` : undefined,
  ];

  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

export class TelegramNotificationService implements NotificationService {
  constructor(
    private readonly botToken: string,
    private readonly chatId: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async notifyBookingConfirmed(booking: Booking): Promise<Result<void, NotificationError>> {
    const url = `${TELEGRAM_API_BASE}/bot${this.botToken}/sendMessage`;

    try {
      const response = await this.fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: formatBookingMessage(booking),
        }),
      });

      if (!response.ok) {
        return Result.fail({ reason: `Telegram API ${response.status} durum kodu döndürdü.` });
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail({
        reason: error instanceof Error ? error.message : "Bilinmeyen bir ağ hatası oluştu.",
      });
    }
  }
}
