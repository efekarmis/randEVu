import type { Booking } from "../domain/Booking";
import type { BookingRepository } from "../ports/BookingRepository";

export class InMemoryBookingRepository implements BookingRepository {
  private readonly bookings = new Map<string, Booking>();

  async findById(id: string): Promise<Booking | null> {
    return this.bookings.get(id) ?? null;
  }

  async findOverlapping(slotStart: Date, slotEnd: Date): Promise<readonly Booking[]> {
    return [...this.bookings.values()].filter(
      (booking) => booking.slotStart < slotEnd && booking.slotEnd > slotStart,
    );
  }

  async save(booking: Booking): Promise<void> {
    this.bookings.set(booking.id, booking);
  }

  get all(): readonly Booking[] {
    return [...this.bookings.values()];
  }
}
