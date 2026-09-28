import { NextResponse } from "next/server";
import { offeringsUseCase } from "@/infrastructure/container";

export async function GET() {
  const catalog = await offeringsUseCase().execute();
  return NextResponse.json(catalog);
}
