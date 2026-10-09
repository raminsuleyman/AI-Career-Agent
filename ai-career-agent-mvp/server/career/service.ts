import { and, asc, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "../db";
import { analyses, cvDocuments, interviewAnswers, interviewQuestions, interviews, roadmapTasks, roadmaps } from "../../drizzle/schema";
import { computeGaps, computeRoleReadiness, extractSkills, roleCatalog, skillCatalog, type RoleSlug, type SkillSlug } from "./domain";
import { scoreCatalog } from "./catalog";

function requireDb() {
  return getDb().then((db) => {
    if (!db) throw new Error("Database is not configured");
    return db;
  });
}

function questionsFor(role: RoleSlug, skillList: Array<{ slug: SkillSlug; level: number }>, gaps: ReturnType<typeof computeGaps>) {
  const strongest = [...skillList].sort((a, b) => b.level - a.level)[0]?.slug ?? roleCatalog[role].skills[0].slug;
  const weakest = gaps[0]?.slug ?? strongest;
  const strongestName = skillCatalog[strongest].name;
  const weakestName = skillCatalog[weakest].name;
  const roleName = roleCatalog[role].name;
  return [
    { type: "technical" as const, skillSlug: strongest, question: `${strongestName} ilə işlədiyiniz kiçik bir layihədə hansı problemi həll etmisiniz?`, rubric: "Kontekst, texniki qərar, addımlar və nəticə." },
    { type: "technical" as const, skillSlug: weakest, question: `${weakestName} bacarığını inkişaf etdirmək üçün hansı praktik addımı atardınız?`, rubric: "Öyrənmə yanaşması, konkret praktika və nəticə." },
    { type: "experience" as const, skillSlug: null, question: "Komanda layihəsində fərqli fikirləri necə bir qərara çevirmisiniz?", rubric: "Real nümunə, şəxsi töhfə və komanda nəticəsi." },
    { type: "behavioral" as const, skillSlug: null, question: "Bilmədiyiniz mövzu ilə qarşılaşanda öyrənmə planınızı necə qurursunuz?", rubric: "Mənbə, praktika, geribildirim və refleksiya." },
    { type: "scenario" as const, skillSlug: null, question: `Mentor sizə ${roleName} tapşırığını iki günə bitirməyi desə, işi necə planlayardınız?`, rubric: "Prioritet, risk, suallar və yoxlama nöqtələri." },
  ];
}

function roadmapPlan(role: RoleSlug, skills: Array<{ slug: SkillSlug; level: number }>) {
  const gaps = computeGaps(skills.map((item) => ({ ...item, evidence: "" })), role);
  const focus = gaps.length ? gaps.slice(0, 6) : roleCatalog[role].skills.slice(0, 3).map((item) => ({ slug: item.slug, name: skillCatalog[item.slug].name, gap: 0, currentLevel: 1, requiredLevel: item.level, priority: "low" as const }));
  const actions = ["əsasları möhkəmləndir", "praktik tapşırıq qur", "kiçik nümunə yaz", "müsahibə sualı hazırla"];
  return Array.from({ length: 7 }, (_, index) => {
    const primary = focus[index % focus.length];
    const secondary = focus[(index + 1) % focus.length];
    const tasks = [
      { skill: primary.slug, title: `${primary.name}: ${actions[index % actions.length]}`, description: `${primary.name} üzrə bir anlayışı seçin, 30–45 dəqiqə fokuslanın və qısa qeyd çıxarın.`, minutes: 45, query: `${primary.name} beginner practice` },
      { skill: secondary.slug, title: `${secondary.name}: tətbiq et`, description: "Öyrəndiyiniz ideyanı kiçik nümunədə sınaqdan keçirin və nəticəni qeyd edin.", minutes: 35, query: `${secondary.name} hands-on exercise` },
      ...(index % 2 === 0 ? [{ skill: primary.slug, title: "Qısa refleksiya", description: "Nəyi rahat etdiyinizi və hansı sualın açıq qaldığını iki cümlə ilə yazın.", minutes: 15, query: `${primary.name} interview questions` }] : []),
    ];
    return { day: index + 1, tasks };
  });
}

export async function listRoles() {
  return Object.entries(roleCatalog).map(([slug, value]) => ({ slug, name: value.name }));
}

export async function listInternships(skills: Array<{ slug: string; level: number }>, role: RoleSlug) {
  return scoreCatalog(skills, role);
}

export async function createAnalysis(userId: number, input: { text: string; targetRole: RoleSlug; requestKey: string }) {
  const db = await requireDb();
  const existing = await db.select().from(analyses).where(and(eq(analyses.userId, userId), eq(analyses.requestKey, input.requestKey))).limit(1);
  if (existing[0]) return { analysis: existing[0], replayed: true };

  const text = input.text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").trim();
  const extracted = extractSkills(text);
  const id = randomUUID();
  const cvId = randomUUID();
  const readiness = computeRoleReadiness(extracted, input.targetRole);
  const summary = extracted.length
    ? `CV mətnində ${extracted.length} bacarıq aşkarlandı. Bu, keyword əsaslı demo çıxarışıdır; bacarıq səviyyələri ilkin olaraq 1 verilir.`
    : "CV mətnində dəstəklənən bacarıq açar sözləri tapılmadı. Profil bacarıqlarını dashboard-da əl ilə əlavə edə bilərsiniz.";
  const candidateLevel = /internship|iş təcrübəsi|work experience/i.test(text) ? "junior" as const : "student" as const;
  const analysis = {
    id,
    userId,
    cvId,
    requestKey: input.requestKey,
    targetRole: input.targetRole,
    candidateLevel,
    summary,
    skills: extracted,
    highlights: [] as string[],
    roleReadiness: readiness,
    source: "mock" as const,
  };
  try {
    await db.transaction(async (tx) => {
      await tx.insert(cvDocuments).values({ id: cvId, userId, source: "paste", text });
      await tx.insert(analyses).values(analysis);
    });
    return { analysis, replayed: false };
  } catch (error) {
    // Concurrent retry with the same key: return the winner's committed record.
    const replay = await db.select().from(analyses).where(and(eq(analyses.userId, userId), eq(analyses.requestKey, input.requestKey))).limit(1);
    if (replay[0]) return { analysis: replay[0], replayed: true };
    throw error;
  }
}

export async function getAnalysis(userId: number, analysisId: string) {
  const db = await requireDb();
  const result = await db.select().from(analyses).where(and(eq(analyses.id, analysisId), eq(analyses.userId, userId))).limit(1);
  return result[0] ?? null;
}

export async function getLatestAnalysis(userId: number) {
  const db = await requireDb();
  const result = await db.select().from(analyses).where(eq(analyses.userId, userId)).orderBy(desc(analyses.createdAt)).limit(1);
  return result[0] ?? null;
}

export async function createRoadmap(userId: number, analysisId: string) {
  const db = await requireDb();
  const analysis = await getAnalysis(userId, analysisId);
  if (!analysis) return null;
  const id = randomUUID();
  const plan = roadmapPlan(analysis.targetRole as RoleSlug, analysis.skills as Array<{ slug: SkillSlug; level: number }>);
  await db.transaction(async (tx) => {
    await tx.insert(roadmaps).values({ id, userId, analysisId, targetRole: analysis.targetRole, source: "mock" });
    await tx.insert(roadmapTasks).values(plan.flatMap((day) => day.tasks.map((task, position) => ({
      id: randomUUID(), roadmapId: id, day: day.day, position: position + 1, skillSlug: task.skill,
      title: task.title, description: task.description, estMinutes: task.minutes, resourceQuery: task.query, completed: false,
    }))));
  });
  return getRoadmap(userId, id);
}

export async function getRoadmap(userId: number, roadmapId: string) {
  const db = await requireDb();
  const owned = await db.select().from(roadmaps).where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId))).limit(1);
  if (!owned[0]) return null;
  const tasks = await db.select().from(roadmapTasks).where(eq(roadmapTasks.roadmapId, roadmapId)).orderBy(asc(roadmapTasks.day), asc(roadmapTasks.position));
  return { ...owned[0], days: Array.from({ length: 7 }, (_, index) => ({ day: index + 1, tasks: tasks.filter((task) => task.day === index + 1) })) };
}

