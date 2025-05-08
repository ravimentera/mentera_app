"use client";

import { Card } from "@/components/organisms";
import { Fragment, useEffect, useMemo, useState } from "react";

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  title: string;
  height?: number;
  width?: number;
  color?: string;
  className?: string;
}

export const LineChart = ({
  data,
  title,
  height = 300,
  width = 600,
  color = "#2563eb",
  className = "",
}: LineChartProps) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points for drawing
  const points = useMemo(() => {
    if (!data.length) return [];

    const values = data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    return data.map((d, i) => {
      // Calculate x position based on index
      const x = (i / (data.length - 1 || 1)) * chartWidth;

      // Calculate y position based on value
      // Invert y because SVG coordinates start from top
      const y = chartHeight - ((d.value - minValue) / valueRange) * chartHeight;

      return { x, y, ...d };
    });
  }, [data, chartWidth, chartHeight]);

  // Calculate values for y-axis ticks
  const yAxisTicks = useMemo(() => {
    if (!data.length) return [];

    const values = data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Generate 5 evenly spaced ticks
    return Array.from({ length: 5 }, (_, i) => {
      const value = minValue + (valueRange * i) / 4;
      return { value, id: `y-tick-${i}-${value.toFixed(1)}` };
    });
  }, [data]);

  // Generate path for the line
  const linePath = useMemo(() => {
    if (!points.length) return "";

    return points
      .map((point, i) => {
        return `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`;
      })
      .join(" ");
  }, [points]);

  // Generate SVG for x-axis labels
  const xAxisLabels = useMemo(() => {
    // Only show labels for first, middle, and last points if there are more than 5 data points
    const indicesToShow =
      data.length <= 5 ? data.map((_, i) => i) : [0, Math.floor(data.length / 2), data.length - 1];

    return points
      .filter((_, i) => indicesToShow.includes(i))
      .map((point) => ({
        x: point.x,
        label: point.date,
        key: `x-label-${point.date}-${point.value}`,
      }));
  }, [points, data.length, data]);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data.length) {
    return <div className={`text-center p-4 ${className}`}>No data available</div>;
  }

  return (
    <div className={className}>
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="w-full relative">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
            aria-labelledby="lineChartTitle"
            style={{ maxWidth: "100%" }}
          >
            <title id="lineChartTitle">{title}</title>

            {/* X and Y axes */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeOpacity={0.3}
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeOpacity={0.3}
            />

            {/* Y-axis grid lines and labels */}
            {yAxisTicks.map((tick) => (
              <Fragment key={tick.id}>
                <line
                  x1={padding.left}
                  y1={
                    padding.top +
                    chartHeight -
                    ((tick.value - yAxisTicks[0].value) /
                      (yAxisTicks[yAxisTicks.length - 1].value - yAxisTicks[0].value || 1)) *
                      chartHeight
                  }
                  x2={width - padding.right}
                  y2={
                    padding.top +
                    chartHeight -
                    ((tick.value - yAxisTicks[0].value) /
                      (yAxisTicks[yAxisTicks.length - 1].value - yAxisTicks[0].value || 1)) *
                      chartHeight
                  }
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={
                    padding.top +
                    chartHeight -
                    ((tick.value - yAxisTicks[0].value) /
                      (yAxisTicks[yAxisTicks.length - 1].value - yAxisTicks[0].value || 1)) *
                      chartHeight
                  }
                  fontSize="12"
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fillOpacity={0.7}
                >
                  {Math.round(tick.value)}
                </text>
              </Fragment>
            ))}

            {/* Line chart group */}
            <g transform={`translate(${padding.left}, ${padding.top})`}>
              {/* The line with animation */}
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="animate-draw-line"
                style={{
                  strokeDasharray: `${chartWidth * 3}`,
                  strokeDashoffset: mounted ? "0" : `${chartWidth * 3}`,
                  transition: "stroke-dashoffset 1.5s ease-in-out",
                }}
              />

              {/* Data points with animation and tooltips */}
              {points.map((point, idx) => (
                <Fragment key={`point-${point.date}-${point.value}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={activePoint === idx ? 6 : 4}
                    fill="white"
                    stroke={color}
                    strokeWidth={2}
                    onMouseEnter={() => setActivePoint(idx)}
                    onMouseLeave={() => setActivePoint(null)}
                  />

                  {/* Tooltip */}
                  {activePoint === idx && (
                    <g style={{ pointerEvents: "none" }}>
                      <rect
                        x={Math.min(Math.max(point.x - 40, 0), chartWidth - 80)}
                        y={point.y - 40 < 0 ? point.y + 10 : point.y - 40}
                        width="80"
                        height="30"
                        rx="4"
                        fill="white"
                        stroke={color}
                        strokeWidth="1"
                        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={Math.min(Math.max(point.x, 40), chartWidth - 40)}
                        y={point.y - 40 < 0 ? point.y + 25 : point.y - 25}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="currentColor"
                      >
                        {point.date}
                      </text>
                      <text
                        x={Math.min(Math.max(point.x, 40), chartWidth - 40)}
                        y={point.y - 40 < 0 ? point.y + 35 : point.y - 15}
                        textAnchor="middle"
                        fontSize="12"
                        fill="currentColor"
                      >
                        Count: {point.value}
                      </text>
                    </g>
                  )}
                </Fragment>
              ))}
            </g>

            {/* X-axis labels */}
            {xAxisLabels.map((label) => (
              <text
                key={label.key}
                x={padding.left + label.x}
                y={height - padding.bottom + 20}
                fontSize="12"
                textAnchor="middle"
                fill="currentColor"
                fillOpacity={0.7}
              >
                {label.label}
              </text>
            ))}
          </svg>
        </div>
      </Card>
    </div>
  );
};
