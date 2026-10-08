"use client";

import { useEffect, useState } from "react";

export function PixelNinja({ equipped }: { belt: string; equipped: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((value) => (value ? 0 : 1)), 700);
    return () => clearInterval(timer);
  }, []);
  const src = frame ? "/kenney/player_cheer.png" : "/kenney/player_idle.png";
  return <img className="pixel" src={src} alt={equipped ? `${equipped} ninja` : "Pixel ninja"} />;
}
