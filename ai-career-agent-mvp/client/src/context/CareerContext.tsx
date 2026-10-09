import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { roles, type RoleSlug } from "@/data/career";

// ─── Session storage key ───────────────────────────────────────────────────
const SESSION_KEY = "career-agent-session-v2";

type SessionData = {
  role: RoleSlug;
  analysisId: string | null;
  roadmapId: string | null;
  interviewId: string | null;
};

const defaultSession: SessionData = {
  role: "frontend",
  analysisId: null,
  roadmapId: null,
  interviewId: null,
};

function loadSession(): SessionData {
  if (typeof window === "undefined") return defaultSession;
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (!stored) return defaultSession;
    return { ...defaultSession, ...JSON.parse(stored) } as SessionData;
  } catch {
    return defaultSession;
  }
}

// ─── Server data types (inferred from tRPC) ───────────────────────────────
type AnalysisData = {
  id: string;
  userId: number;
  cvId: string;
  targetRole: string;
  candidateLevel: string;
  summary: string;
  skills: Array<{ slug: string; level: number; evidence: string }>;
  highlights: string[];
  roleReadiness: number;
  source: string;
  requestKey: string;
  createdAt: Date;
} | null | undefined;

type RoadmapTaskData = {
  id: string;
  roadmapId: string;
  day: number;
  position: number;
  skillSlug: string;
  title: string;
  description: string;
  estMinutes: number;
  resourceQuery: string;
  completed: boolean;
  completedAt: Date | null;
};

type RoadmapData = {
  id: string;
  userId: number;
  analysisId: string;
  targetRole: string;
  source: string;
  createdAt: Date;
  days: Array<{ day: number; tasks: RoadmapTaskData[] }>;
} | null | undefined;

type InterviewQuestionData = {
  id: string;
  interviewId: string;
  position: number;
  type: string;
  skillSlug: string | null;
  question: string;
  rubric: string;
};

type InterviewAnswerData = {
  id: string;
  interviewId: string;
  questionId: string;
  answer: string | null;
  skipped: boolean;
  score: number | null;
  strength: string | null;
  improvement: string | null;
};

type InterviewData = {
  id: string;
  userId: number;
  analysisId: string;
  targetRole: string;
  status: string;
  source: string;
  interviewScore: number | null;
  readinessScore: number | null;
  feedback: unknown;
  completedAt: Date | null;
  createdAt: Date;
  questions: InterviewQuestionData[];
  answers: InterviewAnswerData[];
} | null | undefined;

type InternshipData = Array<{
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "Remote" | "Hibrid" | "Ofis";
  role: string;
  description: string;
  required: string[];
  preferred: string[];
  score: number;
  source: string;
  matchedSkills: Array<{ slug: string; name: string; level: number | undefined }>;
  missingSkills: Array<{ slug: string; name: string; currentLevel: number; requiredLevel: number }>;
}> | undefined;

type InterviewResultData = {
  interviewScore: number;
  roleReadiness: number;
  readinessScore: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
  source: string;
} | null | undefined;

// ─── Context types ─────────────────────────────────────────────────────────
type CareerContextValue = {
  role: RoleSlug;
  setRole: (role: RoleSlug) => void;
  analysisId: string | null;
  roadmapId: string | null;
  interviewId: string | null;
  analysis: AnalysisData;
  analysisLoading: boolean;
  internships: InternshipData;
  internshipsLoading: boolean;
  roadmap: RoadmapData;
  roadmapLoading: boolean;
  interview: InterviewData;
  interviewLoading: boolean;
  setAnalysisId: (id: string) => void;
  createRoadmap: () => Promise<string | null>;
  createRoadmapLoading: boolean;
  toggleTask: (taskId: string, completed: boolean) => void;
  createInterview: () => Promise<string | null>;
  createInterviewLoading: boolean;
  saveAnswer: (params: { interviewId: string; questionId: string; answer: string; skipped: boolean }) => Promise<void>;
  completeInterview: (interviewId: string) => Promise<void>;
  interviewResult: InterviewResultData;
  resetJourney: () => void;
};

