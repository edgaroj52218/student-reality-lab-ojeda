# Data Notes

## wages_raw.csv
- **Source:** U.S. Bureau of Labor Statistics (BLS)
- **Series ID:** CES0500000008
- **Series Title:** Average Hourly Earnings of Production and Nonsupervisory Employees, Total Private
- **Format:** Monthly averages, USD
- **Coverage:** January 2010 – December 2025
- **License:** Public domain (U.S. federal government data)
- **Retrieved:** February 26, 2026
- **URL:** https://www.bls.gov/data/

## raw_cpi.csv
- **Source:** U.S. Bureau of Labor Statistics (BLS)
- **Series ID:** CUSR0000SA0 (CPI-U, All Urban Consumers, All Items)
- **Format:** Monthly index values (base: 1982–84 = 100)
- **Coverage:** January 2010 – December 2025
- **Caveats:**
  - October 2025 value is missing (preliminary data gap)
  - Annual column present in source but unused; annual averages computed from monthly values
- **License:** Public domain (U.S. federal government data)
- **Retrieved:** February 26, 2026
- **URL:** https://www.bls.gov/data/

## Known Limitations
- Wage series covers production and nonsupervisory workers as a proxy for entry-level / non-management labor — does not isolate strictly entry-level workers
- CPI-U reflects urban consumer prices and may not perfectly reflect student-specific consumption
- No regional breakdown — national averages only
- Non-wage compensation (benefits, equity, bonuses) not included
