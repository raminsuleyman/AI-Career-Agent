import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, CircleDashed, Loader2, MessageSquareText, Sparkles } from "lucide-react";
import { AppShell, DemoBanner, PageGuard, SectionHeading } from "@/components/career/CareerUI";
import { useCareer } from "@/context/CareerContext";

export default function Interview() {
  const [, setLocation] = useLocation();
  const { interview, interviewLoading, interviewId, createInterview, createInterviewLoading, saveAnswer, completeInterview, analysisId } = useCareer();
  const [position, setPosition] = useState(0);
  const [answer, setAnswer] = useState("");
  const [completing, setCompleting] = useState(false);

  const questions = interview?.questions ?? [];
  const answers = interview?.answers ?? [];

  // Sync answer field when navigating between questions
  useEffect(() => {
    const currentQuestion = questions[position];
    if (!currentQuestion) return;
    const savedAnswer = answers.find((a) => a.questionId === currentQuestion.id);
    setAnswer(savedAnswer?.answer ?? "");
  }, [position, questions, answers]);

  const handleStart = async () => {
    const id = await createInterview();
    if (!id) return;
  };

  if (interviewLoading || createInterviewLoading) {
    return (
      <PageGuard><AppShell><DemoBanner />
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center"><Loader2 className="mx-auto mb-3 size-8 animate-spin text-accent" /><p className="text-sm text-muted-foreground">Müsahibə yüklənir...</p></div>
        </div>
      </AppShell></PageGuard>
    );
  }

  if (!interviewId || questions.length === 0) {
    return (
      <PageGuard><AppShell><DemoBanner />
        <div className="mx-auto max-w-2xl py-12 text-center">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
            <MessageSquareText className="mx-auto mb-4 size-8 text-accent" />
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Mock müsahibə</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">5 sualda hazır olduğunuzu yoxlayın</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Suallar CV analizinizdən yaranır. Cavablarınız nəticəni formalaşdırır.</p>
            <button type="button" onClick={handleStart} disabled={createInterviewLoading || !analysisId} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-50">
              {createInterviewLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Müsahibəyə başla <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </AppShell></PageGuard>
    );
  }

  const current = questions[position];
  const isLast = position === questions.length - 1;

  const finish = async (skipped = false) => {
    if (!interviewId || !current) return;
    await saveAnswer({ interviewId, questionId: current.id, answer: skipped ? "" : answer.trim(), skipped });
    if (isLast) {
      setCompleting(true);
      try {
        await completeInterview(interviewId);
        setLocation("/interview/result");
      } finally {
        setCompleting(false);
      }
    } else {
      setPosition((p) => p + 1);
    }
  };

  const typeLabel: Record<string, string> = {
    technical: "Texniki",
    experience: "Təcrübə",
    behavioral: "Davranış",
    scenario: "Ssenari",
  };

  return (
    <PageGuard><AppShell><DemoBanner />
      <div className="mx-auto max-w-2xl">
        <SectionHeading eyebrow="Mock müsahibə" title="Bir sual, bir cavab" description="Cavablarınızı konkret nümunə, qərar və nəticə ilə qurmağa çalışın." />
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm"><span className="font-medium">Sual {position + 1} / {questions.length}</span><span className="text-muted-foreground">{Math.round(((position + 1) / questions.length) * 100)}%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((position + 1) / questions.length) * 100}%` }} /></div>
        </div>
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-accent"><CircleDashed className="size-3.5" />{typeLabel[current.type] ?? current.type}</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-info"><Sparkles className="size-3.5" />CV-yə əsaslı sual</span>
          </div>
          <h2 className="text-xl font-semibold leading-8 tracking-[-0.04em] sm:text-2xl">{current.question}</h2>
          <p className="mt-4 rounded-xl border border-border bg-secondary/60 p-3 text-sm leading-6 text-muted-foreground">İpucu: {current.rubric}</p>
          <div className="mt-7">
            <label htmlFor="answer" className="mb-2 block text-sm font-medium">Sizin cavabınız</label>
            <textarea id="answer" value={answer} onChange={(e) => setAnswer(e.target.value.slice(0, 2000))} className="min-h-44 w-full resize-none rounded-xl border border-input bg-secondary/40 p-4 text-sm leading-6 outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30" placeholder="Cavabınızı strukturlaşdırın: vəziyyət, etdiyiniz addım, nəticə..." />
            <div className="mt-2 text-right text-xs text-muted-foreground">{answer.length} / 2 000</div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => finish(true)} disabled={completing} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50">Bu sualı keç</button>
            <button type="button" disabled={!answer.trim() || completing} onClick={() => finish(false)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45">
              {completing ? <Loader2 className="size-4 animate-spin" /> : null}
              {isLast ? "Müsahibəni bitir" : "Növbəti"} {isLast ? <CheckCircle2 className="size-4" /> : <ArrowRight className="size-4" />}
            </button>
          </div>
        </section>
      </div>
    </AppShell></PageGuard>
  );
}
