"use client";

import Link from "next/link";
import { useState } from "react";
import { useGame } from "../game";
import { PixelNinja } from "./pixel";

const slots = [
  ["Hat", "A hat from the locker."],
  ["Badge", "A badge for a quest."],
  ["Title", "A title under the name."],
  ["Name tag", "The name on the TV."],
  ["Pet", "A pet stands beside you."],
  ["Skin", "The outfit on the character."],
];

export default function NinjaHome() {
  const { profile, equipped, owned, equip } = useGame();
  const [tip, setTip] = useState("Tap a slot.");
  const belt = profile?.belt ?? "White";
  const level = profile?.level ?? 1;
  const xp = profile?.xp_in_level ?? 0;
  return (
    <main>
      <section className="frame">
        <header>
          <strong>{profile?.first_name ?? "Pixel"}</strong>
          <span>{belt} belt</span>
        </header>
        <div className="frame-body">
          <div className="scene">
            <PixelNinja belt={belt} equipped={equipped} />
            <img className="pet" src="/kenney/char_0004.png" alt="" />
          </div>
          <div>
            <p>Equipped</p>
            <div className="slots">
              {slots.map(([slot, hint]) => (
                <button key={slot} type="button" title={hint} onClick={() => { setTip(slot === "Skin" && equipped ? equipped : hint); if (slot === "Skin" && owned[0]) equip(owned[0]); }}>
                  {slot === "Skin" && equipped ? equipped.slice(0, 4) : slot.slice(0, 1)}
                </button>
              ))}
            </div>
            <p>{tip}</p>
            <p>{owned.length ? owned.join(", ") : "Locker is empty. Buy a skin."}</p>
          </div>
        </div>
        <p>LV {level} <span className="bar"><i style={{ width: `${Math.min(100, (xp / 30) * 100)}%` }} /></span> XP {xp}/30 · {profile?.coins ?? 0} coins</p>
        <p className="track">{Array.from({ length: 20 }, (_, index) => index < level ? "◆" : "◇").join(" ")}</p>
      </section>
      <p><Link href="/credits">Credits</Link> · Kenney pixel pack, idle and cheer.</p>
    </main>
  );
}
