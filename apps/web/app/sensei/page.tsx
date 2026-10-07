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

  async function act(name: string, args: Record<string, string | number>) {
    const { data, error } = await browserSupabase().rpc(name, args);
    setMessage(error?.message ?? (typeof data === "string" ? data : JSON.stringify(data)));
    load();
  }

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
            <button type="button" onClick={() => act("award_xp", { target: ninja.id, amount: 10, reason: "sensei award" })}>+10 XP</button>
            <button type="button" onClick={() => act("award_xp", { target: ninja.id, amount: -10, reason: "sensei remove" })}>-10 XP</button>
            <button type="button" onClick={() => act("start_powerup", { target: ninja.id })}>Power-up</button>
            <button type="button" onClick={() => act("lock_screen", { target: ninja.id })}>Lock screen</button>
            <button type="button" onClick={() => act("record_minute", { target: ninja.id, device_name: "pilot-pc", active_buckets: 4 })}>One active minute</button>
          </p>
        ))}
        <p>{message}</p>
        <button type="button" onClick={() => act("set_scene", { scene: "block-dojo" })}>Block scene</button>
        <button type="button" onClick={() => act("set_scene", { scene: "training-hall" })}>Training scene</button>
        <p><a href="/tv">Open the dojo TV</a></p>
      </section>
    </main>
  );
}
