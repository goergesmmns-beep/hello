"use client";
import { useEffect, useRef, useState } from "react";
/** Shows the real value by default, then counts up the first time it scrolls into view. */
export function CountUp({ value }: { value: string }) {
  const m = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const [v, setV] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!m || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = parseFloat(m[2]), dec = (m[2].split(".")[1] ?? "").length;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => { const p = Math.min(1, (t - t0) / 1400), ease = 1 - (1 - p) ** 3; setV(m[1] + (target * ease).toFixed(dec) + m[3]); if (p < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    });
    io.observe(ref.current!);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]); // eslint-disable-line
  return <span ref={ref}>{v}</span>;
}
