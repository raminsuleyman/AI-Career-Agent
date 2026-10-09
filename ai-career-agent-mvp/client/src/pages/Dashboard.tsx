import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, BarChart3, BriefcaseBusiness, Check, ChevronRight, Code2, Filter, Loader2, MapPin, Sparkles, Target, X } from "lucide-react";
import { AppShell, DemoBadge, DemoBanner, LevelBars, MiniStat, PageGuard, RoleIdentity, SearchResource, SectionHeading, SkillBadge } from "@/components/career/CareerUI";
import { useCareer } from "@/context/CareerContext";
import { getGaps, roleReadiness, skills as skillCatalog, getRole, type RoleSlug, type SkillEntry } from "@/data/career";

// ─── Score tone helper ────────────────────────────────────────────────────
function scoreTone(score: number) {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-muted-foreground";
}

type InternshipItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "Remote" | "Hibrid" | "Ofis";
  role: RoleSlug;
  score: number;
  matchedSkills: { slug: string; name: string; level?: number }[];
  missingSkills: { slug: string; name: string }[];
  description: string;
  required: string[];
  source: string;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { role, analysis, analysisLoading, internships, internshipsLoading, roadmap, roadmapLoading, createRoadmap, createRoadmapLoading, createInterview, createInterviewLoading, roadmapId } = useCareer();
  const [tab, setTab] = useState<"internships" | "gaps">("internships");
  const [onlyRole, setOnlyRole] = useState(false);
  const [mode, setMode] = useState("all");
  const [selected, setSelected] = useState<InternshipItem | null>(null);

  type AnalysisShape = { skills: Array<{ slug: string; level: number }>; targetRole: string; candidateLevel: string; summary: string } | null | undefined;
  const typedAnalysis = analysis as AnalysisShape;
  const rawSkills = typedAnalysis?.skills ?? [];
  const targetRole = ((typedAnalysis?.targetRole) ?? role) as RoleSlug;
  // Adapt server skill format to client SkillEntry format
  const skillEntries: SkillEntry[] = rawSkills.map((s) => ({
    slug: s.slug as SkillEntry["slug"],
    name: skillCatalog[s.slug as keyof typeof skillCatalog]?.name ?? s.slug,
    level: s.level as SkillEntry["level"],
    origin: "cv" as const,
  }));

  const gaps = useMemo(() => getGaps(skillEntries, targetRole), [skillEntries, targetRole]);
  const readiness = useMemo(() => roleReadiness(skillEntries, targetRole), [skillEntries, targetRole]);

  const roadmapProgress = useMemo(() => {
    if (!roadmap) return 0;
    const tasks = roadmap.days.flatMap((day) => day.tasks);
    return tasks.length ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0;
  }, [roadmap]);

  const filtered = useMemo(
    () => (internships ?? []).filter((m) => (!onlyRole || m.role === role) && (mode === "all" || m.workMode === mode)) as InternshipItem[],
    [internships, mode, onlyRole, role],
  );
  const topMatch = internships?.[0]?.score ?? 0;
  const hasRoadmap = Boolean(roadmapId);

  const handleRoadmap = async () => {
    const id = await createRoadmap();
    if (id) setLocation("/roadmap");
  };

  const handleInterview = async () => {
    const id = await createInterview();
    if (id) setLocation("/interview");
  };

  const next = hasRoadmap
    ? roadmapProgress < 100
      ? { label: `Roadmap-ı davam et (${roadmapProgress}%)`, description: "Yarımçıq qalan task-larınızı tamamlayın.", action: () => setLocation("/roadmap") }
      : { label: "Mock müsahibəyə başla", description: "Nə öyrəndiyinizi 5 sualda yoxlayın.", action: handleInterview }
    : { label: "7 günlük roadmap yarat", description: `${gaps.length} prioritet skill gap üçün plan hazırlayın.`, action: handleRoadmap };

  if (analysisLoading) {
    return (
      <PageGuard><AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center"><Loader2 className="mx-auto mb-3 size-8 animate-spin text-accent" /><p className="text-sm text-muted-foreground">Analiz yüklənir...</p></div>
        </div>
      </AppShell></PageGuard>
    );
  }

  const profileName = typedAnalysis ? `${typedAnalysis.candidateLevel} profil` : "Demo profil";
  const profileSummary = typedAnalysis?.summary ?? "CV məlumatları burada görünəcək.";

  return (
    <PageGuard><AppShell><DemoBanner />
      <SectionHeading eyebrow="İcmal" title={`Salam, ${profileName}`} description={`${getRole(targetRole)?.name ?? targetRole} istiqamətində vəziyyətiniz və növbəti prioritetləriniz.`} action={<RoleIdentity />} />
      <section className="mb-7 rounded-2xl border border-primary/25 bg-[linear-gradient(115deg,rgba(47,93,255,0.16),rgba(17,17,19,0.2)_42%)] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-accent"><Sparkles className="size-3.5" /> NÖVBƏTİ ƏMƏLİYYAT</div><h2 className="text-xl font-semibold tracking-[-0.04em]">{next.label}</h2><p className="mt-1 text-sm text-secondary-foreground">{next.description}</p></div>
          <button type="button" onClick={next.action} disabled={createRoadmapLoading || createInterviewLoading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4672ff] disabled:opacity-50">
            {(createRoadmapLoading || createInterviewLoading) ? <Loader2 className="size-4 animate-spin" /> : null}
            Davam et <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
      <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat icon={Target} label="Role Readiness" value={`${readiness}%`} hint="Hədəf rol üçün təxmini" tone={readiness >= 70 ? "green" : "blue"} />
        <MiniStat icon={BriefcaseBusiness} label="Ən yaxşı uyğunluq" value={`${topMatch}%`} hint="12 elan içindən" tone={topMatch >= 75 ? "green" : "amber"} />
        <MiniStat icon={Code2} label="Aşkarlanan bacarıq" value={rawSkills.length} hint="CV-dən çıxarılan" />
        <MiniStat icon={BarChart3} label="Roadmap progress" value={`${roadmapProgress}%`} hint={hasRoadmap ? "Plan üzrə irəliləyiş" : "Plan hələ yaradılmayıb"} tone={roadmapProgress === 100 ? "green" : "blue"} />
      </section>
      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Profil</p><h2 className="mt-1 font-semibold">{typedAnalysis?.candidateLevel ?? "Tələbə"}</h2></div><DemoBadge /></div>
          <p className="text-sm leading-6 text-secondary-foreground">{profileSummary}</p>
          <div className="my-5 h-px bg-border" />
          <p className="mb-3 text-xs font-medium text-muted-foreground">Aşkarlanan bacarıqlar</p>
          <div className="flex flex-wrap gap-2">
            {rawSkills.length > 0
              ? rawSkills.map((s) => <span key={s.slug} className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-medium">{skillCatalog[s.slug as keyof typeof skillCatalog]?.name ?? s.slug} <span className="text-muted-foreground">Lv{s.level}</span></span>)
              : <span className="text-xs text-muted-foreground">CV analizi gözlənilir...</span>}
          </div>
        </aside>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-border bg-secondary p-1">
              <button type="button" onClick={() => setTab("internships")} className={`rounded-lg px-3 py-2 text-sm ${tab === "internships" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Internship-lər <span className="ml-1 text-xs">{filtered.length}</span></button>
              <button type="button" onClick={() => setTab("gaps")} className={`rounded-lg px-3 py-2 text-sm ${tab === "gaps" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Skill gap-lər <span className="ml-1 text-xs">{gaps.length}</span></button>
            </div>
            {tab === "internships" && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOnlyRole((v) => !v)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${onlyRole ? "border-primary/50 bg-primary/10 text-accent" : "border-border text-muted-foreground"}`}><Filter className="size-3.5" />Yalnız rol</button>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-lg border border-border bg-secondary px-2.5 py-2 text-xs text-secondary-foreground outline-none">
                  <option value="all">Bütün rejimlər</option>
                  <option value="Remote">Remote</option>
                  <option value="Hibrid">Hibrid</option>
                  <option value="Ofis">Ofis</option>
                </select>
              </div>
            )}
          </div>
          {internshipsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-accent" /></div>
          ) : tab === "internships" ? (
            <div className="space-y-3">
              {filtered.map((match) => <InternshipCard key={match.id} match={match} onOpen={() => setSelected(match)} />)}
              {filtered.length === 0 && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Bu filtrlə nəticə yoxdur. Filtri sıfırlayın.</div>}
            </div>
          ) : (
            <div className="space-y-3">
              {gaps.map((gap) => (
                <div key={gap.slug} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{gap.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${gap.priority === "high" ? "bg-warning/15 text-warning" : gap.priority === "medium" ? "bg-info/15 text-info" : "bg-secondary text-muted-foreground"}`}>{gap.priority === "high" ? "Yüksək prioritet" : gap.priority === "medium" ? "Orta prioritet" : "Aşağı prioritet"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <LevelBars current={gap.currentLevel} required={gap.requiredLevel} />
                      <span className="text-xs text-muted-foreground">{gap.currentLevel}/{gap.requiredLevel} · fərq {gap.gap}</span>
                    </div>
                  </div>
                  <button type="button" onClick={handleRoadmap} disabled={createRoadmapLoading} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground hover:bg-muted disabled:opacity-50">{hasRoadmap ? "Planda göstər" : "Öyrənmə planı yarat"}<ChevronRight className="size-3.5" /></button>
                </div>
              ))}
              {gaps.length === 0 && <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Hədəf rol üçün çatışmayan bacarıq yoxdur.</div>}
            </div>
          )}
        </div>
      </section>
      {selected && <InternshipDetail match={selected} onClose={() => setSelected(null)} />}
    </AppShell></PageGuard>
  );
}

