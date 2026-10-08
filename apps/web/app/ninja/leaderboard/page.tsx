"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Array<{ first_name: string; belt: string; level: number }>>([]);
  useEffect(() => {
    browserSupabase().rpc("session_board").then(({ data }) => setRows(Array.isArray(data) ? data : []));
  }, []);
  return (
    <main>
      <h1>Leaderboard</h1>
      <section className="card">
        {rows.length === 0 ? <p>No Ninjas on the board yet.</p> : rows.map((row, index) => <p key={row.first_name}>{index + 1}. {row.first_name} · {row.belt} · level {row.level}</p>)}
      </section>
    </main>
  );
}
