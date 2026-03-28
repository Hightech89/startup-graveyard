export const CAUSE_PRESETS = [
  "Ran out of funding",
  "No product-market fit",
  "Co-founder conflict",
  "Could not acquire users",
  "Regulatory or legal issues",
  "Burned out / shut down voluntarily",
] as const;

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
