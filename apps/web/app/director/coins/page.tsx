"use client";

import { FormEvent, useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";

type Ninja = { id: string; first_name: string };

export default function CoinsPage() {
  const [ninjas, setNinjas] = useState<Ninja[]>([]);
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("10");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("20");
  const [message, setMessage] = useState("Coin changes are Director only.");

  useEffect(() => {
    browserSupabase().from("ninjas").select("id, first_name").then(({ data }) => setNinjas(data ?? []));
  }, []);

  async function adjust(event: FormEvent) {
    event.preventDefault();
    const { data, error } = await browserSupabase().rpc("adjust_coins", { target, amount: Number(amount), reason: "director adjust" });
    setMessage(error?.message ?? String(data));
  }

  async function addItem(event: FormEvent) {
    event.preventDefault();
    const { data, error } = await browserSupabase().rpc("add_shop_item", { item_name: name, item_price: Number(price), item_kind: "physical" });
    setMessage(error?.message ?? String(data));
  }

  return (
    <main>
      <h1>Coins</h1>
      <form className="card" onSubmit={adjust}>
        <h2>Adjust coins</h2>
        <select value={target} onChange={(event) => setTarget(event.target.value)}>
          <option value="">Pick a Ninja</option>
          {ninjas.map((ninja) => <option key={ninja.id} value={ninja.id}>{ninja.first_name}</option>)}
        </select>
        <input value={amount} onChange={(event) => setAmount(event.target.value)} />
        <button className="go" type="submit">Save coins</button>
      </form>
      <form className="card" onSubmit={addItem}>
        <h2>Add shop item</h2>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Item name" />
        <input value={price} onChange={(event) => setPrice(event.target.value)} />
        <button type="submit">Add item</button>
      </form>
      <p>{message}</p>
    </main>
  );
}
