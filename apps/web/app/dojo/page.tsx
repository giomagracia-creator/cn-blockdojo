"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

type Ninja = { id: string; first_name: string; last_initial: string; locked: boolean };

export default function DojoPage() {
  const [ninjas, setNinjas] = useState<Ninja[]>([]);
  const [picked, setPicked] = useState<Ninja | null>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("Tap your name, then enter your 4-digit PIN.");

  useEffect(() => {
    browserSupabase().from("ninjas").select("id, first_name, last_initial, locked").eq("active", true).order("first_name")
      .then(({ data }) => setNinjas(data ?? []));
  }, []);

  async function signIn() {
    if (!picked) return;
    const { data, error } = await browserSupabase().rpc("sign_in_ninja", { target: picked.id, pin });
    setMessage(error?.message ?? data?.detail ?? "No answer.");
    if (data?.ok) {
      sessionStorage.setItem("block-dojo-ninja", picked.id);
      window.location.href = "/portal";
    }
    setPin("");
  }

  return (
    <main>
      <p className="mark">NINJA SIGN-IN</p>
      <h1>Pick your block</h1>
      <section className="card roster">
        {ninjas.map((ninja) => (
          <button key={ninja.id} type="button" className={picked?.id === ninja.id ? "picked" : ""} onClick={() => setPicked(ninja)}>
            {ninja.first_name} {ninja.last_initial}.{ninja.locked ? " locked" : ""}
          </button>
        ))}
      </section>
      <section className="card">
        <p>{picked ? picked.first_name : "No Ninja picked yet."}</p>
        <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="4-digit PIN" />
        <button type="button" onClick={signIn}>Enter dojo</button>
        <p>{message}</p>
      </section>
    </main>
  );
}
