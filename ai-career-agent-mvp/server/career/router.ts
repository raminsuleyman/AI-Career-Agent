import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { answerInput, createAnalysisInput, createInterviewInput, createRoadmapInput, interviewIdInput, roadmapIdInput, roleSchema, toggleTaskInput } from "./domain";
import * as service from "./service";

function mapDatabaseError(error: unknown): never {
  if (error instanceof TRPCError) throw error;
  console.error("[career] request failed", error instanceof Error ? error.message : "unknown error");
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Career əməliyyatı alınmadı. Bir az sonra yenidən cəhd edin." });
}

export const careerRouter = router({
  roles: protectedProcedure.query(() => service.listRoles()),
  internships: protectedProcedure.input(roleSchema.optional()).query(async ({ ctx, input }) => {
    try {
      const latest = await service.getLatestAnalysis(ctx.user.id);
      return service.listInternships(latest?.skills as Array<{ slug: string; level: number }> ?? [], input ?? latest?.targetRole ?? "frontend");
    } catch (error) { return mapDatabaseError(error); }
  }),
  createAnalysis: protectedProcedure.input(createAnalysisInput).mutation(async ({ ctx, input }) => {
    try { return await service.createAnalysis(ctx.user.id, input); }
    catch (error) { return mapDatabaseError(error); }
  }),
  getAnalysis: protectedProcedure.input(createRoadmapInput).query(async ({ ctx, input }) => {
    try {
      const analysis = await service.getAnalysis(ctx.user.id, input.analysisId);
      if (!analysis) throw new TRPCError({ code: "NOT_FOUND", message: "Analiz tapılmadı" });
      return analysis;
    } catch (error) { return mapDatabaseError(error); }
  }),
  createRoadmap: protectedProcedure.input(createRoadmapInput).mutation(async ({ ctx, input }) => {
    try {
      const result = await service.createRoadmap(ctx.user.id, input.analysisId);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Analiz tapılmadı" });
      return result;
    } catch (error) { return mapDatabaseError(error); }
  }),
  getRoadmap: protectedProcedure.input(roadmapIdInput).query(async ({ ctx, input }) => {
    try {
      const result = await service.getRoadmap(ctx.user.id, input.roadmapId);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Roadmap tapılmadı" });
      return result;
    } catch (error) { return mapDatabaseError(error); }
  }),
  setTaskCompleted: protectedProcedure.input(toggleTaskInput).mutation(async ({ ctx, input }) => {
    try {
      const result = await service.setTaskCompleted(ctx.user.id, input.taskId, input.completed);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Task tapılmadı" });
      return result;
    } catch (error) { return mapDatabaseError(error); }
  }),
  createInterview: protectedProcedure.input(createInterviewInput).mutation(async ({ ctx, input }) => {
    try {
      const result = await service.createInterview(ctx.user.id, input.analysisId);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Analiz tapılmadı" });
      return result;
    } catch (error) { return mapDatabaseError(error); }
  }),
  getInterview: protectedProcedure.input(interviewIdInput).query(async ({ ctx, input }) => {
    try {
      const result = await service.getInterview(ctx.user.id, input.interviewId);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Müsahibə tapılmadı" });
      return result;
    } catch (error) { return mapDatabaseError(error); }
  }),
  saveAnswer: protectedProcedure.input(answerInput).mutation(async ({ ctx, input }) => {
    try {
      const result = await service.saveAnswer(ctx.user.id, input);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Müsahibə sualı tapılmadı" });
      return result;
    } catch (error) { return mapDatabaseError(error); }
  }),
  completeInterview: protectedProcedure.input(interviewIdInput).mutation(async ({ ctx, input }) => {
    try {
      const result = await service.completeInterview(ctx.user.id, input.interviewId);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Müsahibə tapılmadı" });
      return result;
    } catch (error) { return mapDatabaseError(error); }
  }),
  deleteMyData: protectedProcedure.mutation(async ({ ctx }) => {
    try { return await service.deleteMyData(ctx.user.id); }
    catch (error) { return mapDatabaseError(error); }
  }),
});
