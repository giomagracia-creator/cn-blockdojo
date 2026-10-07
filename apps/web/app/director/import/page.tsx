"use client";

import { FormEvent, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Row = { first_name: string; last_name: string; belt: string; session: string; parent_name: string; photo_consent: boolean };

function parseCsv(text: string): Row[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(1).map((line) => {
    const [first_name, last_name, belt, , session, parent_name, photo] = line.split(",").map((part) => part.trim());
    return { first_name, last_name, belt, session: session || "CREATE Afternoon", parent_name, photo_consent: /^y|true|1/i.test(photo ?? "") };
  });
}

export default function ImportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("Columns: first_name, last_name, belt, dojo, session, parent_name, photo_consent");

  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("file");
    if (!(file instanceof File)) return;
    file.text().then((text) => {
      const parsed = parseCsv(text);
      setRows(parsed);
      setMessage(`${parsed.length} rows ready. Nothing is saved until you commit.`);
    });
  }

  async function commit() {
    const { data, error } = await browserSupabase().rpc("import_roster", { rows, file_name: "roster.csv" });
    if (error) {
      setMessage(error.message);
      return;
    }
    sessionStorage.setItem("block-dojo-pin-sheet", JSON.stringify(data.sheet ?? []));
    setMessage(`Added ${data.added}. Skipped ${data.errors}. Open the PIN sheet to print.`);
  }

  return (
    <main>
      <p className="mark">IMPORT</p>
      <h1>Roster</h1>
      <form className="card" onSubmit={preview}>
        <input name="file" type="file" accept=".csv,text/csv" />
        <button type="submit">Preview</button>
      </form>
      <section className="card">
        {rows.map((row) => <p key={`${row.first_name}-${row.last_name}`}>{row.first_name} {row.last_name} · {row.belt} · {row.parent_name}</p>)}
        <button type="button" onClick={commit} disabled={rows.length === 0}>Commit import</button>
        <p>{message}</p>
        <p><a href="/director/pins">Open PIN sheet</a></p>
      </section>
    </main>
  );
}
