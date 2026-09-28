import type { Category } from "@/core/domain/Category";
import type { Offering } from "@/core/domain/Offering";

export interface OfferingsCatalog {
  categories: readonly Category[];
  offerings: readonly Offering[];
}

export interface BookingDraft {
  slotStart: Date | null;
  slotEnd: Date | null;
  guestName: string;
  guestCount: number;
  bringsContribution: boolean;
  guestContribution: string;
  selectedOfferingIds: string[];
}

export const INITIAL_DRAFT: BookingDraft = {
  slotStart: null,
  slotEnd: null,
  guestName: "",
  guestCount: 1,
  bringsContribution: false,
  guestContribution: "",
  selectedOfferingIds: [],
};

/** Ziyaretin varsayılan süresi; her randevu için sabit tutulur. */
export const VISIT_DURATION_MINUTES = 90;

/**
 * Ev sahibinin sunduğu günlük saat dilimleri. Henüz ayrı bir "müsaitlik"
 * yönetim ekranı olmadığı için sabit bir liste olarak tutulur; çakışma
 * kontrolü zaten sunucu tarafında (409) yapılıyor.
 */
export const DAILY_SLOT_HOURS = [10, 12, 14, 16, 18, 20];

export const MAX_GUEST_COUNT = 4;
