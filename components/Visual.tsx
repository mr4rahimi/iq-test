import { useId } from "react";
import type { Grid, ShapeKind, ShapeSpec, Visual } from "@/lib/types";

const LAYOUTS: Record<number, { pos: [number, number][]; r: number }> = {
  1: { pos: [[50, 50]], r: 26 },
  2: { pos: [[29, 50], [71, 50]], r: 17 },
  3: { pos: [[50, 28], [28, 70], [72, 70]], r: 16 },
  4: { pos: [[29, 29], [71, 29], [29, 71], [71, 71]], r: 15 },
};

function polygon(cx: number, cy: number, r: number, n: number, inner?: number) {
  const pts: string[] = [];
  const steps = inner ? n * 2 : n;
  for (let i = 0; i < steps; i++) {
    const rad = inner && i % 2 === 1 ? inner : r;
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / steps;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function Shape({ kind, cx, cy, r, ...paint }: { kind: ShapeKind; cx: number; cy: number; r: number } & React.SVGProps<SVGElement>) {
  const p = paint as React.SVGProps<SVGPolygonElement>;
  switch (kind) {
    case "circle":
      return <circle cx={cx} cy={cy} r={r} {...(paint as React.SVGProps<SVGCircleElement>)} />;
    case "square":
      return <rect x={cx - r * 0.85} y={cy - r * 0.85} width={r * 1.7} height={r * 1.7} {...(paint as React.SVGProps<SVGRectElement>)} />;
    case "triangle":
      return <polygon points={polygon(cx, cy + r * 0.15, r * 1.05, 3)} {...p} />;
    case "diamond":
      return <polygon points={polygon(cx, cy, r, 4)} {...p} />;
    case "pentagon":
      return <polygon points={polygon(cx, cy, r, 5)} {...p} />;
    case "star":
      return <polygon points={polygon(cx, cy, r * 1.05, 5, r * 0.45)} {...p} />;
    case "arrow": {
      const w = r * 0.38;
      const pts = [
        [cx, cy - r], [cx + r * 0.85, cy - r * 0.1], [cx + w, cy - r * 0.1],
        [cx + w, cy + r], [cx - w, cy + r], [cx - w, cy - r * 0.1], [cx - r * 0.85, cy - r * 0.1],
      ];
      return <polygon points={pts.map((q) => q.join(",")).join(" ")} {...p} />;
    }
  }
}

export function ShapeCell({ cell }: { cell: ShapeSpec }) {
  const patternId = useId();
  const layout = LAYOUTS[cell.count] ?? LAYOUTS[1];
  const fill =
    cell.fill === "solid" ? "currentColor" : cell.fill === "striped" ? `url(#${patternId})` : "none";
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="2.5" />
        </pattern>
      </defs>
      {layout.pos.map(([cx, cy], i) => (
        <g key={i} transform={`rotate(${cell.rotation} ${cx} ${cy})`}>
          <Shape kind={cell.kind} cx={cx} cy={cy} r={layout.r} fill={fill} stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
}

export function GridShape({ grid }: { grid: Grid }) {
  const n = Math.max(grid.length, grid[0].length);
  const size = 100 / (n + 1);
  const ox = (100 - grid[0].length * size) / 2;
  const oy = (100 - grid.length * size) / 2;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {grid.flatMap((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={ox + c * size}
              y={oy + r * size}
              width={size}
              height={size}
              className="fill-primary"
              stroke="var(--surface)"
              strokeWidth={1.5}
              rx={1.5}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

export function VisualView({ visual, large }: { visual: Visual; large?: boolean }) {
  if (visual.type === "matrix") {
    // Matrices are always read left-to-right, regardless of page direction.
    return (
      <div dir="ltr" className="mx-auto grid w-full max-w-sm grid-cols-3 gap-1.5 rounded-xl bg-border p-1.5">
        {visual.cells.map((cell, i) => (
          <div key={i} className="flex aspect-square items-center justify-center rounded-lg bg-surface p-2 text-fg">
            {cell ? <ShapeCell cell={cell} /> : <span className="text-4xl font-bold text-primary">؟</span>}
          </div>
        ))}
      </div>
    );
  }
  const box = large ? "mx-auto h-44 w-44 sm:h-52 sm:w-52" : "aspect-square w-full";
  return (
    <div className={`${box} text-fg`}>
      {visual.type === "cell" ? <ShapeCell cell={visual.cell} /> : <GridShape grid={visual.grid} />}
    </div>
  );
}
