/** Exact listed-skill evidence, not a fit score or a proficiency assessment. */
export function getRoleEvidence(role, skills = [], industrySkills = []) {
  const clean = values => [...new Set((Array.isArray(values) ? values : []).filter(s => typeof s === "string" && s.trim()).map(s => s.trim()))];
  const listed = clean(skills);
  const roleRequirements = clean(role?.skills);
  const requirements = roleRequirements.length ? roleRequirements : clean(industrySkills);
  const normalize = s => s.toLowerCase();
  const existing = new Set(listed.map(normalize));
  return {
    scope: roleRequirements.length ? "role" : "industry",
    transferable: requirements.filter(s => existing.has(normalize(s))),
    toExplore: requirements.filter(s => !existing.has(normalize(s))),
    listed,
  };
}
