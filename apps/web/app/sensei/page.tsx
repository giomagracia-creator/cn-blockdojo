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
          <article className="card ninja-card" key={ninja.id}>
            <h2>{ninja.first_name} {ninja.last_initial}.</h2>
            <p>{ninja.locked ? "Locked" : "Open"} · misses {ninja.pin_failures}</p>
            <div className="actions">
              <span>Rewards</span>
              <button className="go" type="button" onClick={() => act("award_xp", { target: ninja.id, amount: 10, reason: "sensei award" })}>+10 XP</button>
              <button className="warn" type="button" onClick={() => act("award_xp", { target: ninja.id, amount: -10, reason: "sensei remove" })}>-10 XP</button>
              <button type="button" onClick={() => act("start_powerup", { target: ninja.id })}>Power-up</button>
            </div>
            <div className="actions">
              <span>Safety</span>
              <button className="stop" type="button" onClick={() => act("lock_screen", { target: ninja.id })}>Lock screen</button>
              <button type="button" onClick={() => unlock(ninja.id)}>Unlock</button>
              <button className="warn" type="button" onClick={() => lookup(ninja.id)}>Look up PIN</button>
            </div>
            <div className="actions">
              <span>Practice</span>
              <button type="button" onClick={() => act("record_minute", { target: ninja.id, device_name: "pilot-pc", active_buckets: 4 })}>One active minute</button>
            </div>
          </article>
        ))}
        <p>{message}</p>
        <div className="actions">
          <span>Scene</span>
          <button className="go" type="button" onClick={() => act("set_scene", { scene: "block-dojo" })}>Block scene</button>
          <button type="button" onClick={() => act("set_scene", { scene: "training-hall" })}>Training scene</button>
          <button type="button" onClick={() => act("set_scene", { scene: "winter" })}>Winter scene</button>
          <button type="button" onClick={() => act("set_scene", { scene: "summer" })}>Summer scene</button>
        </div>
      </section>
    </main>
  );
}
