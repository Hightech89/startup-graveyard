"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/toast-context";
import { supabase } from "@/src/lib/supabase";

const CAUSE_PRESETS = [
  "Ran out of funding",
  "No product-market fit",
  "Co-founder conflict",
  "Could not acquire users",
  "Regulatory or legal issues",
  "Burned out / shut down voluntarily",
] as const;

export function SubmitStartupForm() {
  const showToast = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [causePreset, setCausePreset] = useState<string>(CAUSE_PRESETS[0]);
  const [causeCustom, setCauseCustom] = useState("");
  const [finalLesson, setFinalLesson] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsAuth(false);

    const causeOfDeath =
      causePreset === "__other__" ? causeCustom.trim() : causePreset;

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!shortDescription.trim()) {
      setError("Short description is required.");
      return;
    }
    if (!causeOfDeath) {
      setError("Cause of death is required.");
      return;
    }
    if (!finalLesson.trim()) {
      setError("Final lesson is required.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const sessionMissing =
      !!userError &&
      /auth session missing|session missing/i.test(userError.message);

    if (!user || sessionMissing) {
      setLoading(false);
      setNeedsAuth(true);
      setError("You must be logged in to submit a startup.");
      showToast("You must be logged in to do that.", "error");
      return;
    }

    if (userError) {
      setLoading(false);
      setError("Unable to verify your session. Please try again.");
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    const { error: insertError } = await supabase.from("startups").insert({
      user_id: user.id,
      name: name.trim(),
      short_description: shortDescription.trim(),
      cause_of_death: causeOfDeath,
      final_lesson: finalLesson.trim(),
      tags,
      upvotes: 0,
    });

    setLoading(false);

    if (insertError) {
      setError("Something went wrong. Try again.");
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    showToast("Startup submitted");
    router.push("/");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-50 outline-none ring-orange-500/0 transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";
  const labelClass = "text-sm font-semibold text-zinc-300";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
      {error ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
          {needsAuth ? (
            <Link
              href="/auth"
              className="ml-3 inline-flex items-center rounded-lg border border-orange-500/60 bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-200 transition hover:bg-orange-500/25"
            >
              Go to /auth
            </Link>
          ) : null}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="shortDescription" className={labelClass}>
          Short description
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          rows={3}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className={`${inputClass} resize-y min-h-[5rem]`}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="causeOfDeath" className={labelClass}>
          Cause of death
        </label>
        <select
          id="causeOfDeath"
          name="causeOfDeath"
          value={causePreset}
          onChange={(e) => setCausePreset(e.target.value)}
          className={inputClass}
          disabled={loading}
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
            id="causeCustom"
            name="causeCustom"
            rows={2}
            placeholder="Describe what happened…"
            value={causeCustom}
            onChange={(e) => setCauseCustom(e.target.value)}
            className={`${inputClass} mt-2 resize-y min-h-[4rem]`}
            disabled={loading}
          />
        ) : null}
      </div>

      <div>
        <label htmlFor="finalLesson" className={labelClass}>
          Final lesson
        </label>
        <textarea
          id="finalLesson"
          name="finalLesson"
          rows={3}
          value={finalLesson}
          onChange={(e) => setFinalLesson(e.target.value)}
          className={`${inputClass} resize-y min-h-[5rem]`}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="tags" className={labelClass}>
          Tags <span className="font-normal text-zinc-500">(comma-separated)</span>
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="e.g. B2B, SaaS, AI"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-orange-500/60 bg-orange-500/15 px-5 py-2.5 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit startup"}
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
