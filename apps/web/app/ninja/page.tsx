"use client";

import Link from "next/link";
import { useState } from "react";
import { useGame } from "../game";
import { PixelNinja } from "./pixel";

const slots = [
  ["Hat", "Empty. Hats show up in the locker."],
  ["Badge", "Empty. Badges come from quests."],
  ["Title", "Empty. A title sits under your name."],
  ["Tag", "Empty. This is the name on the TV."],
  ["Pet", "Empty. A pet stands beside you."],
  ["Outfit", "Starter gi. Buy a skin to change it."],
];

export default function NinjaHome() {
  const { profile, equipped, owned, equip } = useGame();
  const [tip, setTip] = useState("Tap a slot to see what it does.");
  const name = profile?.first_name ?? "Pixel";
  const belt = profile?.belt ?? "White";
  const level = profile?.level ?? 1;
  const xp = profile?.xp_in_level ?? 0;
  const coins = profile?.coins ?? 0;
  const xpWidth = Math.min(100, (xp / 30) * 100);

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
            <PixelNinja belt={belt} equipped={equipped} />
            <img className="pet" src="/kenney/char_0004.png" alt="" />
          </div>
          <div className="stats">
            <div>
              <span>Experience</span>
              <b>{xp} / 30</b>
              <i className="meter"><em style={{ width: `${xpWidth}%` }} /></i>
            </div>
            <div>
              <span>Session</span>
              <b>0 / 40 min</b>
              <i className="meter session"><em style={{ width: "0%" }} /></i>
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
