import { z } from "zod";

export const roleSchema = z.enum(["frontend", "backend", "fullstack", "data", "qa", "ux"]);
export type RoleSlug = z.infer<typeof roleSchema>;
export const skillSlugSchema = z.enum(["html", "css", "javascript", "typescript", "react", "node", "python", "sql", "git", "testing", "figma", "api"]);
export type SkillSlug = z.infer<typeof skillSlugSchema>;

export const roleCatalog: Record<RoleSlug, { name: string; skills: Array<{ slug: SkillSlug; level: 1 | 2 | 3; importance: 1 | 2 | 3 }> }> = {
  frontend: { name: "Frontend Developer", skills: [{ slug: "html", level: 3, importance: 3 }, { slug: "css", level: 3, importance: 3 }, { slug: "javascript", level: 3, importance: 3 }, { slug: "react", level: 2, importance: 3 }, { slug: "typescript", level: 2, importance: 2 }, { slug: "git", level: 2, importance: 2 }] },
  backend: { name: "Backend Developer", skills: [{ slug: "node", level: 3, importance: 3 }, { slug: "api", level: 3, importance: 3 }, { slug: "sql", level: 2, importance: 3 }, { slug: "javascript", level: 2, importance: 2 }, { slug: "git", level: 2, importance: 2 }, { slug: "testing", level: 2, importance: 1 }] },
  fullstack: { name: "Full-stack Developer", skills: [{ slug: "react", level: 2, importance: 3 }, { slug: "javascript", level: 3, importance: 3 }, { slug: "node", level: 2, importance: 3 }, { slug: "api", level: 2, importance: 2 }, { slug: "sql", level: 2, importance: 2 }, { slug: "git", level: 2, importance: 2 }] },
  data: { name: "Data Analyst", skills: [{ slug: "python", level: 3, importance: 3 }, { slug: "sql", level: 3, importance: 3 }, { slug: "testing", level: 1, importance: 1 }, { slug: "git", level: 1, importance: 1 }, { slug: "api", level: 1, importance: 1 }] },
  qa: { name: "QA Engineer", skills: [{ slug: "testing", level: 3, importance: 3 }, { slug: "javascript", level: 2, importance: 2 }, { slug: "api", level: 2, importance: 2 }, { slug: "git", level: 2, importance: 2 }, { slug: "sql", level: 1, importance: 1 }] },
  ux: { name: "UI/UX Designer", skills: [{ slug: "figma", level: 3, importance: 3 }, { slug: "html", level: 1, importance: 1 }, { slug: "css", level: 1, importance: 1 }, { slug: "testing", level: 2, importance: 2 }, { slug: "javascript", level: 1, importance: 1 }] },
};

export const skillCatalog: Record<SkillSlug, { name: string; patterns: RegExp[] }> = {
  html: { name: "HTML", patterns: [/\bhtml\b/i] },
  css: { name: "CSS", patterns: [/\bcss\b/i] },
  javascript: { name: "JavaScript", patterns: [/\bjavascript\b/i, /\bjs\b/i] },
  typescript: { name: "TypeScript", patterns: [/\btypescript\b/i] },
  react: { name: "React", patterns: [/\breact(?:\.js)?\b/i] },
  node: { name: "Node.js", patterns: [/\bnode(?:\.js)?\b/i] },
  python: { name: "Python", patterns: [/\bpython\b/i] },
  sql: { name: "SQL", patterns: [/\bsql\b/i] },
  git: { name: "Git", patterns: [/\bgit\b/i, /\bgithub\b/i] },
  testing: { name: "Testing", patterns: [/\btesting\b/i, /\btests?\b/i, /\bqa\b/i] },
  figma: { name: "Figma", patterns: [/\bfigma\b/i] },
  api: { name: "REST API", patterns: [/\brest\s*api\b/i, /\bapi\b/i] },
};

export type ExtractedSkill = { slug: SkillSlug; level: 1 | 2 | 3; evidence: string };
export type SkillGap = { slug: SkillSlug; name: string; currentLevel: number; requiredLevel: number; gap: number; priority: "high" | "medium" | "low" };

/** A deterministic mock extractor, intentionally not represented as real AI. */
export function extractSkills(text: string): ExtractedSkill[] {
  const found: ExtractedSkill[] = [];
  for (const [slug, item] of Object.entries(skillCatalog) as Array<[SkillSlug, (typeof skillCatalog)[SkillSlug]]>) {
    for (const pattern of item.patterns) {
      const match = pattern.exec(text);
      if (!match) continue;
      const start = Math.max(0, text.lastIndexOf(".", match.index) + 1);
      const endIndex = text.indexOf(".", match.index + match[0].length);
      const end = endIndex < 0 ? Math.min(text.length, start + 160) : Math.min(endIndex + 1, start + 160);
      const evidence = text.slice(start, end).trim();
      if (evidence.length >= 3 && !found.some((entry) => entry.slug === slug)) {
        found.push({ slug, level: 1, evidence });
      }
      break;
    }
  }
  return found;
}

export function computeRoleReadiness(skills: Array<{ slug: SkillSlug; level: number }>, role: RoleSlug): number {
  const levels = new Map(skills.map((skill) => [skill.slug, skill.level]));
  const required = roleCatalog[role].skills;
  const totalWeight = required.reduce((sum, item) => sum + item.importance, 0);
  const earned = required.reduce((sum, item) => sum + item.importance * Math.min((levels.get(item.slug) ?? 0) / item.level, 1), 0);
  return totalWeight ? Math.round((earned / totalWeight) * 100) : 0;
}

export function computeGaps(skills: Array<{ slug: SkillSlug; level: number }>, role: RoleSlug): SkillGap[] {
  const levels = new Map(skills.map((skill) => [skill.slug, skill.level]));
  return roleCatalog[role].skills
    .map((required) => {
      const currentLevel = levels.get(required.slug) ?? 0;
      const gap = Math.max(required.level - currentLevel, 0);
      const priority = gap === 0 ? "low" : (required.importance === 3 && gap >= 1) || gap >= 3 ? "high" : required.importance === 2 || gap === 2 ? "medium" : "low";
      return { slug: required.slug, name: skillCatalog[required.slug].name, currentLevel, requiredLevel: required.level, gap, priority } satisfies SkillGap;
    })
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap * roleCatalog[role].skills.find((item) => item.slug === b.slug)!.importance - a.gap * roleCatalog[role].skills.find((item) => item.slug === a.slug)!.importance);
}

export const createAnalysisInput = z.object({
  text: z.string().trim().min(200, "CV ən azı 200 simvol olmalıdır").max(20_000, "CV maksimum 20 000 simvol ola bilər"),
  targetRole: roleSchema,
  requestKey: z.string().uuid(),
});

export const createRoadmapInput = z.object({ analysisId: z.string().uuid() });
export const roadmapIdInput = z.object({ roadmapId: z.string().uuid() });
export const toggleTaskInput = z.object({ taskId: z.string().uuid(), completed: z.boolean() });
export const createInterviewInput = z.object({ analysisId: z.string().uuid() });
export const interviewIdInput = z.object({ interviewId: z.string().uuid() });
export const answerInput = z.object({ interviewId: z.string().uuid(), questionId: z.string().uuid(), answer: z.string().trim().max(2000), skipped: z.boolean().default(false) }).refine((value) => value.skipped || value.answer.length > 0, { message: "Cavab yazın və ya sualı keçin" });
