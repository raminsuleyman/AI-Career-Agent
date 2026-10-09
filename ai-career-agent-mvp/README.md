# AI Career Agent

Azərbaycan dilli **AI Career Agent** — ilk internship axtaran tələbə üçün hazırlanmış interaktiv dark-mode demo platformadır.

## Hazır funksiyalar

- CV mətnini yapışdırma və PDF/DOCX fayl seçimi üçün validasiyalı landing ekranı
- Altı hədəf rol seçimi
- Açıq şəkildə etiketlənən demo CV analizi və profil bacarıqları
- 12 demo internship üçün deterministik uyğunluq hesabı, filtr və detail paneli
- Skill chip əlavə etmə/silmə və səviyyə dəyişdikdə avtomatik yenilənən readiness/gap nəticələri
- Yeddi günlük, 18 task-lıq roadmap və progress izləmə
- Beş suallı mock müsahibə və Career Readiness gauge nəticəsi
- Sessiya daxilində axının qorunması, demo banner, “Real nəticəni yenilə” nəzarəti və məlumatları silmə təsdiqi
- Mobil uyğun, klaviatura ilə işlənən interfeys

## Lokal işə salma

```bash
pnpm install
pnpm dev
```

Sonra `http://localhost:3000` ünvanını açın.

## Yoxlama komandaları

```bash
pnpm check
pnpm build
```

## Qeyd

Bu layihə işlək frontend demo və ilkin **Express + tRPC + Drizzle backend MVP kodunu** ehtiva edir. Backend CV mətni, analiz, roadmap task-ları və müsahibə cavablarını persistent saxlayır, amma skill extraction və feedback hələ mock-dur; PDF/DOCX parser, real LLM və UI-nin API-yə qoşulması növbəti mərhələdir.

## Starter və platforma qeydləri

Layihə React / Express / tRPC / Drizzle starterinə əsaslanır. `pnpm build` frontend və Express server bundle-ını yaradır; `pnpm db:migrate` isə gələcək persistent schema dəyişiklikləri üçün saxlanılıb. Private açarlar yalnız serverdə qalmalıdır; `server/_core/publicConfig.ts` yalnız seçilmiş public runtime dəyərlərini brauzerə ötürür.

Backend endpoint-ləri, cədvəllər, local API inteqrasiya qeydləri və migration təhlükəsizlik qeydi üçün [`docs/backend-mvp.md`](docs/backend-mvp.md)-ə baxın. Migration SQL [`drizzle/0001_career_agent.sql`](drizzle/0001_career_agent.sql)-dədir. Database shared development/production olduğu üçün schema migration-ı bu işdə **tətbiq edilməyib**.
