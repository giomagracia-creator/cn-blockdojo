"use client";

import { FormEvent, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

export default function StaffPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Sign in with the login you created in Supabase Auth.");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const supabase = browserSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setMessage(error?.message ?? "Sign-in failed.");
      return;
    }
    const { data: staff } = await supabase.from("staff_users").select("role").eq("auth_user_id", data.user.id).maybeSingle();
    if (!staff) {
      setMessage("Signed in, but this login has no role yet. Claim Director if you are the first one.");
      return;
    }
    window.location.href = staff.role === "sensei" ? "/sensei" : "/director";
  }

  async function claim() {
    const supabase = browserSupabase();
    const { data, error } = await supabase.rpc("claim_director");
    setMessage(error?.message ?? String(data));
    if (data === "Director claimed.") window.location.href = "/director";
  }

  return (
    <main>
      <p className="mark">STAFF</p>
      <h1>Sensei gate</h1>
      <form className="card" onSubmit={onSubmit}>
        <label>Email <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label>
        <label>Password <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></label>
        <button type="submit">Sign in</button>
        <button type="button" onClick={claim}>Claim Director</button>
        <p>{message}</p>
      </form>
    </main>
  );
}
