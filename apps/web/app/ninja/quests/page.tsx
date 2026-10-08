"use client";

export default function QuestsPage() {
  return (
    <main>
      <h1>Quests</h1>
      <section className="card">
        <h2>Session</h2>
        <p>40 active minutes. Counts only when the dojo PC confirms you are in the dojo.</p>
      </section>
      <section className="card">
        <h2>Bring a Friend</h2>
        <p>A Sensei confirms this at check-in. It is the biggest weekly card.</p>
      </section>
    </main>
  );
}
