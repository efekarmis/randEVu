# CLAUDE.md

Bu dosya, bu depoda çalışırken Claude Code için bağlayıcı kurallar içerir. Kuralların tam ve ayrıntılı kaynağı **`docs/arch.md`**'dir — herhangi bir çelişkide `docs/arch.md` esas alınır. Kod yazmadan önce emin olmadığın bir kural varsa oradan doğrula.

## Proje Özeti

randEVu; ev sahibinin arkadaş grubu için ziyaret randevusu aldığı, samimi ve esprili bir misafir karşılama / kahve randevu platformudur. Ana motivasyon: hazırlığı uzun süren ikramların (örn. 24 saat önceden demlenen Cold Brew) zamanında yetiştirilebilmesi ve arkadaşların arama çekincesi olmadan uygun saatleri rezerve edebilmesi.

## Teknoloji Yığını

- **Next.js (App Router) + TypeScript** — full-stack iskelet. Ayrı bir Node.js backend yok; tüm sunucu mantığı Next.js Route Handler'ları içinde çalışır.
- **Tailwind CSS + shadcn/ui** — arayüz ve stil.
- **Google Firebase Firestore — yalnızca ücretsiz Spark Plan.**
- **Telegram Bot API** — bildirim servisi.
- **Hetzner Cloud (VPS)** — sunucu altyapısı.
- **Coolify (self-hosted)** — CI/CD ve dağıtım.
- **Docker (`standalone` Next.js build)** — konteyner mimarisi.

Proje `src/` dizini kullanır, App Router aktiftir.

## Katı Kurallar (İhlal Edilemez)

1. **Vercel ve benzeri kapalı platformlar yasak.** Vercel'e özgü herhangi bir bağımlılık, `next.config` ayarı veya kütüphane eklenmez (örn. `@vercel/*` paketleri). Dağıtım hedefi her zaman Hetzner + Coolify + Docker'dır; kod bu varsayımla yazılır (ör. dosya sistemi / uzun süreli process gerektiren yaklaşımlar Vercel'in serverless kısıtlarına göre değil, kendi Docker container'ımıza göre değerlendirilir).
2. **Firebase Spark Plan (ücretsiz) kısıtı.**
   - Kredi kartı gerektiren ücretli servisler (özellikle **Firebase Cloud Functions**) kullanılmaz. Tüm backend mantığı Next.js Route Handler'larında çalışır.
   - Günlük ücretsiz kota (okuma 50.000 / yazma 20.000) aşılmayacak şekilde sorgular optimize yazılır. Gereksiz `onSnapshot` dinleyicileri, polling döngüleri veya sınırsız/sayfalanmamış sorgular yazılmaz.

## Mimari Kurallar

1. **Hexagonal Mimari (Ports & Adapters).** İş mantığı (ikram hazırlığı, randevu onay kuralları) doğrudan Firebase SDK'sına veya Telegram API'sine bağımlı olamaz. Veritabanı ve bildirim işlemleri arayüzler (Port) arkasında soyutlanır; somut Firebase/Telegram kütüphaneleri bu arayüzleri uygulayan Adapter'lardır. Use case'ler port'lara bağımlı olur, somut adapter'lara değil.
2. **Specification Pattern + Rule Engine.** Randevu validasyonları/kısıtlamaları use case içine spagetti `if-else` olarak yazılmaz. Her kural bağımsız, tek sorumluluğa sahip bir Specification'dır ve bir Rule Engine tarafından sırayla işletilir. Yeni bir kural eklerken mevcut kuralları değiştirmek yerine yeni bir Specification eklenir.
3. **Result Pattern.** İş kuralı ihlallerinde (örn. hazırlık süresi yetmiyor, kapasite aşımı) `throw new Error()` kullanılmaz. Tüm iş akışları ve kural kontrolleri tip güvenli bir `Result<Success, Failure>` (başarılı/başarısız) yapısıyla döner. `throw`, yalnızca gerçekten beklenmeyen/programlama hatası durumları için ayrılır, iş kuralı ihlalleri için değil.
4. **Dinamik Katalog (Statik Enum Yasağı — OCP).** `Cold Brew`, `V60`, `Kahve`, `Yemek` gibi sabit tipler kod içine enum/union olarak yazılmaz. Tüm kategoriler ve ikramlar Firestore'dan dinamik olarak okunur. Yeni bir kategori veya ürün eklemek için tek satır kod değişikliği gerekmemelidir — bu veri katmanında bir doküman eklemekle çözülür.
5. **Anti-Over-Engineering.** Domain Events (Pub/Sub Event Bus), Two-Phase Commit, Message Queue veya karmaşık mikroservis desenleri projeye dahil edilmez. Mimari hafif, okunabilir ve pragmatik kalır — YAGNI'ye aykırı soyutlama katmanları eklenmez.

## Önemli İş Kuralları (özet — detay için `docs/arch.md` §5)

- Kullanıcı yalnızca ev sahibinin belirlediği müsait gün/saat aralıklarını seçebilir; çakışan veya geçmiş randevular seçilemez.
- Misafir formunda: isim/lakap zorunlu, kişi sayısı maksimum 4, opsiyonel "eli boş gelmiyorum" ikram katkı seçeneği.
- **Lead Time kuralı:** her ikram öğesinin saat cinsinden bir hazırlık süresi metadata'sı vardır. Randevu saati ile şu an arasındaki fark bu süreden azsa, ürün arayüzde `disabled` olur ve backend'de aynı kural Rule Engine ile de doğrulanır (arayüz kontrolüne asla güvenilmez).
- Randevu, kurallar sağlandığında **anında otomatik onaylanır** (Opsiyon A) ve bir "Misafir Kartı / Dijital Bilet" üretilir.
- Randevu tamamlandığında ev sahibinin Telegram botuna detaylar anında mesaj olarak iletilir.

## UI Prensipleri

- Samimi, esprili, "özel kahve dükkanı" sıcaklığında modern bir tema.
- shadcn/ui tabanlı temiz, erişilebilir form ve takvim bileşenleri.
- Kategori/seçenek alanları dinamik veriye göre kendiliğinden oluşur (kategori tipine göre tekli veya çoklu seçim).

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm run build` — production build (Docker imajı bu build'i kullanır)
- `npm run start` — production sunucusu
- `npm run lint` — ESLint
