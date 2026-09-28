import type { Offering } from "./Offering";

export interface SelectedOffering {
  readonly offeringId: Offering["id"];
  readonly quantity: number;
}

export interface Booking {
  readonly id: string;
  readonly guestName: string;
  readonly guestCount: number;
  readonly slotStart: Date;
  readonly slotEnd: Date;
  readonly selectedOfferings: readonly SelectedOffering[];
  readonly guestContribution?: string;
  readonly createdAt: Date;
}
