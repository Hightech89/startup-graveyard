import type { Startup } from "@/types/startup";
import { supabase } from "./supabase";
import { getUserEmailsById } from "./user-identities";

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

type ProfileNicknameRow = {
  id: string;
  nickname: string | null;
};

function mapRow(
  row: StartupRow,
  upvotes: number,
  authorName?: string | null,
  authorEmail?: string | null,
): Startup {
  return {
    id: String(row.id),
    userId: row.user_id ?? undefined,
    authorName: authorName ?? undefined,
    authorEmail: authorEmail ?? undefined,
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

async function getProfileNicknames(
  userIds: string[],
): Promise<Record<string, string>> {
  const ids = [
    ...new Set(userIds.map((id) => String(id)).filter((id) => id.length > 0)),
  ];
  if (ids.length === 0) return {};

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname")
    .in("id", ids);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data as ProfileNicknameRow[]) {
    const id = String(row.id);
    const nickname = typeof row.nickname === "string" ? row.nickname.trim() : "";
    if (id && nickname.length > 0) {
      map[id] = nickname;
    }
  }
  return map;
}

export async function getStartups(): Promise<Startup[]> {
  const { data, error } = await supabase
    .from("startups")
    .select(
      "id, user_id, name, short_description, cause_of_death, final_lesson, tags, created_at",
    );

  if (error || !data) return [];

  const startups = data as StartupRow[];
  const voteCounts = await getStartupVoteCounts(
    startups.map((s) => String(s.id)),
  );
  const authorUserIds = startups
    .map((s) => (s.user_id ? String(s.user_id) : ""))
    .filter(Boolean);
  const [nicknameByUserId, emailByUserId] = await Promise.all([
    getProfileNicknames(authorUserIds),
    getUserEmailsById(supabase, authorUserIds),
  ]);

  if (process.env.NODE_ENV === "development" && startups.length > 0) {
    const keys = Object.keys(voteCounts);
    console.debug("[vote:server] getStartups", {
      startupIdsSample: startups.slice(0, 5).map((s) => s.id),
      voteCountKeysSample: keys.slice(0, 5),
      voteCountMapSize: keys.length,
    });
  }

  return startups.map((s) => {
    const userId = s.user_id ? String(s.user_id) : "";
    return mapRow(
      s,
      voteCounts[String(s.id)] ?? 0,
      userId ? nicknameByUserId[userId] ?? null : null,
      userId ? emailByUserId[userId] ?? null : null,
    );
  });
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
  const authorUserIds = startups
    .map((s) => (s.user_id ? String(s.user_id) : ""))
    .filter(Boolean);
  const [nicknameByUserId, emailByUserId] = await Promise.all([
    getProfileNicknames(authorUserIds),
    getUserEmailsById(supabase, authorUserIds),
  ]);

  return startups.map((s) => {
    const uid = s.user_id ? String(s.user_id) : "";
    return mapRow(
      s,
      voteCounts[String(s.id)] ?? 0,
      uid ? nicknameByUserId[uid] ?? null : null,
      uid ? emailByUserId[uid] ?? null : null,
    );
  });
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
  const authorUserIds = row.user_id ? [String(row.user_id)] : [];
  const [nicknameByUserId, emailByUserId] = await Promise.all([
    getProfileNicknames(authorUserIds),
    getUserEmailsById(supabase, authorUserIds),
  ]);

  return mapRow(
    row,
    voteCounts[idKey] ?? 0,
    row.user_id ? nicknameByUserId[String(row.user_id)] ?? null : null,
    row.user_id ? emailByUserId[String(row.user_id)] ?? null : null,
  );
}
