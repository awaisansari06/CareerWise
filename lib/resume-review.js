function entryText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(entryText).filter(Boolean).join(" · ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined && item !== "")
      .map(([key, item]) => `${key.replace(/[_-]/g, " ")}: ${entryText(item)}`)
      .join("\n");
  }
  return "";
}

/** Preserve only extracted content; a reconstructed preview is not the original PDF. */
export function parseResumeDocument(content) {
  let parsed = content;
  if (typeof content === "string") {
    try { parsed = JSON.parse(content); }
    catch { return { name: "", contact: [], industry: "", sections: [], rawText: content }; }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { name: "", contact: [], industry: "", sections: [], rawText: typeof content === "string" ? content : "" };
  }
  const definitions = [
    ["summary", "Summary"], ["experience", "Experience"], ["education", "Education"],
    ["skills", "Skills"], ["projects", "Projects"], ["languages", "Languages"], ["hobbies", "Interests"],
  ];
  return {
    name: typeof parsed.name === "string" ? parsed.name : "",
    contact: [parsed.email, parsed.phone].filter((item) => typeof item === "string" && item.trim()),
    industry: typeof parsed.industry === "string" ? parsed.industry : "",
    sections: definitions.flatMap(([key, title]) => {
      const value = parsed[key];
      const items = (Array.isArray(value) ? value : [value]).map(entryText).filter(Boolean);
      return items.length ? [{ key, title, items }] : [];
    }),
    rawText: "",
  };
}

export function resumeDocumentToText(document) {
  if (!document) return "";
  if (document.rawText) return document.rawText;
  return [document.name, document.industry, document.contact.join(" | "), ...document.sections.map((section) => `${section.title.toUpperCase()}\n${section.items.join("\n\n")}`)]
    .filter(Boolean).join("\n\n");
}

export function diagnosticScore(value) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(Math.max(0, Math.min(100, value))) : null;
}
