"use client";

import { useEffect, useState } from "react";

const frames = ["/lpc/turn-0.png", "/lpc/turn-1.png", "/lpc/turn-2.png", "/lpc/turn-3.png"];

export function PixelNinja({ equipped }: { belt: string; equipped: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((value) => (value + 1) % frames.length), 420);
    return () => clearInterval(timer);
  }, []);
  return <img className="pixel lpc" src={frames[frame]} alt={equipped ? `${equipped} ninja turning` : "LPC ninja turning"} />;
}
