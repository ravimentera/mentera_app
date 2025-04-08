"use client";

import { Card } from "@/components/organisms";
import { Fragment, useEffect, useMemo, useState } from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  title: string;
  height?: number;
  width?: number;
  color?: string;
  className?: string;
}

export const BarChart = ({
  data,
  title,
  height = 300,
  width = 600,
  color = "#2563eb",
  className = "",
}: BarChartProps) => {
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  const padding = { top: 20, right: 20, bottom: 50, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate the maximum value for scaling
  const maxValue = useMemo(() => {
    const values = data.map((d) => d.value);
    return Math.max(...values, 0);
  }, [data]);

  // Calculate bar width based on data length
  const barWidth = useMemo(() => {
    return (chartWidth / data.length) * 0.7; // 70% of available space per bar
  }, [chartWidth, data.length]);

  // Calculate Y axis ticks
  const yAxisTicks = useMemo(() => {
    const tickCount = 5;
    return Array.from({ length: tickCount }, (_, idx) => {
      return maxValue * (idx / (tickCount - 1));
    });
  }, [maxValue]);

  // Start animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!data.length) {
    return <div className={`text-center p-4 ${className}`}>No data available</div>;
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="text-lg font-medium mb-3">{title}</h3>

        <div className="w-full relative">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
            style={{ maxWidth: "100%" }}
            role="img"
            aria-labelledby="barChartTitle"
          >
            <title id="barChartTitle">{title}</title>

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

            {/* Y-axis ticks and grid lines */}
            {yAxisTicks.map((tick) => (
              <Fragment key={`y-tick-${tick}`}>
                <line
                  x1={padding.left}
                  y1={height - padding.bottom - (tick / maxValue) * chartHeight}
                  x2={width - padding.right}
                  y2={height - padding.bottom - (tick / maxValue) * chartHeight}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={height - padding.bottom - (tick / maxValue) * chartHeight}
                  fontSize="12"
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="currentColor"
                  fillOpacity={0.7}
                >
                  {Math.round(tick)}
                </text>
              </Fragment>
            ))}

            {/* Bars */}
            {data.map((dataPoint, index) => {
              const barX =
                padding.left +
                (chartWidth / data.length) * index +
                (chartWidth / data.length - barWidth) / 2;
              const barHeight = (dataPoint.value / maxValue) * chartHeight;
              const barY = height - padding.bottom - barHeight;
              const isActive = activeBar === index;

              return (
                <Fragment key={`bar-${dataPoint.label}-${dataPoint.value}`}>
                  {/* Bar with animation */}
                  <rect
                    x={barX}
                    y={isAnimated ? barY : height - padding.bottom}
                    width={barWidth}
                    height={isAnimated ? barHeight : 0}
                    fill={color}
                    opacity={isActive ? 1 : 0.8}
                    rx={2}
                    style={{
                      transition: `y 1s ease-out ${index * 0.1}s, height 1s ease-out ${index * 0.1}s, opacity 0.3s`,
                    }}
                    onMouseEnter={() => setActiveBar(index)}
                    onMouseLeave={() => setActiveBar(null)}
                  />

                  {/* Tooltip */}
                  {isActive && (
                    <g style={{ pointerEvents: "none" }}>
                      <rect
                        x={Math.min(
                          Math.max(barX + barWidth / 2 - 45, padding.left),
                          width - padding.right - 90,
                        )}
                        y={barY - 40 < padding.top ? barY + 10 : barY - 40}
                        width="90"
                        height="30"
                        rx="4"
                        fill="white"
                        stroke={color}
                        strokeWidth="1"
                        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={Math.min(
                          Math.max(barX + barWidth / 2, padding.left + 45),
                          width - padding.right - 45,
                        )}
                        y={barY - 40 < padding.top ? barY + 25 : barY - 25}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="currentColor"
                      >
                        {dataPoint.label}
                      </text>
                      <text
                        x={Math.min(
                          Math.max(barX + barWidth / 2, padding.left + 45),
                          width - padding.right - 45,
                        )}
                        y={barY - 40 < padding.top ? barY + 35 : barY - 15}
                        fontSize="12"
                        textAnchor="middle"
                        fill="currentColor"
                      >
                        Value: {dataPoint.value}
                      </text>
                    </g>
                  )}

                  {/* Value label (only shown if not animated or animation complete) */}
                  {isAnimated && (
                    <text
                      x={barX + barWidth / 2}
                      y={barY - 5}
                      fontSize="12"
                      textAnchor="middle"
                      fill="currentColor"
                      opacity={isAnimated ? 1 : 0}
                      style={{
                        transition: `opacity 0.5s ease-out ${index * 0.1 + 0.7}s`,
                      }}
                    >
                      {dataPoint.value}
                    </text>
                  )}

                  {/* X-axis label */}
                  <text
                    x={barX + barWidth / 2}
                    y={height - padding.bottom + 20}
                    fontSize="12"
                    textAnchor="middle"
                    fill="currentColor"
                    fillOpacity={0.7}
                  >
                    {dataPoint.label}
                  </text>
                </Fragment>
              );
            })}
          </svg>
        </div>
      </div>
    </Card>
  );
};
