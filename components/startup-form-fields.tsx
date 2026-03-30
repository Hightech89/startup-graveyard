"use client";

import { CAUSE_PRESETS } from "@/src/lib/startup-form";

export const startupFormInputClass =
  "mt-1 w-full min-w-0 max-w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-50 outline-none ring-orange-500/0 transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

export const startupFormLabelClass = "text-sm font-semibold text-zinc-300";

export type StartupFormFieldsProps = {
  idPrefix?: string;
  disabled?: boolean;
  name: string;
  onNameChange: (value: string) => void;
  shortDescription: string;
  onShortDescriptionChange: (value: string) => void;
  causePreset: string;
  onCausePresetChange: (value: string) => void;
  causeCustom: string;
  onCauseCustomChange: (value: string) => void;
  finalLesson: string;
  onFinalLessonChange: (value: string) => void;
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
};

export function StartupFormFields({
  idPrefix = "",
  disabled = false,
  name,
  onNameChange,
  shortDescription,
  onShortDescriptionChange,
  causePreset,
  onCausePresetChange,
  causeCustom,
  onCauseCustomChange,
  finalLesson,
  onFinalLessonChange,
  tagsInput,
  onTagsInputChange,
}: StartupFormFieldsProps) {
  const pid = idPrefix;

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <label htmlFor={`${pid}name`} className={startupFormLabelClass}>
          Name
        </label>
        <input
          id={`${pid}name`}
          name="name"
          type="text"
          autoComplete="off"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={startupFormInputClass}
          disabled={disabled}
        />
      </div>

      <div>
        <label
          htmlFor={`${pid}shortDescription`}
          className={startupFormLabelClass}
        >
          Short description
        </label>
        <textarea
          id={`${pid}shortDescription`}
          name="shortDescription"
          rows={3}
          value={shortDescription}
          onChange={(e) => onShortDescriptionChange(e.target.value)}
          className={`${startupFormInputClass} min-h-[5rem] resize-y`}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor={`${pid}causeOfDeath`} className={startupFormLabelClass}>
          Cause of death
        </label>
        <select
          id={`${pid}causeOfDeath`}
          name="causeOfDeath"
          value={causePreset}
          onChange={(e) => onCausePresetChange(e.target.value)}
          className={startupFormInputClass}
          disabled={disabled}
        >
          {CAUSE_PRESETS.map((opt) => (
            <option key={opt} value={opt} className="bg-zinc-900">
              {opt}
            </option>
          ))}
          <option value="__other__" className="bg-zinc-900">
            Other…
          </option>
        </select>
        {causePreset === "__other__" ? (
          <textarea
            id={`${pid}causeCustom`}
            name="causeCustom"
            rows={2}
            placeholder="Describe what happened…"
            value={causeCustom}
            onChange={(e) => onCauseCustomChange(e.target.value)}
            className={`${startupFormInputClass} mt-2 min-h-[4rem] resize-y`}
            disabled={disabled}
          />
        ) : null}
      </div>

      <div>
        <label htmlFor={`${pid}finalLesson`} className={startupFormLabelClass}>
          Final lesson
        </label>
        <textarea
          id={`${pid}finalLesson`}
          name="finalLesson"
          rows={3}
          value={finalLesson}
          onChange={(e) => onFinalLessonChange(e.target.value)}
          className={`${startupFormInputClass} min-h-[5rem] resize-y`}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor={`${pid}tags`} className={startupFormLabelClass}>
          Tags{" "}
          <span className="font-normal text-zinc-500">(comma-separated)</span>
        </label>
        <input
          id={`${pid}tags`}
          name="tags"
          type="text"
          placeholder="e.g. B2B, SaaS, AI"
          value={tagsInput}
          onChange={(e) => onTagsInputChange(e.target.value)}
          className={startupFormInputClass}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
