import { getFirestoreDb } from "./firebase/firebaseAdmin";
import { FirebaseBookingRepository } from "./firebase/FirebaseBookingRepository";
import { FirebaseOfferingRepository } from "./firebase/FirebaseOfferingRepository";
import { TelegramNotificationService } from "./notification/TelegramNotificationService";
import { CreateBookingUseCase } from "../core/use-cases/CreateBookingUseCase";
import { GetOfferingsUseCase } from "../core/use-cases/GetOfferingsUseCase";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} ortam değişkeni tanımlı değil.`);
  }
  return value;
}

let createBookingUseCase: CreateBookingUseCase | undefined;
let offeringsUseCaseInstance: GetOfferingsUseCase | undefined;

export function bookingUseCase(): CreateBookingUseCase {
  if (!createBookingUseCase) {
    const db = getFirestoreDb();
    createBookingUseCase = new CreateBookingUseCase(
      new FirebaseBookingRepository(db),
      new FirebaseOfferingRepository(db),
      new TelegramNotificationService(
        requireEnv("TELEGRAM_BOT_TOKEN"),
        requireEnv("TELEGRAM_CHAT_ID"),
      ),
    );
  }
  return createBookingUseCase;
}

export function offeringsUseCase(): GetOfferingsUseCase {
  if (!offeringsUseCaseInstance) {
    offeringsUseCaseInstance = new GetOfferingsUseCase(new FirebaseOfferingRepository(getFirestoreDb()));
  }
  return offeringsUseCaseInstance;
}
