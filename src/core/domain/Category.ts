/**
 * Kategori tipi UI'da tekli/çoklu seçim davranışını belirler.
 * Kategorinin kendisi (adı, kimliği) burada sabit kodlanmaz — veritabanından dinamik gelir.
 */
export type CategorySelectionType = "single" | "multiple";

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly selectionType: CategorySelectionType;
}
