/**
 * Bir randevu henüz kaydedilmeden önce kural motoruna verilen aday şeklidir.
 * Booking entity'sinden ayrı tutulur çünkü yalnızca doğrulama için gereken
 * (ör. her seçilen ikramın leadTimeHours'ı) alanları taşır.
 */
export interface BookingCandidateOffering {
  readonly offeringId: string;
  readonly name: string;
  readonly leadTimeHours: number;
  readonly quantity: number;
}

export interface BookingCandidate {
  readonly guestCount: number;
  readonly slotStart: Date;
  readonly selectedOfferings: readonly BookingCandidateOffering[];
}
