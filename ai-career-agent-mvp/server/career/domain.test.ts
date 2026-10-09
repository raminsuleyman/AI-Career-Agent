import { describe, expect, it } from "vitest";
import { computeGaps, computeRoleReadiness, createAnalysisInput, extractSkills } from "./domain";

describe("Career deterministic domain", () => {
  it("extracts supported skills with matching CV evidence", () => {
    const text = "Mən kompüter elmləri tələbəsiyəm. React, JavaScript və Git ilə task tətbiqi hazırlamışam.";
    const skills = extractSkills(text);
    expect(skills.map((item) => item.slug)).toEqual(expect.arrayContaining(["react", "javascript", "git"]));
    expect(skills.every((item) => text.includes(item.evidence))).toBe(true);
  });

  it("computes stable readiness and ordered role gaps", () => {
    const skills = extractSkills("HTML CSS JavaScript React Git");
    expect(computeRoleReadiness(skills, "frontend")).toBe(34);
    const gaps = computeGaps(skills, "frontend");
    expect(gaps.map((gap) => gap.slug)).toEqual(["html", "css", "javascript", "typescript", "react", "git"]);
  });

  it("enforces CV length and request-key validation", () => {
    expect(createAnalysisInput.safeParse({ text: "short", targetRole: "frontend", requestKey: "not-a-uuid" }).success).toBe(false);
    expect(createAnalysisInput.safeParse({ text: "A".repeat(200), targetRole: "frontend", requestKey: "7fd67a8f-e1a5-49af-9165-85cb09917005" }).success).toBe(true);
  });
});
