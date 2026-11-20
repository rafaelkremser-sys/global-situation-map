# Data model & editorial workflow

## Event record fields
- id: unique stable identifier
- title/category/region: label and classification
- coordinates: [longitude, latitude] (marker location, generalized if necessary)
- date: ISO date, nullable when unknown
- summary: concise, attributed context
- status: confirmed / limited / unverified / demo
- sources: array of objects {name,url,publishedAt,accessedAt,notes}
- updatedAt: ISO date

## Country profile
ISO-3166 alpha-3 identifier, profile fields, notes, confidence, source list and lastReviewed.

## Publication rule
All production records must include source URLs and review date. Contested claims must be attributed and uncertainty visible. Do not publish real-time tactical, precise troop locations, targeting information or sensitive personal data. Weekly change proposals require human approval.

The initial JSON records are intentionally placeholders; they do not constitute current geopolitical facts.

## Source handling and confidence

- A source link is required for every non-demo event. Record the publisher, direct URL, publication date, access date and what claim it supports.
- Prefer primary documents for official decisions and datasets; use independent reporting to corroborate contested facts and provide local context.
- Do not treat a statement by a party to a conflict as independently verified. Attribute it explicitly and seek independent corroboration.
- Dataset counts are not interchangeable: preserve each provider's definitions, geographic/temporal coverage, release version and methodology. In particular, ACLED event coding and UCDP armed-conflict definitions answer different questions.
- More citations do not automatically mean stronger evidence. Assess independence, proximity to the event, expertise, incentives, transparency and corrections history.
- Every production record must have a review date. Expired or superseded records should be archived or marked stale, not silently carried forward as current.
- Coordinates should be generalized to the least precise level needed for public understanding. Never publish tactical or personally identifying location data.

## Automated checks

`node scripts/validate-data.mjs` runs in the Pages workflow before deployment. It checks required fields, unique event IDs, allowed statuses/categories, coordinate bounds, date format and HTTPS source links. Passing validation checks structure only; it does not establish factual accuracy.
