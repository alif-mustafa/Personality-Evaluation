"use client";

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

/**
 * Reusable Radar Chart component for personality trait visualization.
 *
 * @param {Object[]} data - Array of { trait, value, fullMark? }
 * @param {string} [fillColor] - Fill color for the radar area
 * @param {string} [strokeColor] - Stroke color for the radar outline
 * @param {Object[]} [compareData] - Optional second dataset for comparison (couples)
 * @param {string} [compareFill] - Fill color for comparison dataset
 * @param {string} [compareStroke] - Stroke color for comparison dataset
 * @param {boolean} [showLegend] - Show legend
 * @param {string} [labelA] - Label for first dataset
 * @param {string} [labelB] - Label for comparison dataset
 */
export default function RadarChartComponent({
  data,
  fillColor = "rgba(59, 123, 252, 0.25)",
  strokeColor = "#3b7bfc",
  compareData = null,
  compareFill = "rgba(58, 140, 105, 0.25)",
  compareStroke = "#3a8c69",
  showLegend = false,
  labelA = "You",
  labelB = "Partner",
}) {
  // Merge data for dual-radar display
  const chartData = data.map((item, index) => ({
    trait: item.trait,
    [labelA]: item.value,
    ...(compareData ? { [labelB]: compareData[index]?.value ?? 0 } : {}),
    fullMark: item.fullMark || 100,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadar
        cx="50%"
        cy="50%"
        outerRadius="70%"
        data={chartData}
      >
        <PolarGrid
          stroke="var(--border)"
          strokeDasharray="3 3"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="trait"
          tick={{
            fill: "var(--text-secondary)",
            fontSize: 11,
            fontWeight: 500,
          }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
          axisLine={false}
          tickCount={5}
        />

        <Radar
          name={labelA}
          dataKey={labelA}
          stroke={strokeColor}
          fill={fillColor}
          fillOpacity={1}
          strokeWidth={2}
          dot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
          animationDuration={800}
          animationEasing="ease-out"
        />

        {compareData && (
          <Radar
            name={labelB}
            dataKey={labelB}
            stroke={compareStroke}
            fill={compareFill}
            fillOpacity={1}
            strokeWidth={2}
            dot={{ r: 4, fill: compareStroke, strokeWidth: 0 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        )}

        <Tooltip
          contentStyle={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            boxShadow: "var(--shadow-lg)",
          }}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          itemStyle={{ color: "var(--text-secondary)" }}
        />

        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
          />
        )}
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
