"use client";

import { useEffect, useState } from "react";
import type { Startup } from "@/types/startup";
import { supabase } from "@/src/lib/supabase";
import { StartupCard } from "./startup-card";

export function StartupDetailClient({ startup }: { startup: Startup }) {
  const [userHasVoted, setUserHasVoted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadVoteState() {
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
        .eq("startup_id", startup.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;
      if (error || !existingVote) {
        setUserHasVoted(false);
        return;
      }

      setUserHasVoted(true);
    }

    loadVoteState();
    return () => {
      mounted = false;
    };
  }, [startup.id]);

  return <StartupCard startup={startup} userHasVoted={userHasVoted} />;
}

