import type { Result } from "../shared/Result";
import type { Booking } from "../domain/Booking";

export interface NotificationError {
  readonly reason: string;
}

export interface NotificationService {
  // Randevu, bildirimden bağımsız olarak zaten onaylanmış olur (Opsiyon A);
  // bu yüzden bildirim başarısızlığı throw değil Result.fail ile taşınır.
  notifyBookingConfirmed(booking: Booking): Promise<Result<void, NotificationError>>;
}
