import { NextResponse } from "next/server";
import { z } from "zod";
import { bookingUseCase } from "@/infrastructure/container";
import type { CreateBookingError } from "@/core/use-cases/CreateBookingUseCase";

const createBookingRequestSchema = z
  .object({
    guestName: z.string().trim().min(1),
    guestCount: z.number().int().min(1),
    slotStart: z.coerce.date(),
    slotEnd: z.coerce.date(),
    selections: z.array(
      z.object({
        offeringId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    ),
    guestContribution: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.slotEnd > data.slotStart, {
    message: "slotEnd, slotStart'tan sonra olmalıdır.",
    path: ["slotEnd"],
  });

function errorResponse(error: CreateBookingError) {
  switch (error.type) {
    case "slot-conflict":
      return NextResponse.json({ error: error.message }, { status: 409 });
    case "rule-violation":
      return NextResponse.json(
        { error: "İş kuralı ihlali.", violations: error.violations },
        { status: 422 },
      );
    case "unknown-offering":
      return NextResponse.json(
        { error: `Bilinmeyen ikram: ${error.offeringId}` },
        { status: 422 },
      );
    default: {
      const exhaustiveCheck: never = error;
      return exhaustiveCheck;
    }
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi." }, { status: 400 });
  }

  const parsed = createBookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz istek.", details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const result = await bookingUseCase().execute(parsed.data);

  if (result.isFailure) {
    return errorResponse(result.error);
  }

  return NextResponse.json({ id: result.value.id }, { status: 201 });
}
