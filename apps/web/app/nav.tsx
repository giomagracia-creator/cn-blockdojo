"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const shells = {
  ninja: [["/ninja", "Home"], ["/ninja/quests", "Quests"], ["/ninja/shop", "Shop"], ["/ninja/locker", "Locker"], ["/ninja/leaderboard", "Leaderboard"]],
  sensei: [["/sensei", "Floor"], ["/sensei/notes", "Notes"], ["/sensei/awards", "Awards"], ["/sensei/belt-up", "Belt-up"], ["/sensei/lookup", "Lookup"]],
  director: [["/director", "Overview"], ["/director/roster", "Roster"], ["/director/coins", "Coins"], ["/director/settings", "Settings"], ["/director/staff", "Staff"]],
};

function roleFromPath(path: string) {
  if (path.startsWith("/ninja") && !path.startsWith("/ninja/sign-in")) return "ninja";
  if (path.startsWith("/sensei")) return "sensei";
  if (path.startsWith("/director")) return "director";
  return "";
}

export function DojoNav() {
  const path = usePathname();
  const role = roleFromPath(path);
  const [name, setName] = useState("");
  useEffect(() => {
    setName(decodeURIComponent(document.cookie.match(/bd_name=([^;]+)/)?.[1] ?? ""));
  }, [path]);
  if (path.startsWith("/tv")) return null;
  if (!role) {
    return (
      <header className="topnav">
        <Link className="brand" href="/">Block Dojo</Link>
        <Link href="/">Sign in</Link>
      </header>
    );
  }
  return (
    <header className="topnav">
      <Link className="brand" href={shells[role][0][0]}>{role}</Link>
      <nav>
        {shells[role].map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <p className="who">Signed in as {name || role} · <button type="button" onClick={() => { document.cookie = "bd_role=; path=/; max-age=0"; document.cookie = "bd_name=; path=/; max-age=0"; window.location.href = "/"; }}>Sign out</button></p>
    </header>
  );
}
