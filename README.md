# student-reality-lab-ojeda
## NJIT Spring 2026 IS219 Midterm Project
___________________________________
## Are Entry-Level Wages Keeping Up With Inflation?
### Essential Question 
Have production and nonsupervisory wages in the U.S. kept pace with inflation since 2010?
### Claim
Production and nonsupervisory wages have not kept up with inflation since 2010, resulting in lower real purchasing power for new workers.
### Audience
- College students preparing to enter the workforce
- Recent graduates
- Students comparing wages across years

### STAR Draft
**S - Situation**
* Inflation has risen significantly in recent years. Students entering the workforce question whether wages are actually increasing in meaningful terms or just nominally.

**T - Task**
* Build an interactive data story that allows viewers to compare nominal wages vs inflation-adjusted wages over time and determine whether real purchasing power has increased or decreased.

**A - Action**
- Collect wage data (average hourly earnings or production and nonsupervisory wage proxy)
- Collect CPI (Consumer Price Index) data
- Adjust wages into constant dollars
- Build an interactive toggle: Nominal vs Real wages
- Annotate a key divergence point (e.g., post-2020 inflation spike)

**R - Result (Expected)**
* I expect to show that nominal wages increased, but real wages stagnated or declined during high inflation years (2021-2023). I will report percent change in real wages since 2010.

### Dataset & Provenance
***Wage Data Source***
From: U.S. Bureau of Labor Statistics (BLS)
Series ID: CES0500000008
Series Title: Average Hourly Earnings of Production and Nonsupervisory Employees
License: Public domain (U.S. government)
Retrieval data: Feb. 26, 2026

***Inflation Data Source***
From: BLS Consumer Price Index (CPI-U)
License: Public domain
Retrieval date: Feb. 26, 2026

### Data Dictionary
|Term|Meaning|Units|
|------|---------|-------|
|year|Calendar year|YYYY|
|nominal_wage|average hourly earnings|USD|
|cpi|Consumer Price Index (CPI-U)|Index (1982-84 = 100)|
|real_wage|Inflation-adjusted wage|USD (base year dollars)|
|pct_change_real|Percent change in real wage from base year|%|


### Data Viability Audit
**Missing Values & Structural Issues**
- Both datasets (CES0500000008 and CUSR0000SA0) provide complete monthly observations from 2010–2025.
- No structural gaps were observed within the selected date range.
- 2025 data may include preliminary (P) values in the most recent months.
- Data is reported monthly and must be aggregated to annual averages for clarity and consistency.

***Weird Fields / Interpretation Concerns***
* CPI is reported as an index (1982–84 = 100), not dollar values.
* Wage data is reported in nominal USD, not inflation-adjusted.
* Both datasets are monthly, meaning time alignment is required before transformation.
* CPI measures price changes for urban consumers and may not perfectly represent student-specific consumption patterns.
* Wage data reflects production and nonsupervisory employees, which serves as a proxy for early-career workers but does not isolate strictly “entry-level” employees.

***Cleaning & Transformation Plan***
To ensure the UI consumes clean, predictable data:
1. Remove metadata rows from raw CSV files.
2. Convert monthly data into annual averages for both wage and CPI datasets.
3. Align both datasets by calendar year.
4. Select a base year (2010) for inflation adjustment.
5. Compute real wages using:
`Real Wage = Nominal Wage × (Base CPI / Current CPI)`
6. Calculate percent change in real wages since 2010.
7. Round final values to two decimal places for readability.
8. Output a structured processed dataset (year, nominal_wage, real_wage, cpi, pct_change_real).

***What This Dataset Cannot Prove (Limit & Bias)***
* Does not isolate strictly entry-level workers.
* Does not account for regional wage variation.
* Does not include non-wage compensation (benefits, bonuses, equity).
* CPI may not reflect the exact consumption patterns of students or recent graduates.
* Does not measure cost-of-living variation across metropolitan areas.
* Cannot determine causation — only trend comparison.

### Data Chart Screenshot