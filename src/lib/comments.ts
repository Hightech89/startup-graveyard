import type { StartupComment } from "@/types/comment";
import { supabase } from "./supabase";
import { getUserEmailsById } from "./user-identities";

type CommentRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  nickname: string | null;
};

export async function getStartupComments(
  startupId: string,
): Promise<StartupComment[]> {
  const { data, error } = await supabase
    .from("startup_comments")
    .select("id, user_id, content, created_at")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const rows = data as CommentRow[];
  const userIds = [
    ...new Set(
      rows
        .map((row) => (row.user_id ? String(row.user_id) : ""))
        .filter(Boolean),
    ),
  ];

  let nicknameByUserId: Record<string, string | null> = {};
  const emailByUserId = await getUserEmailsById(supabase, userIds);
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nickname")
      .in("id", userIds);

    if (!profilesError && profiles) {
      nicknameByUserId = Object.fromEntries(
        (profiles as ProfileRow[]).map((p) => [
          String(p.id),
          typeof p.nickname === "string" ? p.nickname.trim() : null,
        ]),
      );
    }
  }

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    authorNickname: nicknameByUserId[String(row.user_id)] ?? null,
    authorEmail: emailByUserId[String(row.user_id)] ?? null,
    content: row.content,
    createdAt: row.created_at,
  }));
}
