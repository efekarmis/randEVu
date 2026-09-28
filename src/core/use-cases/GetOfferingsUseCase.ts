import type { Category } from "../domain/Category";
import type { Offering } from "../domain/Offering";
import type { OfferingRepository } from "../ports";

export interface OfferingsCatalog {
  readonly categories: readonly Category[];
  readonly offerings: readonly Offering[];
}

export class GetOfferingsUseCase {
  constructor(private readonly offeringRepository: OfferingRepository) {}

  async execute(): Promise<OfferingsCatalog> {
    const [categories, offerings] = await Promise.all([
      this.offeringRepository.findCategories(),
      this.offeringRepository.findOfferings(),
    ]);

    return { categories, offerings };
  }
}
