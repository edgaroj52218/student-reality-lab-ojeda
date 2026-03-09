// src/components/WageChart.jsx
// View 1: Nominal vs Real Wages Over Time
// Interaction 1: Toggle between Nominal / Real / Both lines
// Interaction 2: Year range slider to zoom into a period

import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Label
} from "recharts";

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{
      background: "#1a1d27", border: "1px solid #2a2d3a",
      borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.85rem"
    }}>
      <p style={{ color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: "0.2rem 0" }}>
          {entry.name}: <strong>${entry.value.toFixed(2)}/hr</strong>
        </p>
      ))}
    </div>
  );
}

export default function WageChart({ data }) {
  const [mode, setMode] = useState("both");     // "nominal" | "real" | "both"
  const [endYear, setEndYear] = useState(2025); // year range: always starts 2010

  // Filter data by selected year range
  const filtered = data.filter((d) => d.year <= endYear);

  // Compute the gap at the selected end year for annotation
  const lastRow = filtered[filtered.length - 1];
  const gapDollars = lastRow
    ? (lastRow.nominal_wage - lastRow.real_wage).toFixed(2)
    : null;

  return (
    <section className="view-card" aria-label="View 1: Wage trends over time">
      <h2 className="view-title">Nominal vs. Real Wages (2010–{endYear})</h2>
      <p className="view-question">
        Are workers actually earning more — or just being paid more dollars that
        buy less?
      </p>

      {/* ── Stat pills ── */}
      <div className="stat-row">
        <div className="stat-pill">
          <div className="stat-value">${data[0]?.nominal_wage}/hr</div>
          <div className="stat-desc">Nominal wage in 2010</div>
        </div>
        <div className="stat-pill">
          <div className="stat-value">${lastRow?.nominal_wage}/hr</div>
          <div className="stat-desc">Nominal wage in {endYear}</div>
        </div>
        <div className="stat-pill">
          <div className={`stat-value ${lastRow?.pct_change_real >= 0 ? "" : "negative"}`}>
            {lastRow?.pct_change_real > 0 ? "+" : ""}{lastRow?.pct_change_real}%
          </div>
          <div className="stat-desc">Real wage change since 2010</div>
        </div>
      </div>

      {/* ── Toggle: Nominal / Real / Both ── */}
      <div className="toggle-group" role="group" aria-label="Select wage display mode">
        <span className="toggle-label">Show:</span>
        {[
          { key: "nominal", label: "Nominal Only" },
          { key: "real",    label: "Real Only"    },
          { key: "both",    label: "Both"         },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`toggle-btn ${key} ${mode === key ? "active" : ""}`}
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Year Slider ── */}
      <div className="slider-group">
        <div className="slider-row">
          <span className="slider-label">End Year:</span>
          <input
            type="range"
            min={2012}
            max={2025}
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            aria-label={`End year: ${endYear}`}
          />
          <span className="slider-value">2010 – {endYear}</span>
        </div>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={filtered}
          margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          >
            <Label value="Year" offset={-10} position="insideBottom" fill="#94a3b8" fontSize={12} />
          </XAxis>
          <YAxis
            domain={[17, 33]}
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(v) => `$${v}`}
          >
            <Label value="Avg. Hourly Wage (USD)" angle={-90} position="insideLeft"
              fill="#94a3b8" fontSize={12} offset={10} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "0.85rem", paddingTop: "0.5rem", color: "#94a3b8" }}
          />

          {/* 2021 inflation spike annotation line */}
          {endYear >= 2021 && (
            <ReferenceLine
              x={2021}
              stroke="rgba(249,115,22,0.5)"
              strokeDasharray="4 4"
              label={{
                value: "↑ Inflation spike",
                position: "top",
                fill: "#f97316",
                fontSize: 11,
              }}
            />
          )}

          {(mode === "nominal" || mode === "both") && (
            <Line
              type="monotone"
              dataKey="nominal_wage"
              name="Nominal Wage"
              stroke="#60a5fa"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          )}
          {(mode === "real" || mode === "both") && (
            <Line
              type="monotone"
              dataKey="real_wage"
              name="Real Wage (2010 $)"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* ── Annotation callout ── */}
      {mode !== "nominal" && endYear >= 2022 && (
        <div className="annotation-box">
          <strong>📌 2021–2022 Divergence:</strong> Nominal wages rose sharply
          after 2020, but CPI inflation accelerated faster. By {lastRow?.year},
          the gap between what workers are <em>paid</em> and what they can{" "}
          <em>buy</em> is{" "}
          <strong>${gapDollars}/hr</strong> — meaning inflation has erased a
          significant portion of apparent wage growth.
        </div>
      )}

      {/* ── Story Text ── */}
      <div className="story-text">
        <p>
          <strong>What to notice:</strong> The blue line (nominal wages) climbs
          steadily upward — on paper, workers are earning more every year.
          But the orange line (real wages, adjusted to 2010 dollars) tells a
          different story.
        </p>
        <p>
          Real purchasing power stayed nearly <strong>flat from 2010 to 2020</strong>,
          then briefly surged during COVID-era labor shortages — only to be wiped
          out by the 2021–2023 inflation wave. Use the toggle to isolate each
          line, and drag the slider to see how the story changes across
          different time windows.
        </p>
        <p>
          <strong>Try it:</strong> Set the end year to 2022 and switch to
          "Real Only" — you'll see real wages in 2022 were barely higher than
          in 2015.
        </p>
      </div>
    </section>
  );
}
