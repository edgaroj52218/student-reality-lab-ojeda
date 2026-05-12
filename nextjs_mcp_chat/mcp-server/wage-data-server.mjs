import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Wage data from the Student Reality Lab (NJIT IS219 Midterm Project)
 * Source: U.S. Bureau of Labor Statistics (BLS)
 * Wage Series: CES0500000008 — Average Hourly Earnings, Production & Nonsupervisory Employees
 * CPI Series: CUSR0000SA0 — CPI-U, All Urban Consumers
 * Base year: 2010 (real wages expressed in 2010 dollars)
 * Formula: Real Wage = Nominal Wage × (CPI_2010 / CPI_current)
 */
const wageData = {
  2010: { nominal_wage: 19.07, real_wage: 19.07, cpi: 218.056, pct_change_real: 0.0 },
  2011: { nominal_wage: 19.47, real_wage: 18.67, cpi: 224.939, pct_change_real: -2.09 },
  2012: { nominal_wage: 19.74, real_wage: 18.55, cpi: 229.594, pct_change_real: -2.73 },
  2013: { nominal_wage: 20.13, real_wage: 18.74, cpi: 232.957, pct_change_real: -1.73 },
  2014: { nominal_wage: 20.61, real_wage: 18.93, cpi: 236.736, pct_change_real: -0.73 },
  2015: { nominal_wage: 21.03, real_wage: 19.53, cpi: 237.017, pct_change_real: 2.41 },
  2016: { nominal_wage: 21.56, real_wage: 19.84, cpi: 240.007, pct_change_real: 4.04 },
  2017: { nominal_wage: 22.07, real_wage: 19.89, cpi: 245.12,  pct_change_real: 4.30 },
  2018: { nominal_wage: 22.73, real_wage: 20.01, cpi: 251.107, pct_change_real: 4.93 },
  2019: { nominal_wage: 23.51, real_wage: 20.45, cpi: 255.657, pct_change_real: 7.23 },
  2020: { nominal_wage: 24.98, real_wage: 21.17, cpi: 258.811, pct_change_real: 11.01 },
  2021: { nominal_wage: 26.21, real_wage: 20.84, cpi: 270.970, pct_change_real: 9.28 },
  2022: { nominal_wage: 27.62, real_wage: 20.37, cpi: 292.655, pct_change_real: 6.82 },
  2023: { nominal_wage: 28.89, real_wage: 20.48, cpi: 304.702, pct_change_real: 7.40 },
  2024: { nominal_wage: 30.19, real_wage: 20.82, cpi: 314.175, pct_change_real: 9.18 },
  2025: { nominal_wage: 31.12, real_wage: 21.02, cpi: 323.1,   pct_change_real: 10.23 },
};

const VALID_YEARS = Object.keys(wageData).map(Number);
const MIN_YEAR = Math.min(...VALID_YEARS);
const MAX_YEAR = Math.max(...VALID_YEARS);

const server = new McpServer({
  name: "student-reality-lab-wage-data",
  version: "1.0.0",
});

