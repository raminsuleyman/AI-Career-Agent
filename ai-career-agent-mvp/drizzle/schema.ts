import {
  boolean,
  index,
  int,
  json,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Existing Manus OAuth users table. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const cvDocuments = mysqlTable(
  "cv_documents",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    source: mysqlEnum("source", ["paste", "file_text"]).default("paste").notNull(),
    text: longtext("text").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({ userCreatedIdx: index("cv_documents_user_created_idx").on(table.userId, table.createdAt) }),
);

export const analyses = mysqlTable(
  "analyses",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    cvId: varchar("cv_id", { length: 36 }).notNull().references(() => cvDocuments.id, { onDelete: "cascade" }),
    requestKey: varchar("request_key", { length: 64 }).notNull(),
    targetRole: mysqlEnum("target_role", ["frontend", "backend", "fullstack", "data", "qa", "ux"]).notNull(),
    candidateLevel: mysqlEnum("candidate_level", ["student", "junior", "unknown"]).default("unknown").notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    skills: json("skills").$type<Array<{ slug: string; level: 1 | 2 | 3; evidence: string }>>().notNull(),
    highlights: json("highlights").$type<string[]>().notNull(),
    roleReadiness: int("role_readiness").notNull(),
    source: mysqlEnum("source", ["real", "mock"]).default("mock").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("analyses_user_created_idx").on(table.userId, table.createdAt),
    idempotency: uniqueIndex("analyses_user_request_unique").on(table.userId, table.requestKey),
  }),
);

export const roadmaps = mysqlTable(
  "roadmaps",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    analysisId: varchar("analysis_id", { length: 36 }).notNull().references(() => analyses.id, { onDelete: "cascade" }),
    targetRole: mysqlEnum("target_role", ["frontend", "backend", "fullstack", "data", "qa", "ux"]).notNull(),
    source: mysqlEnum("source", ["real", "mock"]).default("mock").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({ ownerIdx: index("roadmaps_user_created_idx").on(table.userId, table.createdAt) }),
);

export const roadmapTasks = mysqlTable(
  "roadmap_tasks",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    roadmapId: varchar("roadmap_id", { length: 36 }).notNull().references(() => roadmaps.id, { onDelete: "cascade" }),
    day: int("day").notNull(),
    position: int("position").notNull(),
    skillSlug: varchar("skill_slug", { length: 48 }).notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    description: varchar("description", { length: 400 }).notNull(),
    estMinutes: int("est_minutes").notNull(),
    resourceQuery: varchar("resource_query", { length: 120 }).notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({ roadmapDayIdx: index("roadmap_tasks_roadmap_day_idx").on(table.roadmapId, table.day) }),
);

export const interviews = mysqlTable(
  "interviews",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    analysisId: varchar("analysis_id", { length: 36 }).notNull().references(() => analyses.id, { onDelete: "cascade" }),
    targetRole: mysqlEnum("target_role", ["frontend", "backend", "fullstack", "data", "qa", "ux"]).notNull(),
    status: mysqlEnum("status", ["in_progress", "completed"]).default("in_progress").notNull(),
    source: mysqlEnum("source", ["real", "mock"]).default("mock").notNull(),
    interviewScore: int("interview_score"),
    readinessScore: int("readiness_score"),
    feedback: json("feedback").$type<{ strengths: string[]; improvements: string[]; nextSteps: string[] } | null>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({ ownerIdx: index("interviews_user_created_idx").on(table.userId, table.createdAt) }),
);

export const interviewQuestions = mysqlTable(
  "interview_questions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    interviewId: varchar("interview_id", { length: 36 }).notNull().references(() => interviews.id, { onDelete: "cascade" }),
    position: int("position").notNull(),
    type: mysqlEnum("type", ["technical", "experience", "behavioral", "scenario"]).notNull(),
    skillSlug: varchar("skill_slug", { length: 48 }),
    question: varchar("question", { length: 300 }).notNull(),
    rubric: varchar("rubric", { length: 400 }),
  },
  (table) => ({ positionUnique: uniqueIndex("interview_questions_position_unique").on(table.interviewId, table.position) }),
);

export const interviewAnswers = mysqlTable(
  "interview_answers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    interviewId: varchar("interview_id", { length: 36 }).notNull().references(() => interviews.id, { onDelete: "cascade" }),
    questionId: varchar("question_id", { length: 36 }).notNull().references(() => interviewQuestions.id, { onDelete: "cascade" }),
    answer: longtext("answer"),
    skipped: boolean("skipped").default(false).notNull(),
    score: int("score"),
    strength: varchar("strength", { length: 160 }),
    improvement: varchar("improvement", { length: 160 }),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ questionUnique: uniqueIndex("interview_answers_question_unique").on(table.questionId) }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CvDocument = typeof cvDocuments.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;
export type Roadmap = typeof roadmaps.$inferSelect;
export type RoadmapTask = typeof roadmapTasks.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
