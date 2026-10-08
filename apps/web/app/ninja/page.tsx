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
  const [ready, setReady] = useState(false);
  const name = profile?.first_name ?? "Pixel";
  const belt = profile?.belt ?? "White";
  const level = profile?.level ?? 1;
  const xp = profile?.xp_in_level ?? 0;
  const coins = profile?.coins ?? 0;
  const xpWidth = Math.min(100, (xp / 30) * 100);
  const lookName = hairColors.find(([hex]) => hex === hairColor)?.[1] ?? "Black";

  useEffect(() => {
    let cancel = false;
    const id = sessionStorage.getItem("block-dojo-ninja") ?? "guest";
    const saved = localStorage.getItem(`block-dojo-look-${id}`);
    if (saved) {
      try {
        const look = JSON.parse(saved) as { sprite?: string; hair?: string; color?: string };
        if (look.sprite === "boy" || look.sprite === "girl") setSprite(look.sprite);
        if (look.hair) setHair(look.hair);
        if (look.color) setHairColor(look.color);
      } catch {
        localStorage.removeItem(`block-dojo-look-${id}`);
      }
    }
    if (id === "guest") {
      setReady(true);
      return;
    }
    browserSupabase().rpc("get_look", { target: id }).then(({ data }) => {
      if (cancel || !data || typeof data !== "object") {
        setReady(true);
        return;
      }
      const look = data as { sprite?: string; hair?: string; color?: string };
      if (look.sprite === "boy" || look.sprite === "girl") setSprite(look.sprite);
      if (look.hair) setHair(look.hair);
      if (look.color) setHairColor(look.color);
      setReady(true);
    });
    return () => { cancel = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = sessionStorage.getItem("block-dojo-ninja") ?? "guest";
    localStorage.setItem(`block-dojo-look-${id}`, JSON.stringify({ sprite, hair, color: hairColor }));
    if (id !== "guest") browserSupabase().rpc("save_look", { target: id, sprite, hair, color: hairColor });
  }, [ready, sprite, hair, hairColor]);

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
              <button type="button" className={sprite === "boy" ? "on" : ""} onClick={() => setSprite("boy")}>Boy</button>
              <button type="button" className={sprite === "girl" ? "on" : ""} onClick={() => setSprite("girl")}>Girl</button>
            </div>
            <p>Boys</p>
            <div className="hair-picks">
              {boyHair.map(([id, label]) => (
                <button key={id} type="button" className={hair === id ? "on" : ""} onClick={() => setHair(id)}>{label}</button>
              ))}
            </div>
            <p>Girls</p>
            <div className="hair-picks">
              {girlHair.map(([id, label]) => (
                <button key={id} type="button" className={hair === id ? "on" : ""} onClick={() => setHair(id)}>{label}</button>
              ))}
            </div>
            <p>Color</p>
            <div className="swatches">
              {hairColors.map(([color, label]) => (
                <button key={color} type="button" className={hairColor === color ? "on" : ""} style={{ background: color }} aria-label={label} title={label} onClick={() => setHairColor(color)} />
              ))}
            </div>
          </section>
          <p className="hint">This look stays with your name, on any dojo computer.</p>
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
