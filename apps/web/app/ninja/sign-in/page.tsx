"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Ninja = { id: string; first_name: string; last_initial: string; locked: boolean };

export default function NinjaSignIn() {
  const [ninjas, setNinjas] = useState<Ninja[]>([]);
  const [picked, setPicked] = useState<Ninja | null>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("Tap your name, then your PIN.");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    browserSupabase().from("ninjas").select("id, first_name, last_initial, locked").eq("active", true).order("first_name")
      .then(({ data }) => {
        setNinjas(data ?? []);
        setLoaded(true);
      });
  }, []);

  async function signIn(next = pin) {
    if (!picked || next.length < 4) return;
    const { data, error } = await browserSupabase().rpc("sign_in_ninja", { target: picked.id, pin: next });
    if (error || !data?.ok) {
      setMessage(data?.detail ?? "Ask a Sensei.");
      setPin("");
      return;
    }
    document.cookie = `bd_role=ninja; path=/; max-age=14400`;
    document.cookie = `bd_name=${encodeURIComponent(picked.first_name)}; path=/; max-age=14400`;
    sessionStorage.setItem("block-dojo-ninja", picked.id);
    window.location.href = "/ninja";
  }

  return (
    <main>
      <h1>{picked ? picked.first_name : "Find your name"}</h1>
      <section className="card roster">
        {loaded && ninjas.length === 0 ? <p>No names yet. A Director imports the roster first.</p> : null}
        {ninjas.map((ninja) => (
          <button key={ninja.id} type="button" className={picked?.id === ninja.id ? "picked" : ""} disabled={ninja.locked} onClick={() => { setPicked(ninja); setPin(""); setMessage(ninja.locked ? "This Ninja is locked. Ask a Sensei." : "Tap your PIN."); }}>
            {ninja.first_name}{ninja.locked ? " · locked" : ""}
          </button>
        ))}
      </section>
      {picked ? (
        <section className="card">
          <p className="pin">{pin || "----"}</p>
          <div className="keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "ok"].map((key) => (
              <button key={key} type="button" className="go" onClick={() => {
                if (key === "clear") setPin("");
                else if (key === "ok") signIn();
                else {
                  const next = (pin + key).slice(0, 4);
                  setPin(next);
                  if (next.length === 4) signIn(next);
                }
              }}>{key === "clear" ? "Clear" : key === "ok" ? "OK" : key}</button>
            ))}
          </div>
          <button type="button" onClick={() => { setPicked(null); setPin(""); setMessage("Tap your name, then your PIN."); }}>Pick a different name</button>
          <p>{message}</p>
        </section>
      ) : null}
    </main>
  );
}
