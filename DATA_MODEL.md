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
