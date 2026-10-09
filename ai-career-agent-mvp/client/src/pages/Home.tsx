import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, FileText, Loader2, LockKeyhole, Sparkles, UploadCloud } from "lucide-react";
import { BrandMark, RoleSelect } from "@/components/career/CareerUI";
import { useCareer } from "@/context/CareerContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const demoCvText = `Mən kompüter elmləri tələbəsiyəm və frontend development istiqamətində inkişaf edirəm. React, JavaScript, HTML və CSS ilə responsive task tracker tətbiqi hazırlamışam. Layihədə component strukturu qurmuş, form validasiyası yazmış və Git ilə işləmə təcrübəsi qazanmışam. Universitet hackathonunda üç nəfərlik komandada landing page və istifadəçi flow-ları üzərində çalışmışam. TypeScript üzrə online kurs bitirmişəm və kiçik REST API inteqrasiyası ilə praktik etmişəm.`;

const progressMessages = [
  "CV məlumatları yoxlanılır...",
  "Bacarıqlar müəyyənləşdirilir...",
  "Hədəf rolla uyğunluq hesablanır...",
  "Öyrənmə prioritetləri hazırlanır...",
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { role, setAnalysisId } = useCareer();
  const [mode, setMode] = useState<"file" | "text">("text");
  const [cvText, setCvText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const createAnalysis = trpc.career.createAnalysis.useMutation({
    onSuccess: ({ analysis }) => {
      setAnalysisId(analysis.id);
      setLocation("/dashboard");
    },
    onError: (err) => {
      setError(err.message || "Analiz zamanı xəta baş verdi. Yenidən cəhd edin.");
      setAnalyzing(false);
    },
  });

  // Progress animation while analyzing
  useEffect(() => {
    if (!analyzing) return;
    const interval = window.setInterval(
      () => setMessageIndex((current) => Math.min(current + 1, progressMessages.length - 1)),
      900,
    );
    return () => window.clearInterval(interval);
  }, [analyzing]);

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

  const submit = async () => {
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setMessageIndex(0);
    setAnalyzing(true);

    try {
      let text = cvText.trim();

      // If file mode, upload and extract text first
      if (mode === "file" && file) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "pdf") {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch("/api/upload-cv", { method: "POST", body: formData, credentials: "include" });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error ?? "Fayl oxunmadı");
          }
          const data = await response.json() as { text: string };
          text = data.text ?? "";
        } else {
          // DOCX: read as text fallback
          text = await file.text();
        }

        if (text.trim().length < 200) {
          setError("Fayldan kifayət qədər mətn çıxarılmadı. Mətn rejimini sınayın.");
          setAnalyzing(false);
          return;
        }
      }

      const requestKey = crypto.randomUUID();
      await createAnalysis.mutateAsync({ text, targetRole: role, requestKey });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analiz zamanı xəta baş verdi.";
      setError(message);
      toast.error(message);
      setAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground bg-grid-pattern">
      <div className="absolute inset-0 bg-background/90" />
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] mix-blend-screen" />
      
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <BrandMark />
        <div className="flex items-center gap-3">
          <a href="/api/auth/guest" className="group inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white hover:scale-105 hover:shadow-[0_0_20px_-3px_rgba(47,93,255,0.4)]">
            Sınaq üçün daxil ol
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-6 md:pt-14">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="mb-6 inline-flex animate-pulse-glow items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-accent"><Sparkles className="size-3.5" /> Internship axtarışında aydın yol xəritəsi</div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.065em] md:text-6xl md:leading-[1.02]">
              Sənə uyğun təcrübəni tap. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Nəyin çatışmadığını bil.</span> Hazır ol.
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-secondary-foreground md:text-lg">CV-nizdən bacarıqları müəyyənləşdirin, uyğun internship-ləri görün, 7 günlük inkişaf planı qurun və müsahibəyə hazır olduğunuzu yoxlayın.</p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[["12", "demo elan"], ["7 gün", "fokus planı"], ["5 sual", "mock müsahibə"]].map(([value, label], i) => (
                <div key={label} className="group rounded-xl border border-border/50 glassmorphism px-3 py-3 transition-colors hover:border-primary/50 hover:bg-card/80 animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <strong className="block text-lg font-semibold tracking-[-0.04em] transition-transform group-hover:scale-105 group-hover:text-accent origin-left">{value}</strong>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <section className="relative">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary/[0.06] blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
              {analyzing ? (
                <div className="flex min-h-[520px] flex-col justify-center p-7 md:p-9" aria-live="polite">
                  <div className="mb-7 grid size-12 place-items-center rounded-xl bg-primary/15 text-accent"><Loader2 className="size-6 animate-spin motion-reduce:animate-none" /></div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Analiz hazırlanır</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{progressMessages[messageIndex]}</h2>
                  <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full w-2/5 animate-[progress_1.2s_ease-in-out_infinite] rounded-full bg-primary motion-reduce:animate-none" /></div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">CV mətninizdən bacarıqlar çıxarılır, internship uyğunluğu hesablanır.</p>
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
                  <button type="button" disabled={Boolean(validation) || createAnalysis.isPending} onClick={submit} aria-describedby={validation ? "submit-reason" : undefined} className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#5b83ff] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50">
                    {createAnalysis.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Analiz et <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  {validation && <p id="submit-reason" className="mt-2 text-center text-xs text-muted-foreground">{validation}</p>}
                  <button type="button" onClick={() => { setMode("text"); setCvText(demoCvText); setError(""); }} className="mt-4 w-full text-center text-xs text-accent hover:underline">Demo CV mətni ilə tanış olun</button>
                  <p className="mt-5 flex gap-2 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" />CV mətniniz yalnız analiz üçün göndərilir. Nəticələr hesabınıza bağlıdır.</p>
                </div>
              )}
            </div>
          </section>
        </section>
        <section className="mt-20 border-t border-border/50 pt-12">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Bu axında nə alacaqsınız?</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[["01", "Uyğunluq", "Bacarıqlarınıza uyğun demo internship-ləri görün."], ["02", "Prioritet", "Hədəf rol üçün ən vacib skill gap-ləri anlayın."], ["03", "Hazırlıq", "Plan və mock müsahibə ilə növbəti addımı müəyyən edin."]].map(([number, title, text], i) => (
              <div key={number} className="group relative overflow-hidden rounded-2xl border border-border/50 glassmorphism p-6 transition-all hover:border-primary/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 animate-slide-up" style={{ animationDelay: `${0.4 + i * 0.15}s` }}>
                <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/10 blur-2xl transition-transform group-hover:scale-150" />
                <span className="relative z-10 block text-2xl font-bold text-primary/40 transition-colors group-hover:text-primary">{number}</span>
                <div className="relative z-10 mt-4">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">Career Agent · məlumatlı növbəti addım üçün platforma</footer>
    </div>
  );
}
