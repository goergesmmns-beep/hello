const rows = [["Time to revenue", "Slow", "Immediate on closing"], ["Risk", "High", "Lower"], ["Cost", "Expensive", "Lower, with creative funding"], ["What you add", "More sales, one at a time", "Revenue, talent and market share"]];
export function GrowCompare() {
  return (
    <div className="overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-left"><thead><tr className="border-b"><th className="py-3 font-normal"><span className="sr-only">Compare</span></th><th className="eyebrow py-3 font-normal">Organic growth</th><th className="eyebrow py-3 font-normal !text-brand-ink">Growth through acquisition</th></tr></thead>
      <tbody>{rows.map(([a, b, c]) => <tr key={a} className="border-b"><th scope="row" className="py-4 pr-4 font-semibold">{a}</th><td className="py-4 pr-4 text-muted-foreground">{b}</td><td className="py-4 font-medium">{c}</td></tr>)}</tbody></table></div>
  );
}
