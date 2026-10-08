"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { browserSupabase } from "../lib/supabase";

type Profile = { id: string; first_name: string; belt: string; level: number; xp_in_level: number; coins: number };
type Game = {
  profile: Profile | null;
  owned: string[];
  equipped: string;
  toast: string;
  equip: (name: string) => void;
  refresh: () => Promise<void>;
  bought: (name: string, price: number) => void;
};

const GameContext = createContext<Game>({
  profile: null, owned: [], equipped: "", toast: "", equip: () => {}, refresh: async () => {}, bought: () => {},
});

export function useGame() { return useContext(GameContext); }

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState("");
  const [toast, setToast] = useState("");

  async function refresh() {
    const id = sessionStorage.getItem("block-dojo-ninja");
    if (!id) return;
    const { data } = await browserSupabase().rpc("live_board");
    const row = Array.isArray(data) ? data.find((item) => item.id === id) : null;
    if (row) setProfile(row);
    const locker = await browserSupabase().from("inventory").select("shop_items(name)").eq("ninja_id", id);
    const names = (locker.data ?? []).map((row) => {
      const item = row.shop_items as { name?: string } | { name?: string }[] | null;
      return Array.isArray(item) ? item[0]?.name : item?.name;
    }).filter((name): name is string => Boolean(name));
    setOwned(names);
    setEquipped(sessionStorage.getItem("block-dojo-equipped") ?? names[0] ?? "");
  }

  useEffect(() => { refresh(); }, []);

  function equip(name: string) {
    setEquipped(name);
    sessionStorage.setItem("block-dojo-equipped", name);
    setToast(`${name} equipped`);
  }

  function bought(name: string, price: number) {
    setOwned((items) => items.includes(name) ? items : [...items, name]);
    setProfile((current) => current ? { ...current, coins: Math.max(0, current.coins - price) } : current);
    setToast(`${name} added`);
    refresh();
  }

  return <GameContext.Provider value={{ profile, owned, equipped, toast, equip, refresh, bought }}>{children}</GameContext.Provider>;
}
