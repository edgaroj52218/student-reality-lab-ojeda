# STAR Presentation — Student Reality Lab

**Project:** Are Entry-Level Wages Keeping Up With Inflation?
**Author:** Edgar Steven Ojeda | NJIT IS219 Spring 2026
**Duration:** 3–5 minutes

---

## S — Situation (20–30 sec)

Students preparing to enter the workforce often look at wages and see the numbers
going up year after year. A job that paid $19/hr in 2010 might pay $30/hr today —
that sounds like a 58% raise. But prices have also risen. The real question is:
**does that paycheck actually buy more?**

Inflation has been especially visible since 2021, when the U.S. experienced its
highest CPI increases in four decades. For students graduating into this economy,
understanding the difference between nominal and real wages isn't just academic
— it's how you evaluate a job offer.

---

## T — Task (10–15 sec)

I set out to answer one specific question:

> **Have production and nonsupervisory wages in the U.S. kept pace with inflation since 2010?**

The goal: give viewers a tool to compare nominal wages against inflation-adjusted
real wages and draw their own conclusion — backed by government data they can verify.

---

## A — Action (60–90 sec)

**Data collected:**
- BLS Series CES0500000008: Average hourly earnings for production and
  nonsupervisory workers (2010–2025)
- BLS CPI-U Series CUSR0000SA0: Consumer Price Index for all urban consumers
  (2010–2025)

**Key transformation:**
Monthly values were averaged to annual figures, then real wages were computed
using the formula:

```
Real Wage = Nominal Wage × (CPI_2010 / CPI_current)
```

This converts all wages into 2010 dollars, making years directly comparable.

**What I built (2 views):**

*View 1 — Nominal vs Real Wages Over Time*
- A dual-line chart comparing both wage series from 2010 to 2025
- **Toggle interaction:** Switch between Nominal Only / Real Only / Both lines
  so viewers can isolate what they're looking at
- **Year slider:** Drag to zoom into any time window (e.g., zoom to 2018–2022
  to isolate the inflation period)
- Annotation marking the 2021 inflation surge

*View 2 — Purchasing Power % Change*
- A bar/line chart showing real wage % change relative to 2010 baseline
- **Chart type toggle:** Switch between bar and line views
- Color coding: orange bars = real wages below 2010 level; green = above
- Annotation summarizing the key headline number

**Engineering decision:**
Used Recharts (React charting library) for clean component-based chart code.
Data is processed at build time via a Node.js script (`src/lib/processData.js`)
and imported as static JSON — no runtime API calls, no loading states, fast.

---

## R — Result (60–90 sec)

**Headline numbers:**
- Nominal wages rose from **$19.05/hr (2010)** to **$31.34/hr (2025)** — a
  nominal increase of ~64%
- Real wages (in 2010 dollars) rose from **$19.05** to **$21.23** — a real
  increase of only ~**11.4% over 15 years**, or less than 1% per year

**What changes when you interact:**
- Toggle to "Real Only" on View 1 and the upward slope nearly disappears —
  the line is almost flat across 15 years
- Drag the slider to end at 2022 — real wages in 2022 ($20.54) were barely
  higher than 2015 ($19.35), meaning 7 years of nominal growth was almost
  entirely erased by inflation
- On View 2, switching to Line Chart shows the arc clearly: modest gains
  through 2019, a brief COVID spike, then a sharp 2022 crash back to
  near-baseline

**One honest limitation:**
This dataset uses production and nonsupervisory workers as a proxy for
entry-level workers — it doesn't isolate new graduates or students specifically.
Real results may vary by industry, region, and education level. Additionally,
CPI-U measures average urban consumer prices, which may differ from the
specific costs students face (rent, tuition, food).

**Takeaway for students:**
When evaluating a job offer, ask for the wage in real terms. If a company
offers you 3% annual raises but inflation is running at 4–5%, you are
effectively taking a pay cut every year — even as your nominal paycheck grows.
The data shows this is exactly what happened to millions of workers from
2021 to 2023.

---

*Data sources: U.S. Bureau of Labor Statistics — public domain. Retrieved Feb 26, 2026.*
