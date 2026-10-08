"use client";

import { useEffect } from "react";

export function Motion() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll(".card"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    }, { threshold: 0.12 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);
  return null;
}
