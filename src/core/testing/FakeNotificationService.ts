import { Result } from "../shared/Result";
import type { Booking } from "../domain/Booking";
import type { NotificationError, NotificationService } from "../ports/NotificationService";

export class FakeNotificationService implements NotificationService {
  readonly notified: Booking[] = [];
  shouldFail = false;

  async notifyBookingConfirmed(booking: Booking): Promise<Result<void, NotificationError>> {
    this.notified.push(booking);
    return this.shouldFail ? Result.fail({ reason: "simulated-failure" }) : Result.ok(undefined);
  }
}
