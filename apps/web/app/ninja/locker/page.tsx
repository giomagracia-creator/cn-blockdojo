"use client";

import { useGame } from "../../game";

export default function LockerPage() {
  const { owned, equipped, equip } = useGame();
  return (
    <main>
      <h1>Locker</h1>
      <section className="card">
        {owned.length === 0 ? <p>No skins yet. Buy one in the shop.</p> : owned.map((name) => (
          <p key={name}>{name} {equipped === name ? "equipped" : <button type="button" onClick={() => equip(name)}>Equip</button>}</p>
        ))}
      </section>
    </main>
  );
}
