import type { Startup } from "@/types/startup";
import { supabase } from "./supabase";

type StartupRow = {
  id: string;
  name: string;
  short_description: string;
  cause_of_death: string;
  final_lesson: string;
  tags: string[] | null;
  upvotes: number;
  created_at: string;
};

function mapRow(row: StartupRow): Startup {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description,
    causeOfDeath: row.cause_of_death,
    finalLesson: row.final_lesson,
    tags: row.tags ?? [],
    upvotes: row.upvotes,
    createdAt: row.created_at,
  };
}

export async function getStartups(): Promise<Startup[]> {
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, name, short_description, cause_of_death, final_lesson, tags, upvotes, created_at",
    );

  if (error || !data) return [];

  return (data as StartupRow[]).map(mapRow);
}
