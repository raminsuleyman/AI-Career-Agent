# AI Career Agent — həyata keçiriləcək nəticələr

- [x] **Landing və CV intake:** Azərbaycan dilli landing-də hero, fayl yüklə/mətn yapışdır tab-ları, 6 rol seçimi, məxfilik qeydi və "Analiz et" olmalıdır. PDF/DOCX fayl seçildikdə faylın adı və ölçüsü görünməli; `.png` və 5 MB-dan böyük fayl dərhal rədd edilməlidir. Mətn 200 simvoldan qısa olduqda və ya rol seçilmədikdə düymə deaktiv olmalı, səbəb əlçatan olmalıdır.

- [x] **Demo analiz və dashboard:** Etibarlı intake demo profilə keçməli və `/dashboard` açılmalıdır. Dashboard-da demo banner, dəyişdirilə bilən hədəf rol, növbəti əməliyyat CTA-sı, Role Readiness, ən yaxşı uyğunluq, aşkarlanan bacarıq və roadmap progress KPI-ları; profil skill chip-ləri, internship və skill gap tab-ları olmalıdır. Internship kartları score üzrə sıralanmalı, hər birində "Demo elan" nişanı, uyğun və çatışmayan bacarıqlar görünməlidir.

- [x] **Skill və internship idarələri:** İstifadəçi skill chip-lərini silə və kataloqdan əlavə edə bilməlidir; skill dəyişdikdə gap-lər, readiness və internship score-ları dərhal yenilənməlidir. Internship kartı klaviatura ilə açıla bilməli və detail panelində tələb olunan bacarıqlar, uyğunluq izahı, iş rejimi və demo mənbə görünməlidir. Rol dəyişdirilməsi də nəticələri yenidən hesablamalıdır.

- [x] **7 günlük roadmap:** Dashboard-dan roadmap yaradılmalı və `/roadmap` səhifəsində məhz 7 gün, hər gündə 2–3 task görünməlidir. Task checkbox-u progress-i dərhal yeniləməli; progress `tamamlanan / ümumi` ilə uyğun qalmalıdır. Roadmap tamamlananda mock müsahibəyə başlama CTA-sı olmalıdır.

- [x] **Mock müsahibə və nəticə:** `/interview` səhifəsində 5 sual bir-bir göstərilməlidir; boş cavabla "Növbəti" deaktiv, "Keç" aktiv olmalıdır. Son sualdan sonra `/interview/result` açılmalı, 0–100 Career Readiness gauge, nəticə bölgüsü və üç sütunda "Nə yaxşı idi / Nə inkişaf etdirilməlidir / Növbəti addım" görünməlidir.

- [x] **Demonstrasiya keyfiyyəti:** Sayt yalnız dark-mode, elektrik-mavi vurğulu dizaynla, mobil uyğun və klaviatura ilə əlçatan olmalıdır. Hər demo nəticə açıq etiketlənməli, demo banner "Real nəticəni yenilə" idarəsi göstərməli, "Məlumatlarımı sil" bütün istifadəçi səyahətini sıfırlamalıdır. Route-lar `/`, `/dashboard`, `/roadmap`, `/interview`, `/interview/result` kimi işləməlidir.
