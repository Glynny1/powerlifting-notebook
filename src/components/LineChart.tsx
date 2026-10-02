import { formatDate } from "@/lib/format";

export type ChartPoint = { date: string; value: number };

const W = 360;
const H = 200;
const PAD = { top: 26, right: 14, bottom: 22, left: 40 };

function niceValue(v: number, decimals: number) {
  return v.toFixed(decimals);
}

// Pure-SVG single-series line chart, server-rendered. Hover is CSS-only:
// each point owns an invisible full-height column that reveals a crosshair,
// a marker, and a pinned readout at the top of the plot.
export default function LineChart({
  points,
  colorVar,
  unit,
  decimals = 1,
  title,
}: {
  points: ChartPoint[];
  colorVar: string;
  unit: string;
  decimals?: number;
  title: string;
}) {
  if (points.length < 2) return null;

  const xs = points.map((p) => Date.parse(p.date));
  const ys = points.map((p) => p.value);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yLo = Math.min(...ys);
  const yHi = Math.max(...ys);
  const yPad = yHi === yLo ? Math.max(1, yHi * 0.02) : (yHi - yLo) * 0.1;
  const yMin = yLo - yPad;
  const yMax = yHi + yPad;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (t: number) =>
    PAD.left + (xMax === xMin ? plotW / 2 : ((t - xMin) / (xMax - xMin)) * plotW);
  const y = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const coords = points.map((p, i) => ({
    px: x(xs[i]),
    py: y(p.value),
    ...p,
  }));
  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.px.toFixed(1)} ${c.py.toFixed(1)}`)
    .join(" ");

  const gridValues = [0.25, 0.5, 0.75].map((f) => yMin + (yMax - yMin) * f);
  const last = coords[coords.length - 1];

  // Hover hit columns: midpoints between neighbours
  const columns = coords.map((c, i) => {
    const left = i === 0 ? PAD.left : (coords[i - 1].px + c.px) / 2;
    const right =
      i === coords.length - 1 ? W - PAD.right : (c.px + coords[i + 1].px) / 2;
    return { left, width: right - left };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${title}: ${points.length} entries from ${formatDate(points[0].date)} to ${formatDate(last.date)}, latest ${niceValue(last.value, decimals)} ${unit}`}
      className="h-auto w-full"
    >
      <style>{`
        .pt .tip { opacity: 0; transition: opacity 120ms ease-out; }
        .pt:hover .tip { opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .pt .tip { transition: none; } }
      `}</style>

      {gridValues.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--gridline)"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 6}
            y={y(v) + 3}
            textAnchor="end"
            fontSize="9"
            fill="var(--muted)"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {niceValue(v, decimals === 0 ? 0 : 1)}
          </text>
        </g>
      ))}

      <text
        x={PAD.left}
        y={H - 6}
        fontSize="9"
        fill="var(--muted)"
      >
        {formatDate(points[0].date)}
      </text>
      <text
        x={W - PAD.right}
        y={H - 6}
        textAnchor="end"
        fontSize="9"
        fill="var(--muted)"
      >
        {formatDate(last.date)}
      </text>

      <path d={path} fill="none" stroke={colorVar} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Latest value: permanent marker + direct label */}
      <circle cx={last.px} cy={last.py} r="3.5" fill={colorVar} stroke="var(--surface)" strokeWidth="2" />
      <text
        x={Math.min(last.px, W - PAD.right - 2)}
        y={Math.max(last.py - 9, 10)}
        textAnchor="end"
        fontSize="10"
        fontWeight="600"
        fill="var(--foreground)"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {niceValue(last.value, decimals)}
      </text>

      {coords.map((c, i) => (
        <g key={c.date} className="pt">
          <rect
            x={columns[i].left}
            y={0}
            width={columns[i].width}
            height={H}
            fill="transparent"
          />
          <g className="tip" pointerEvents="none">
            <line
              x1={c.px}
              x2={c.px}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--muted)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <circle cx={c.px} cy={c.py} r="3.5" fill={colorVar} stroke="var(--surface)" strokeWidth="2" />
            <text x={PAD.left + 2} y={PAD.top - 10} fontSize="10" fill="var(--foreground)" fontWeight="600" style={{ fontVariantNumeric: "tabular-nums" }}>
              {niceValue(c.value, decimals)} {unit}
            </text>
            <text x={W - PAD.right} y={PAD.top - 10} textAnchor="end" fontSize="10" fill="var(--secondary)">
              {formatDate(c.date)}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}
