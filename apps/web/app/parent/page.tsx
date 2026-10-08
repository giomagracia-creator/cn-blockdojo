"use client";

import { FormEvent, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

type Child = { first_name: string; belt: string; level: number; coins: number; note: string | null };

export default function ParentPage() {
  const [pin, setPin] = useState("");
  const [parentId, setParentId] = useState("");
  const [signed, setSigned] = useState(false);
  const [name, setName] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [message, setMessage] = useState("Demo parent PIN is 135790.");

  async function signIn(event: FormEvent) {
    event.preventDefault();
    const { data, error } = await browserSupabase().rpc("parent_sign_in", { pin });
    if (error || !data?.ok) {
      setMessage(error?.message ?? data?.detail ?? "No match.");
      return;
    }
    document.cookie = "bd_role=parent; path=/; max-age=28800";
    document.cookie = `bd_name=${encodeURIComponent(data.name)}; path=/; max-age=28800`;
    setParentId(data.parent_id);
    setSigned(Boolean(data.signed));
    const view = await browserSupabase().rpc("parent_view", { parent: data.parent_id });
    setChildren(view.data ?? []);
  }

  async function agree(event: FormEvent) {
    event.preventDefault();
    const { data, error } = await browserSupabase().rpc("sign_waiver", { parent: parentId, signed_name: name });
    setMessage(error?.message ?? String(data));
    if (!error) setSigned(true);
  }

  return (
    <main>
      <h1>Parent</h1>
      {!parentId ? (
        <form className="card" onSubmit={signIn}>
          <input value={pin} onChange={(event) => setPin(event.target.value)} placeholder="6-digit PIN" />
          <button className="go" type="submit">Open updates</button>
          <p>{message}</p>
        </form>
      ) : null}
      {parentId && !signed ? (
        <form className="card" onSubmit={agree}>
          <p>Sign the activity, photo, and screen-monitoring agreement before the updates open.</p>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required />
          <button className="go" type="submit">Sign</button>
        </form>
      ) : null}
      {signed ? children.map((child) => (
        <section className="card" key={child.first_name}>
          <h2>{child.first_name}</h2>
          <p>{child.belt} belt · level {child.level} · {child.coins} coins</p>
          <p>{child.note ?? "No note yet."}</p>
        </section>
      )) : null}
    </main>
  );
}
