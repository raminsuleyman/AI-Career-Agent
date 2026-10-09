# AI Career Agent — anonim autentifikasiya inteqrasiyası

## Tövsiyə olunan quruluş

Bu layihə üçün ən az dəyişiklik tələb edən yol **Supabase Auth-u yalnız istifadəçinin identifikasiyası üçün işlətmək**, hazırkı **Express + tRPC + Drizzle + MySQL** bazasını isə saxlamaqdır. `signInAnonymously()` brauzerdə anonim istifadəçi və access token yaradır. İstifadəçi sonradan e-poçt və ya başqa giriş üsulu bağlamasa, brauzer məlumatları silindikdə, hesabdan çıxdıqda və ya başqa cihazdan daxil olduqda həmin anonim hesabı bərpa edə bilməyəcək. Sonradan hesabı Supabase identity linking ilə daimi giriş üsuluna çevirmək mümkündür [1].

Supabase-də anonim istifadəçi də `authenticated` rolu ilə tanınır və JWT-də `is_anonymous` claim-i olur [1]. Ancaq bu layihənin tətbiq məlumatları Supabase Postgres/RLS-də deyil, MySQL-dədir. Buna görə Supabase-in Row Level Security qaydaları Drizzle cədvəllərini qorumur. Express server Supabase identity-sini təsdiqləməli, MySQL-dəki `users` sətri ilə əlaqələndirməli və hər sorğuda həmin istifadəçinin `userId`-sini yoxlamalıdır.

## İnteqrasiya addımları

### 1. Supabase client

Supabase layihəsi yaradıb Auth settings bölməsində anonymous sign-in-i aktivləşdirin. `@supabase/supabase-js` paketini əlavə edib brauzer client-ini `client/src/lib/supabase.ts` faylında yaradın. `SUPABASE_URL` və public publishable/anon key istifadə edin. **Service-role key-i brauzer koduna heç vaxt daxil etməyin.**

Tətbiq açılanda mövcud sessiyanı yoxlayın; sessiya yoxdursa, `supabase.auth.signInAnonymously()` funksiyasını bir dəfə çağırın. `onAuthStateChange` listener-ini qeydiyyatdan çıxma zamanı təmizləyin. React Strict Mode və bir neçə tabın eyni vaxtda açılması əlavə anonim hesablar yaratmasın deyə ilkin autentifikasiyanı bir dəfə icra olunan promise ilə qoruyun.

### 2. tRPC-yə access token ötürmək

`client/src/main.tsx` daxilindəki `httpBatchLink.headers()` hazırda Manus cookie-sini `Authorization` header-i ilə ötürür. Supabase seçildikdə həmin hissəni access token göndərməklə əvəz edin:

```ts
headers: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}
```

Bu nümunədə brauzer sessiyası yalnız token-i ötürmək üçün oxunur. Server istifadəçinin kimliyinə qərar verərkən brauzerdən gələn user obyektinə və ya yoxlanılmamış JWT-yə etibar etməməlidir.

### 3. Express context-də token-i yoxlamaq

Hazırda `server/_core/context.ts` yalnız `sdk.authenticateRequest()` vasitəsilə Manus sessiyasını oxuyur. Supabase rejimində context-i aşağıdakı məntiqlə genişləndirin:

1. `Authorization: Bearer ...` header-indən access token-i götürün.
2. Server tərəfində Supabase client yaradıb `auth.getUser(token)` çağırışı ilə token-i təsdiqləyin. Bu funksiya Supabase Auth serverinə sorğu göndərir və təsdiqlənmiş istifadəçi obyektini qaytarır [2].
3. Supabase `user.id` dəyərini `supabase:<uuid>` formatında hazırkı MySQL `users.openId` sahəsinə yazın. Bu sütunun 64 simvol həddi UUID üçün kifayətdir. `loginMethod` üçün `supabase-anonymous` dəyərindən istifadə etmək olar.
4. Local MySQL istifadəçisinin `users.id` dəyərini `ctx.user`-ə verin. Beləliklə, mövcud `protectedProcedure` və xidmət qatındakı sahiblik yoxlamaları işləməyə davam edəcək.

