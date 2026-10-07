"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

type Ninja = { id: string; first_name: string; last_initial: string; locked: boolean; pin_failures: number };

export default function SenseiPage() {
  const [ninjas, setNinjas] = useState<Ninja[]>([]);
  const [message, setMessage] = useState("Unlock a Ninja after three wrong PINs. Looking up a PIN is logged.");

  async function load() {
    const { data } = await browserSupabase().from("ninjas").select("id, first_name, last_initial, locked, pin_failures").order("first_name");
    setNinjas(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function unlock(id: string) {
    const { data, error } = await browserSupabase().rpc("unlock_ninja", { target: id });
    setMessage(error?.message ?? String(data));
    load();
  }

  async function lookup(id: string) {
    const { data, error } = await browserSupabase().rpc("lookup_pin", { target: id });
    setMessage(error?.message ?? `PIN ${data}. This lookup was logged.`);
  }

  return (
    <main>
      <p className="mark">SENSEI</p>
      <h1>Live roster</h1>
      <section className="card">
        {ninjas.map((ninja) => (
          <p key={ninja.id}>
            {ninja.first_name} {ninja.last_initial}. {ninja.locked ? "locked" : "open"} · misses {ninja.pin_failures}
            <button type="button" onClick={() => unlock(ninja.id)}>Unlock</button>
            <button type="button" onClick={() => lookup(ninja.id)}>Look up PIN</button>
          </p>
        ))}
        <p>{message}</p>
      </section>
    </main>
  );
}
