import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function loadCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    // Eksik ortam değişkeni bir dağıtım/yapılandırma hatasıdır, iş kuralı
    // ihlali değildir — bu yüzden Result değil throw kullanılır.
    throw new Error(
      "Firebase Admin SDK için FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY ortam değişkenleri gereklidir.",
    );
  }

  return { projectId, clientEmail, privateKey };
}

let app: App | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): App {
  if (app) {
    return app;
  }

  // Next.js geliştirme sunucusunda modül yeniden yüklenebilir; zaten
  // başlatılmış bir app varsa (hot-reload) onu yeniden kullanır.
  const [existingApp] = getApps();
  app = existingApp ?? initializeApp({ credential: cert(loadCredentials()) });
  return app;
}

export function getFirestoreDb(): Firestore {
  if (db) {
    return db;
  }

  db = getFirestore(getFirebaseApp());
  // Booking.guestContribution gibi opsiyonel alanlar `undefined` gelebilir;
  // Firestore bunu varsayılan olarak hata sayar.
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}