function InternshipCard({ match, onOpen }: { match: InternshipItem; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-accent/50 focus-visible:ring-2 focus-visible:ring-ring sm:p-5">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2"><DemoBadge /><span className="rounded-full bg-secondary px-2 py-1 text-[11px] text-muted-foreground">{match.workMode}</span></div>
          <h3 className="truncate text-base font-semibold">{match.title}</h3>
          <p className="mt-1 text-sm text-secondary-foreground">{match.company} · {match.location}</p>
        </div>
        <div className="text-right"><p className="text-[11px] text-muted-foreground">Uyğunluq</p><p className={`mt-1 text-3xl font-semibold tracking-[-0.06em] tabular-nums ${scoreTone(match.score)}`}>{match.score}%</p></div>
      </div>
      <div className="mt-4 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
        <div><p className="mb-1.5 text-[11px] text-muted-foreground">Uyğun bacarıqlar</p><div className="flex flex-wrap gap-1.5">{match.matchedSkills.slice(0, 4).map((s) => <span key={s.slug} className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-[11px] text-success"><Check className="size-3" />{s.name}</span>)}{match.matchedSkills.length === 0 && <span className="text-xs text-muted-foreground">Hələ uyğun skill yoxdur</span>}</div></div>
        <div><p className="mb-1.5 text-[11px] text-muted-foreground">Çatışmayanlar</p><div className="flex flex-wrap gap-1.5">{match.missingSkills.slice(0, 4).map((s) => <span key={s.slug} className="rounded bg-secondary px-2 py-1 text-[11px] text-muted-foreground">{s.name}</span>)}{match.missingSkills.length === 0 && <span className="text-xs text-success">Əsas tələblər qarşılanır</span>}</div></div>
      </div>
    </button>
  );
}

function InternshipDetail({ match, onClose }: { match: InternshipItem; onClose: () => void }) {
  const { role } = useCareer();
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Internship detalları">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/60" aria-label="Detail panelini bağla" />
      <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-border bg-background p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><div className="mb-3 flex items-center gap-2"><DemoBadge /><span className="rounded-full bg-secondary px-2 py-1 text-[11px] text-muted-foreground">{match.workMode}</span></div><h2 className="text-2xl font-semibold tracking-[-0.05em]">{match.title}</h2><p className="mt-2 text-sm text-secondary-foreground">{match.company} · {match.location}</p></div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg bg-secondary text-muted-foreground"><X className="size-4" /></button>
        </div>
        <div className="my-7 rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Təxmini uyğunluq</p><p className={`mt-1 text-5xl font-semibold tracking-[-0.07em] ${scoreTone(match.score)}`}>{match.score}%</p><p className="mt-3 text-xs leading-5 text-muted-foreground">Score bacarıqların səviyyəsi, required/preferred tələblər və hədəf rol bonusu ilə deterministik hesablanır.</p></div>
        <div className="space-y-6">
          <div><h3 className="mb-2 font-medium">Rol haqqında</h3><p className="text-sm leading-6 text-secondary-foreground">{match.description}</p></div>
          <div><h3 className="mb-3 font-medium">Tələb olunan bacarıqlar</h3><div className="space-y-2">{(match.required ?? []).map((slug) => <div key={slug} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3"><span className="text-sm">{skillCatalog[slug as keyof typeof skillCatalog]?.name ?? slug}</span><span className="text-xs text-muted-foreground">{match.matchedSkills.some((s) => s.slug === slug) ? "Profilinizdə var" : "İnkişaf etdirin"}</span></div>)}</div></div>
          <div><h3 className="mb-3 font-medium">Uyğunluq qeydi</h3><p className="text-sm leading-6 text-muted-foreground">{match.role === role ? "Bu elan seçdiyiniz hədəf rolla eynidir və score-a 10% rol bonusu daxildir." : "Bu elan başqa rol ailəsinə aiddir; score yalnız bacarıq uyğunluğuna görə formalaşır."}</p></div>
          <SearchResource query={`${match.title} beginner roadmap`} />
        </div>
      </aside>
    </div>
  );
}
