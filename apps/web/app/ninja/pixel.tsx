"use client";

import { useEffect, useState } from "react";

const frames = Array.from({ length: 16 }, (_, index) => `/lpc/step-${String(index).padStart(2, "0")}.png`);

export function PixelNinja({ equipped }: { belt: string; equipped: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((value) => (value + 1) % frames.length), 140);
    return () => clearInterval(timer);
  }, []);
  return <img className="pixel lpc" src={frames[frame]} alt={equipped ? `${equipped} ninja turning` : "LPC ninja turning"} />;
}
