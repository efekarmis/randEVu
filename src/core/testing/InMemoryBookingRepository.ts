import type { Booking } from "../domain/Booking";
import type { BookingRepository } from "../ports/BookingRepository";

export class InMemoryBookingRepository implements BookingRepository {
  private readonly bookings = new Map<string, Booking>();

  async findById(id: string): Promise<Booking | null> {
    return this.bookings.get(id) ?? null;
  }

  async hasConflictingBooking(start: Date, end: Date): Promise<boolean> {
    return [...this.bookings.values()].some(
      (booking) => booking.slotStart < end && booking.slotEnd > start,
    );
  }

  async save(booking: Booking): Promise<void> {
    this.bookings.set(booking.id, booking);
  }

  get all(): readonly Booking[] {
    return [...this.bookings.values()];
  }
}
