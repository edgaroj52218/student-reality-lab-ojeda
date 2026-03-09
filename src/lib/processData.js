// src/lib/processData.js
// Reads raw wage and CPI CSVs, computes annual averages,
// calculates real wages (2010 base), and outputs processed.json

const fs = require("fs");
const path = require("path");

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h.trim()] = values[i] ? values[i].trim() : null;
    });
    return row;
  });
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"];

// Average only the months that have real numeric values (handles missing Oct-2025)
function annualAverage(row) {
  const values = MONTHS.map((m) => parseFloat(row[m]))
                        .filter((v) => !isNaN(v));
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ── Load raw data ─────────────────────────────────────────────────────────────

const wageRows = parseCSV(
  path.join(__dirname, "../../data/wages_raw.csv")
);
const cpiRows = parseCSV(
  path.join(__dirname, "../../data/raw_cpi.csv")
);

// ── Build lookup maps keyed by year ──────────────────────────────────────────

const wageByYear = {};
wageRows.forEach((row) => {
  const avg = annualAverage(row);
  if (avg !== null) wageByYear[row.Year] = parseFloat(avg.toFixed(2));
});

const cpiByYear = {};
cpiRows.forEach((row) => {
  const avg = annualAverage(row);
  if (avg !== null) cpiByYear[row.Year] = parseFloat(avg.toFixed(3));
});

// ── Compute real wages (base year = 2010) ────────────────────────────────────
// Formula: Real Wage = Nominal Wage × (Base CPI / Current CPI)

const BASE_YEAR = "2010";
const baseCPI = cpiByYear[BASE_YEAR];
const baseNominal = wageByYear[BASE_YEAR];

if (!baseCPI || !baseNominal) {
  console.error("Base year data missing — check CSVs.");
  process.exit(1);
}

// ── Assemble final dataset ────────────────────────────────────────────────────

const years = Object.keys(wageByYear)
  .filter((y) => cpiByYear[y] !== undefined)
  .sort();

const processed = years.map((year) => {
  const nominal_wage = wageByYear[year];
  const cpi = cpiByYear[year];
  const real_wage = parseFloat((nominal_wage * (baseCPI / cpi)).toFixed(2));
  const pct_change_real = parseFloat(
    (((real_wage - baseNominal) / baseNominal) * 100).toFixed(2)
  );
  return { year: parseInt(year), nominal_wage, cpi, real_wage, pct_change_real };
});

// ── Write output ──────────────────────────────────────────────────────────────

const outPath = path.join(__dirname, "../../data/processed.json");
fs.writeFileSync(outPath, JSON.stringify(processed, null, 2));

console.log(`✅ Processed ${processed.length} years → data/processed/processed.json`);
console.log("\nSample output (first 3 rows):");
console.log(JSON.stringify(processed.slice(0, 3), null, 2));
