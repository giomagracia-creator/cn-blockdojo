"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Celebration = { id: string; first_name: string; from_belt: string; to_belt: string; status: string };
type Row = { first_name: string; belt: string; level: number; xp: number };

const colors: Record<string, string> = {
  White: "#f7f4ee", Yellow: "#f0d48a", Orange: "#e07a2f", Green: "#3f8f4a",
  Blue: "#338fbf", Purple: "#7b4ea3", Brown: "#6b4a2a", Red: "#c0392b",
  Black: "#1c1c1e", Bronze: "#b87333", Silver: "#c0c0c0", Platinum: "#d7e2ea", Gold: "#e2b657",
};

function chime() {
  const audio = new AudioContext();
  const tone = audio.createOscillator();
  const gain = audio.createGain();
  tone.frequency.value = 523;
  gain.gain.setValueAtTime(0.08, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.6);
  tone.connect(gain).connect(audio.destination);
  tone.start();
  tone.stop(audio.currentTime + 0.6);
}

export default function LobbyPage() {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [board, setBoard] = useState<Row[]>([]);
  const [muted, setMuted] = useState(false);
  const [shown, setShown] = useState("");

  useEffect(() => {
    const load = async () => {
      const [feed, ranks] = await Promise.all([
        browserSupabase().rpc("celebration_feed"),
        browserSupabase().rpc("session_board"),
      ]);
      setQueue(Array.isArray(feed.data) ? feed.data : []);
      setBoard(Array.isArray(ranks.data) ? ranks.data : []);
    };
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = queue.find((item) => item.status === "queued");

  useEffect(() => {
    if (!current || current.id === shown || muted) return;
    setShown(current.id);
    chime();
  }, [current, muted, shown]);

  return (
    <main className={current ? "lobby live" : "lobby"}>
      <button className="warn" type="button" onClick={() => setMuted((value) => !value)}>{muted ? "Sound off" : "Sound on"}</button>
      {current ? (
        <section className="celebrate">
          <p>Belt up</p>
          <h1>{current.first_name}</h1>
          <p className="swap"><i style={{ background: colors[current.from_belt] ?? "#fff" }} /> {current.from_belt} to <i style={{ background: colors[current.to_belt] ?? "#fff" }} /> {current.to_belt}</p>
          <div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${index * 0.15}s` }} />)}</div>
        </section>
      ) : (
        <section>
          <h1>Lobby</h1>
          <h2>Recent belt-ups</h2>
          {queue.filter((item) => item.status === "done").slice(0, 5).map((item) => (
            <p key={item.id}>{item.first_name} · {item.to_belt}</p>
          ))}
          <h2>Leaderboard</h2>
          {board.map((row, index) => <p key={row.first_name}>{index + 1}. {row.first_name} · {row.belt} · level {row.level}</p>)}
        </section>
      )}
    </main>
  );
}
