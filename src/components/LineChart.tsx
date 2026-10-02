import { useState } from "react";
import { StyleSheet, View, type GestureResponderEvent } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { formatDate } from "@/lib/format";
import { useColors } from "@/lib/theme";

export type ChartPoint = { date: string; value: number };

const H = 200;
const PAD = { top: 26, right: 14, bottom: 22, left: 40 };

// Single-series line chart. Touch and drag to read any point.
export default function LineChart({
  points,
  color,
  unit,
  decimals = 1,
  title,
}: {
  points: ChartPoint[];
  color: string;
  unit: string;
  decimals?: number;
  title: string;
}) {
  const c = useColors();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
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

  const plotW = Math.max(1, width - PAD.left - PAD.right);
  const plotH = H - PAD.top - PAD.bottom;
  const x = (t: number) =>
    PAD.left + (xMax === xMin ? plotW / 2 : ((t - xMin) / (xMax - xMin)) * plotW);
  const y = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const coords = points.map((p, i) => ({ px: x(xs[i]), py: y(p.value), ...p }));
  const path = coords
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.px.toFixed(1)} ${p.py.toFixed(1)}`)
    .join(" ");
  const gridValues = [0.25, 0.5, 0.75].map((f) => yMin + (yMax - yMin) * f);
  const last = coords[coords.length - 1];
  const shown = active !== null ? coords[active] : null;
  const fmt = (v: number) => v.toFixed(decimals);

  const pick = (e: GestureResponderEvent) => {
    const touchX = e.nativeEvent.locationX;
    let nearest = 0;
    coords.forEach((p, i) => {
      if (Math.abs(p.px - touchX) < Math.abs(coords[nearest].px - touchX)) {
        nearest = i;
      }
    });
    setActive(nearest);
  };

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${title}: ${points.length} entries from ${formatDate(points[0].date)} to ${formatDate(last.date)}, latest ${fmt(last.value)} ${unit}`}
      style={styles.wrap}
    >
      {width > 0 && (
        <Svg width={width} height={H}>
          {gridValues.map((v) => (
            <Line
              key={v}
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke={c.gridline}
              strokeWidth={1}
            />
          ))}
          {gridValues.map((v) => (
            <SvgText
              key={`label-${v}`}
              x={PAD.left - 6}
              y={y(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill={c.muted}
            >
              {v.toFixed(decimals === 0 ? 0 : 1)}
            </SvgText>
          ))}
          <SvgText x={PAD.left} y={H - 6} fontSize={9} fill={c.muted}>
            {formatDate(points[0].date)}
          </SvgText>
          <SvgText
            x={width - PAD.right}
            y={H - 6}
            textAnchor="end"
            fontSize={9}
            fill={c.muted}
          >
            {formatDate(last.date)}
          </SvgText>

          <Path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {shown ? (
            <>
              <Line
                x1={shown.px}
                x2={shown.px}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke={c.muted}
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <Circle cx={shown.px} cy={shown.py} r={4} fill={color} stroke={c.surface} strokeWidth={2} />
              <SvgText x={PAD.left + 2} y={PAD.top - 10} fontSize={11} fontWeight="600" fill={c.foreground}>
                {`${fmt(shown.value)} ${unit}`}
              </SvgText>
              <SvgText
                x={width - PAD.right}
                y={PAD.top - 10}
                textAnchor="end"
                fontSize={11}
                fill={c.secondary}
              >
                {formatDate(shown.date)}
              </SvgText>
            </>
          ) : (
            <>
              <Circle cx={last.px} cy={last.py} r={4} fill={color} stroke={c.surface} strokeWidth={2} />
              <SvgText
                x={Math.min(last.px, width - PAD.right - 2)}
                y={Math.max(last.py - 9, 10)}
                textAnchor="end"
                fontSize={11}
                fontWeight="600"
                fill={c.foreground}
              >
                {fmt(last.value)}
              </SvgText>
            </>
          )}
        </Svg>
      )}
      {/* Touch layer on top, so locationX is relative to the chart */}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={pick}
        onResponderMove={pick}
        onResponderRelease={() => setActive(null)}
        onResponderTerminate={() => setActive(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: H },
});
