"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

export default function NinjaHome() {
  const [board, setBoard] = useState<Array<{ id: string; first_name: string; level: number; xp_in_level: number; total_xp: number; coins: number; belt: string }>>([]);
  const [id, setId] = useState("");

  useEffect(() => {
    setId(sessionStorage.getItem("block-dojo-ninja") ?? "");
    browserSupabase().rpc("live_board").then(({ data }) => setBoard(Array.isArray(data) ? data : []));
  }, []);

  const ninja = board.find((item) => item.id === id) ?? board[0];
  return (
    <main>
      <h1>{ninja ? ninja.first_name : "Ninja home"}</h1>
      {ninja ? (
        <section className="card">
          <p>{ninja.belt} belt · level {ninja.level}</p>
          <p>XP {ninja.xp_in_level} · coins {ninja.coins}</p>
          <p>Start session happens on the dojo PC. Outside the dojo this page is view-only.</p>
        </section>
      ) : <section className="card"><p>Sign in from the front door to see your belt.</p></section>}
    </main>
  );
}
