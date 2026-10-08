"use client";

import { FormEvent, useEffect, useState } from "react";
import { browserSupabase } from "../../lib/supabase";

type Dojo = { id: string; name: string; seat_limit: number };
type Session = { id: string; name: string; status: string };
type Device = { id: string; name: string };

export default function DirectorPage() {
  const [dojo, setDojo] = useState<Dojo | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [seat, setSeat] = useState("15");
  const [deviceName, setDeviceName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [role, setRole] = useState("sensei");
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = browserSupabase();
    const { data: dojos } = await supabase.from("dojos").select("id, name, seat_limit").limit(1);
    const first = dojos?.[0] ?? null;
    setDojo(first);
    if (first) setSeat(String(first.seat_limit));
    const { data: sessionRows } = await supabase.from("sessions").select("id, name, status");
    setSessions(sessionRows ?? []);
    const { data: deviceRows } = await supabase.from("devices").select("id, name");
    setDevices(deviceRows ?? []);
  }

  useEffect(() => { load(); }, []);

  async function saveSeat(event: FormEvent) {
    event.preventDefault();
    if (!dojo) return;
    const limit = Math.min(30, Math.max(1, Number(seat)));
    const { error } = await browserSupabase().from("dojos").update({ seat_limit: limit }).eq("id", dojo.id);
    setMessage(error?.message ?? `Seat limit saved at ${limit}.`);
    load();
  }

  async function addSession(event: FormEvent) {
    event.preventDefault();
    if (!dojo) return;
    const { error } = await browserSupabase().from("sessions").insert({ dojo_id: dojo.id, name: sessionName, status: "planned" });
    setMessage(error?.message ?? "Session added.");
    setSessionName("");
    load();
  }

  async function addDevice(event: FormEvent) {
    event.preventDefault();
    if (!dojo) return;
    const { error } = await browserSupabase().from("devices").insert({ dojo_id: dojo.id, name: deviceName });
    setMessage(error?.message ?? "Device added.");
    setDeviceName("");
    load();
  }

  async function assign(event: FormEvent) {
    event.preventDefault();
    const { data, error } = await browserSupabase().rpc("assign_role", { staff_email: staffEmail, staff_role: role });
    setMessage(error?.message ?? String(data));
  }

  return (
    <main>
      <p className="mark">DIRECTOR</p>
      <h1>{dojo?.name ?? "Block Dojo"}</h1>
      <form className="card" onSubmit={saveSeat}>
        <h2>Seat limit</h2>
        <input value={seat} onChange={(event) => setSeat(event.target.value)} />
        <button type="submit">Save</button>
      </form>
      <form className="card" onSubmit={addSession}>
        <h2>Sessions</h2>
        {sessions.map((session) => <p key={session.id}>{session.name} · {session.status}</p>)}
        <input value={sessionName} onChange={(event) => setSessionName(event.target.value)} placeholder="Session name" />
        <button type="submit">Add session</button>
      </form>
      <form className="card" onSubmit={addDevice}>
        <h2>Devices</h2>
        {devices.map((device) => <p key={device.id}>{device.name}</p>)}
        <input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} placeholder="PC name" />
        <button type="submit">Add device</button>
      </form>
      <form className="card" onSubmit={assign}>
        <h2>Staff role</h2>
        <input value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} placeholder="email already in Supabase Auth" />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="sensei">Sensei</option>
          <option value="director">Director</option>
          <option value="owner">Owner</option>
        </select>
        <button type="submit">Assign</button>
      </form>
      <p>{message}</p>
    </main>
  );
}
