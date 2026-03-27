import type { StartupComment } from "@/types/comment";
import { supabase } from "./supabase";

type CommentRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
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

  return (data as CommentRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
  }));
}
