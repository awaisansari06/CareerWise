import test from "node:test";
import assert from "node:assert/strict";
import { careerProfileSchema, profileToResume } from "../lib/career-profile.js";
test("manual profiles preserve supplied background without inventing qualifications", () => {
  const resume = profileToResume({ name: " Alex ", industry: " Education ", skills: "Research, Planning\nWriting", background: "Organized a student reading group at college.", careerGoal: "first" }, "alex@example.test");
  assert.equal(resume.name, "Alex");
  assert.deepEqual(resume.skills, ["Research", "Planning", "Writing"]);
  assert.deepEqual(resume.experience, ["Organized a student reading group at college."]);
  assert.deepEqual(resume.education, []);
  assert.equal(resume.careerGoal, "first");
  assert.equal(resume.email, "alex@example.test");
});
test("profile input rejects unsupported goals and oversized background before saving", () => {
  const profile = { name: "Alex", industry: "Education", skills: "Research", background: "Studied educational research at college.", careerGoal: "explore" };
  assert.equal(careerProfileSchema.safeParse(profile).success, true);
  assert.equal(careerProfileSchema.safeParse({ ...profile, careerGoal: "unknown" }).success, false);
  assert.equal(careerProfileSchema.safeParse({ ...profile, background: "x".repeat(10001) }).success, false);
  assert.equal(careerProfileSchema.safeParse({ ...profile, skills: " " }).success, false);
});
