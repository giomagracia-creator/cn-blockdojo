"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

export default function PortalPage() {
  const [board, setBoard] = useState<Array<{ id: string; first_name: string; level: number; xp_in_level: number; total_xp: number; coins: number; belt: string }>>([]);
  const [picked, setPicked] = useState("");

  useEffect(() => {
    setPicked(sessionStorage.getItem("block-dojo-ninja") ?? "");
    browserSupabase().rpc("live_board").then(({ data }) => setBoard(Array.isArray(data) ? data : []));
  }, []);

  const ninja = board.find((item) => item.id === picked) ?? board[0];
  const need = ninja ? 30 + 2 * (ninja.level - 1) : 30;

  return (
    <main>
      <p className="mark">NINJA PORTAL</p>
      <h1>{ninja ? ninja.first_name : "Pick a Ninja at the dojo gate"}</h1>
      {ninja ? (
        <section className="card">
          <p>{ninja.belt} belt · level {ninja.level}</p>
          <p>XP in this level: {ninja.xp_in_level} / {need}</p>
          <p>Total XP {ninja.total_xp} · coins {ninja.coins}</p>
          <p>The battle pass for this belt has 20 levels. A Sensei still has to call the belt-up.</p>
        </section>
      ) : null}
    </main>
  );
}
