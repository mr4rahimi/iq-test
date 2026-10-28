import { fa } from "@/lib/format";

const W = 600;
const H = 180;
const MIN = 55;
const MAX = 145;
const x = (iq: number) => ((iq - MIN) / (MAX - MIN)) * W;
const y = (iq: number) => H - 20 - Math.exp(-(((iq - 100) / 15) ** 2) / 2) * (H - 40);

/** Normal distribution of IQ scores with the user's score marked. */
export function BellCurve({ iq }: { iq: number }) {
  const points: string[] = [];
  for (let v = MIN; v <= MAX; v += 1) points.push(`${x(v).toFixed(1)},${y(v).toFixed(1)}`);
  const marked = Math.min(MAX, Math.max(MIN, iq));
  const area: string[] = [`${x(MIN)},${H - 20}`];
  for (let v = MIN; v <= marked; v += 1) area.push(`${x(v).toFixed(1)},${y(v).toFixed(1)}`);
  area.push(`${x(marked)},${y(marked)}`, `${x(marked)},${H - 20}`);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" direction="ltr" role="img" aria-label={`نمره ${fa(iq)} روی منحنی توزیع نرمال`}>
      <polygon points={area.join(" ")} className="fill-primary/20" />
      <polyline points={points.join(" ")} fill="none" className="stroke-primary" strokeWidth={2.5} />
      <line x1={0} x2={W} y1={H - 20} y2={H - 20} className="stroke-border" strokeWidth={1.5} />
      {[70, 85, 100, 115, 130].map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={H - 20} y2={H - 14} className="stroke-muted" />
          <text x={x(v)} y={H - 2} textAnchor="middle" className="fill-muted text-[12px]">
            {fa(v)}
          </text>
        </g>
      ))}
      <line x1={x(marked)} x2={x(marked)} y1={y(marked) - 14} y2={H - 20} className="stroke-accent" strokeWidth={2.5} strokeDasharray="5 4" />
      <circle cx={x(marked)} cy={y(marked)} r={6} className="fill-accent" />
    </svg>
  );
}
