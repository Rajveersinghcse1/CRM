"use client";

import { useState } from "react";

type PieSlice = {
  name: string;
  value: number;
  color: string;
};

type PieChartProps = {
  data: PieSlice[];
};

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function PieChart({ data }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm font-medium">
        No data to display
      </div>
    );
  }

  const cx = 110;
  const cy = 110;
  const outerR = 90;
  const innerR = 52; // donut hole

  let currentAngle = 0;
  const slices = [];
  for (let i = 0; i < data.length; i++) {
    const slice = data[i];
    const angle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // for inner donut: carve out center
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
    const largeArc = angle <= 180 ? "0" : "1";
    const donutPath = [
      `M ${polarToCartesian(cx, cy, outerR, startAngle).x} ${polarToCartesian(cx, cy, outerR, startAngle).y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${polarToCartesian(cx, cy, outerR, endAngle).x} ${polarToCartesian(cx, cy, outerR, endAngle).y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ");

    const midAngle = startAngle + angle / 2;
    const labelPos = polarToCartesian(cx, cy, (outerR + innerR) / 2, midAngle);
    const pct = ((slice.value / total) * 100).toFixed(1);

    slices.push({
      ...slice,
      path: donutPath,
      midAngle,
      labelPos,
      pct,
      startAngle,
      endAngle,
      index: i,
    });
  }

  const fmt = formatINR;
  const hovered = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg
          width={cx * 2}
          height={cy * 2}
          viewBox={`0 0 ${cx * 2} ${cy * 2}`}
          className="overflow-visible filter drop-shadow-sm"
        >
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <path
                key={slice.index}
                d={slice.path}
                fill={slice.color}
                opacity={hoveredIndex === null || isHovered ? 1 : 0.65}
                stroke="currentColor"
                strokeWidth={2.5}
                className="cursor-pointer transition-all duration-200 text-[#1E293B] dark:text-slate-800"
                style={{
                  transform: isHovered
                    ? `translate(${
                        Math.cos(((slice.midAngle - 90) * Math.PI) / 180) * 6
                      }px, ${
                        Math.sin(((slice.midAngle - 90) * Math.PI) / 180) * 6
                      }px)`
                    : "translate(0,0)",
                }}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Center text */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-slate-900 dark:fill-slate-100 font-extrabold text-[13px]"
          >
            {hovered ? hovered.name : "Total"}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 font-bold text-[12px]"
          >
            {hovered ? hovered.pct + "%" : fmt(total)}
          </text>
          {hovered && (
            <text
              x={cx}
              y={cy + 26}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-200 font-semibold text-[10px]"
            >
              {fmt(hovered.value)}
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {slices.map((slice) => (
          <div
            key={slice.index}
            className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1 rounded-full border-2 border-[#1E293B] dark:border-slate-700 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            onMouseEnter={() => setHoveredIndex(slice.index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className="h-3 w-3 rounded-full shrink-0 border border-[#1E293B] dark:border-slate-600"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-xs text-[#1E293B] dark:text-slate-200 font-bold">
              {slice.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">({slice.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
