import type { Startup } from "@/types/startup";
import { supabase } from "./supabase";

type StartupRow = {
  id: string;
  user_id?: string | null;
  name: string;
  short_description: string;
  cause_of_death: string;
  final_lesson: string;
  tags: string[] | null;
  created_at: string;
};

function mapRow(row: StartupRow, upvotes: number): Startup {
  return {
    id: String(row.id),
    userId: row.user_id ?? undefined,
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
  const normalizedIds = [
    ...new Set(
      startupIds.map((id) => String(id)).filter((id) => id.length > 0),
    ),
  ];
  if (normalizedIds.length === 0) return {};

  const { data, error } = await supabase
    .from("startup_votes")
    .select("startup_id")
    .in("startup_id", normalizedIds);

  if (error || !data) {
    if (process.env.NODE_ENV === "development" && error) {
      console.warn("[vote] getStartupVoteCounts failed:", error.message);
    }
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data) {
    const key =
      row.startup_id != null ? String(row.startup_id) : "";
    if (!key) continue;
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
  const voteCounts = await getStartupVoteCounts(
    startups.map((s) => String(s.id)),
  );

  if (process.env.NODE_ENV === "development" && startups.length > 0) {
    const keys = Object.keys(voteCounts);
    console.debug("[vote:server] getStartups", {
      startupIdsSample: startups.slice(0, 5).map((s) => s.id),
      voteCountKeysSample: keys.slice(0, 5),
      voteCountMapSize: keys.length,
    });
  }

  return startups.map((s) =>
    mapRow(s, voteCounts[String(s.id)] ?? 0),
  );
}

export async function getStartupsByUserId(userId: string): Promise<Startup[]> {
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, user_id, name, short_description, cause_of_death, final_lesson, tags, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const startups = data as StartupRow[];
  const voteCounts = await getStartupVoteCounts(
    startups.map((s) => String(s.id)),
  );

  return startups.map((s) =>
    mapRow(s, voteCounts[String(s.id)] ?? 0),
  );
}

export async function getStartupById(id: string): Promise<Startup | null> {
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, user_id, name, short_description, cause_of_death, final_lesson, tags, created_at",
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const row = data as StartupRow;
  const idKey = String(row.id);
  const voteCounts = await getStartupVoteCounts([idKey]);

  return mapRow(row, voteCounts[idKey] ?? 0);
}
