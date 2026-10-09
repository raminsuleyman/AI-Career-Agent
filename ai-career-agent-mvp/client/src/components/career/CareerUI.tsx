import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Code2,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { getRole, roles, type RoleSlug, type SkillEntry } from "@/data/career";
import { useCareer } from "@/context/CareerContext";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-foreground no-underline">
      <span className="grid size-9 place-items-center rounded-xl border border-primary/60 bg-primary text-white shadow-[0_0_0_3px_rgba(47,93,255,0.1)]">
        <Sparkles className="size-4" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-[-0.03em]">Career</span>
          <span className="block text-sm font-semibold tracking-[-0.03em] text-accent">Agent</span>
        </span>
      )}
    </Link>
  );
}

export function RoleSelect({ className = "" }: { className?: string }) {
  const { role, setRole } = useCareer();
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Hədəf rol</span>
      <select
        value={role}
        onChange={(event) => setRole(event.target.value as RoleSlug)}
        className="appearance-none rounded-lg border border-border bg-secondary px-3 py-2 pr-8 text-sm font-medium text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
      >
        {roles.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "7 günlük plan", icon: BookOpen },
  { href: "/interview", label: "Mock müsahibə", icon: ClipboardCheck },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { resetJourney } = useCareer();
  const activePath = location === "/interview/result" ? "/interview" : location;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-border bg-secondary text-muted-foreground lg:hidden"
              aria-label="Menyunu aç"
            >
              <Menu className="size-4" />
            </button>
            <BrandMark />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="hidden text-xs text-muted-foreground xl:inline">Hədəf rol</span>
            <RoleSelect />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-1.5 text-xs font-medium text-info">
              <span className="size-1.5 rounded-full bg-info" /> Demo rejimi
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Demo profil, roadmap və müsahibə nəticələri silinəcək. Davam edək?")) {
                resetJourney();
                setLocation("/");
              }
            }}
            className="hidden items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:flex"
          >
            <Trash2 className="size-3.5" /> Məlumatlarımı sil
          </button>
        </div>
      </header>

      <aside className="fixed inset-y-16 left-0 z-20 hidden w-64 border-r border-border bg-background lg:block">
        <nav className="flex h-full flex-col p-4">
          <p className="px-3 pb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">İş sahəsi</p>
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-primary/15 text-accent" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  <Icon className="size-4" /> {item.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-auto rounded-xl border border-border bg-card p-3.5">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-info"><Sparkles className="size-3.5" /> Demo məlumat</div>
            <p className="text-xs leading-5 text-muted-foreground">Hesablamalar işləkdir, CV analizi isə nümunə profillə göstərilir.</p>
          </div>
        </nav>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobil menyu">
          <button type="button" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/60" aria-label="Menyunu bağla" />
          <aside className="relative flex h-full w-[280px] flex-col border-r border-border bg-background p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between"><BrandMark /><button type="button" onClick={() => setMenuOpen(false)} className="grid size-9 place-items-center rounded-lg bg-secondary"><X className="size-4" /></button></div>
            <div className="mb-6"><p className="mb-2 text-xs text-muted-foreground">Hədəf rol</p><RoleSelect className="w-full" /></div>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"><Icon className="size-4" />{item.label}</Link>;
              })}
            </nav>
            <button type="button" onClick={() => { if (window.confirm("Demo profil, roadmap və müsahibə nəticələri silinəcək. Davam edək?")) { resetJourney(); setLocation("/"); } }} className="mt-auto flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"><Trash2 className="size-4" />Məlumatlarımı sil</button>
          </aside>
        </div>
      )}
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-4 py-7 lg:pl-[18rem] lg:pr-6 md:py-9">{children}</main>
    </div>
  );
}

