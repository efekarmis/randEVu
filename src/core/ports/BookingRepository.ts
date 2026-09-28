import type { Booking } from "../domain/Booking";

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  hasConflictingBooking(start: Date, end: Date): Promise<boolean>;
  save(booking: Booking): Promise<void>;
}
