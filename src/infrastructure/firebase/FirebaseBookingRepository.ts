import { Timestamp, type Firestore } from "firebase-admin/firestore";
import type { Booking, SelectedOffering } from "../../core/domain/Booking";
import type { BookingRepository } from "../../core/ports/BookingRepository";

const BOOKINGS_COLLECTION = "bookings";

interface BookingDocument {
  guestName: string;
  guestCount: number;
  slotStart: Timestamp;
  slotEnd: Timestamp;
  selectedOfferings: SelectedOffering[];
  guestContribution?: string;
  createdAt: Timestamp;
}

function toBooking(id: string, doc: BookingDocument): Booking {
  return {
    id,
    guestName: doc.guestName,
    guestCount: doc.guestCount,
    slotStart: doc.slotStart.toDate(),
    slotEnd: doc.slotEnd.toDate(),
    selectedOfferings: doc.selectedOfferings,
    guestContribution: doc.guestContribution,
    createdAt: doc.createdAt.toDate(),
  };
}

function toDocument(booking: Booking): BookingDocument {
  return {
    guestName: booking.guestName,
    guestCount: booking.guestCount,
    slotStart: Timestamp.fromDate(booking.slotStart),
    slotEnd: Timestamp.fromDate(booking.slotEnd),
    selectedOfferings: [...booking.selectedOfferings],
    guestContribution: booking.guestContribution,
    createdAt: Timestamp.fromDate(booking.createdAt),
  };
}

export class FirebaseBookingRepository implements BookingRepository {
  constructor(private readonly db: Firestore) {}

  async findById(id: string): Promise<Booking | null> {
    const snapshot = await this.db.collection(BOOKINGS_COLLECTION).doc(id).get();
    if (!snapshot.exists) {
      return null;
    }
    return toBooking(snapshot.id, snapshot.data() as BookingDocument);
  }

  async hasConflictingBooking(start: Date, end: Date): Promise<boolean> {
    // Firestore aynı sorguda bir alan üzerinde iki yönlü aralık (< ve >)
    // karşılaştırmasını desteklemez. Kotayı korumak için tek yönlü bir aralık
    // sorgusu (slotStart < end) çalıştırılır; ikinci karşılaştırma (slotEnd >
    // start) küçük sonuç kümesi üzerinde bellek içinde yapılır.
    const snapshot = await this.db
      .collection(BOOKINGS_COLLECTION)
      .where("slotStart", "<", Timestamp.fromDate(end))
      .get();

    return snapshot.docs.some((doc) => {
      const data = doc.data() as BookingDocument;
      return data.slotEnd.toDate() > start;
    });
  }

  async save(booking: Booking): Promise<void> {
    await this.db.collection(BOOKINGS_COLLECTION).doc(booking.id).set(toDocument(booking));
  }
}
