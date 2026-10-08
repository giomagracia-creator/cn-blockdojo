"use client";

import { useEffect, useState } from "react";

export function PixelNinja({ equipped }: { belt: string; equipped: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((value) => (value ? 0 : 1)), 450);
    return () => clearInterval(timer);
  }, []);
  return <img className="pixel lpc" src={frame ? "/lpc/lpc-walk.png" : "/lpc/lpc-idle.png"} alt={equipped ? `${equipped} ninja` : "LPC ninja"} />;
}
