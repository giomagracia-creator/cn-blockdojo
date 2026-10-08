"use client";

import Link from "next/link";
import { useGame } from "../game";
import { PixelNinja } from "./pixel";

const slots = ["Hat", "Badge", "Title", "Name tag", "Pet", "Skin"];

export default function NinjaHome() {
  const { profile, equipped, owned } = useGame();
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
          </div>
          <div>
            <p>Equipped</p>
            <div className="slots">
              {slots.map((slot) => (
                <span key={slot} title={slot === "Skin" && equipped ? equipped : `${slot} is empty`}>{slot === "Skin" && equipped ? equipped.slice(0, 4) : slot.slice(0, 1)}</span>
              ))}
            </div>
            <p>{owned.length ? owned.join(", ") : "Locker is empty. Buy a skin."}</p>
          </div>
        </div>
        <p>LV {level} <span className="bar"><i style={{ width: `${Math.min(100, (xp / 30) * 100)}%` }} /></span> XP {xp}/30 · {profile?.coins ?? 0} coins</p>
        <p className="track">{Array.from({ length: 20 }, (_, index) => index < level ? "◆" : "◇").join(" ")}</p>
      </section>
      <p><Link href="/credits">Credits</Link></p>
    </main>
  );
}