export async function setTaskCompleted(userId: number, taskId: string, completed: boolean) {
  const db = await requireDb();
  const ownedTask = await db.select({ taskId: roadmapTasks.id }).from(roadmapTasks).innerJoin(roadmaps, eq(roadmapTasks.roadmapId, roadmaps.id)).where(and(eq(roadmapTasks.id, taskId), eq(roadmaps.userId, userId))).limit(1);
  if (!ownedTask[0]) return null;
  await db.update(roadmapTasks).set({ completed, completedAt: completed ? new Date() : null }).where(eq(roadmapTasks.id, taskId));
  const updated = await db.select().from(roadmapTasks).where(eq(roadmapTasks.id, taskId)).limit(1);
  return updated[0] ?? null;
}

export async function createInterview(userId: number, analysisId: string) {
  const db = await requireDb();
  const analysis = await getAnalysis(userId, analysisId);
  if (!analysis) return null;
  const id = randomUUID();
  const questions = questionsFor(analysis.targetRole as RoleSlug, analysis.skills as Array<{ slug: SkillSlug; level: number }>, computeGaps(analysis.skills as Array<{ slug: SkillSlug; level: number; evidence: string }>, analysis.targetRole as RoleSlug));
  await db.transaction(async (tx) => {
    await tx.insert(interviews).values({ id, userId, analysisId, targetRole: analysis.targetRole, status: "in_progress", source: "mock" });
    await tx.insert(interviewQuestions).values(questions.map((question, index) => ({ id: randomUUID(), interviewId: id, position: index + 1, ...question })));
  });
  return getInterview(userId, id);
}

