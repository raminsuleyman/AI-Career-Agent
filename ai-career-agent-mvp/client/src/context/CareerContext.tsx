import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createInterview,
  createRoadmap,
  demoProfile,
  getFeedback,
  getGaps,
  getMatches,
  getRole,
  roleReadiness,
  skills,
  type InterviewQuestion,
  type RoadmapDay,
  type RoleSlug,
  type SkillEntry,
  type SkillLevel,
  type SkillSlug,
} from "@/data/career";

type CareerState = {
  role: RoleSlug;
  hasAnalysis: boolean;
  skills: SkillEntry[];
  roadmap: RoadmapDay[] | null;
  interviewAnswers: Record<string, string>;
  interviewQuestions: InterviewQuestion[] | null;
  demoDismissed: boolean;
};

type CareerContextValue = CareerState & {
  readiness: number;
  gaps: ReturnType<typeof getGaps>;
  matches: ReturnType<typeof getMatches>;
  profile: typeof demoProfile;
  setRole: (role: RoleSlug) => void;
  startDemoAnalysis: () => void;
  addSkill: (slug: SkillSlug) => void;
  removeSkill: (slug: SkillSlug) => void;
  setSkillLevel: (slug: SkillSlug, level: SkillLevel) => void;
  generateRoadmap: () => void;
  toggleTask: (taskId: string) => void;
  startInterview: () => void;
  saveAnswer: (questionId: string, answer: string) => void;
  dismissDemo: () => void;
  resetJourney: () => void;
  result: ReturnType<typeof getFeedback> | null;
};

const STORAGE_KEY = "career-agent-demo-v1";
const defaultState: CareerState = {
  role: "frontend",
  hasAnalysis: false,
  skills: demoProfile.skills,
  roadmap: null,
  interviewAnswers: {},
  interviewQuestions: null,
  demoDismissed: false,
};

const CareerContext = createContext<CareerContextValue | null>(null);

function loadState(): CareerState {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    return { ...defaultState, ...JSON.parse(stored) } as CareerState;
  } catch {
    return defaultState;
  }
}

export function CareerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CareerState>(loadState);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const readiness = useMemo(() => roleReadiness(state.skills, state.role), [state.role, state.skills]);
  const gaps = useMemo(() => getGaps(state.skills, state.role), [state.role, state.skills]);
  const matches = useMemo(() => getMatches(state.skills, state.role), [state.role, state.skills]);
  const result = useMemo(
    () => (state.interviewQuestions ? getFeedback(state.interviewAnswers, readiness) : null),
    [readiness, state.interviewAnswers, state.interviewQuestions],
  );

  const value: CareerContextValue = {
    ...state,
    readiness,
    gaps,
    matches,
    profile: demoProfile,
    result,
    setRole: (role) => setState((current) => ({ ...current, role })),
    startDemoAnalysis: () =>
      setState((current) => ({
        ...current,
        hasAnalysis: true,
        skills: current.skills.length ? current.skills : demoProfile.skills,
        demoDismissed: false,
      })),
    addSkill: (slug) =>
      setState((current) => {
        if (current.skills.some((skill) => skill.slug === slug)) return current;
        return {
          ...current,
          skills: [...current.skills, { slug, name: skills[slug].name, level: 1, origin: "user" }],
        };
      }),
    removeSkill: (slug) =>
      setState((current) => ({ ...current, skills: current.skills.filter((skill) => skill.slug !== slug) })),
    setSkillLevel: (slug, level) =>
      setState((current) => ({
        ...current,
        skills: current.skills.map((skill) => (skill.slug === slug ? { ...skill, level } : skill)),
      })),
    generateRoadmap: () =>
      setState((current) => ({
        ...current,
        roadmap: current.roadmap ?? createRoadmap(getGaps(current.skills, current.role)),
      })),
    toggleTask: (taskId) =>
      setState((current) => ({
        ...current,
        roadmap: current.roadmap?.map((day) => ({
          ...day,
          tasks: day.tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
        })) ?? null,
      })),
    startInterview: () =>
      setState((current) => ({
        ...current,
        interviewQuestions: current.interviewQuestions ?? createInterview(current.role, getGaps(current.skills, current.role)),
      })),
    saveAnswer: (questionId, answer) =>
      setState((current) => ({
        ...current,
        interviewAnswers: { ...current.interviewAnswers, [questionId]: answer },
      })),
    dismissDemo: () => setState((current) => ({ ...current, demoDismissed: true })),
    resetJourney: () => {
      window.sessionStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
    },
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
  return { ...career, roleDefinition: getRole(career.role) };
}
