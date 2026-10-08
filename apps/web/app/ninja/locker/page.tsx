"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

export default function LockerPage() {
  const [rows, setRows] = useState<Array<{ id: string; shop_items: { name: string } | null }>>([]);

  useEffect(() => {
    const ninja = sessionStorage.getItem("block-dojo-ninja");
    if (!ninja) return;
    browserSupabase().from("inventory").select("id, shop_items(name)").eq("ninja_id", ninja).then(({ data }) => setRows(data ?? []));
  }, []);

  return (
    <main>
      <h1>Locker</h1>
      <section className="card">
        {rows.length === 0 ? <p>No skins yet. Buy one in the shop.</p> : rows.map((row) => <p key={row.id}>{row.shop_items?.name}</p>)}
      </section>
    </main>
  );
}
