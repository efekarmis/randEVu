import type { Category } from "../domain/Category";
import type { Offering } from "../domain/Offering";

export interface OfferingRepository {
  findCategories(): Promise<readonly Category[]>;
  findOfferings(): Promise<readonly Offering[]>;
  findOfferingById(id: string): Promise<Offering | null>;
}