Manus OAuth-u da saxlamaq lazımdırsa, `AUTH_PROVIDER=manus|supabase` kimi açıq konfiqurasiya seçimi əlavə edin. Provider-in token yoxlaması uğursuz olduqda istifadəçini avtomatik anonim saymayın. Bir neçə provider dəstəklənərsə, `provider + subject` cütü ilə identity-ləri bir-birindən ayırın.

### 4. MySQL-də sahiblik əlaqəsi

`analyses`, `roadmaps` və `interviews` cədvəlləri MySQL-in `users.id` sahəsinə istinad edir. Supabase `user.id` dəyərini birbaşa `user_id` kimi yazmayın: bu, başqa sistemin istifadəçi identifikatorudur. Əvvəlcə təsdiqlənmiş Supabase identity-sini MySQL `users` sətri ilə əlaqələndirin, sonra sorğularda MySQL `users.id` istifadə edin. Qeyd ID-sini bilmək başqa istifadəçinin məlumatını oxumağa imkan verməməlidir; bütün sorğular `userId`-yə görə məhdudlaşdırılmalıdır.

Daha sonra e-poçt və ya OAuth girişi əlavə ediləndə anonim identity-ni Supabase vasitəsilə bağlamaq olar. İstifadəçinin artıq başqa hesabı varsa, anonim hesabın məlumatlarının köçürülməsi və ya birləşdirilməsi üçün ayrıca qayda lazımdır [1].

## Alternativlər

**Firebase Anonymous Auth** da istifadə oluna bilər: Firebase brauzer SDK-sı anonim istifadəçi yaradır, Express isə Firebase Admin SDK-nın `verifyIdToken()` funksiyası ilə token-i yoxlayır. Təsdiqlənmiş Firebase UID-si də MySQL-dəki local user sətri ilə əlaqələndirilir. Layihədə Supabase artıq seçilibsə, ikinci provider əlavə etməmək işi sadələşdirir.

**Öz anonim cookie sisteminizi** qurmaq üçün serverin yaratdığı token, token hash-in saxlanması, müddətin bitməsi və yenilənməsi, CSRF müdafiəsi, rate limit və hesabı daimi girişə çevirmə axını lazımdır. İlk MVP üçün bu, Supabase və ya Firebase-dən daha çox texniki xidmət tələb edir.

## Təhlükəsizlik və icra ardıcıllığı

Brauzer məlumatları silindikdə anonim hesab və saxlanmış CV/roadmap bərpa olunmaya bilər. Bunu interfeysdə açıq bildirin. Supabase anonim giriş sorğularının sui-istifadəsindən qorunmaq üçün CAPTCHA/Cloudflare Turnstile və tətbiq səviyyəsində rate limit tövsiyə edir [1]. Köhnə anonim istifadəçi məlumatları üçün saxlanma və silinmə müddəti də müəyyən edin. `career.deleteMyData` MySQL məlumatlarını silir; Supabase Auth istifadəçisinin də silinib-silinməyəcəyini ayrıca qərarlaşdırın.

İcra ardıcıllığı belə ola bilər: Supabase layihəsi və ayarları → brauzerdə anonim sessiya → tRPC token header-i → Express token yoxlaması → MySQL local user mapping-i → sahiblik yoxlamaları → sessiyanın yenilənməsi, bitməsi və çıxış sınaqları → CAPTCHA və rate limit → lazım olsa hesabı daimi girişə bağlama. Frontend-in API-yə qoşulması, PDF/DOCX parser-i və real LLM extraction-ı ayrıca işlərdir.

## Mənbələr

[1] [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
[2] [Supabase JavaScript `getUser()`](https://supabase.com/docs/reference/javascript/auth-getuser)
[3] [Supabase server-side client və token yoxlanması](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