const CareerContext = createContext<CareerContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────
export function CareerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData>(loadSession);

  useEffect(() => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const { role, analysisId, roadmapId, interviewId } = session;

  // ── Queries ───────────────────────────────────────────────────────────
  const analysisQuery = trpc.career.getAnalysis.useQuery(
    { analysisId: analysisId! },
    { enabled: Boolean(analysisId), staleTime: 60_000 },
  );

  const internshipsQuery = trpc.career.internships.useQuery(role, {
    staleTime: 60_000,
  });

  const roadmapQuery = trpc.career.getRoadmap.useQuery(
    { roadmapId: roadmapId! },
    { enabled: Boolean(roadmapId), staleTime: 30_000 },
  );

  const interviewQuery = trpc.career.getInterview.useQuery(
    { interviewId: interviewId! },
    { enabled: Boolean(interviewId), staleTime: 10_000 },
  );

  // ── Mutations ─────────────────────────────────────────────────────────
  const utils = trpc.useUtils();

  const createRoadmapMutation = trpc.career.createRoadmap.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSession((prev) => ({ ...prev, roadmapId: data.id }));
        void utils.career.getRoadmap.invalidate();
      }
    },
  });

  const setTaskMutation = trpc.career.setTaskCompleted.useMutation({
    onSuccess: () => {
      if (roadmapId) void utils.career.getRoadmap.invalidate({ roadmapId });
    },
  });

  const createInterviewMutation = trpc.career.createInterview.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSession((prev) => ({ ...prev, interviewId: data.id }));
        void utils.career.getInterview.invalidate();
      }
    },
  });

  const saveAnswerMutation = trpc.career.saveAnswer.useMutation({
    onSuccess: () => {
      if (interviewId) void utils.career.getInterview.invalidate({ interviewId });
    },
  });

  const completeInterviewMutation = trpc.career.completeInterview.useMutation({
    onSuccess: () => {
      if (interviewId) void utils.career.getInterview.invalidate({ interviewId });
    },
  });

  // ── Action callbacks ──────────────────────────────────────────────────
  const setRole = useCallback((newRole: RoleSlug) => {
    setSession((prev) => ({ ...prev, role: newRole }));
    void utils.career.internships.invalidate();
  }, [utils]);

  const setAnalysisId = useCallback((id: string) => {
    setSession((prev) => ({ ...prev, analysisId: id, roadmapId: null, interviewId: null }));
  }, []);

  const createRoadmap = useCallback(async () => {
    if (!analysisId) return null;
    const result = await createRoadmapMutation.mutateAsync({ analysisId });
    return result?.id ?? null;
  }, [analysisId, createRoadmapMutation]);

  const toggleTask = useCallback(
    (taskId: string, completed: boolean) => {
      setTaskMutation.mutate({ taskId, completed });
    },
    [setTaskMutation],
  );

  const createInterview = useCallback(async () => {
    if (!analysisId) return null;
    const result = await createInterviewMutation.mutateAsync({ analysisId });
    return result?.id ?? null;
  }, [analysisId, createInterviewMutation]);

  const saveAnswer = useCallback(
    async (params: { interviewId: string; questionId: string; answer: string; skipped: boolean }) => {
      await saveAnswerMutation.mutateAsync(params);
    },
    [saveAnswerMutation],
  );

  const completeInterview = useCallback(
    async (iId: string) => {
      await completeInterviewMutation.mutateAsync({ interviewId: iId });
    },
    [completeInterviewMutation],
  );

  const resetJourney = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setSession(defaultSession);
    void utils.career.getAnalysis.invalidate();
    void utils.career.getRoadmap.invalidate();
    void utils.career.getInterview.invalidate();
  }, [utils]);

  const value: CareerContextValue = {
    role,
    setRole,
    analysisId,
    roadmapId,
    interviewId,
    analysis: analysisQuery.data as AnalysisData,
    analysisLoading: analysisQuery.isLoading && Boolean(analysisId),
    internships: internshipsQuery.data as InternshipData,
    internshipsLoading: internshipsQuery.isLoading,
    roadmap: roadmapQuery.data as RoadmapData,
    roadmapLoading: roadmapQuery.isLoading && Boolean(roadmapId),
    interview: interviewQuery.data as InterviewData,
    interviewLoading: interviewQuery.isLoading && Boolean(interviewId),
    setAnalysisId,
    createRoadmap,
    createRoadmapLoading: createRoadmapMutation.isPending,
    toggleTask,
    createInterview,
    createInterviewLoading: createInterviewMutation.isPending,
    saveAnswer,
    completeInterview,
    interviewResult: completeInterviewMutation.data as InterviewResultData,
    resetJourney,
  };

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error("useCareer must be used within CareerProvider");
  return context;
}

export function useRequireAnalysis() {
  const career = useCareer();
  const roleDefinition = roles.find((r) => r.slug === career.role) ?? roles[0];
  return { ...career, roleDefinition };
}
