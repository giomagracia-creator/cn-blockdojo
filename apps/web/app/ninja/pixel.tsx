"use client";

import { useEffect, useRef } from "react";

const steps: [number, number][] = [];
for (const row of [2, 3, 0, 1]) {
  for (const frame of [0, 2, 4, 6]) steps.push([row, frame]);
}

const bases = steps.map((_, index) => `/lpc/base-${String(index).padStart(2, "0")}.png`);

function load(src: string) {
  const image = new Image();
  image.src = src;
  return image;
}

function paintHair(source: HTMLImageElement, row: number, frame: number, color: string, dest: CanvasRenderingContext2D) {
  const scratch = document.createElement("canvas");
  scratch.width = 64;
  scratch.height = 64;
  const ctx = scratch.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(source, frame * 64, row * 64, 64, 64, 0, 0, 64, 64);
  const data = ctx.getImageData(0, 0, 64, 64);
  const bits = data.data;
  const hex = parseInt(color.slice(1), 16);
  const cr = (hex >> 16) & 255;
  const cg = (hex >> 8) & 255;
  const cb = hex & 255;
  for (let i = 0; i < bits.length; i += 4) {
    if (bits[i + 3] < 20) continue;
    const r = bits[i];
    const g = bits[i + 1];
    const b = bits[i + 2];
    if (r < 70 && g < 45 && b < 55) continue;
    const light = Math.min(1, (r * 0.4 + g * 0.4 + b * 0.2) / 180);
    bits[i] = Math.min(255, Math.round(cr * (0.35 + light)));
    bits[i + 1] = Math.min(255, Math.round(cg * (0.35 + light)));
    bits[i + 2] = Math.min(255, Math.round(cb * (0.35 + light)));
  }
  ctx.putImageData(data, 0, 0);
  dest.drawImage(scratch, 0, 0);
}

export function PixelNinja({ hair, color }: { belt: string; equipped: string; hair: string; color: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const view = canvas.current?.getContext("2d");
    if (!view) return;
    view.imageSmoothingEnabled = false;
    const body = bases.map(load);
    const top = load(`/lpc/hair/${hair}.png`);
    let step = 0;
    const timer = setInterval(() => {
      const [row, frame] = steps[step];
      view.clearRect(0, 0, 64, 64);
      if (body[step].complete) view.drawImage(body[step], 0, 0);
      if (top.complete) paintHair(top, row, frame, color, view);
      step = (step + 1) % steps.length;
    }, 140);
    return () => clearInterval(timer);
  }, [hair, color]);

  return <canvas ref={canvas} className="pixel lpc" width={64} height={64} aria-label="Ninja with chosen hair" />;
}