export async function getInterview(userId: number, interviewId: string) {
  const db = await requireDb();
  const owned = await db.select().from(interviews).where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId))).limit(1);
  if (!owned[0]) return null;
  const questions = await db.select().from(interviewQuestions).where(eq(interviewQuestions.interviewId, interviewId)).orderBy(asc(interviewQuestions.position));
  const answers = await db.select().from(interviewAnswers).where(eq(interviewAnswers.interviewId, interviewId));
  return { ...owned[0], questions, answers };
}

export async function saveAnswer(userId: number, input: { interviewId: string; questionId: string; answer: string; skipped: boolean }) {
  const db = await requireDb();
  const owned = await db.select({ interviewId: interviews.id }).from(interviews).innerJoin(interviewQuestions, eq(interviews.id, interviewQuestions.interviewId)).where(and(eq(interviews.id, input.interviewId), eq(interviews.userId, userId), eq(interviewQuestions.id, input.questionId), eq(interviews.status, "in_progress"))).limit(1);
  if (!owned[0]) return null;
  const existing = await db.select().from(interviewAnswers).where(eq(interviewAnswers.questionId, input.questionId)).limit(1);
  const answer = { answer: input.skipped ? null : input.answer, skipped: input.skipped };
  if (existing[0]) await db.update(interviewAnswers).set(answer).where(eq(interviewAnswers.questionId, input.questionId));
  else await db.insert(interviewAnswers).values({ id: randomUUID(), interviewId: input.interviewId, questionId: input.questionId, ...answer });
  return { saved: true };
}

export async function completeInterview(userId: number, interviewId: string) {
  const db = await requireDb();
  const session = await db.select().from(interviews).where(and(eq(interviews.id, interviewId), eq(interviews.userId, userId), eq(interviews.status, "in_progress"))).limit(1);
  if (!session[0]) return null;
  const questions = await db.select().from(interviewQuestions).where(eq(interviewQuestions.interviewId, interviewId));
  const answers = await db.select().from(interviewAnswers).where(eq(interviewAnswers.interviewId, interviewId));
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const scores = questions.map((question) => {
    const answer = answerMap.get(question.id);
    if (!answer || answer.skipped || !answer.answer?.trim()) return { questionId: question.id, score: 0, strength: "", improvement: "Suala keçildi; bu mövzu roadmap-da möhkəmləndirilsin." };
    const score = Math.max(0, Math.min(10, Math.round(answer.answer.length / 100) + 3));
    return { questionId: question.id, score, strength: answer.answer.length >= 120 ? "Cavabda konkret izah və nümunə var." : "Cavab təqdim edilib; daha konkret nümunə əlavə edin.", improvement: answer.answer.length < 120 ? "Nəticə və şəxsi töhfəni daha aydın yazın." : "Texniki trade-off və ölçülə bilən nəticəni dəqiqləşdirin." };
  });
  const interviewScore = Math.round(scores.reduce((sum, item) => sum + item.score, 0) / Math.max(questions.length, 1) * 10);
  const analysis = await getAnalysis(userId, session[0].analysisId);
  if (!analysis) return null;
  const readinessScore = Math.round(interviewScore * 0.6 + analysis.roleReadiness * 0.4);
  const feedback = {
    strengths: ["Cavablarınız təcrübə və öyrənmə yanaşmanızı göstərir.", "Növbəti sınaqda konkret layihə nəticələri əlavə edin."],
    improvements: ["Texniki cavablarda qərar və trade-off-ları qeyd edin."],
    nextSteps: ["Roadmap-dakı yüksək prioritetli task-ları tamamlayın."],
  };
  await db.transaction(async (tx) => {
    for (const item of scores) {
      await tx.update(interviewAnswers).set({ score: item.score, strength: item.strength, improvement: item.improvement }).where(eq(interviewAnswers.questionId, item.questionId));
    }
    await tx.update(interviews).set({ status: "completed", interviewScore, readinessScore, feedback, completedAt: new Date() }).where(eq(interviews.id, interviewId));
  });
  return { interviewScore, roleReadiness: analysis.roleReadiness, readinessScore, feedback, source: "mock" as const };
}

export async function deleteMyData(userId: number) {
  const db = await requireDb();
  await db.transaction(async (tx) => {
    // Child records cascade from their parent tables; delete top-level owners in FK-safe order.
    await tx.delete(interviews).where(eq(interviews.userId, userId));
    await tx.delete(roadmaps).where(eq(roadmaps.userId, userId));
    await tx.delete(analyses).where(eq(analyses.userId, userId));
    await tx.delete(cvDocuments).where(eq(cvDocuments.userId, userId));
  });
  return { deleted: true } as const;
}
