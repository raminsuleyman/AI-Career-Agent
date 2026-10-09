export type SkillLevel = 0 | 1 | 2 | 3 | 4;
export type SkillSlug =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "react"
  | "node"
  | "python"
  | "sql"
  | "git"
  | "testing"
  | "figma"
  | "api";

export type RoleSlug = "frontend" | "backend" | "fullstack" | "data" | "qa" | "ux";

export type SkillEntry = {
  slug: SkillSlug;
  name: string;
  level: SkillLevel;
  origin?: "cv" | "user";
};

export type RoleDefinition = {
  slug: RoleSlug;
  name: string;
  subtitle: string;
  description: string;
  requiredSkills: Array<{ slug: SkillSlug; level: SkillLevel; importance: 1 | 2 | 3 }>;
};

export type Internship = {
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

export type Gap = {
  slug: SkillSlug;
  name: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number;
  priority: "high" | "medium" | "low";
};

export type InternshipMatch = Internship & {
  score: number;
  matched: SkillSlug[];
  missing: SkillSlug[];
};

export type RoadmapTask = {
  id: string;
  skillSlug: SkillSlug;
  title: string;
  description: string;
  estMinutes: number;
  resourceQuery: string;
  completed: boolean;
};

export type RoadmapDay = { day: number; focus: string; tasks: RoadmapTask[] };

export type InterviewQuestion = {
  id: string;
  type: "Texniki" | "Təcrübə" | "Davranış" | "Ssenari";
  question: string;
  hint: string;
};

export const skills: Record<SkillSlug, { name: string; category: string }> = {
  html: { name: "HTML", category: "Frontend" },
  css: { name: "CSS", category: "Frontend" },
  javascript: { name: "JavaScript", category: "Frontend" },
  typescript: { name: "TypeScript", category: "Frontend" },
  react: { name: "React", category: "Frontend" },
  node: { name: "Node.js", category: "Backend" },
  python: { name: "Python", category: "Data" },
  sql: { name: "SQL", category: "Data" },
  git: { name: "Git", category: "Workflow" },
  testing: { name: "Testing", category: "Quality" },
  figma: { name: "Figma", category: "Design" },
  api: { name: "REST API", category: "Backend" },
};

export const roles: RoleDefinition[] = [
  {
    slug: "frontend",
    name: "Frontend Developer",
    subtitle: "İnterfeys və məhsul təcrübəsi",
    description: "Müasir veb interfeysləri və istifadəçi təcrübəsi üzərində işləyən başlanğıc səviyyəli rol.",
    requiredSkills: [
      { slug: "html", level: 3, importance: 3 },
      { slug: "css", level: 3, importance: 3 },
      { slug: "javascript", level: 3, importance: 3 },
      { slug: "react", level: 2, importance: 3 },
      { slug: "typescript", level: 2, importance: 2 },
      { slug: "git", level: 2, importance: 2 },
    ],
  },
  {
    slug: "backend",
    name: "Backend Developer",
    subtitle: "API və xidmət arxitekturası",
    description: "Server məntiqi, API-lər və etibarlı məlumat axınları üzərində işləyən başlanğıc səviyyəli rol.",
    requiredSkills: [
      { slug: "node", level: 3, importance: 3 },
      { slug: "api", level: 3, importance: 3 },
      { slug: "sql", level: 2, importance: 3 },
      { slug: "javascript", level: 2, importance: 2 },
      { slug: "git", level: 2, importance: 2 },
      { slug: "testing", level: 2, importance: 1 },
    ],
  },
  {
    slug: "fullstack",
    name: "Full-stack Developer",
    subtitle: "Məhsulu uçdan-uca qur",
    description: "İnterfeys, API və verilənlər qatını birləşdirən geniş profilli başlanğıc rol.",
    requiredSkills: [
      { slug: "react", level: 2, importance: 3 },
      { slug: "javascript", level: 3, importance: 3 },
      { slug: "node", level: 2, importance: 3 },
      { slug: "api", level: 2, importance: 2 },
      { slug: "sql", level: 2, importance: 2 },
      { slug: "git", level: 2, importance: 2 },
    ],
  },
  {
    slug: "data",
    name: "Data Analyst",
    subtitle: "Məlumatdan qərara",
    description: "Məlumatı təmizləyən, analiz edən və qərar üçün görünən nəticəyə çevirən başlanğıc rol.",
    requiredSkills: [
      { slug: "python", level: 3, importance: 3 },
      { slug: "sql", level: 3, importance: 3 },
      { slug: "testing", level: 1, importance: 1 },
      { slug: "git", level: 1, importance: 1 },
      { slug: "api", level: 1, importance: 1 },
    ],
  },
  {
    slug: "qa",
    name: "QA Engineer",
    subtitle: "Keyfiyyət və sınaq",
    description: "İstifadəçi ssenarilərini, keyfiyyəti və məhsulun etibarlılığını qoruyan başlanğıc rol.",
    requiredSkills: [
      { slug: "testing", level: 3, importance: 3 },
      { slug: "javascript", level: 2, importance: 2 },
      { slug: "api", level: 2, importance: 2 },
      { slug: "git", level: 2, importance: 2 },
      { slug: "sql", level: 1, importance: 1 },
    ],
  },
  {
    slug: "ux",
    name: "UI/UX Designer",
    subtitle: "İstifadəçi üçün aydın məhsul",
    description: "Araşdırma, flow və vizual interfeysi birləşdirən başlanğıc dizayn rolu.",
    requiredSkills: [
      { slug: "figma", level: 3, importance: 3 },
      { slug: "html", level: 1, importance: 1 },
      { slug: "css", level: 1, importance: 1 },
      { slug: "testing", level: 2, importance: 2 },
      { slug: "javascript", level: 1, importance: 1 },
    ],
  },
];

export const internships: Internship[] = [
  {
    id: "int-01",
    title: "Frontend Intern",
    company: "Nexora Studio",
    location: "Bakı",
    workMode: "Hibrid",
    role: "frontend",
    description: "React komponentləri, dizayn sistemi və məhsul interfeysləri ilə işləyən 3 aylıq internship.",
    required: ["html", "css", "javascript", "react"],
    preferred: ["typescript", "git"],
  },
  {
    id: "int-02",
    title: "Junior UI Engineer",
    company: "Prism Labs",
    location: "Remote",
    workMode: "Remote",
    role: "frontend",
    description: "Responsive səhifələr və komponent kitabxanasına töhfə vermək üçün başlanğıc rol.",
    required: ["html", "css", "javascript"],
    preferred: ["react", "figma"],
  },
  {
    id: "int-03",
    title: "Backend Intern",
    company: "Atlas Cloud",
    location: "Bakı",
    workMode: "Ofis",
    role: "backend",
    description: "Node.js API-ləri və sadə database sorğuları üzərində mentorlu internship.",
    required: ["node", "javascript", "api"],
    preferred: ["sql", "git"],
  },
  {
    id: "int-04",
    title: "Platform Engineering Intern",
    company: "Epsilon Works",
    location: "Remote",
    workMode: "Remote",
    role: "backend",
    description: "API inteqrasiyaları, test ssenariləri və server keyfiyyəti üzrə internship.",
    required: ["node", "api", "git"],
    preferred: ["testing", "sql"],
  },
  {
    id: "int-05",
    title: "Full-stack Product Intern",
    company: "Sfera Tech",
    location: "Bakı",
    workMode: "Hibrid",
    role: "fullstack",
    description: "Məhsul komandasına UI-dan API-yə qədər kiçik funksiyalarla qoşulan internship.",
    required: ["react", "javascript", "node"],
    preferred: ["api", "sql", "git"],
  },
  {
    id: "int-06",
    title: "Web Product Intern",
    company: "Orbit Commerce",
    location: "Remote",
    workMode: "Remote",
    role: "fullstack",
    description: "Veb məhsulunda istifadəçi flow-ları və məlumat inteqrasiyaları ilə işləyən rol.",
    required: ["javascript", "react", "api"],
    preferred: ["node", "testing"],
  },
  {
    id: "int-07",
    title: "Data Analyst Intern",
    company: "Delta Insights",
    location: "Bakı",
    workMode: "Hibrid",
    role: "data",
    description: "Məlumat təmizləmə, SQL sorğuları və sadə dashboard hesabatları üzrə internship.",
    required: ["python", "sql"],
    preferred: ["git", "api"],
  },
  {
    id: "int-08",
    title: "Product Analytics Intern",
    company: "Lumen Digital",
    location: "Remote",
    workMode: "Remote",
    role: "data",
    description: "Məhsul metrikalarını araşdırmaq və nəticələri komandaya çatdırmaq üçün rol.",
    required: ["sql", "python"],
    preferred: ["testing", "git"],
  },
  {
    id: "int-09",
    title: "QA Automation Intern",
    company: "Vertex QA",
    location: "Bakı",
    workMode: "Ofis",
    role: "qa",
    description: "Manual yoxlamalardan başlayaraq test düşüncəsi qazanmaq üçün internship.",
    required: ["testing", "javascript", "api"],
    preferred: ["git", "sql"],
  },
  {
    id: "int-10",
    title: "Software Quality Intern",
    company: "Northline",
    location: "Remote",
    workMode: "Remote",
    role: "qa",
    description: "Bug hesabatı, regresiya yoxlaması və API sınaqları ilə işləyən internship.",
    required: ["testing", "api"],
    preferred: ["javascript", "git"],
  },
  {
    id: "int-11",
    title: "Product Design Intern",
    company: "Mosaic Lab",
    location: "Bakı",
    workMode: "Hibrid",
    role: "ux",
    description: "Figma flow-ları, sadə istifadəçi araşdırması və dizayn handoff-u üçün rol.",
    required: ["figma", "testing"],
    preferred: ["html", "css"],
  },
  {
    id: "int-12",
    title: "UX Research Intern",
    company: "Caspian Products",
    location: "Remote",
    workMode: "Remote",
    role: "ux",
    description: "İstifadəçi ehtiyaclarını anlamaq və aydın məhsul qərarlarına çevirmək üçün internship.",
    required: ["figma", "testing"],
    preferred: ["html", "javascript"],
  },
];

export const demoProfile = {
  name: "Demo profil",
  candidateLevel: "Tələbə",
  summary:
    "Veb texnologiyaları üzrə praktik layihələr qurmuş, frontend istiqamətində inkişaf edən tələbə profili.",
  highlights: [
    "React ilə kiçik task idarəetmə tətbiqi",
    "Universitet hackathon layihəsində komanda təcrübəsi",
    "Responsive landing page və Git workflow praktikası",
  ],
  skills: [
    { slug: "html", name: "HTML", level: 3, origin: "cv" },
    { slug: "css", name: "CSS", level: 3, origin: "cv" },
    { slug: "javascript", name: "JavaScript", level: 2, origin: "cv" },
    { slug: "react", name: "React", level: 2, origin: "cv" },
    { slug: "git", name: "Git", level: 2, origin: "cv" },
    { slug: "typescript", name: "TypeScript", level: 1, origin: "cv" },
  ] satisfies SkillEntry[],
};

export function getRole(slug: RoleSlug) {
  return roles.find((role) => role.slug === slug) ?? roles[0];
}

export function getLevel(skillsList: SkillEntry[], slug: SkillSlug): SkillLevel {
  return skillsList.find((skill) => skill.slug === slug)?.level ?? 0;
}

export function roleReadiness(skillsList: SkillEntry[], roleSlug: RoleSlug) {
  const requirements = getRole(roleSlug).requiredSkills;
  const total = requirements.reduce((sum, requirement) => sum + requirement.importance, 0);
  const achieved = requirements.reduce(
    (sum, requirement) =>
      sum +
      requirement.importance *
        Math.min(getLevel(skillsList, requirement.slug) / requirement.level, 1),
    0,
  );
  return Math.round((achieved / total) * 100);
}

export function getGaps(skillsList: SkillEntry[], roleSlug: RoleSlug): Gap[] {
  return getRole(roleSlug)
    .requiredSkills.map((requirement) => {
      const currentLevel = getLevel(skillsList, requirement.slug);
      const gap = Math.max(requirement.level - currentLevel, 0);
      const priority: Gap["priority"] =
        (requirement.importance === 3 && gap > 0) || gap >= 3
          ? "high"
          : requirement.importance === 2 || gap === 2
            ? "medium"
            : "low";
      return {
        slug: requirement.slug,
        name: skills[requirement.slug].name,
        currentLevel,
        requiredLevel: requirement.level,
        gap,
        priority,
      };
    })
    .filter((gap) => gap.gap > 0)
    .sort((first, second) => second.gap * (second.priority === "high" ? 3 : second.priority === "medium" ? 2 : 1) - first.gap * (first.priority === "high" ? 3 : first.priority === "medium" ? 2 : 1));
}

export function getMatches(skillsList: SkillEntry[], roleSlug: RoleSlug): InternshipMatch[] {
  return internships
    .map((internship) => {
      const requiredScore = internship.required.length
        ? internship.required.reduce((sum, slug) => sum + Math.min(getLevel(skillsList, slug) / 2, 1), 0) /
          internship.required.length
        : 0;
      const preferredScore = internship.preferred.length
        ? internship.preferred.reduce((sum, slug) => sum + Math.min(getLevel(skillsList, slug) / 2, 1), 0) /
          internship.preferred.length
        : 0;
      const score = Math.round(
        Math.min(100, (requiredScore * 0.7 + preferredScore * 0.2 + (internship.role === roleSlug ? 0.1 : 0)) * 100),
      );
      return {
        ...internship,
        score,
        matched: [...internship.required, ...internship.preferred].filter((slug) => getLevel(skillsList, slug) > 0),
        missing: internship.required.filter((slug) => getLevel(skillsList, slug) < 2),
      };
    })
    .sort((first, second) => second.score - first.score || Number(second.role === roleSlug) - Number(first.role === roleSlug));
}

const learningActions = ["əsasları möhkəmləndir", "praktik tapşırıq qur", "kiçik nümunə yaz", "müsahibə sualı hazırla"];

export function createRoadmap(gaps: Gap[]): RoadmapDay[] {
  const usefulGaps = gaps.length ? gaps.slice(0, 4) : [{ slug: "git" as SkillSlug, name: "Git", currentLevel: 0, requiredLevel: 1, gap: 1, priority: "low" as const }];
  return Array.from({ length: 7 }, (_, index) => {
    const primary = usefulGaps[index % usefulGaps.length];
    const secondary = usefulGaps[(index + 1) % usefulGaps.length];
    const action = learningActions[index % learningActions.length];
    return {
      day: index + 1,
      focus: `${primary.name} · fokus günü`,
      tasks: [
        {
          id: `day-${index + 1}-a`,
          skillSlug: primary.slug,
          title: `${primary.name}: ${action}`,
          description: `${primary.name} üzrə bir anlayışı seçin, 30–45 dəqiqə fokuslanın və qısa qeyd çıxarın.`,
          estMinutes: 45,
          resourceQuery: `${primary.name} beginner practice`,
          completed: false,
        },
        {
          id: `day-${index + 1}-b`,
          skillSlug: secondary.slug,
          title: `${secondary.name}: tətbiq et`,
          description: `Öyrəndiyiniz ideyanı kiçik bir nümunədə sınaqdan keçirin və nəticəni Git qeydinə əlavə edin.`,
          estMinutes: 35,
          resourceQuery: `${secondary.name} hands-on exercise`,
          completed: false,
        },
        ...(index % 2 === 0
          ? [
              {
                id: `day-${index + 1}-c`,
                skillSlug: primary.slug,
                title: "Qısa refleksiya",
                description: "Nəyi rahat etdiyinizi və hansı sualın açıq qaldığını iki cümlə ilə yazın.",
                estMinutes: 15,
                resourceQuery: `${primary.name} interview questions`,
                completed: false,
              },
            ]
          : []),
      ],
    };
  });
}

export function createInterview(roleSlug: RoleSlug, gaps: Gap[]): InterviewQuestion[] {
  const role = getRole(roleSlug);
  const fallbackSkill = role.requiredSkills[0];
  const focus = gaps[0]?.name ?? (fallbackSkill ? skills[fallbackSkill.slug].name : "əsas bacarıq");
  return [
    {
      id: "q1",
      type: "Texniki",
      question: `${focus} ilə işlədiyiniz kiçik bir layihədə hansı problemi həll etmisiniz?`,
      hint: "Kontekst → etdiyiniz addım → nəticə ardıcıllığı ilə cavablayın.",
    },
    {
      id: "q2",
      type: "Texniki",
      question: `${role.name} rolunda keyfiyyəti yoxlamaq üçün ilk hansı addımları atardınız?`,
      hint: "Sadə, izah edilə bilən prioritetləşdirmə verin.",
    },
    {
      id: "q3",
      type: "Təcrübə",
      question: "Komanda layihəsində fərqli fikirləri necə bir qərara çevirmisiniz?", 
      hint: "Konkret layihə nümunəsi və öz rolunuzu qeyd edin.",
    },
    {
      id: "q4",
      type: "Davranış",
      question: "Bilmədiyiniz mövzu ilə qarşılaşanda öyrənmə planınızı necə qurursunuz?", 
      hint: "Mənbə, praktika və geribildirim addımlarını göstərin.",
    },
    {
      id: "q5",
      type: "Ssenari",
      question: `Mentor sizə ${role.name} tapşırığını iki günə bitirməyi desə, işi necə planlayardınız?`,
      hint: "Riskləri, sualları və yoxlama nöqtələrini nəzərə alın.",
    },
  ];
}

export function getFeedback(answers: Record<string, string>, readiness: number) {
  const answered = Object.values(answers).filter((answer) => answer.trim().length > 0);
  const averageLength = answered.length
    ? Math.round(answered.reduce((sum, answer) => sum + answer.length, 0) / answered.length)
    : 0;
  const interviewScore = Math.max(0, Math.min(100, Math.round((answered.length / 5) * 45 + Math.min(averageLength / 8, 55))));
  const overall = Math.round(interviewScore * 0.6 + readiness * 0.4);
  return {
    interviewScore,
    readinessScore: overall,
    strengths: [
      answered.length >= 4 ? "Cavablarınızda ardıcıllıq və davamlılıq görünür." : "Suallara açıq və məqsədli yanaşmısınız.",
      averageLength >= 150 ? "Cavablarınız nümunə və detallarla zəngindir." : "Məsələyə praktik prizmadan yanaşmısınız.",
    ],
    improvements: [
      "Hər texniki cavabda konkret nəticə və ölçü əlavə edin.",
      "İşin trade-off-larını və prioritetlərini daha aydın adlandırın.",
    ],
    nextSteps: [
      "Roadmap-dakı yüksək prioritetli task-lardan birini tamamlayın.",
      "Bu müsahibəni 48 saat sonra daha konkret nümunələrlə yenidən edin.",
    ],
  };
}
