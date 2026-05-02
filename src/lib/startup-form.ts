export const CAUSE_PRESETS = [
  "Ran out of funding",
  "No product-market fit",
  "Co-founder conflict",
  "Could not acquire users",
  "Regulatory or legal issues",
  "Burned out / shut down voluntarily",
] as const;

export const INDUSTRY_PRESETS = [
  "SaaS",
  "Fintech",
  "HealthTech",
  "E-commerce",
  "Marketplace",
  "Social",
  "Gaming",
  "Media",
  "AI",
  "EdTech",
  "Hardware",
  "Real Estate",
  "Other",
] as const;

export type IndustryPreset = (typeof INDUSTRY_PRESETS)[number];

const INDUSTRY_TO_CATEGORY_SUFFIX: Record<IndustryPreset, string> = {
  SaaS: "saas",
  Fintech: "fintech",
  HealthTech: "healthtech",
  "E-commerce": "e-commerce",
  Marketplace: "marketplace",
  Social: "social",
  Gaming: "gaming",
  Media: "media",
  AI: "ai",
  EdTech: "edtech",
  Hardware: "hardware",
  "Real Estate": "real-estate",
  Other: "other",
};

export function categoryTagFromIndustry(industry: IndustryPreset): string {
  return `category:${INDUSTRY_TO_CATEGORY_SUFFIX[industry]}`;
}

export function getCategoryTag(tags: string[]): string | null {
  for (const t of tags) {
    if (typeof t === "string" && t.toLowerCase().startsWith("category:")) {
      return t;
    }
  }
  return null;
}

export function industryFromCategoryTag(tag: string | null): IndustryPreset {
  if (!tag) return "Other";
  const normalized = String(tag).trim().toLowerCase();
  const match = (INDUSTRY_PRESETS as readonly IndustryPreset[]).find((p) => {
    return categoryTagFromIndustry(p).toLowerCase() === normalized;
  });
  return match ?? "Other";
}

export function tagsWithoutCategoryNoise(tags: string[]): string[] {
  const category = industryFromCategoryTag(getCategoryTag(tags));
  const suffix = INDUSTRY_TO_CATEGORY_SUFFIX[category];
  const deny = new Set<string>([
    `category:${suffix}`.toLowerCase(),
    suffix.toLowerCase(),
    suffix.replace(/-/g, "").toLowerCase(),
    category.toLowerCase(),
    category.toLowerCase().replace(/\s+/g, ""),
    category.toLowerCase().replace(/\s+/g, "-"),
  ]);

  return tags.filter((t) => {
    const norm = String(t ?? "").trim().toLowerCase();
    if (!norm) return false;
    if (norm.startsWith("category:")) return false;
    if (deny.has(norm)) return false;
    return true;
  });
}

/** Max comma-separated user tags (category is stored separately as `category:*`). */
export const MAX_NON_CATEGORY_TAGS = 3;

export const TAGS_OVER_LIMIT_MESSAGE =
  "You can add at most 3 tags besides your category. Remove a few and try again.";

/**
 * Parses comma-separated tag input: trim, lowercase, dedupe, drop empties and
 * any `category:*` tokens (category is chosen separately).
 */
export function parseNonCategoryTagsInput(
  input: string,
): { ok: true; tags: string[] } | { ok: false; error: string } {
  const pieces = tagsFromInput(input);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of pieces) {
    const t = p.trim().toLowerCase();
    if (!t) continue;
    if (t.startsWith("category:")) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  if (out.length > MAX_NON_CATEGORY_TAGS) {
    return { ok: false, error: TAGS_OVER_LIMIT_MESSAGE };
  }
  return { ok: true, tags: out };
}

/**
 * Tags array for DB: normalized non-category tags (max 3) plus exactly one
 * `category:*` tag for the selected preset.
 */
export function buildTagsArrayForSave(
  tagsInput: string,
  industry: IndustryPreset,
): { ok: true; tags: string[] } | { ok: false; error: string } {
  const parsed = parseNonCategoryTagsInput(tagsInput);
  if (!parsed.ok) return parsed;
  return {
    ok: true,
    tags: [...parsed.tags, categoryTagFromIndustry(industry)],
  };
}

/** Value for the tags text field when editing an existing startup. */
export function initialTagsFieldValueFromStartup(tags: string[]): string {
  const cleaned = tagsWithoutCategoryNoise(tags);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of cleaned) {
    const t = String(p).trim().toLowerCase();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_NON_CATEGORY_TAGS) break;
  }
  return out.join(", ");
}

export function computeCauseOfDeath(
  preset: string,
  customTrimmed: string,
): string {
  return preset === "__other__" ? customTrimmed : preset;
}

export function tagsFromInput(tagsInput: string): string[] {
  return tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function validateStartupFields(params: {
  name: string;
  shortDescription: string;
  causeOfDeath: string;
  finalLesson: string;
}): string | null {
  if (!params.name.trim()) {
    return "Name is required.";
  }
  if (!params.shortDescription.trim()) {
    return "Short description is required.";
  }
  if (!params.causeOfDeath) {
    return "Cause of death is required.";
  }
  if (!params.finalLesson.trim()) {
    return "Final lesson is required.";
  }
  return null;
}

export function initialCauseFields(causeOfDeath: string): {
  preset: string;
  custom: string;
} {
  const presets = CAUSE_PRESETS as readonly string[];
  if (presets.includes(causeOfDeath)) {
    return { preset: causeOfDeath, custom: "" };
  }
  return { preset: "__other__", custom: causeOfDeath };
}
