/** Lane markings heading west to the horizon, in their own band below the hero copy. */
export function Road() {
  return (
    <div className="road-band relative mt-14 h-28 w-full overflow-hidden md:h-36" aria-hidden>
      <svg viewBox="0 0 1200 140" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 8 L1200 8" stroke="var(--border)" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M0 8 L1200 140" stroke="var(--border)" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M1200 74 L0 8" stroke="var(--brand)" strokeWidth="3" fill="none" className="road-dash" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
