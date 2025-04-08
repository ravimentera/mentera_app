"use client";

import { Card } from "@/components/organisms";
import { useEffect, useMemo, useState } from "react";

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataPoint[];
  title: string;
  size?: number;
  thickness?: number;
  className?: string;
}

export const DonutChart = ({
  data,
  title,
  size = 300,
  thickness = 60,
  className = "",
}: DonutChartProps) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  const radius = size / 2;
  const innerRadius = radius - thickness;
  const centerX = radius;
  const centerY = radius;

  // Calculate total for percentages
  const total = useMemo(() => {
    return data.reduce((sum, d) => sum + d.value, 0);
  }, [data]);

  // Calculate arc data
  const arcs = useMemo(() => {
    if (!data.length) return [];

    let startAngle = 0;
    return data.map((d, index) => {
      // Calculate angle for this segment
      const angle = (d.value / total) * (2 * Math.PI);
      const currentAngle = Math.min(angle, angle * animationProgress);

      // Calculate SVG arc path
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(startAngle + currentAngle);
      const y2 = centerY + radius * Math.sin(startAngle + currentAngle);

      const largeArcFlag = currentAngle > Math.PI ? 1 : 0;

      // Inner arc points
      const x1Inner = centerX + innerRadius * Math.cos(startAngle);
      const y1Inner = centerY + innerRadius * Math.sin(startAngle);
      const x2Inner = centerX + innerRadius * Math.cos(startAngle + currentAngle);
      const y2Inner = centerY + innerRadius * Math.sin(startAngle + currentAngle);

      // Create path
      const path = [
        `M ${x1} ${y1}`, // Move to outer start point
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc
        `L ${x2Inner} ${y2Inner}`, // Line to inner end
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`, // Inner arc (counter-clockwise)
        "Z", // Close path
      ].join(" ");

      // Calculate middle angle for label positioning
      const midAngle = startAngle + currentAngle / 2;
      const labelRadius = (radius + innerRadius) / 2;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);

      // Calculate percentage
      const percentage = Math.round((d.value / total) * 100);

      // Save the start angle for the next segment
      const result = {
        path,
        color: d.color,
        label: d.label,
        labelX,
        labelY,
        percentage,
        value: d.value,
        id: `arc-${d.label}-${percentage}`,
        index,
      };

      startAngle += angle;
      return result;
    });
  }, [data, total, radius, innerRadius, centerX, centerY, animationProgress]);

  // Start animation when component mounts
  useEffect(() => {
    const duration = 1200; // Animation duration in ms
    const interval = 16; // Interval between frames (~60fps)
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      setAnimationProgress(step / steps);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  if (!data.length) {
    return <div className={`text-center p-4 ${className}`}>No data available</div>;
  }

  return (
    <div className={className}>
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="w-full flex justify-center relative">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
            style={{ maxWidth: "100%" }}
            role="img"
            aria-labelledby="donutchart-title"
          >
            <title id="donutchart-title">{title}</title>
            {arcs.map((arc) => (
              <g key={arc.id}>
                <path
                  d={arc.path}
                  fill={arc.color}
                  stroke="white"
                  strokeWidth={1}
                  opacity={activeSegment === arc.index ? 1 : 0.9}
                  style={{ transition: "opacity 0.3s, transform 0.3s" }}
                  transform={
                    activeSegment === arc.index
                      ? `scale(1.03) translate(${-centerX * 0.03}, ${-centerY * 0.03})`
                      : ""
                  }
                  onMouseEnter={() => setActiveSegment(arc.index)}
                  onMouseLeave={() => setActiveSegment(null)}
                />

                {/* Tooltip */}
                {activeSegment === arc.index && (
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={Math.min(Math.max(arc.labelX - 50, 10), size - 110)}
                      y={Math.min(Math.max(arc.labelY - 40, 10), size - 50)}
                      width="100"
                      height="40"
                      rx="4"
                      fill="white"
                      stroke={arc.color}
                      strokeWidth="1"
                      filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                    />
                    <text
                      x={Math.min(Math.max(arc.labelX, 60), size - 60)}
                      y={Math.min(Math.max(arc.labelY - 25, 25), size - 35)}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="currentColor"
                    >
                      {arc.label}
                    </text>
                    <text
                      x={Math.min(Math.max(arc.labelX, 60), size - 60)}
                      y={Math.min(Math.max(arc.labelY - 10, 40), size - 20)}
                      textAnchor="middle"
                      fontSize="12"
                      fill="currentColor"
                    >
                      {arc.value} ({arc.percentage}%)
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* Center text with total (with fade in animation) */}
            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              opacity={animationProgress}
              style={{ transition: "opacity 0.5s ease-out" }}
            >
              Total
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              opacity={animationProgress}
              style={{ transition: "opacity 0.5s ease-out" }}
            >
              {total}
            </text>
          </svg>
        </div>

        {/* Legend with fade-in animation */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((dataPoint, index) => (
            <div
              key={`legend-${dataPoint.label}`}
              className="flex items-center"
              style={{
                opacity: animationProgress > 0.7 ? (animationProgress - 0.7) / 0.3 : 0,
                transform: animationProgress > 0.7 ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
              }}
              onMouseEnter={() => setActiveSegment(index)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <div
                className="w-3 h-3 mr-2 rounded-sm"
                style={{ backgroundColor: dataPoint.color }}
              />
              <div className="text-sm">
                <span className="font-medium">{dataPoint.label}</span>
                <span className="ml-1 text-muted-foreground">
                  {Math.round((dataPoint.value / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
