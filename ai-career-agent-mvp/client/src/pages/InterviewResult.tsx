import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, CircleAlert, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { AppShell, DemoBanner, PageGuard, ScoreGauge, SectionHeading } from "@/components/career/CareerUI";
import { useCareer } from "@/context/CareerContext";

export default function InterviewResult() {
  const [, setLocation] = useLocation();
  const { interviewResult, interview, roadmapId, resetJourney } = useCareer();

  const questions = interview?.questions ?? [];
  const answers = interview?.answers ?? [];

  if (!interviewResult) {
    return (
      <PageGuard><AppShell>
        <div className="mx-auto max-w-md py-16 text-center">
          <CircleAlert className="mx-auto mb-3 size-7 text-warning" />
          <h1 className="text-xl font-semibold">Hələ müsahibə nəticəsi yoxdur</h1>
          <p className="mt-2 text-sm text-muted-foreground">Müsahibəni bitirdikdən sonra nəticə burada görünəcək.</p>
          <button type="button" onClick={() => setLocation("/interview")} className="mt-5 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white">Müsahibəyə başla</button>
        </div>
      </AppShell></PageGuard>
    );
  }

  const answered = answers.filter((a) => !a.skipped && a.answer?.trim()).length;

  const columns = [
    { title: "Nə yaxşı idi", icon: CheckCircle2, tone: "text-success bg-success/10", items: interviewResult.feedback?.strengths ?? [] },
    { title: "Nə inkişaf etdirilməlidir", icon: CircleAlert, tone: "text-warning bg-warning/10", items: interviewResult.feedback?.improvements ?? [] },
    { title: "Növbəti addım", icon: Sparkles, tone: "text-info bg-info/10", items: interviewResult.feedback?.nextSteps ?? [] },
  ];

  return (
    <PageGuard><AppShell><DemoBanner />
      <SectionHeading eyebrow="Müsahibə nəticəsi" title="Career Readiness nəticəniz" description="Bu nəticə müsahibə cavablarınızın həcmi və hədəf rol readiness-i birləşdirilərək hesablanır." />
      <section className="rounded-2xl border border-border bg-card px-5 py-8 sm:px-8">
        <ScoreGauge score={interviewResult.readinessScore} />
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 divide-x divide-border rounded-xl border border-border bg-secondary/50">
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Müsahibə skoru</p><p className="mt-1 text-2xl font-semibold tabular-nums text-accent">{interviewResult.interviewScore}%</p></div>
          <div className="p-4 text-center"><p className="text-xs text-muted-foreground">Cavablanan sual</p><p className="mt-1 text-2xl font-semibold tabular-nums">{answered} / {questions.length}</p></div>
        </div>
      </section>
      <section className="mt-7 grid gap-4 md:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div key={column.title} className="rounded-2xl border border-border bg-card p-5">
              <span className={`mb-4 grid size-9 place-items-center rounded-xl ${column.tone}`}><Icon className="size-4" /></span>
              <h2 className="font-semibold">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-border" />{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
      {questions.length > 0 && (
        <section className="mt-7 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Sual xülasəsi</h2>
          <div className="mt-4 divide-y divide-border">
            {questions.map((question, index) => {
              const answer = answers.find((a) => a.questionId === question.id);
              const hasAnswer = !answer?.skipped && answer?.answer?.trim();
              return (
                <div key={question.id} className="flex items-start justify-between gap-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{index + 1}. {question.type}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{hasAnswer ? "Cavab təqdim edilib" : "Sual keçilib"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${hasAnswer ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}>{hasAnswer ? "Qeydə alındı" : "Keçildi"}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={() => setLocation(roadmapId ? "/roadmap" : "/dashboard")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary"><ArrowLeft className="size-4" />Roadmap-a qayıt</button>
        <button type="button" onClick={() => { resetJourney(); setLocation("/"); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white">Yeni CV ilə başla <RotateCcw className="size-4" /></button>
      </div>
    </AppShell></PageGuard>
  );
}
