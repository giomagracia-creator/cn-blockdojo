"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "../../../lib/supabase";
import { useGame } from "../../game";

type Item = { id: string; name: string; description: string; price: number; stock: number; kind: string };

export default function ShopPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState("Pick an item. Coins come off the belt journey.");
  const game = useGame();

  useEffect(() => {
    browserSupabase().from("shop_items").select("id, name, description, price, stock, kind").then(({ data }) => setItems(data ?? []));
  }, []);

  async function buy(id: string) {
    const target = sessionStorage.getItem("block-dojo-ninja");
    if (!target) {
      setMessage("Sign in as a Ninja first.");
      return;
    }
    const { data, error } = await browserSupabase().rpc("buy_item", { target, item: id });
    setMessage(error?.message ?? data?.detail ?? "No answer.");
    if (data?.ok) {
      const item = items.find((row) => row.id === id);
      if (item) game.bought(item.name, item.price);
    }
  }

  return (
    <main>
      <h1>Shop</h1>
      {items.map((item) => (
        <section className="card" key={item.id}>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <p>{item.price} coins · {item.stock} left · {item.kind}</p>
          <button className="go" type="button" onClick={() => buy(item.id)}>Buy</button>
        </section>
      ))}
      <p>{ninja ? message : "Sign in as a Ninja to buy."}</p>
    </main>
  );
}
