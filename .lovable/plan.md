# Project currency (multi-currency projects)

Each project can use its own currency. The organisation's currency (AED for Dubai Culture, SAR for Riyadh) stays the default and is used for all totals.

## What users will see

- **Request form, Project Planning step**: a "Currency" dropdown next to Project Budget. It starts on the organisation's currency, and you can pick from AED, SAR, USD, EUR or GBP. It's hidden when the project has no budget.
- **Project page**: the budget, phase budgets, Cost tab, Budget Performance and the Business Case / ROI figures all show in the project's currency. The info strip also shows the converted amount in the main currency, e.g. "USD 500,000 (≈ AED 1,836,250)".
- **Changing currency**: after the request is submitted, the only way to change currency is a change request. The Raise Change Request form gets an optional "New currency" field. Approving the request switches the project's currency. Amounts stay the same numbers; nothing is re-converted.
- **Dashboards and totals**: every amount is converted into the main currency using built-in rates. The totals show a note: "Converted to AED at configured rates". Projects without a budget are still left out, as they are today.
- **Lists and exports**: the Budget column shows each project's own currency. Exports get two extra columns: "Currency" and "Budget (main currency)".
- **Config trace**: adds lines like "Budget shown in USD, converted to AED for totals".
- **Admin**: Configurations → Regional shows the fixed currency list and its rates as read-only.

## Demo data
2–3 existing demo projects will use USD or EUR, across both requests and approved projects.

## Technical details
- Project record gets a new `currency` field. New and older seeded projects default to the organisation's currency.
- New `client-preview/currency.ts`: fixed list, built-in rates to AED (SAR and USD pegged; EUR and GBP fixed demo rates), and a `convert(amount, from, to)` helper.
- `budgetLabel`, `financials`, `projectCsvRows` and `phaseBudgetError` run through this helper. `financials.total` comes back in the main currency. The existing rule stays: never show 0 for a project without a budget.
- Change requests get an optional `newCurrency`, applied when the request is approved.
- New tests: conversion, totals across mixed currencies, budgetLabel showing the project's currency, the currency change through change requests, and CSV columns.
- AGENTS.md: rule that money totals convert through currency.ts.
