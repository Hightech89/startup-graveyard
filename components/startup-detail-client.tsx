"use client";

import { useEffect, useState } from "react";
import type { Startup } from "@/types/startup";
import { supabase } from "@/src/lib/supabase";
import { StartupCard } from "./startup-card";

export function StartupDetailClient({ startup }: { startup: Startup }) {
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [clientVoteCount, setClientVoteCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const id = String(startup.id);

    async function loadVoteState() {
      const {
        data: rows,
        error: countError,
      } = await supabase
        .from("startup_votes")
        .select("startup_id")
        .eq("startup_id", id);

      if (!mounted) return;

      if (process.env.NODE_ENV === "development") {
        console.debug("[vote:detail] count rows", {
          startupId: id,
          rowCount: rows?.length ?? 0,
          error: countError?.message ?? null,
          rawStartupIds: rows?.map((r) => r.startup_id),
        });
      }

      if (!countError && rows) {
        setClientVoteCount(rows.length);
      } else {
        setClientVoteCount(null);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      if (!user) {
        setUserHasVoted(false);
        return;
      }

      const { data: existingVote, error } = await supabase
        .from("startup_votes")
        .select("id")
        .eq("startup_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[vote:detail] hasVoted load error", {
            startupId: id,
            error: error.message,
          });
        }
        setUserHasVoted(false);
        return;
      }

      const voted = existingVote?.id != null;
      if (process.env.NODE_ENV === "development") {
        console.debug("[vote:detail] hasVoted (final)", {
          startupId: id,
          userId: user.id,
          hasVoted: voted,
        });
      }
      setUserHasVoted(voted);
    }

    setClientVoteCount(null);
    void loadVoteState();
    return () => {
      mounted = false;
    };
  }, [startup.id]);

  const displayStartup: Startup = {
    ...startup,
    upvotes: clientVoteCount ?? startup.upvotes,
  };

  return (
    <StartupCard
      startup={displayStartup}
      userHasVoted={userHasVoted === true}
    />
  );
}

