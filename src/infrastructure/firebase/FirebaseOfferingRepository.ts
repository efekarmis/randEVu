import type { Firestore } from "firebase-admin/firestore";
import type { Category, CategorySelectionType } from "../../core/domain/Category";
import type { Offering } from "../../core/domain/Offering";
import type { OfferingRepository } from "../../core/ports/OfferingRepository";

const CATEGORIES_COLLECTION = "categories";
const OFFERINGS_COLLECTION = "offerings";

interface CategoryDocument {
  name: string;
  selectionType: CategorySelectionType;
}

interface OfferingDocument {
  categoryId: string;
  name: string;
  leadTimeHours: number;
  description?: string;
}

function toOffering(id: string, doc: OfferingDocument): Offering {
  return {
    id,
    categoryId: doc.categoryId,
    name: doc.name,
    leadTimeHours: doc.leadTimeHours,
    description: doc.description,
  };
}

export class FirebaseOfferingRepository implements OfferingRepository {
  constructor(private readonly db: Firestore) {}

  async findCategories(): Promise<readonly Category[]> {
    // Kategoriler küçük, sabit boyutlu bir referans koleksiyonudur; tek
    // seferlik düz bir okuma yeterlidir (dinleyici veya sayfalama gerekmez).
    const snapshot = await this.db.collection(CATEGORIES_COLLECTION).get();
    return snapshot.docs.map((doc) => {
      const data = doc.data() as CategoryDocument;
      return { id: doc.id, name: data.name, selectionType: data.selectionType };
    });
  }

  async findOfferings(): Promise<readonly Offering[]> {
    const snapshot = await this.db.collection(OFFERINGS_COLLECTION).get();
    return snapshot.docs.map((doc) => toOffering(doc.id, doc.data() as OfferingDocument));
  }

  async findOfferingById(id: string): Promise<Offering | null> {
    const snapshot = await this.db.collection(OFFERINGS_COLLECTION).doc(id).get();
    if (!snapshot.exists) {
      return null;
    }
    return toOffering(snapshot.id, snapshot.data() as OfferingDocument);
  }
}
