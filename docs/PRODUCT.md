# HedgeMind product brief

## Problem

Businesses carry financial exposure in ordinary operations: supplier invoices, receivables, imports, financing, and contractual commitments. A foreign-currency payable can become more expensive before it is due, but many teams do not have an accessible way to identify or quantify that risk.

## Solution

HedgeMind is business risk intelligence software. It turns operational data into a clear risk workflow:

**Understand → Quantify → Simulate → Mitigate**

AI may extract structured information from unstructured business language and explain already-computed results. Deterministic code owns every financial calculation.

## Prototype use case

The hackathon prototype focuses only on an Indian business with a USD-denominated payable. The user can upload a CSV/XLSX file or choose demo data, see the current INR liability and a transparent risk score, later simulate USD/INR changes, and later compare an illustrative partial hedge.

Phase 1 delivers upload, parsing, validation, current-exposure analysis, and the initial React result screen.

## Example

ABC Electronics is owed USD 50,000 in 45 days. At ₹87/USD, its current INR liability is ₹4,350,000 (₹43.5 lakh). This is a liability estimate at the supplied base rate, not a market quote, forecast, recommendation, or executable hedge price.

## Out of scope

- Real-money trading or direct MochaTrade execution
- Live exchange rates, derivative pricing, or market forecasts
- Financial advice or guaranteed outcomes
- Full authentication, multi-risk modules, or WhatsApp integration

See [ROADMAP.md](ROADMAP.md) for deferred work.
