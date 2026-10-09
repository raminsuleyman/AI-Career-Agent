import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle2, CircleDashed, MessageSquareText, Sparkles } from "lucide-react";
import { AppShell, DemoBanner, PageGuard, SectionHeading } from "@/components/career/CareerUI";
import { useCareer } from "@/context/CareerContext";

export default function Interview() {
  const [, setLocation] = useLocation();
  const { interviewQuestions, interviewAnswers, startInterview, saveAnswer } = useCareer();
  const [position, setPosition] = useState(0);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const current = interviewQuestions?.[position];
    setAnswer(current ? interviewAnswers[current.id] ?? "" : "");
  }, [interviewAnswers, interviewQuestions, position]);

  if (!interviewQuestions) {
    return <PageGuard><AppShell><DemoBanner /><div className="mx-auto max-w-2xl py-12 text-center"><div className="rounded-2xl border border-border bg-card p-8 sm:p-10"><MessageSquareText className="mx-auto mb-4 size-8 text-accent" /><p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Mock müsahibə</p><h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">5 sualda hazır olduğunuzu yoxlayın</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Suallar demo ssenaridir. Cavablarınız nəticəni formalaşdırır, amma real AI ilə qiymətləndirilmir.</p><button type="button" onClick={startInterview} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white">Müsahibəyə başla <ArrowRight className="size-4" /></button></div></div></AppShell></PageGuard>;
  }

  const current = interviewQuestions[position];
  const isLast = position === interviewQuestions.length - 1;
  const finish = (skipped = false) => {
    saveAnswer(current.id, skipped ? "" : answer.trim());
    if (isLast) setLocation("/interview/result");
    else setPosition((currentPosition) => currentPosition + 1);
  };

  return <PageGuard><AppShell><DemoBanner />
    <div className="mx-auto max-w-2xl"><SectionHeading eyebrow="Mock müsahibə" title="Bir sual, bir cavab" description="Cavablarınızı konkret nümunə, qərar və nəticə ilə qurmağa çalışın." />
      <div className="mb-6 rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between text-sm"><span className="font-medium">Sual {position + 1} / {interviewQuestions.length}</span><span className="text-muted-foreground">{Math.round(((position + 1) / interviewQuestions.length) * 100)}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((position + 1) / interviewQuestions.length) * 100}%` }} /></div></div>
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="mb-6 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-accent"><CircleDashed className="size-3.5" />{current.type}</span><span className="inline-flex items-center gap-1.5 text-xs text-info"><Sparkles className="size-3.5" />Demo sual</span></div><h2 className="text-xl font-semibold leading-8 tracking-[-0.04em] sm:text-2xl">{current.question}</h2><p className="mt-4 rounded-xl border border-border bg-secondary/60 p-3 text-sm leading-6 text-muted-foreground">İpucu: {current.hint}</p><div className="mt-7"><label htmlFor="answer" className="mb-2 block text-sm font-medium">Sizin cavabınız</label><textarea id="answer" value={answer} onChange={(event) => setAnswer(event.target.value.slice(0, 2000))} className="min-h-44 w-full resize-none rounded-xl border border-input bg-secondary/40 p-4 text-sm leading-6 outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30" placeholder="Cavabınızı strukturlaşdırın: vəziyyət, etdiyiniz addım, nəticə..." /><div className="mt-2 text-right text-xs text-muted-foreground">{answer.length} / 2 000</div></div><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => finish(true)} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">Bu sualı keç</button><button type="button" disabled={!answer.trim()} onClick={() => finish(false)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45">{isLast ? "Müsahibəni bitir" : "Növbəti"} {isLast ? <CheckCircle2 className="size-4" /> : <ArrowRight className="size-4" />}</button></div></section>
    </div>
  </AppShell></PageGuard>;
}
