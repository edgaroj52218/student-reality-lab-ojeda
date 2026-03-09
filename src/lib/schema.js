// src/lib/schema.js
// Data contract for processed.json
// Each entry in the processed dataset must conform to this shape.
// Used as reference documentation and for runtime validation.

// ── Shape Definition ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} WageDataPoint
 * @property {number} year             - Calendar year (e.g. 2010). Integer, 4 digits.
 * @property {number} nominal_wage     - Average hourly earnings in current USD. Rounded to 2 decimal places.
 * @property {number} cpi              - Annual average CPI-U index value (base: 1982-84 = 100). Rounded to 3 decimal places.
 * @property {number} real_wage        - Inflation-adjusted wage in 2010 dollars. Rounded to 2 decimal places.
 * @property {number} pct_change_real  - Percent change in real wage relative to 2010 baseline. Rounded to 2 decimal places.
 */

// ── Expected Ranges ───────────────────────────────────────────────────────────

export const SCHEMA_CONSTRAINTS = {
  year:            { type: "number", min: 2010, max: 2025 },
  nominal_wage:    { type: "number", min: 0,    max: 100  },
  cpi:             { type: "number", min: 200,  max: 400  },
  real_wage:       { type: "number", min: 0,    max: 100  },
  pct_change_real: { type: "number", min: -50,  max: 50   },
};

export const REQUIRED_FIELDS = [
  "year",
  "nominal_wage",
  "cpi",
  "real_wage",
  "pct_change_real",
];

// ── Base Year ─────────────────────────────────────────────────────────────────

export const BASE_YEAR = 2010;

// ── Validation Function ───────────────────────────────────────────────────────

/**
 * Validates a single data point against the schema.
 * Logs a warning (does not throw) if a constraint is violated.
 * @param {WageDataPoint} row
 * @returns {boolean} true if valid, false if any field fails
 */
export function validateRow(row) {
  let valid = true;

  // Check all required fields exist
  for (const field of REQUIRED_FIELDS) {
    if (row[field] === undefined || row[field] === null) {
      console.warn(`Schema violation: missing field "${field}" in row`, row);
      valid = false;
    }
  }

  // Check ranges
  for (const [field, constraint] of Object.entries(SCHEMA_CONSTRAINTS)) {
    const val = row[field];
    if (typeof val !== constraint.type) {
      console.warn(`Schema violation: "${field}" should be ${constraint.type}, got ${typeof val}`, row);
      valid = false;
    }
    if (val < constraint.min || val > constraint.max) {
      console.warn(`Schema violation: "${field}" value ${val} out of expected range [${constraint.min}, ${constraint.max}]`, row);
      valid = false;
    }
  }

  return valid;
}

/**
 * Validates the entire processed dataset.
 * @param {WageDataPoint[]} data
 * @returns {boolean} true if all rows pass
 */
export function validateDataset(data) {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("Schema violation: dataset is empty or not an array");
    return false;
  }
  return data.every(validateRow);
}
