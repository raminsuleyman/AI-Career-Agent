import { skillCatalog, type RoleSlug, type SkillSlug } from "./domain";

type InternshipSeed = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "Remote" | "Hibrid" | "Ofis";
  role: RoleSlug;
  description: string;
  required: SkillSlug[];
  preferred: SkillSlug[];
};

export const internshipCatalog: InternshipSeed[] = [
  { id: "int-01", title: "Frontend Intern", company: "Nexora Studio", location: "Bakı", workMode: "Hibrid", role: "frontend", description: "React komponentləri və məhsul interfeysləri ilə işləyən 3 aylıq internship.", required: ["html", "css", "javascript", "react"], preferred: ["typescript", "git"] },
  { id: "int-02", title: "Junior UI Engineer", company: "Prism Labs", location: "Remote", workMode: "Remote", role: "frontend", description: "Responsive səhifələr və komponent kitabxanasına töhfə üçün başlanğıc rol.", required: ["html", "css", "javascript"], preferred: ["react", "figma"] },
  { id: "int-03", title: "Backend Intern", company: "Atlas Cloud", location: "Bakı", workMode: "Ofis", role: "backend", description: "Node.js API-ləri və database sorğuları üzərində mentorlu internship.", required: ["node", "javascript", "api"], preferred: ["sql", "git"] },
  { id: "int-04", title: "Platform Engineering Intern", company: "Epsilon Works", location: "Remote", workMode: "Remote", role: "backend", description: "API inteqrasiyaları və test ssenariləri üzrə internship.", required: ["node", "api", "git"], preferred: ["testing", "sql"] },
  { id: "int-05", title: "Full-stack Product Intern", company: "Sfera Tech", location: "Bakı", workMode: "Hibrid", role: "fullstack", description: "UI-dan API-yə qədər kiçik məhsul funksiyaları hazırlayın.", required: ["react", "javascript", "node"], preferred: ["api", "sql", "git"] },
  { id: "int-06", title: "Web Product Intern", company: "Orbit Commerce", location: "Remote", workMode: "Remote", role: "fullstack", description: "İstifadəçi flow-ları və məlumat inteqrasiyaları ilə işləyən rol.", required: ["javascript", "react", "api"], preferred: ["node", "testing"] },
  { id: "int-07", title: "Data Analyst Intern", company: "Delta Insights", location: "Bakı", workMode: "Hibrid", role: "data", description: "Məlumat təmizləmə, SQL sorğuları və sadə dashboard hesabatları.", required: ["python", "sql"], preferred: ["git", "api"] },
  { id: "int-08", title: "Product Analytics Intern", company: "Lumen Digital", location: "Remote", workMode: "Remote", role: "data", description: "Məhsul metrikalarını araşdırmaq və nəticələri paylaşmaq üçün rol.", required: ["sql", "python"], preferred: ["testing", "git"] },
  { id: "int-09", title: "QA Automation Intern", company: "Vertex QA", location: "Bakı", workMode: "Ofis", role: "qa", description: "Manual yoxlamadan başlayaraq test düşüncəsi qazanmaq üçün internship.", required: ["testing", "javascript", "api"], preferred: ["git", "sql"] },
  { id: "int-10", title: "Software Quality Intern", company: "Northline", location: "Remote", workMode: "Remote", role: "qa", description: "Bug hesabatı, regresiya yoxlaması və API sınaqları ilə işləyin.", required: ["testing", "api"], preferred: ["javascript", "git"] },
  { id: "int-11", title: "Product Design Intern", company: "Mosaic Lab", location: "Bakı", workMode: "Hibrid", role: "ux", description: "Figma flow-ları və istifadəçi araşdırması üçün dizayn internship-i.", required: ["figma", "testing"], preferred: ["html", "css"] },
  { id: "int-12", title: "UX Research Intern", company: "Caspian Products", location: "Remote", workMode: "Remote", role: "ux", description: "İstifadəçi ehtiyaclarını araşdırıb məhsul qərarlarına çevirin.", required: ["figma", "testing"], preferred: ["html", "javascript"] },
];

export function scoreCatalog(skills: Array<{ slug: string; level: number }>, role: RoleSlug) {
  const levels = new Map(skills.map((skill) => [skill.slug, skill.level]));
  return internshipCatalog
    .map((item) => {
      const avg = (slugs: SkillSlug[]) => slugs.length ? slugs.reduce((sum, slug) => sum + Math.min((levels.get(slug) ?? 0) / 2, 1), 0) / slugs.length : null;
      const required = avg(item.required) ?? 0;
      const preferred = avg(item.preferred);
      const score = Math.round(Math.min(100, (0.7 + (preferred === null ? 0.2 : 0)) * required * 100 + (preferred === null ? 0 : preferred * 20) + (item.role === role ? 10 : 0)));
      return {
        ...item,
        score,
        source: "mock" as const,
        matchedSkills: [...item.required, ...item.preferred].filter((slug) => (levels.get(slug) ?? 0) > 0).map((slug) => ({ slug, name: skillCatalog[slug].name, level: levels.get(slug) })),
        missingSkills: item.required.filter((slug) => (levels.get(slug) ?? 0) < 2).map((slug) => ({ slug, name: skillCatalog[slug].name, currentLevel: levels.get(slug) ?? 0, requiredLevel: 2 })),
      };
    })
    .sort((a, b) => b.score - a.score || Number(b.role === role) - Number(a.role === role));
}
