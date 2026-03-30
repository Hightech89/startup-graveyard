"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast-context";
import { StartupFormFields } from "@/components/startup-form-fields";
import {
  computeCauseOfDeath,
  tagsFromInput,
  validateStartupFields,
} from "@/src/lib/startup-form";
import { supabase } from "@/src/lib/supabase";

export function SubmitStartupForm() {
  const showToast = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [causePreset, setCausePreset] = useState<string>("Ran out of funding");
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

    const causeOfDeath = computeCauseOfDeath(
      causePreset,
      causeCustom.trim(),
    );

    const validationError = validateStartupFields({
      name,
      shortDescription,
      causeOfDeath,
      finalLesson,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    const tags = tagsFromInput(tagsInput);

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

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full min-w-0 max-w-xl space-y-5"
    >
      {error ? (
        <p
          className="break-words rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
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

      <StartupFormFields
        disabled={loading}
        name={name}
        onNameChange={setName}
        shortDescription={shortDescription}
        onShortDescriptionChange={setShortDescription}
        causePreset={causePreset}
        onCausePresetChange={setCausePreset}
        causeCustom={causeCustom}
        onCauseCustomChange={setCauseCustom}
        finalLesson={finalLesson}
        onFinalLessonChange={setFinalLesson}
        tagsInput={tagsInput}
        onTagsInputChange={setTagsInput}
      />

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
