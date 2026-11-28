# Day 28 · BKK Yield Alpha

Real estate investment yield & daily lifestyle score calculator — preloaded with 3 realistic Bangkok condos (**Thonglor**, **Ari**, **Asoke**) and customizable for any city or currency (`THB`, `EUR`, `USD`).

## Features
- **Live Financial Math**: Gross Yield %, Net Yield (Cap Rate) %, Cash-on-Cash Return %, Monthly Net Cashflow, and Break-Even Occupancy %.
- **Optional Mortgage Modeling**: Toggle debt financing with custom down payment %, interest rate %, and loan term years.
- **Lifestyle Quality Score**: 5 weighted sliders (Transit/BTS distance, Natural Light, Quietness, Walkability, Building Amenities) blended with financial return into a composite **Alpha Score (0–100)**.
- **Side-by-Side Comparison**: Save and compare up to 5 properties, highlight best-in-column metrics, and export to **CSV**.
- **Privacy-First**: Runs 100% locally in the browser with `localStorage` persistence, full EN/FR toggle, and standalone HTML download.

## Still unfinished
- Does not model country-specific income taxes, Thai transfer/stamp duties, or exit capital gains.
- Currency switcher updates display symbol and formatting rather than fetching live FX rates.
- Lifestyle ratings are manual inputs rather than live transit/walking-time API lookups.
