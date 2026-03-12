// App.jsx
import React, { useState } from "react";
import WageChart from "./components/WageChart";
import PurchasingPowerChart from "./components/PurchasingPowerChart";
import processedData from "./data/processed.json";
import "./App.css";

export default function App() {
  const [activeView, setActiveView] = useState(1);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="site-header">
        <div className="header-inner">
          <div className="header-label">Student Reality Lab</div>
          <h1 className="header-title">
            Are Entry-Level Wages Keeping Up With Inflation?
          </h1>
          <p className="header-subtitle">
            An interactive look at nominal vs. real wages for production &amp;
            nonsupervisory workers, 2010–2025
          </p>
        </div>
      </header>

      {/* ── Claim Banner ── */}
      <div className="claim-banner">
        <span className="claim-label">Claim</span>
        <p className="claim-text">
          Production and nonsupervisory wages have <strong>not</strong> kept up
          with inflation since 2010, resulting in lower real purchasing power
          for new workers.
        </p>
      </div>

      {/* ── View Navigation ── */}
      <nav className="view-nav" aria-label="Chart views">
        <button
          className={`nav-btn ${activeView === 1 ? "active" : ""}`}
          onClick={() => setActiveView(1)}
          aria-pressed={activeView === 1}
        >
          View 1 — Wages Over Time
        </button>
        <button
          className={`nav-btn ${activeView === 2 ? "active" : ""}`}
          onClick={() => setActiveView(2)}
          aria-pressed={activeView === 2}
        >
          View 2 — Purchasing Power
        </button>
      </nav>

      {/* ── Views ── */}
      <main className="views-container">
        {activeView === 1 && <WageChart data={processedData} />}
        {activeView === 2 && <PurchasingPowerChart data={processedData} />}
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <p>
          Data:{" "}
          <a
            href="https://www.bls.gov/data/"
            target="_blank"
            rel="noopener noreferrer"
          >
            U.S. Bureau of Labor Statistics
          </a>{" "}
          — Series CES0500000008 (Wages) &amp; CUSR0000SA0 (CPI-U) — Retrieved
          Feb 26, 2026
        </p>
        <p>
          Built by Edgar Steven Ojeda · NJIT IS219 Spring 2026 ·{" "}
          <a
            href="https://github.com/edgaroj52218/student-reality-lab-ojeda"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
