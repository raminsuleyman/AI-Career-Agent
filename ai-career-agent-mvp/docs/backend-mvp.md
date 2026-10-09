# AI Career Agent — minimal backend MVP

Bu backend mövcud **Express + tRPC + Drizzle + MySQL** skeletinə qoşulur. REST endpoint-lər əlavə etmir; Express serveri artıq tRPC-ni `/api/trpc`-də servis edir. İstifadəçi məlumatı dəyişdirən bütün career procedure-lər `protectedProcedure` ilə qorunur, yəni mövcud Manus OAuth ilə təsdiqlənmiş istifadəçi tələb olunur.

> Bu qərar blueprint-dəki Supabase Anonymous Auth-dan fərqlidir. Hazırkı repo-da Supabase client/Auth yoxdur; yeni auth provayder və açarları uydurmaq əvəzinə starter-in təsdiqlənmiş Manus sessiyası istifadə olunur. Qeydiyyatsız anonim MVP tələb olunsa, Supabase Anonymous Auth və UUID-based ownership migration-ı ayrıca planlanmalıdır.

## Əlavə edilmiş database cədvəllər

| Cədvəl | Təyinat |
| --- | --- |
| `cv_documents` | CV-nin çıxarılmış mətni, upload faylının özü deyil |
| `analyses` | Rol, bacarıqlar, evidence, source, deterministic readiness; user/request-key unikal index-i idempotency üçün |
| `roadmaps`, `roadmap_tasks` | 7 günlük tapşırıqlar və completed status |
| `interviews`, `interview_questions`, `interview_answers` | 5 sual, cavablar və yekun skor/feedback |

Bütün user-owned cədvəllərdə foreign key və `ON DELETE CASCADE` var. İstifadəçi məlumatlarını silmək üçün `career.deleteMyData` proseduru da əlavə olunub. Internship kataloqu bu minimal versiyada statik seed kodudur, ayrıca DB cədvəli deyil.

## API (tRPC)

`career` router-i aşağıdakı procedure-ləri təqdim edir:

- `career.roles` — rol katalogu
- `career.internships` — 12 demo elan və deterministik match
- `career.createAnalysis` — CV mətni qəbulu, request-key replay, mock skill extraction və gap/readiness hesabı
- `career.getAnalysis` — sahiblik yoxlaması ilə analiz
- `career.createRoadmap`, `career.getRoadmap`, `career.setTaskCompleted`
- `career.createInterview`, `career.getInterview`, `career.saveAnswer`, `career.completeInterview`
- `career.deleteMyData`

`tRPC` clienti `client/src/lib/trpc.ts` vasitəsilə bu procedure-ləri çağırmalıdır. Mövcud UI hələ mock context-dədir; real API-yə qoşmaq növbəti frontend integration işidir.

## Tətbiq etmə

1. Database shared dev/production resurs olduğuna görə migration-dan əvvəl backup/approval prosedurunuzu yoxlayın.
2. Migration SQL-i nəzərdən keçirin: `drizzle/0001_career_agent.sql`.
3. Tətbiq yalnız təsdiqdən sonra edin, məsələn migration runner ilə `pnpm db:migrate`. **`pnpm db:push` bu SQL-i avtomatik tətbiq etmək üçün çalışdırılmayıb.**
4. `pnpm check`, `pnpm test`, `pnpm build` çalışdırın.

`DATABASE_URL` yalnız server mühitində qalır. `.env` və secret-lər arxivə/repo-ya daxil edilməməlidir.

## Mock və real AI sərhədi

Hazır `extractSkills()` CV mətni daxilində keyword-ləri tapıb `evidence` qaytaran deterministic mock extractor-dur. Bu analizlərin `source: "mock"` işarəsi ilə saxlanması vacibdir; onu real AI nəticəsi kimi göstərməyin. Növbəti mərhələdə extractor-i server-only Manus LLM call ilə əvəz edin, JSON-u zod ilə parse edin və `evidence` hər birinin CV mətni daxilində olduğunu yoxlayın. Deterministic scoring funksiyaları dəyişmədən qalmalıdır.

## Məxfilik və saxlanma

`cv_documents.text`-də CV-nin yapışdırılmış mətni database-də saxlanır; demo UI-nin brauzer-sessiya davranışından fərqlidir. Bu dəyişikliklə test etməzdən əvvəl məxfilik bildirişində bunu aydın göstərin. Məlumat yalnız həmin auth user-i üçün qaytarılır və `career.deleteMyData` silir. MVP-ni açıq istifadəçiyə buraxmazdan əvvəl retention müddəti/avtomatik silmə, backup nüsxələrinin saxlanması və fayl mətninin serverə ötürülməsi barədə razılıq UI-si müəyyən edilməlidir. Hazırda file upload/parser endpoint-i yoxdur; yalnız mətndən CV qəbulu işləyir.

## Əsas məhdudiyyətlər

- API hələ frontend səhifələrinə qoşulmayıb; mövcud UI öz brauzer demo state-i ilə işləyir.
- Auth: Manus OAuth / starter-in təsdiqlənmiş user session-ı; anonim sessiya yoxdur.
- Skill extraction, roadmap wording və interview feedback `mock`; LLM inteqrasiyası əlavə edilməyib.
- Internship siyahısı demo kataloqudur, canlı vakansiya feed-i deyil.
- SQL migration yalnız yaradılıb və kod review/build/test-dən keçirilib. Ortak development/production database-ə **tətbiq edilməyib**.
