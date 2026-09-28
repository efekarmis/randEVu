import type { Booking } from "../domain/Booking";

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findOverlapping(slotStart: Date, slotEnd: Date): Promise<readonly Booking[]>;
  save(booking: Booking): Promise<void>;
}
