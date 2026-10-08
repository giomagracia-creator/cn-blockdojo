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
  const [note, setNote] = useState("");
  const [report, setReport] = useState<{ minutes_14d: number; open_alerts: number; coins_spent: number; ninjas: number; last_ping: string | null } | null>(null);
  const [notes, setNotes] = useState<Array<{ id: string; note: string; created_at: string }>>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const supabase = browserSupabase();
    const { data: dojos } = await supabase.from("dojos").select("id, name, seat_limit").order("name").limit(1);
    const first = dojos?.[0] ?? null;
    setDojo(first);
    if (first) setSeat(String(first.seat_limit));
    const { data: sessionRows } = await supabase.from("sessions").select("id, name, status");
    setSessions(sessionRows ?? []);
    const { data: deviceRows } = await supabase.from("devices").select("id, name");
    setDevices(deviceRows ?? []);
    const summary = await supabase.rpc("pilot_report");
    if (summary.data && typeof summary.data === "object") setReport(summary.data);
    const saved = await supabase.rpc("list_pilot_notes");
    setNotes(Array.isArray(saved.data) ? saved.data : []);
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
      <p className="mark">OVERVIEW</p>
      <h1>{dojo?.name ?? "Block Dojo"}</h1>
      <section className="card">
        <h2>Pilot</h2>
        <p>Active minutes, 14 days: {report?.minutes_14d ?? 0}</p>
        <p>Open alerts: {report?.open_alerts ?? 0}</p>
        <p>Coins spent, 14 days: {report?.coins_spent ?? 0}</p>
        <p>Ninjas: {report?.ninjas ?? 0}</p>
        <p>Last keep-alive: {report?.last_ping ? new Date(report.last_ping).toLocaleString() : "Not yet"}</p>
        <p>
          <a href="/tv/central">Central TV</a>
          {" · "}
          <a href="/tv/dojo-2">Dojo 2 TV</a>
          {" · "}
          <a href="/tv/lobby">Lobby TV</a>
        </p>
        <button type="button" onClick={async () => {
          const { data, error } = await browserSupabase().rpc("keep_alive");
          setMessage(error?.message ?? String(data));
          load();
        }}>Run keep-alive</button>
        <button type="button" onClick={async () => {
          const { data, error } = await browserSupabase().rpc("purge_old");
          setMessage(error?.message ?? String(data));
        }}>Purge old rows</button>
        <button type="button" onClick={async () => {
          const { data, error } = await browserSupabase().rpc("backup_snapshot");
          if (error || !data) { setMessage(error?.message ?? "No backup."); return; }
          const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(file);
          link.download = "block-dojo-backup.json";
          link.click();
          setMessage("Backup downloaded. Keep that file.");
        }}>Download backup</button>
      </section>
      <form className="card" onSubmit={async (event) => {
        event.preventDefault();
        const { data, error } = await browserSupabase().rpc("add_pilot_note", { note });
        setMessage(error?.message ?? String(data));
        setNote("");
        load();
      }}>
        <h2>Ninja feedback</h2>
        {notes.map((item) => <p key={item.id}>{item.note}</p>)}
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="What did the Ninjas say?" />
        <button type="submit">Save note</button>
      </form>
      <section className="card">
        <h2>System status</h2>
        <p>The dojo page is live. Database checks stay here, not on the front door.</p>
      </section>
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
