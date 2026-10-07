"use client";

import { useEffect, useState } from "react";

type PinRow = { first_name: string; last_initial: string; ninja_pin: string; parent_name: string; parent_pin: string };

export default function PinSheetPage() {
  const [rows, setRows] = useState<PinRow[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("block-dojo-pin-sheet");
    setRows(saved ? JSON.parse(saved) : []);
  }, []);

  return (
    <main>
      <p className="mark">PIN SHEET</p>
      <h1>Hand these out in person</h1>
      <section className="card">
        {rows.length === 0 ? <p>Import a roster first. This sheet stays in this browser only.</p> : null}
        {rows.map((row) => (
          <p key={`${row.first_name}-${row.last_initial}`}>
            {row.first_name} {row.last_initial}. · Ninja PIN {row.ninja_pin}
            {row.parent_name ? ` · ${row.parent_name} parent PIN ${row.parent_pin}` : ""}
          </p>
        ))}
        <button type="button" onClick={() => window.print()}>Print</button>
      </section>
    </main>
  );
}
