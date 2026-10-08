"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "../game";
import { PixelNinja } from "./pixel";
import { browserSupabase } from "../../lib/supabase";

const boyHair = [
  ["buzzcut", "Buzz"],
  ["bedhead", "Bedhead"],
  ["cowlick", "Cowlick"],
];
const girlHair = [
  ["bob", "Bob"],
  ["long", "Long"],
  ["curly_short", "Curls"],
];
const hairColors = [
  ["#1c1c1e", "Black"],
  ["#6b3a1f", "Brown"],
  ["#a84820", "Auburn"],
  ["#e2b657", "Gold"],
  ["#f0d48a", "Blonde"],
  ["#c0392b", "Red"],
  ["#338fbf", "Blue"],
  ["#1d4e89", "Navy"],
  ["#7b4ea3", "Purple"],
  ["#e38aaa", "Pink"],
];

const slots = [
  ["Hat", "Empty. Hats show up in the locker."],
  ["Badge", "Empty. Badges come from quests."],
  ["Title", "Empty. A title sits under your name."],
  ["Tag", "Empty. This is the name on the TV."],
  ["Outfit", "Starter gi. Buy a skin to change it."],
];

export default function NinjaHome() {
  const { profile, equipped, owned, equip } = useGame();
  const [tip, setTip] = useState("Tap a slot to see what it does.");
  const [hair, setHair] = useState("buzzcut");
  const [hairColor, setHairColor] = useState(hairColors[0][0]);
  const [sprite, setSprite] = useState<"boy" | "girl">("boy");
  const [note, setNote] = useState("");
  const name = profile?.first_name ?? "Pixel";
  const belt = profile?.belt ?? "White";
  const level = profile?.level ?? 1;
  const xp = profile?.xp_in_level ?? 0;
  const coins = profile?.coins ?? 0;
  const xpWidth = Math.min(100, (xp / 30) * 100);
  const lookName = hairColors.find(([hex]) => hex === hairColor)?.[1] ?? "Black";

  function remember(next: { sprite: "boy" | "girl"; hair: string; color: string }) {
    const id = sessionStorage.getItem("block-dojo-ninja");
    if (!id) {
      setNote("Sign in again so this look can be saved.");
      return;
    }
    localStorage.setItem(`block-dojo-look-${id}`, JSON.stringify(next));
    browserSupabase().rpc("save_look", { target: id, sprite: next.sprite, hair: next.hair, color: next.color }).then(({ data, error }) => {
      setNote(error ? "Saved on this computer only." : data === "Look saved." ? "Saved." : String(data ?? "Saved."));
    });
  }

  useEffect(() => {
    const id = sessionStorage.getItem("block-dojo-ninja");
    if (!id) return;
    const raw = localStorage.getItem(`block-dojo-look-${id}`);
    let local: { sprite?: string; hair?: string; color?: string } | null = null;
    if (raw) {
      try { local = JSON.parse(raw); } catch { local = null; }
    }
    if (local?.sprite === "boy" || local?.sprite === "girl") setSprite(local.sprite);
    if (local?.hair) setHair(local.hair);
    if (local?.color) setHairColor(local.color);
    browserSupabase().rpc("get_look", { target: id }).then(({ data }) => {
      if (!data || typeof data !== "object") return;
      const look = data as { sprite?: string; hair?: string; color?: string; saved?: boolean };
      const serverDefault = !look.saved && (look.sprite ?? "boy") === "boy" && (look.hair ?? "buzzcut") === "buzzcut" && (look.color ?? "#1c1c1e") === "#1c1c1e";
      if (local && serverDefault) return;
      if (look.sprite === "boy" || look.sprite === "girl") setSprite(look.sprite);
      if (look.hair) setHair(look.hair);
      if (look.color) setHairColor(look.color);
    });
  }, []);

  return (
    <main className="journal-wrap">
      <section className="journal">
        <header className="journal-top">
          <div>
            <p className="eyebrow">Dojo journal</p>
            <h1>{name}</h1>
          </div>
          <p className="belt-pill">{belt} belt · level {level}</p>
        </header>

        <div className="journal-main">
          <div className="scene">
            <PixelNinja belt={belt} equipped={equipped} hair={hair} color={hairColor} sprite={sprite} />
          </div>
          <div className="stats">
            <div>
              <span>Experience</span>
              <b>{xp} / 30</b>
              <i className="meter"><em style={{ width: `${xpWidth}%` }} /></i>
            </div>
            <div>
              <span>Session</span>
              <b>At the dojo</b>
            </div>
            <div>
              <span>Coins</span>
              <b>{coins}</b>
            </div>
            <div>
              <span>Outfit</span>
              <b>{equipped || "Starter gi"}</b>
            </div>
            <p className="hint">Minutes count only while the dojo computer says you are here.</p>
          </div>
        </div>

        <details className="options" open>
          <summary>Options · {sprite === "girl" ? "Girl" : "Boy"} · {lookName}</summary>
          <section className="hair-menu">
            <p>Body</p>
            <div className="hair-picks">
              <button type="button" className={sprite === "boy" ? "on" : ""} onClick={() => { setSprite("boy"); remember({ sprite: "boy", hair, color: hairColor }); }}>Boy</button>
              <button type="button" className={sprite === "girl" ? "on" : ""} onClick={() => { setSprite("girl"); remember({ sprite: "girl", hair, color: hairColor }); }}>Girl</button>
            </div>
            <p>Boys</p>
            <div className="hair-picks">
              {boyHair.map(([id, label]) => (
                <button key={id} type="button" className={hair === id ? "on" : ""} onClick={() => { setHair(id); remember({ sprite, hair: id, color: hairColor }); }}>{label}</button>
              ))}
            </div>
            <p>Girls</p>
            <div className="hair-picks">
              {girlHair.map(([id, label]) => (
                <button key={id} type="button" className={hair === id ? "on" : ""} onClick={() => { setHair(id); remember({ sprite, hair: id, color: hairColor }); }}>{label}</button>
              ))}
            </div>
            <p>Color</p>
            <div className="swatches">
              {hairColors.map(([color, label]) => (
                <button key={color} type="button" className={hairColor === color ? "on" : ""} style={{ background: color }} aria-label={label} title={label} onClick={() => { setHairColor(color); remember({ sprite, hair, color }); }} />
              ))}
            </div>
          </section>
          <p className="hint">{note || "Tap a look. It is saved as soon as you tap."}</p>
        </details>

        <h2>Gear</h2>
        <div className="gear">
          {slots.map(([slot, hint]) => (
            <button
              key={slot}
              type="button"
              onClick={() => {
                setTip(slot === "Outfit" && equipped ? equipped : hint);
                if (slot === "Outfit" && owned[0]) equip(owned[0]);
              }}
            >
              <small>{slot}</small>
              <strong>{slot === "Outfit" && equipped ? equipped : "Empty"}</strong>
            </button>
          ))}
        </div>
        <p className="hint">{tip}</p>

        <h2>Pack</h2>
        <div className="pack">
          {owned.length === 0 ? <p>Nothing in the pack yet. The shop is where skins and snacks live.</p> : owned.map((item) => <span key={item}>{item}</span>)}
          <Link href="/ninja/shop">Open shop</Link>
        </div>

        <h2>Today</h2>
        <div className="today">
          <Link href="/ninja/quests">40 minute session</Link>
          <Link href="/ninja/quests">Bring a friend</Link>
          <Link href="/ninja/leaderboard">Who is here</Link>
        </div>

        <h2>Belt path</h2>
        <p className="track" aria-label={`Level ${level} of 20`}>
          {Array.from({ length: 20 }, (_, index) => (
            <span key={index} className={index < level ? "on" : ""}>{index + 1}</span>
          ))}
        </p>
      </section>
      <p className="credits-line"><Link href="/credits">Credits</Link> · Starter gi is always on. No bare characters.</p>
    </main>
  );
}
