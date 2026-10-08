"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Quest = { id: string; title: string; detail: string; reward_xp: number };

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [matches, setMatches] = useState<Array<{ title: string; ends_at: string }>>([]);

  useEffect(() => {
    browserSupabase().rpc("list_quests").then(({ data }) => setQuests(Array.isArray(data) ? data : []));
    browserSupabase().rpc("list_matches").then(({ data }) => setMatches(Array.isArray(data) ? data : []));
  }, []);

  return (
    <main>
      <h1>Quests</h1>
      {matches.map((match) => (
        <section className="card" key={match.title}>
          <h2>Match day</h2>
          <p>{match.title} is live.</p>
        </section>
      ))}
      {quests.length === 0 ? <section className="card"><p>No quests yet. A Sensei adds them from Awards.</p></section> : quests.map((quest) => (
        <section className="card" key={quest.id}>
          <h2>{quest.title}</h2>
          <p>{quest.detail || "A Sensei marks this done."}</p>
          <p>{quest.reward_xp} XP</p>
        </section>
      ))}
    </main>
  );
}
