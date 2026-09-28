import { describe, expect, it } from "vitest";
import { GetOfferingsUseCase } from "./GetOfferingsUseCase";
import { InMemoryOfferingRepository } from "../testing";
import type { Category } from "../domain/Category";
import type { Offering } from "../domain/Offering";

describe("GetOfferingsUseCase", () => {
  it("kategori ve ikramları repository'den toplar", async () => {
    const category: Category = { id: "beverages", name: "İçecekler", selectionType: "single" };
    const offering: Offering = {
      id: "cold-brew",
      categoryId: "beverages",
      name: "Cold Brew",
      leadTimeHours: 24,
    };
    const repository = new InMemoryOfferingRepository([category], [offering]);
    const useCase = new GetOfferingsUseCase(repository);

    const catalog = await useCase.execute();

    expect(catalog.categories).toEqual([category]);
    expect(catalog.offerings).toEqual([offering]);
  });
});
