import type { OfferingsCatalog } from "@/components/booking/types";

export async function fetchOfferingsCatalog(): Promise<OfferingsCatalog> {
  const response = await fetch("/api/offerings");
  if (!response.ok) {
    throw new Error("İkramlar yüklenemedi.");
  }
  return response.json();
}

export interface CreateBookingPayload {
  guestName: string;
  guestCount: number;
  slotStart: Date;
  slotEnd: Date;
  selections: { offeringId: string; quantity: number }[];
  guestContribution?: string;
}

export type CreateBookingResponse =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string };

export async function submitBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body: unknown = await response.json().catch(() => ({}));
  const bodyRecord = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  if (response.ok) {
    return { ok: true, id: String(bodyRecord.id ?? "") };
  }

  return {
    ok: false,
    status: response.status,
    error: typeof bodyRecord.error === "string" ? bodyRecord.error : "Bilinmeyen bir hata oluştu.",
  };
}
