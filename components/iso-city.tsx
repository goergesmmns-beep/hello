"use client";
import { useEffect, useRef } from "react";

/** Isometric deal city: traffic runs along the road and businesses light up as they sell. */
const BRAND = [247, 178, 103];
const N = 11, ROAD = 5;
type B = { x: number; y: number; h: number; seed: number };

export function IsoCity() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!; const ctx = cv.getContext("2d")!;
    const rnd = (i: number) => { const v = Math.sin(i * 127.1) * 43758.5453; return v - Math.floor(v); };
    const blocks: B[] = [];
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
      if (y === ROAD || x === 7) continue;
      const s = rnd(x * 17 + y * 31 + 3);
      if (s < .24) continue;
      blocks.push({ x, y, h: .25 + rnd(x * 7 + y * 13) * 1.75, seed: s });
    }
    blocks.sort((a, b) => a.x + a.y - (b.x + b.y));
    let w = 0, h = 0, unit = 30, ox = 0, oy = 0, raf = 0, visible = true, mx = 0, my = 0, px = 0, py = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      unit = Math.max(19, Math.min(w / (N * 1.72), h / (N * 1.02))); ox = w / 2; oy = h / 2 - unit * N * .43;
    };
    const iso = (x: number, y: number, z = 0): [number, number] => [ox + px + (x - y) * unit * .866, oy + py + (x + y) * unit * .5 - z * unit];
    const poly = (pts: [number, number][], fill: string, line?: string) => { ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (line) { ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke(); } };
    const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const box = (x: number, y: number, s: number, hh: number, heat: number) => {
      const a = iso(x, y, hh), b = iso(x + s, y, hh), c = iso(x + s, y + s, hh), d = iso(x, y + s, hh);
      const mix = (v: number, k: number) => Math.round(v + (BRAND[k] - v) * heat);
      const col = (v: number) => `rgb(${mix(v, 0)},${mix(v, 1)},${mix(v, 2)})`;
      poly([d, c, iso(x + s, y + s), iso(x, y + s)], col(13), "rgba(255,255,255,.07)");
      poly([b, c, iso(x + s, y + s), iso(x + s, y)], col(22), "rgba(255,255,255,.07)");
      poly([a, b, c, d], col(34), `rgba(255,255,255,${.14 + heat * .5})`);
      if (heat > .05) { const t = iso(x + s / 2, y + s / 2, hh + .1 + heat * .25); const g = ctx.createRadialGradient(t[0], t[1], 0, t[0], t[1], unit * 2.2); g.addColorStop(0, rgba(BRAND, .34 * heat)); g.addColorStop(1, rgba(BRAND, 0)); ctx.fillStyle = g; ctx.fillRect(t[0] - unit * 2.2, t[1] - unit * 2.2, unit * 4.4, unit * 4.4); }
    };
    const draw = (t: number) => {
      px += (mx - px) * .05; py += (my - py) * .05;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i <= N; i++) { const a = iso(i, 0), b = iso(i, N), c = iso(0, i), d = iso(N, i); ctx.strokeStyle = "rgba(255,255,255,.045)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.moveTo(...c); ctx.lineTo(...d); ctx.stroke(); }
      poly([iso(0, ROAD), iso(N, ROAD), iso(N, ROAD + 1), iso(0, ROAD + 1)], "#0a0a0a", "rgba(255,255,255,.14)");
      poly([iso(7, 0), iso(8, 0), iso(8, N), iso(7, N)], "#0a0a0a", "rgba(255,255,255,.14)");
      const dash = (t / 500) % 1;
      for (let i = -1; i < N; i++) { const s = i + dash, e = s + .42; if (s < 0 || e > N) continue; ctx.strokeStyle = rgba(BRAND, .85); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...iso(N - s, ROAD + .5)); ctx.lineTo(...iso(N - e, ROAD + .5)); ctx.stroke(); }
      const cycle = 1500, idx = Math.floor(t / cycle), f = (t % cycle) / cycle;
      const heatOf = (b: B, i: number) => {
        let v = 0;
        for (let k = 0; k < 5; k++) { const age = k + f; if (Math.floor(rnd(idx - k + 11) * blocks.length) === i) v = Math.max(v, Math.min(1, age * 3) * Math.max(0, 1 - age / 5)); }
        return v + (b.seed > .93 ? .34 : 0);
      };
      const cars = [0, 1, 2].map((k) => ({ p: N - (((t / 1500 + k * 3.7) % (N + 1.4)) - .7), lane: ROAD + .28 + k % 2 * .36 }));
      const car2 = (((t / 1900) % (N + 1.4)) - .7);
      blocks.forEach((b, i) => {
        if (b.y > ROAD && !drawnCars) { paintCars(); drawnCars = true; }
        box(b.x + .1, b.y + .1, .8, b.h * (.94 + Math.sin(t / 1400 + b.seed * 9) * .025), Math.min(1, heatOf(b, i)));
      });
      if (!drawnCars) paintCars();
      drawnCars = false;
      function paintCars() {
        cars.forEach((c) => { for (let j = 8; j >= 0; j--) { const [a, e] = iso(c.p + j * .09, c.lane, .05); ctx.fillStyle = rgba(BRAND, (1 - j / 9) * .32); ctx.fillRect(a - 2, e - 1.5, 4, 3); } box(c.p - .16, c.lane - .09, .24, .13, 1); });
        const [a, e] = iso(7.5, car2); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(a, e - 3, 2.6, 0, 7); ctx.fill();
      }
    };
    let drawnCars = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop = (t: number) => { if (visible) draw(t); raf = requestAnimationFrame(loop); };
    size();
    if (reduced) draw(9000); else raf = requestAnimationFrame(loop);
    const onResize = () => { size(); if (reduced) draw(9000); };
    const onMove = (e: PointerEvent) => { mx = (e.clientX / innerWidth - .5) * -22; my = (e.clientY / innerHeight - .5) * -14; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv); addEventListener("resize", onResize); addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", onResize); removeEventListener("pointermove", onMove); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
