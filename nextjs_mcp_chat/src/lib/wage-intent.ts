/**
 * Detects whether a user message is asking about wage or inflation data
 * from the Student Reality Lab dataset (2010–2025).
 */

export type WageIntent =
  | { tool: "get_wage_by_year"; args: { year: number } }
  | { tool: "get_wage_range"; args: { start_year: number; end_year: number } }
  | { tool: "compare_wages"; args: { year: number } }
  | { tool: "get_wage_trend"; args: { start_year: number; end_year: number } };

const VALID_YEARS = Array.from({ length: 16 }, (_, i) => 2010 + i); // 2010–2025

function extractYears(text: string): number[] {
  const matches = text.match(/\b(20\d{2})\b/g) ?? [];
  return matches
    .map(Number)
    .filter((y) => VALID_YEARS.includes(y))
    .filter((y, i, arr) => arr.indexOf(y) === i); // dedupe
}

/**
 * Returns a WageIntent if the message can be mapped to a specific tool call,
 * or null if the message needs the LLM to handle it more freely.
 */
export function detectWageIntent(message: string): WageIntent | null {
  const lower = message.toLowerCase();
  const years = extractYears(message);

  // "compare wages in 2022" / "nominal vs real 2019"
  const isCompare =
    /\b(compare|vs|versus|nominal.*real|real.*nominal|gap|difference)\b/.test(
      lower
    );
  if (isCompare && years.length === 1) {
    return { tool: "compare_wages", args: { year: years[0] } };
  }

  // "trend from 2015 to 2020" / "what happened between 2018 and 2022"
  const isTrend =
    /\b(trend|grew|shrank|change|between|from.*to|over the period)\b/.test(
      lower
    );
  if (isTrend && years.length >= 2) {
    const [start_year, end_year] = [
      Math.min(...years),
      Math.max(...years),
    ];
    return { tool: "get_wage_trend", args: { start_year, end_year } };
  }

  // "wages from 2015 to 2020" / "data between 2018 and 2023"
  const isRange =
    /\b(range|from|between|through|to)\b/.test(lower) && years.length >= 2;
  if (isRange) {
    const [start_year, end_year] = [
      Math.min(...years),
      Math.max(...years),
    ];
    return { tool: "get_wage_range", args: { start_year, end_year } };
  }

  // "what was the wage in 2021" / "show me 2019"
  if (years.length === 1) {
    return { tool: "get_wage_by_year", args: { year: years[0] } };
  }

  return null;
}

/**
 * Returns true if the message is generally about wages, inflation,
 * purchasing power, or the dataset — even if no specific year is mentioned.
 */
export function detectWageRelated(message: string): boolean {
  return /\b(wage|wages|salary|salaries|inflation|purchasing power|real wage|nominal wage|cpi|cost of living|entry.?level|bls|earnings|hourly|afford|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|2025)\b/i.test(
    message
  );
}