export function PageGuard({ children }: { children: ReactNode }) {
  const { analysisId } = useCareer();
  const [, setLocation] = useLocation();
  if (!analysisId) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <div className="max-w-md rounded-2xl border border-border bg-card p-7">
          <CircleAlert className="mx-auto mb-4 size-7 text-warning" />
          <h1 className="text-xl font-semibold">Əvvəlcə CV analizini başlayın</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Nəticələri görmək üçün CV mətni və hədəf rol seçimi lazımdır.</p>
          <button type="button" onClick={() => setLocation("/")} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white">Landing-ə qayıt</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mb-6 flex flex-wrap items-start gap-3 rounded-xl border border-info/30 bg-info/10 px-4 py-3 text-sm text-secondary-foreground">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-info" />
      <p className="min-w-48 flex-1 leading-5"><strong className="font-medium text-info">CV analizi tamamlandı.</strong> Aşkarlanan bacarıqlar və internship uyğunluğu real hesablamalara əsaslanır.</p>
      <button type="button" onClick={() => setDismissed(true)} className="self-center text-muted-foreground hover:text-foreground" aria-label="Bildirişi bağla"><X className="size-4" /></button>
    </div>
  );
}

export function LevelBars({ current, required, compact = false }: { current: number; required?: number; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 ${compact ? "" : "gap-1.5"}`} role="img" aria-label={`Səviyyə ${current}${required ? `, tələb olunan ${required}` : ""}`}>
      {[1, 2, 3, 4].map((level) => (
        <span key={level} className={`${compact ? "h-1.5 w-4" : "h-1.5 w-7"} rounded-full ${level <= current ? "bg-primary" : "bg-border"} ${required === level ? "ring-1 ring-accent ring-offset-1 ring-offset-card" : ""}`} />
      ))}
    </span>
  );
}

// SkillChip and AddSkillButton removed - skill editing now done via server API
// These stubs are exported for backward compat but render nothing
export function SkillChip({ skill }: { skill: SkillEntry }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary py-1 pl-3 pr-2 text-sm">{skill.name}<LevelBars current={skill.level} compact /></span>;
}
export function SkillBadge({ slug, name }: { slug: string; name: string }) {
  return <span className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-medium">{name}</span>;
}
export function AddSkillButton() { return null; }

export function ScoreGauge({ score, label = "Career Readiness" }: { score: number; label?: string }) {
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#7c9bff" : "#f59e0b";
  return (
    <figure className="mx-auto w-full max-w-xs text-center" aria-label={`${label}: ${score}/100`}>
      <svg viewBox="0 0 200 120" className="w-full overflow-visible">
        <path d="M18 102 A82 82 0 0 1 182 102" pathLength="100" fill="none" stroke="#27272a" strokeWidth="13" strokeLinecap="round" />
        <path d="M18 102 A82 82 0 0 1 182 102" pathLength="100" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 - score} className="transition-all duration-700 motion-reduce:transition-none" />
      </svg>
      <div className="-mt-14 text-5xl font-semibold tracking-[-0.06em] tabular-nums">{score}</div>
      <figcaption className="mt-3 text-sm text-muted-foreground">{label} · 100 üzərindən</figcaption>
    </figure>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-accent">{eyebrow}</p>}<h1 className="text-2xl font-semibold tracking-[-0.04em] md:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</div>;
}

export function MiniStat({ icon: Icon, label, value, hint, tone = "blue" }: { icon: typeof BarChart3; label: string; value: string | number; hint: string; tone?: "blue" | "green" | "amber" }) {
  const tones = { blue: "bg-primary/15 text-accent", green: "bg-success/15 text-success", amber: "bg-warning/15 text-warning" };
  return <div className="rounded-xl border border-border bg-card p-4"><div className="mb-5 flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span><span className={`grid size-8 place-items-center rounded-lg ${tones[tone]}`}><Icon className="size-4" /></span></div><p className="text-3xl font-semibold tracking-[-0.05em] tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>;
}

export function DemoBadge() { return <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-1 text-[11px] font-medium text-info"><span className="size-1 rounded-full bg-info" />Demo</span>; }

export function SearchResource({ query }: { query: string }) { return <a className="inline-flex items-center gap-1 text-xs text-accent hover:underline" href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">Axtar<ExternalLink className="size-3" /></a>; }

export function RoleIdentity() {
  const { role } = useCareer();
  const currentRole = getRole(role);
  return <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"><span className="grid size-7 place-items-center rounded-lg bg-primary/15 text-accent"><Target className="size-3.5" /></span><span><span className="block text-[11px] text-muted-foreground">Hədəf rol</span><span className="block text-xs font-medium">{currentRole.name}</span></span></div>;
}
