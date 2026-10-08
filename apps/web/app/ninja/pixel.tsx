"use client";

import { useEffect, useRef } from "react";

const skin = {
  base: ["#f2c7a0", "#1c1c1e", "#338fbf", "#f4efe4"],
  blue: ["#f2c7a0", "#1c1c1e", "#338fbf", "#9fd0ea"],
  snack: ["#f2c7a0", "#5a3a1a", "#c47a3a", "#e3d5b1"],
};

export function PixelNinja({ belt, equipped }: { belt: string; equipped: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !canvas.current) return;
    const palette = equipped.toLowerCase().includes("blue") ? skin.blue : equipped.toLowerCase().includes("snack") ? skin.snack : skin.base;
    const sash = belt.toLowerCase().includes("yellow") ? "#e3b341" : belt.toLowerCase().includes("orange") ? "#e07a2f" : "#f7f4ee";
    let frame = 0;
    const draw = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = "#7dba6a";
      ctx.fillRect(8, 50, 48, 8);
      ctx.fillStyle = palette[1];
      ctx.fillRect(26, 14 + (frame ? 1 : 0), 12, 10);
      ctx.fillStyle = palette[0];
      ctx.fillRect(28, 16 + (frame ? 1 : 0), 8, 6);
      ctx.fillStyle = palette[2];
      ctx.fillRect(24, 24 + (frame ? 1 : 0), 16, 16);
      ctx.fillStyle = sash;
      ctx.fillRect(24, 30 + (frame ? 1 : 0), 16, 3);
      ctx.fillStyle = palette[3];
      ctx.fillRect(22, 40, 6, 8);
      ctx.fillRect(36, 40, 6, 8);
    };
    draw();
    const timer = setInterval(() => { frame = frame ? 0 : 1; draw(); }, 500);
    return () => clearInterval(timer);
  }, [belt, equipped]);

  return <canvas ref={canvas} width={64} height={64} className="pixel" aria-label="Pixel ninja" />;
}
