import type { Category } from "../domain/Category";
import type { Offering } from "../domain/Offering";
import type { OfferingRepository } from "../ports/OfferingRepository";

export class InMemoryOfferingRepository implements OfferingRepository {
  constructor(
    private readonly categories: readonly Category[] = [],
    private readonly offerings: readonly Offering[] = [],
  ) {}

  async findCategories(): Promise<readonly Category[]> {
    return this.categories;
  }

  async findOfferings(): Promise<readonly Offering[]> {
    return this.offerings;
  }

  async findOfferingById(id: string): Promise<Offering | null> {
    return this.offerings.find((offering) => offering.id === id) ?? null;
  }
}
