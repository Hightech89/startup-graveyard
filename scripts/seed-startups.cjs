const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

function ts() {
  return new Date().toISOString();
}

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing ${name}. Add it to your environment before seeding.`);
  }
  return v;
}

function loadSeed() {
  const seedPath = path.join(process.cwd(), "seed", "startups.json");
  const raw = fs.readFileSync(seedPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("seed/startups.json must be a JSON array");
  }
  return parsed;
}

async function ensureSeedVoters(supabase, needed) {
  const count = Math.max(needed, 2);
  const desiredEmails = Array.from(
    { length: count },
    (_, i) => `seed-voter-${i + 1}@startupgraveyard.local`,
  );

  const existingByEmail = new Map();
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      console.error("[seed:startups] listUsers failed:", error);
      throw new Error(error.message);
    }
    const users = data?.users ?? [];
    for (const user of users) {
      if (user?.email) existingByEmail.set(user.email, user);
    }
    if (users.length < 200) break;
    page += 1;
  }

  const userIds = [];
  for (const email of desiredEmails) {
    const existing = existingByEmail.get(email);
    if (existing?.id) {
      userIds.push(existing.id);
      continue;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: "SeedVoter!234",
      email_confirm: true,
    });
    if (error) {
      console.error(`[seed:startups] createUser failed for ${email}:`, error);
      throw new Error(error.message);
    }
    if (!data?.user?.id) {
      throw new Error(`Failed to create seed voter for ${email}`);
    }
    userIds.push(data.user.id);
  }
  return userIds;
}

async function main() {
  console.log(`[seed:startups] ${ts()} starting`);
  loadDotEnvLocal();

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL). Provide SUPABASE_URL for scripts.",
    );
  }

  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const refMatch = String(url).match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  const ref = refMatch ? refMatch[1] : null;
  console.log(
    `[seed:startups] target=${ref ? `supabase:${ref}` : url} (set SUPABASE_URL to override)`,
  );

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const seed = loadSeed();
  console.log(`[seed:startups] seed entries=${seed.length}`);
  if (seed.length > 0) {
    console.log(
      `[seed:startups] seed names=${seed.map((s) => s?.name).filter(Boolean).join(", ")}`,
    );
  }

  // Always clear `startups` so ONLY seed remains.
  // Clear dependent tables first for consistency (and to avoid FK issues).
  const { data: idsRows, error: idsError } = await supabase
    .from("startups")
    .select("id");
  if (idsError) {
    console.error("[seed:startups] failed to read existing startups:", idsError);
    throw new Error(idsError.message);
  }

  const ids = (idsRows || [])
    .map((r) => (r && r.id != null ? String(r.id) : ""))
    .filter(Boolean);

  console.log(`[seed:startups] existing startups=${ids.length}`);

  if (ids.length > 0) {
    console.log("[seed:startups] deleting dependent startup_votes…");
    const { error: votesError, count: votesDeleted } = await supabase
      .from("startup_votes")
      .delete({ count: "exact" })
      .in("startup_id", ids);
    if (votesError) {
      console.error("[seed:startups] delete startup_votes failed:", votesError);
      throw new Error(votesError.message);
    }
    console.log(
      `[seed:startups] deleted startup_votes (count may be null)=${votesDeleted ?? "n/a"}`,
    );

    console.log("[seed:startups] deleting dependent startup_comments…");
    const { error: commentsError, count: commentsDeleted } = await supabase
      .from("startup_comments")
      .delete({ count: "exact" })
      .in("startup_id", ids);
    if (commentsError) {
      console.error("[seed:startups] delete startup_comments failed:", commentsError);
      throw new Error(commentsError.message);
    }
    console.log(
      `[seed:startups] deleted startup_comments (count may be null)=${commentsDeleted ?? "n/a"}`,
    );
  }

  console.log("[seed:startups] deleting startups…");
  const { error: deleteStartupsError, count: startupsDeleted } = await supabase
    .from("startups")
    .delete({ count: "exact" })
    // PostgREST requires a filter for delete(). Use a NULL check to avoid invalid UUID comparisons.
    .not("id", "is", null);
  if (deleteStartupsError) {
    console.error("[seed:startups] delete startups failed:", deleteStartupsError);
    throw new Error(deleteStartupsError.message);
  }
  console.log(
    `[seed:startups] deleted startups (count may be null)=${startupsDeleted ?? "n/a"}`,
  );

  if (seed.length === 0) {
    console.log("Seed is empty. `startups` table has been cleared.");
    return;
  }

  const nowIso = new Date().toISOString();
  const payload = seed.map((s) => ({
    name: s.name,
    short_description: s.shortDescription,
    cause_of_death: s.causeOfDeath,
    final_lesson: s.finalLesson,
    tags: s.tags,
    upvotes: typeof s.upvotes === "number" ? s.upvotes : 0,
    created_at: s.createdAt || nowIso,
  }));

  console.log("[seed:startups] inserting seed startups…");
  const { error: insertError, data: insertedRows } = await supabase
    .from("startups")
    .insert(payload)
    .select("id, name");
  if (insertError) {
    console.error("[seed:startups] insert failed:", insertError);
    throw new Error(insertError.message);
  }
  console.log(
    `[seed:startups] inserted rows=${Array.isArray(insertedRows) ? insertedRows.length : 0}`,
  );

  const voteTargets = seed.map((s, i) => {
    const configured = Number.isFinite(Number(s.seedVotes))
      ? Number(s.seedVotes)
      : null;
    const fallback = Math.max(2, 10 - i);
    const votes = Math.max(2, Math.min(10, configured ?? fallback));
    return { name: s.name, votes };
  });

  const maxVotes = voteTargets.reduce((m, v) => Math.max(m, v.votes), 0);
  const voterIds = await ensureSeedVoters(supabase, maxVotes);
  console.log(
    `[seed:startups] seed voters ready=${voterIds.length} (for max votes=${maxVotes})`,
  );

  const insertedByName = new Map(
    (insertedRows ?? []).map((r) => [String(r.name), String(r.id)]),
  );
  const voteRows = [];
  for (const t of voteTargets) {
    const startupId = insertedByName.get(String(t.name));
    if (!startupId) continue;
    for (let i = 0; i < t.votes && i < voterIds.length; i += 1) {
      voteRows.push({
        startup_id: startupId,
        user_id: voterIds[i],
      });
    }
  }

  if (voteRows.length > 0) {
    console.log(`[seed:startups] inserting startup_votes rows=${voteRows.length}…`);
    const { error: votesInsertError } = await supabase
      .from("startup_votes")
      .insert(voteRows);
    if (votesInsertError) {
      console.error("[seed:startups] insert startup_votes failed:", votesInsertError);
      throw new Error(votesInsertError.message);
    }
  }

  const { count, error: countError } = await supabase
    .from("startups")
    .select("*", { count: "exact", head: true });
  if (countError) {
    console.error("[seed:startups] count after insert failed:", countError);
    throw new Error(countError.message);
  }

  console.log(`Seed complete. startups rows: ${count ?? "unknown"}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

