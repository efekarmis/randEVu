import type { Category } from "./Category";

/**
 * İkram/ürün kataloğu tamamen dinamiktir — "Cold Brew", "V60" gibi somut
 * isimler burada değil, veritabanındaki Offering kayıtlarında yer alır.
 */
export interface Offering {
  readonly id: string;
  readonly categoryId: Category["id"];
  readonly name: string;
  /** Hazırlık süresi (saat). Lead Time kuralının girdisidir. */
  readonly leadTimeHours: number;
  readonly description?: string;
}
