type UserEmailRow = {
  id: string;
  email: string | null;
};

/**
 * Returns non-empty emails for the provided user IDs.
 * Uses a narrow RPC to avoid over-fetching user data.
 */
export async function getUserEmailsById(
  supabase: {
    rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{
      data: unknown;
      error: { message?: string } | null;
    }>;
  },
  userIds: string[],
): Promise<Record<string, string>> {
  const ids = [
    ...new Set(userIds.map((id) => String(id)).filter((id) => id.length > 0)),
  ];
  if (ids.length === 0) return {};

  const { data, error } = await supabase.rpc("get_user_emails", {
    user_ids: ids,
  });

  if (error || !Array.isArray(data)) return {};

  const map: Record<string, string> = {};
  for (const row of data as UserEmailRow[]) {
    const id = String(row.id);
    const email = typeof row.email === "string" ? row.email.trim() : "";
    if (id && email.length > 0) {
      map[id] = email;
    }
  }

  return map;
}
