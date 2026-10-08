"use client";

import { useEffect, useRef, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Celebration = { id: string; first_name: string; from_belt: string; to_belt: string; status: string };
type Row = { first_name: string; belt: string; level: number; xp: number };

const colors: Record<string, string> = {
  White: "#f7f4ee", Yellow: "#f0d48a", Orange: "#e07a2f", Green: "#3f8f4a",
  Blue: "#338fbf", Purple: "#7b4ea3", Brown: "#6b4a2a", Red: "#c0392b",
  Black: "#1c1c1e", Bronze: "#b87333", Silver: "#c0c0c0", Platinum: "#d7e2ea", Gold: "#e2b657",
};

function burst(audio: AudioContext, seconds: number) {
  const length = Math.floor(audio.sampleRate * seconds);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function ceremony() {
  const audio = new AudioContext();
  audio.resume();
  const now = audio.currentTime;
  const master = audio.createGain();
  master.gain.value = 0.85;
  master.connect(audio.destination);

  const drone = audio.createOscillator();
  const droneGain = audio.createGain();
  drone.type = "sine";
  drone.frequency.value = 55;
  droneGain.gain.setValueAtTime(0.001, now);
  droneGain.gain.linearRampToValueAtTime(0.16, now + 3.4);
  droneGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);
  drone.connect(droneGain).connect(master);
  drone.start(now);
  drone.stop(now + 4.3);

  [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 784, 880].forEach((freq, index) => {
    const start = now + index * 0.28;
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    tone.type = "triangle";
    tone.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.07 + index * 0.012, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.34);
    tone.connect(gain).connect(master);
    tone.start(start);
    tone.stop(start + 0.36);
  });

  const gongAt = now + 3.5;
  const gong = audio.createOscillator();
  const gongGain = audio.createGain();
  gong.type = "sine";
  gong.frequency.setValueAtTime(146, gongAt);
  gong.frequency.exponentialRampToValueAtTime(46, gongAt + 2.8);
  gongGain.gain.setValueAtTime(0.001, gongAt);
  gongGain.gain.linearRampToValueAtTime(0.85, gongAt + 0.03);
  gongGain.gain.exponentialRampToValueAtTime(0.001, gongAt + 5);
  gong.connect(gongGain).connect(master);
  gong.start(gongAt);
  gong.stop(gongAt + 5.1);

  const ring = audio.createOscillator();
  const ringGain = audio.createGain();
  ring.type = "triangle";
  ring.frequency.setValueAtTime(310, gongAt);
  ring.frequency.exponentialRampToValueAtTime(160, gongAt + 1.6);
  ringGain.gain.setValueAtTime(0.28, gongAt);
  ringGain.gain.exponentialRampToValueAtTime(0.001, gongAt + 2.4);
  ring.connect(ringGain).connect(master);
  ring.start(gongAt);
  ring.stop(gongAt + 2.5);

  const hit = audio.createBufferSource();
  hit.buffer = burst(audio, 0.45);
  const hitFilter = audio.createBiquadFilter();
  hitFilter.type = "lowpass";
  hitFilter.frequency.value = 420;
  const hitGain = audio.createGain();
  hitGain.gain.setValueAtTime(0.55, gongAt);
  hitGain.gain.exponentialRampToValueAtTime(0.001, gongAt + 0.4);
  hit.connect(hitFilter).connect(hitGain).connect(master);
  hit.start(gongAt);

  for (let index = 0; index < 32; index += 1) {
    const start = gongAt + 0.45 + index * 0.14 + Math.random() * 0.06;
    const clap = audio.createBufferSource();
    clap.buffer = burst(audio, 0.09);
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1100 + Math.random() * 900;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.2 * (1 - index / 48), start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
    clap.connect(filter).connect(gain).connect(master);
    clap.start(start);
  }

  window.setTimeout(() => audio.close(), 11000);
  return audio;
}

export default function LobbyPage() {
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [board, setBoard] = useState<Row[]>([]);
  const [muted, setMuted] = useState(false);
  const [shown, setShown] = useState("");
  const sound = useRef<AudioContext | null>(null);

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
    sound.current?.close();
    sound.current = ceremony();
  }, [current, muted, shown]);

  return (
    <main className={current ? "lobby live" : "lobby"}>
      <button className="warn" type="button" onClick={() => {
        sound.current?.close();
        setMuted((value) => {
          const next = !value;
          if (!next && current) sound.current = ceremony();
          return next;
        });
      }}>{muted ? "Sound off" : "Sound on"}</button>
      {current ? (
        <section className="celebrate">
          <p>Belt up</p>
          <h1>{current.first_name}</h1>
          <p className="swap"><i style={{ background: colors[current.from_belt] ?? "#fff" }} /> {current.from_belt} to <i style={{ background: colors[current.to_belt] ?? "#fff" }} /> {current.to_belt}</p>
          <button type="button" onClick={() => { sound.current?.close(); sound.current = ceremony(); }}>Play again</button>
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
