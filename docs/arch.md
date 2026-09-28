# TECH STACK & PROJECT RULES SPECIFICATION

## 1. Proje Amacı ve Özeti

Bu proje; ev sahibinin arkadaş grubu için ziyaret randevusu alabildiği, samimi ve esprili bir misafir karşılama ve kahve randevu platformudur.

Sistemin ana motivasyonu; hazırlığı uzun süren özel ikramların (örneğin 24 saat önceden demlenmesi gereken Cold Brew veya marine edilmesi gereken yemekler) zamanında hazırlanabilmesi ve arkadaşların arama çekincesi yaşamadan uygun saatleri rezerve edebilmesidir.

---

## 2. Teknoloji Yığını (Tech Stack)

- **Uygulama İskeleti (Full-Stack):** Next.js (App Router) + TypeScript
  - _Not:_ API rotaları ve sunucu iş mantığı Next.js içinde çalışır; harici bir Node.js backend sunucusuna gerek yoktur.
- **Arayüz ve Stil:** Tailwind CSS + shadcn/ui
- **Veritabanı:** Google Firebase Firestore (**Yalnızca Ücretsiz / Spark Plan**)
- **Bildirim Servisi:** Telegram Bot API
- **Sunucu Altyapısı (Hosting):** Hetzner Cloud (VPS)
- **Dağıtım ve Yönetim (CI/CD & PaaS):** Coolify (Self-hosted, açık kaynak)
- **Konteyner Mimarisi:** Docker (`standalone` Next.js derlemesi)

---

## 3. Katı Altyapı ve Platform Kuralları

1. **Vercel ve Benzeri Kapalı Platformlar Yasaktır:**
   - Projede Vercel bağımlılığı veya platforma özel kütüphaneler yer alamaz.
   - Dağıtım sadece **Hetzner Cloud** üzerindeki **Coolify** aracılığıyla, Docker container olarak yapılacaktır.
2. **Firebase Ücretsiz Sürüm (Spark Plan) Kısıtı:**
   - Kredi kartı gerektiren ücretli servisler (Firebase Cloud Functions gibi) kullanılmayacaktır. Tüm backend mantığı Next.js Route Handler'ları üzerinde koşacaktır.
   - Günlük ücretsiz okuma (50.000) ve yazma (20.000) kotalarını aşmayacak şekilde optimize sorgular yazılacaktır (gereksiz dinleyiciler veya sonsuz döngülü sorgular yasaktır).

---

## 4. Mimari Tasarım Kuralları

1. **Hexagonal Mimari (Ports & Adapters):**
   - İş mantığı (İkram hazırlığı, randevu onay kuralları) doğrudan Firebase SDK'sına veya Telegram API'sine bağımlı olamaz.
   - Veritabanı ve bildirim işlemleri birer arayüz (Port) arkasında soyutlanmalı, somut kütüphaneler bu arayüzleri uygulayan birer eklenti (Adapter) olmalıdır.
2. **Kural Motoru (Specification Pattern):**
   - Randevu validasyonları veya kısıtlamaları iş senaryosu (Use Case) içine spagetti `if-else` blokları halinde yazılamaz.
   - Her kural bağımsız, tek bir sorumluluğa sahip bir "Specification" olarak yazılmalı ve bir "Rule Engine" tarafından sırayla işletilmelidir.
3. **Result Pattern (Modern Hata Yönetimi):**
   - İş kurallarının ihlalinde (örn: sürenin yetmemesi, kapasite aşımı) sisteme `throw new Error()` patlatılamaz.
   - Tüm iş akışları ve kural kontrolleri tip güvenli bir `Result (Başarılı / Başarısız)` yapısıyla sonuç dönmelidir.
4. **Dinamik Veri Modeli (Statik Enum Yasağı - OCP):**
   - Kod içerisinde `Cold Brew`, `V60`, `Kahve`, `Yemek` gibi sabit tipler (enum/union) kodlanamaz.
   - Tüm kategoriler ve ikramlar veritabanından dinamik olarak beslenmelidir. Sisteme yeni bir ikram kategorisi veya ürünü eklendiğinde tek bir satır kod değiştirilmemelidir.
5. **Anti-Over-Engineering Kuralı:**
   - Domain Events (Pub/Sub Event Bus), Two-Phase Commit, Message Queue veya karmaşık mikroservis desenleri projeye dahil edilmeyecektir. Mimari hafif, okunabilir ve pragmatik kalmalıdır.

---

## 5. Fonksiyonel Gereksinimler ve İş Kuralları

1. **Zaman Dilimi ve Slot Seçimi:**
   - Kullanıcı sadece ev sahibinin belirlediği müsait gün ve saat aralıklarını seçebilir. Çakışan veya geçmiş randevular seçilemez.
2. **Misafir Formu:**
   - Misafir adı/lakabı zorunludur.
   - Kişi sayısı seçilebilir (Maksimum sınır: 4 kişi).
   - "Eli boş gelmiyorum" opsiyonel ikram katkı seçeneği bulunmalıdır.
3. **Dinamik Hazırlık Süresi (Lead Time) Kuralı:**
   - Her ikram öğesinin bir "hazırlık süresi" (saat cinsinden) metadata değeri vardır.
   - Eğer randevu saati ile şu an arasındaki fark, seçilmek istenen ürünün hazırlık süresinden azsa:
     - O ürün arayüzde seçilemez (`disabled`) olmalıdır.
     - Kullanıcıya hazırlık süresiyle ilgili bilgilendirici/esprili bir mesaj gösterilmelidir.
     - Bu kural backend tarafında da Rule Engine ile doğrulanmalıdır.
4. **Onay Mekanizması (Opsiyon A):**
   - Müsait saat dilimi seçilip kurallar sağlandığında randevu **anında otomatik onaylanır**.
   - Ekranda arkadaşa özel bir "Misafir Kartı / Dijital Bilet" üretilir.
5. **Bildirim:**
   - Randevu tamamlandığında ev sahibinin telefonundaki Telegram botuna randevu detayları, seçilen dinamik ikramlar ve misafir sayısı anında mesaj olarak iletilir.

---

## 6. Kullanıcı Arayüzü (UI) Prensipleri

- Samimi, esprili ve bir "özel kahve dükkanı" sıcaklığında modern bir tema.
- shadcn/ui tabanlı temiz, erişilebilir form ve takvim bileşenleri.
- Dinamik veriye göre kendiliğinden oluşan kategori ve seçenek alanları (kategori tipine göre tekli seçim veya çoklu seçim kutuları).
