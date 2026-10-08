"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Ninja = { id: string; first_name: string; belt: string };
type Celebration = { id: string; first_name: string; from_belt: string; to_belt: string; status: string };

export default function BeltUpPage() {
  const [ninjas, setNinjas] = useState<Ninja[]>([]);
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [message, setMessage] = useState("Change the belt in Impact, then queue the celebration here.");

  async function load() {
    const [people, feed] = await Promise.all([
      browserSupabase().rpc("live_board"),
      browserSupabase().rpc("celebration_feed"),
    ]);
    setNinjas(Array.isArray(people.data) ? people.data : []);
    setQueue(Array.isArray(feed.data) ? feed.data : []);
  }

  useEffect(() => { load(); }, []);

  async function run(name: string, args: Record<string, string>) {
    const { data, error } = await browserSupabase().rpc(name, args);
    setMessage(error?.message ?? String(data));
    load();
  }

  return (
    <main>
      <h1>Belt-up</h1>
      <section className="card">
        <p>The lobby TV plays each queued belt-up, one at a time. Open <a href="/tv/lobby">/tv/lobby</a> on the lobby screen.</p>
        <p>{message}</p>
      </section>
      <section className="card">
        <h2>Queue one</h2>
        {ninjas.map((ninja) => (
          <p key={ninja.id}>
            {ninja.first_name} · {ninja.belt}
            <button className="go" type="button" onClick={() => run("queue_belt_up", { target: ninja.id })}>Belt up</button>
          </p>
        ))}
      </section>
      <section className="card">
        <h2>Queue</h2>
        {queue.length === 0 ? <p>No celebrations yet.</p> : queue.map((item) => (
          <p key={item.id}>
            {item.first_name}: {item.from_belt} to {item.to_belt} · {item.status}
            <button type="button" onClick={() => run("set_celebration", { target: item.id, next_status: "queued" })}>Replay</button>
            <button className="warn" type="button" onClick={() => run("set_celebration", { target: item.id, next_status: "done" })}>Skip</button>
          </p>
        ))}
      </section>
    </main>
  );
}
