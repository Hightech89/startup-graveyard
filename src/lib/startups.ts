import type { Startup } from "@/types/startup";
import { supabase } from "./supabase";

type StartupRow = {
  id: string;
  name: string;
  short_description: string;
  cause_of_death: string;
  final_lesson: string;
  tags: string[] | null;
  created_at: string;
};

function mapRow(row: StartupRow, upvotes: number): Startup {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    causeOfDeath: row.cause_of_death,
    finalLesson: row.final_lesson,
    tags: row.tags ?? [],
    upvotes,
    createdAt: row.created_at,
  };
}

async function getStartupVoteCounts(
  startupIds: string[],
): Promise<Record<string, number>> {
  if (startupIds.length === 0) return {};

  const { data, error } = await supabase
    .from("startup_votes")
    .select("startup_id")
    .in("startup_id", startupIds);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    const key = row.startup_id;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

export async function getStartups(): Promise<Startup[]> {
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, name, short_description, cause_of_death, final_lesson, tags, created_at",
    );

  if (error || !data) return [];

  const startups = data as StartupRow[];
  const voteCounts = await getStartupVoteCounts(startups.map((s) => s.id));

  return startups.map((s) => mapRow(s, voteCounts[s.id] ?? 0));
}

export async function getStartupById(id: string): Promise<Startup | null> {
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, name, short_description, cause_of_death, final_lesson, tags, created_at",
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const voteCounts = await getStartupVoteCounts([id]);

  return mapRow(data as StartupRow, voteCounts[id] ?? 0);
}
