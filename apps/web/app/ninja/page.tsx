"use client";

import { useGame } from "../game";

export default function NinjaHome() {
  const { profile, equipped, owned } = useGame();
  return (
    <main>
      <h1>{profile?.first_name ?? "Ninja home"}</h1>
      <section className="card">
        <div className="avatar">{equipped ? equipped.slice(0, 1) : "P"}</div>
        <p>{profile?.belt ?? "White"} belt · level {profile?.level ?? 1}</p>
        <p>Equipped: {equipped || "none yet"}</p>
        <p>{owned.length ? owned.join(", ") : "Locker is empty. Buy a skin."}</p>
      </section>
      <section className="card">
        <h2>Levels 1 to 20</h2>
        <p>This belt has 20 levels. A skin bought in the shop shows here as soon as the coins drop.</p>
      </section>
    </main>
  );
}
