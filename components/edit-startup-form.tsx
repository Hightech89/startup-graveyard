"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Startup } from "@/types/startup";
import { StartupFormFields } from "@/components/startup-form-fields";
import { useToast } from "@/components/toast-context";
import {
  computeCauseOfDeath,
  initialCauseFields,
  tagsFromInput,
  validateStartupFields,
} from "@/src/lib/startup-form";
import { supabase } from "@/src/lib/supabase";

type EditStartupFormProps = {
  startup: Startup;
};

function friendlyUpdateError(): string {
  return "Couldn't save changes. Please try again.";
}

export function EditStartupForm({ startup }: EditStartupFormProps) {
  const showToast = useToast();
  const router = useRouter();
  const causeInit = initialCauseFields(startup.causeOfDeath);

  const [name, setName] = useState(startup.name);
  const [shortDescription, setShortDescription] = useState(
    startup.shortDescription,
  );
  const [causePreset, setCausePreset] = useState(causeInit.preset);
  const [causeCustom, setCauseCustom] = useState(causeInit.custom);
  const [finalLesson, setFinalLesson] = useState(startup.finalLesson);
  const [tagsInput, setTagsInput] = useState(startup.tags.join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      showToast("You must be logged in to do that.", "error");
      return;
    }

    if (userError) {
      setLoading(false);
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    if (startup.userId && user.id !== startup.userId) {
      setLoading(false);
      showToast("You can't edit this startup.", "error");
      return;
    }

    const { data: updated, error: updateError } = await supabase
      .from("startups")
      .update({
        name: name.trim(),
        short_description: shortDescription.trim(),
        cause_of_death: causeOfDeath,
        final_lesson: finalLesson.trim(),
        tags,
      })
      .eq("id", startup.id)
      .eq("user_id", user.id)
      .select("id");

    setLoading(false);

    if (updateError || !updated?.length) {
      setError(friendlyUpdateError());
      showToast(friendlyUpdateError(), "error");
      return;
    }

    showToast("Startup updated");
    router.push(`/startups/${startup.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5">
      {error ? (
        <p
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <StartupFormFields
        idPrefix="edit-"
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
          {loading ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={`/startups/${startup.id}`}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
