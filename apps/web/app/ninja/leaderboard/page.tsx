"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Array<{ first_name: string; belt: string; level: number }>>([]);
  useEffect(() => {
    browserSupabase().rpc("live_board").then(({ data }) => setRows(Array.isArray(data) ? data : []));
  }, []);
  return (
    <main>
      <h1>Leaderboard</h1>
      <section className="card">
        {rows.map((row) => <p key={row.first_name}>{row.first_name} · {row.belt} · level {row.level}</p>)}
      </section>
    </main>
  );
}