// Tool 1: Get wage data for a single year
server.registerTool(
  "get_wage_by_year",
  {
    title: "Get Wage By Year",
    description:
      "Returns nominal wage, real wage (inflation-adjusted to 2010 dollars), CPI, and percent change in real wage since 2010 for a given year. Valid years: 2010–2025.",
    inputSchema: {
      year: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
    },
  },
  async ({ year }) => {
    const entry = wageData[year];
    if (!entry) {
      return {
        content: [
          {
            type: "text",
            text: `No data available for ${year}. Valid years are ${MIN_YEAR}–${MAX_YEAR}.`,
          },
        ],
      };
    }
    const result = {
      year,
      nominal_wage: entry.nominal_wage,
      real_wage: entry.real_wage,
      cpi: entry.cpi,
      pct_change_real_since_2010: entry.pct_change_real,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// Tool 2: Get wage data for a range of years
server.registerTool(
  "get_wage_range",
  {
    title: "Get Wage Range",
    description:
      "Returns nominal wage, real wage, and CPI for every year in the given range (inclusive). Valid years: 2010–2025.",
    inputSchema: {
      start_year: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
      end_year: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
    },
  },
  async ({ start_year, end_year }) => {
    if (start_year > end_year) {
      return {
        content: [
          {
            type: "text",
            text: "start_year must be less than or equal to end_year.",
          },
        ],
      };
    }
    const results = [];
    for (let year = start_year; year <= end_year; year++) {
      if (wageData[year]) {
        results.push({
          year,
          nominal_wage: wageData[year].nominal_wage,
          real_wage: wageData[year].real_wage,
          cpi: wageData[year].cpi,
          pct_change_real_since_2010: wageData[year].pct_change_real,
        });
      }
    }
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

// Tool 3: Compare nominal vs real wage for a year
server.registerTool(
  "compare_wages",
  {
    title: "Compare Nominal vs Real Wage",
    description:
      "Compares nominal and real (inflation-adjusted) wages for a given year, showing the dollar gap and what percentage of purchasing power has been gained or lost since 2010.",
    inputSchema: {
      year: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
    },
  },
  async ({ year }) => {
    const entry = wageData[year];
    if (!entry) {
      return {
        content: [
          {
            type: "text",
            text: `No data available for ${year}. Valid years are ${MIN_YEAR}–${MAX_YEAR}.`,
          },
        ],
      };
    }
    const gap = (entry.nominal_wage - entry.real_wage).toFixed(2);
    const direction = entry.pct_change_real >= 0 ? "gained" : "lost";
    const result = {
      year,
      nominal_wage: entry.nominal_wage,
      real_wage_2010_dollars: entry.real_wage,
      dollar_gap: Number(gap),
      purchasing_power_change: `${Math.abs(entry.pct_change_real)}% ${direction} since 2010`,
      summary: `In ${year}, a worker earned $${entry.nominal_wage}/hr nominally, but in 2010 dollars that is only $${entry.real_wage}/hr — a $${gap} gap created by inflation.`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// Tool 4: Get wage trend between two years
server.registerTool(
  "get_wage_trend",
  {
    title: "Get Wage Trend",
    description:
      "Analyzes whether real purchasing power grew or shrank between two years, returning the nominal and real percent changes and a plain-English summary.",
    inputSchema: {
      start_year: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
      end_year: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
    },
  },
  async ({ start_year, end_year }) => {
    if (start_year >= end_year) {
      return {
        content: [
          {
            type: "text",
            text: "start_year must be less than end_year.",
          },
        ],
      };
    }
    const start = wageData[start_year];
    const end = wageData[end_year];
    if (!start || !end) {
      return {
        content: [
          {
            type: "text",
            text: `Data not available for one or both years. Valid years: ${MIN_YEAR}–${MAX_YEAR}.`,
          },
        ],
      };
    }

    const nominalChange = (
      ((end.nominal_wage - start.nominal_wage) / start.nominal_wage) *
      100
    ).toFixed(2);
    const realChange = (
      ((end.real_wage - start.real_wage) / start.real_wage) *
      100
    ).toFixed(2);
    const realGrew = Number(realChange) > 0;

    const result = {
      start_year,
      end_year,
      nominal_wage_start: start.nominal_wage,
      nominal_wage_end: end.nominal_wage,
      nominal_pct_change: `+${nominalChange}%`,
      real_wage_start: start.real_wage,
      real_wage_end: end.real_wage,
      real_pct_change: `${realGrew ? "+" : ""}${realChange}%`,
      summary: `From ${start_year} to ${end_year}, nominal wages rose ${nominalChange}%, but real purchasing power (in 2010 dollars) ${realGrew ? "grew" : "shrank"} by ${Math.abs(Number(realChange))}%. ${
        !realGrew
          ? "Inflation outpaced wage growth during this period."
          : "Wages outpaced inflation during this period."
      }`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
