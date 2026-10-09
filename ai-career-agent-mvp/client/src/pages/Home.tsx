import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Check, FileText, Loader2, LockKeyhole, Sparkles, UploadCloud } from "lucide-react";
import { BrandMark, RoleSelect } from "@/components/career/CareerUI";
import { useCareer } from "@/context/CareerContext";

const demoCvText = `Mən kompüter elmləri tələbəsiyəm və frontend development istiqamətində inkişaf edirəm. React, JavaScript, HTML və CSS ilə responsive task tracker tətbiqi hazırlamışam. Layihədə component strukturu qurmuş, form validasiyası yazmış və Git ilə işləmə təcrübəsi qazanmışam. Universitet hackathonunda üç nəfərlik komandada landing page və istifadəçi flow-ları üzərində çalışmışam. TypeScript üzrə online kurs bitirmişəm və kiçik REST API inteqrasiyası ilə praktik etmişəm.`;

const progressMessages = [
  "CV məlumatları yoxlanılır...",
  "Bacarıqlar müəyyənləşdirilir...",
  "Hədəf rolla uyğunluq hesablanır...",
  "Öyrənmə prioritetləri hazırlanır...",
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { role, startDemoAnalysis } = useCareer();
  const [mode, setMode] = useState<"file" | "text">("text");
  const [cvText, setCvText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!analyzing) return;
    const interval = window.setInterval(() => setMessageIndex((current) => Math.min(current + 1, progressMessages.length - 1)), 900);
    const complete = window.setTimeout(() => {
      startDemoAnalysis();
      setLocation("/dashboard");
    }, 2700);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(complete);
    };
  }, [analyzing, setLocation, startDemoAnalysis]);

  const validation = useMemo(() => {
    if (!role) return "Hədəf rol seçin";
    if (mode === "text" && cvText.trim().length < 200) return "Analiz üçün ən azı 200 simvol lazımdır";
    if (mode === "file" && !file) return "CV faylı seçin";
    return "";
  }, [cvText, file, mode, role]);

  const handleFile = (candidate: File | undefined) => {
    setError("");
    if (!candidate) return;
    const extension = candidate.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(extension ?? "")) {
      setFile(null);
      setError("Yalnız PDF və ya DOCX dəstəklənir");
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("Fayl 5 MB-dan böyükdür");
      return;
    }
    setFile(candidate);
  };

  const submit = () => {
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setMessageIndex(0);
    setAnalyzing(true);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <BrandMark />
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex"><span className="size-1.5 rounded-full bg-success" /> Qeydiyyatsız başlayın</span>
          <a href="/api/auth/google" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition hover:bg-[#4672ff]">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Daxil ol
          </a>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-6 md:pt-14">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-accent"><Sparkles className="size-3.5" /> Internship axtarışında aydın yol xəritəsi</div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.065em] md:text-6xl md:leading-[1.02]">Sənə uyğun təcrübəni tap. <span className="text-accent">Nəyin çatışmadığını bil.</span> Hazır ol.</h1>
            <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-secondary-foreground md:text-lg">CV-nizdən bacarıqları müəyyənləşdirin, uyğun internship-ləri görün, 7 günlük inkişaf planı qurun və müsahibəyə hazır olduğunuzu yoxlayın.</p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[ ["12", "demo elan"], ["7 gün", "fokus planı"], ["5 sual", "mock müsahibə"] ].map(([value, label]) => <div key={label} className="rounded-xl border border-border bg-card px-3 py-3"><strong className="block text-lg font-semibold tracking-[-0.04em]">{value}</strong><span className="mt-0.5 block text-[11px] text-muted-foreground">{label}</span></div>)}
            </div>
          </div>

          <section className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/[0.06] blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
              {analyzing ? (
                <div className="flex min-h-[520px] flex-col justify-center p-7 md:p-9" aria-live="polite">
                  <div className="mb-7 grid size-12 place-items-center rounded-xl bg-primary/15 text-accent"><Loader2 className="size-6 animate-spin motion-reduce:animate-none" /></div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Demo analiz hazırlanır</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{progressMessages[messageIndex]}</h2>
                  <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full w-2/5 animate-[progress_1.2s_ease-in-out_infinite] rounded-full bg-primary motion-reduce:animate-none" /></div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">Nəticələr deterministik hesablanır; demo rejimində nümunə profil istifadə olunacaq.</p>
                  <button type="button" onClick={() => setAnalyzing(false)} className="mt-8 w-fit text-sm text-muted-foreground hover:text-foreground">Ləğv et</button>
                </div>
              ) : (
                <div className="p-5 sm:p-7">
                  <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">İlk addım</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">CV-nizi əlavə edin</h2></div><span className="grid size-9 place-items-center rounded-xl bg-secondary text-muted-foreground"><FileText className="size-4" /></span></div>
                  <div className="mb-5 grid grid-cols-2 rounded-xl border border-border bg-secondary p-1">
                    <button type="button" onClick={() => { setMode("file"); setError(""); }} className={`rounded-lg px-3 py-2 text-sm transition ${mode === "file" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Fayl yüklə</button>
                    <button type="button" onClick={() => { setMode("text"); setError(""); }} className={`rounded-lg px-3 py-2 text-sm transition ${mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Mətn yapışdır</button>
                  </div>
                  {mode === "file" ? (
                    <div>
                      <input ref={fileInput} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
                      <button type="button" onClick={() => fileInput.current?.click()} className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 p-5 text-center transition hover:border-accent/70 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="mb-3 grid size-10 place-items-center rounded-xl bg-card text-accent"><UploadCloud className="size-5" /></span>
                        {file ? <><strong className="max-w-[24ch] truncate text-sm">{file.name}</strong><span className="mt-1 text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · Dəyişmək üçün klikləyin</span></> : <><strong className="text-sm">PDF və ya DOCX faylını seçin</strong><span className="mt-1 text-xs text-muted-foreground">Maksimum 5 MB · Fayl saxlanmır</span></>}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <textarea value={cvText} onChange={(event) => { setCvText(event.target.value.slice(0, 20000)); setError(""); }} placeholder="CV mətninizi buraya yapışdırın..." className="min-h-48 w-full resize-none rounded-xl border border-input bg-secondary/40 p-4 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-ring/30" aria-invalid={Boolean(error && cvText.length < 200)} aria-describedby="cv-description" />
                      <div className="mt-2 flex items-center justify-between gap-3"><p id="cv-description" className="text-xs text-muted-foreground">Minimum 200, maksimum 20 000 simvol</p><span className={`text-xs ${cvText.length >= 200 ? "text-success" : "text-muted-foreground"}`}>{cvText.length.toLocaleString("az-AZ")} / 20 000</span></div>
                    </div>
                  )}
                  <div className="mt-5"><label className="mb-2 block text-xs font-medium text-secondary-foreground">Hədəf rol</label><RoleSelect className="w-full" /></div>
                  {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
                  <button type="button" disabled={Boolean(validation)} onClick={submit} aria-describedby={validation ? "submit-reason" : undefined} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4672ff] disabled:cursor-not-allowed disabled:opacity-45">Analiz et <ArrowRight className="size-4" /></button>
                  {validation && <p id="submit-reason" className="mt-2 text-center text-xs text-muted-foreground">{validation}</p>}
                  <button type="button" onClick={() => { setMode("text"); setCvText(demoCvText); setError(""); }} className="mt-4 w-full text-center text-xs text-accent hover:underline">Demo CV mətni ilə tanış olun</button>
                  <p className="mt-5 flex gap-2 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />CV mətniniz demo axınında yalnız brauzer sessiyasında istifadə olunur. İstədiyiniz vaxt silə bilərsiniz.</p>
                </div>
              )}
            </div>
          </section>
        </section>
        <section className="mt-20 border-t border-border pt-8"><p className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Bu axında nə alacaqsınız?</p><div className="grid gap-3 md:grid-cols-3">{[["01", "Uyğunluq", "Bacarıqlarınıza uyğun demo internship-ləri görün."], ["02", "Prioritet", "Hədəf rol üçün ən vacib skill gap-ləri anlayın."], ["03", "Hazırlıq", "Plan və mock müsahibə ilə növbəti addımı müəyyən edin."]].map(([number, title, text]) => <div key={number} className="flex gap-4 rounded-xl border border-border bg-card p-5"><span className="text-sm font-semibold text-accent">{number}</span><div><h3 className="font-medium">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}</div></section>
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">Career Agent · məlumatlı növbəti addım üçün demo platforma</footer>
    </div>
  );
}
