"use client";

import { useEffect, useRef, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

type Ninja = { id: string; first_name: string; level: number; total_xp: number; coins: number; belt: string; screen_locked: boolean };

export function Floor({ room }: { room?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ninjas, setNinjas] = useState<Ninja[]>([]);

  useEffect(() => {
    const load = async () => {
      const query = room
        ? browserSupabase().rpc("live_board_for", { room })
        : browserSupabase().rpc("live_board");
      const { data } = await query;
      setNinjas(Array.isArray(data) ? data : []);
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [room]);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !canvas.current) return;
    const width = canvas.current.width;
    const height = canvas.current.height;
    ctx.fillStyle = "#1c1c1e";
    ctx.fillRect(0, 0, width, height);
    ninjas.forEach((ninja, index) => {
      const x = 40 + (index % 6) * 150;
      const y = 80 + Math.floor(index / 6) * 160;
      ctx.fillStyle = ninja.screen_locked ? "#8a5a00" : "#338fbf";
      ctx.fillRect(x, y, 48, 48);
      ctx.fillStyle = "#f7f4ee";
      ctx.font = "20px VT323, Arial";
      ctx.fillText(ninja.first_name, x, y + 72);
      ctx.fillText(`${ninja.belt} L${ninja.level}`, x, y + 96);
      ctx.fillText(`${ninja.total_xp} XP`, x, y + 120);
    });
  }, [ninjas]);

  return (
    <main>
      <p className="mark">DOJO TV</p>
      <h1>{room === "dojo-2" ? "Dojo 2" : "Block Dojo"}</h1>
      <canvas ref={canvas} width={960} height={420} />
    </main>
  );
}

export default function TvPage() {
  return <Floor />;
}
