"use client";

import { FormEvent, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

export default function StaffSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Senseis and Directors sign in here.");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const supabase = browserSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setMessage(error?.message ?? "Sign-in failed.");
      return;
    }
    const { data: staff } = await supabase.from("staff_users").select("role, email").eq("auth_user_id", data.user.id).maybeSingle();
    if (!staff) {
      setMessage("This login has no role yet. Claim Director only if you are the first one.");
      return;
    }
    document.cookie = `bd_role=${staff.role}; path=/; max-age=28800`;
    document.cookie = `bd_name=${encodeURIComponent(staff.email)}; path=/; max-age=28800`;
    window.location.href = staff.role === "sensei" ? "/sensei" : "/director";
  }

  async function claim() {
    const { data, error } = await browserSupabase().rpc("claim_director");
    setMessage(error?.message ?? String(data));
    if (data === "Director claimed.") {
      document.cookie = "bd_role=director; path=/; max-age=28800";
      window.location.href = "/director";
    }
  }

  return (
    <main>
      <h1>Staff sign-in</h1>
      <form className="card" onSubmit={onSubmit}>
        <label>Email <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label>
        <label>Password <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></label>
        <button className="go" type="submit">Sign in</button>
        <button type="button" onClick={claim}>Claim Director</button>
        <p>{message}</p>
      </form>
    </main>
  );
}
