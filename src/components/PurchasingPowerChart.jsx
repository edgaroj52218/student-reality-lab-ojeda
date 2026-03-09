// src/components/PurchasingPowerChart.jsx
// View 2: Real Wage % Change since 2010 — the "purchasing power" story
// Interaction: Toggle between bar chart and line chart view

import React, { useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell, Label
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0].value;
  return (
    <div style={{
      background: "#1a1d27", border: "1px solid #2a2d3a",
      borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.85rem"
    }}>
      <p style={{ color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ color: val >= 0 ? "#34d399" : "#f97316" }}>
        Real wage change: <strong>{val > 0 ? "+" : ""}{val}%</strong>
      </p>
      <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.3rem" }}>
        {val < 0
          ? "Workers had less purchasing power than in 2010"
          : "Workers had slightly more purchasing power than in 2010"}
      </p>
    </div>
  );
}

export default function PurchasingPowerChart({ data }) {
  const [chartType, setChartType] = useState("bar"); // "bar" | "line"

  // Find worst year (most negative real change)
  const worstYear = data.reduce(
    (min, d) => (d.pct_change_real < min.pct_change_real ? d : min),
    data[0]
  );

  // Find the 2022 row for annotation
  const row2022 = data.find((d) => d.year === 2022);

  return (
    <section className="view-card" aria-label="View 2: Purchasing power change">
      <h2 className="view-title">Real Wage % Change Since 2010</h2>
      <p className="view-question">
        How much more — or less — can a worker actually buy compared to 2010?
      </p>

      {/* ── Stat pills ── */}
      <div className="stat-row">
        <div className="stat-pill">
          <div className="stat-value negative">
            {worstYear?.pct_change_real}%
          </div>
          <div className="stat-desc">
            Worst year: {worstYear?.year}
          </div>
        </div>
        <div className="stat-pill">
          <div className="stat-value">
            {data[data.length - 1]?.pct_change_real > 0 ? "+" : ""}
            {data[data.length - 1]?.pct_change_real}%
          </div>
          <div className="stat-desc">Real change by 2025</div>
        </div>
        <div className="stat-pill">
          <div className="stat-value negative">
            {row2022?.pct_change_real}%
          </div>
          <div className="stat-desc">Real change in 2022 (inflation peak)</div>
        </div>
      </div>

      {/* ── Toggle: Bar / Line ── */}
      <div className="toggle-group" role="group" aria-label="Select chart type">
        <span className="toggle-label">Chart type:</span>
        <button
          className={`toggle-btn both ${chartType === "bar" ? "active" : ""}`}
          onClick={() => setChartType("bar")}
          aria-pressed={chartType === "bar"}
        >
          Bar Chart
        </button>
        <button
          className={`toggle-btn both ${chartType === "line" ? "active" : ""}`}
          onClick={() => setChartType("line")}
          aria-pressed={chartType === "line"}
        >
          Line Chart
        </button>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={320}>
        {chartType === "bar" ? (
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            >
              <Label value="Year" offset={-10} position="insideBottom" fill="#94a3b8" fontSize={12} />
            </XAxis>
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            >
              <Label value="% Change vs 2010" angle={-90} position="insideLeft"
                fill="#94a3b8" fontSize={12} offset={10} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#4a5568" strokeWidth={2} />
            {/* Annotation: 2021 inflation onset */}
            <ReferenceLine
              x={2021}
              stroke="rgba(249,115,22,0.5)"
              strokeDasharray="4 4"
              label={{
                value: "Inflation surge →",
                position: "top",
                fill: "#f97316",
                fontSize: 10,
              }}
            />
            <Bar dataKey="pct_change_real" name="Real Wage Change" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.pct_change_real < 0 ? "#f97316" : "#34d399"}
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            >
              <Label value="Year" offset={-10} position="insideBottom" fill="#94a3b8" fontSize={12} />
            </XAxis>
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            >
              <Label value="% Change vs 2010" angle={-90} position="insideLeft"
                fill="#94a3b8" fontSize={12} offset={10} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#4a5568" strokeWidth={2} />
            <ReferenceLine
              x={2021}
              stroke="rgba(249,115,22,0.5)"
              strokeDasharray="4 4"
              label={{
                value: "Inflation surge →",
                position: "top",
                fill: "#f97316",
                fontSize: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="pct_change_real"
              name="Real Wage % Change"
              stroke="#60a5fa"
              strokeWidth={2.5}
              dot={{ fill: "#60a5fa", r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* ── Annotation callout ── */}
      <div className="annotation-box">
        <strong>📌 Key Finding:</strong> From 2010–2020, real wages barely moved
        — workers gained less than <strong>+10%</strong> in real purchasing power
        over a decade. Then the 2021–2022 inflation surge erased those gains,
        pushing real wages back near 2010 levels. By 2025, a modest recovery
        is visible, but workers are still only ~<strong>11% ahead</strong> of where they
        were 15 years ago — less than 1% per year in real terms.
      </div>

      {/* ── Story Text ── */}
      <div className="story-text">
        <p>
          <strong>What to notice:</strong> The bars below zero (orange) represent
          years where workers could buy <em>less</em> than in 2010. The bars
          above zero (green) show years of modest gains.
        </p>
        <p>
          Notice how gains built up slowly through 2019, then spiked briefly
          during 2020–2021 — not from real prosperity, but partly from pandemic
          labor shortages briefly lifting wages. Then inflation hit, and those
          gains collapsed in 2022.
        </p>
        <p>
          <strong>Switch to Line Chart</strong> to see the full trend arc more
          clearly — the rise, the spike, the crash, and the slow recovery.
        </p>
      </div>
    </section>
  );
}
