# Global Situation Map
HOI4-inspired geopolitical dashboard, static website (GitHub Pages-ready).

**Important:** Initial demo markers are illustrative and not a current situation report.

Features: dark world map (Leaflet + CARTO), event/conflict marker layers, source/methodology page, responsive UI.

## Deploy
Repository Settings → Pages → deploy from GitHub Actions. The included workflow deploys on pushes to main.

## Research standards
See sources.html. Public, aggregated, non-sensitive military information only. No real-time tactical tracking. Weekly changes reviewed and presented for approval before publication.

## Roadmap
- GeoJSON country borders and selectable country profiles
- Influence and alliance overlays with methodology
- Events with timestamps, sources, confidence, review history
- Weekly archive and export
- Validation-first data ingestion

## Quality assurance

Every push runs `node scripts/validate-data.mjs` before the Pages deployment. The validator checks data structure and source-link hygiene; it does not fact-check claims. Human editorial review and approval remain mandatory for all weekly updates.

## Structured data
`data/events.json` and `data/countries.json` define the data contract. `DATA_MODEL.md` documents the validation and editorial workflow. Current content is demonstrative only.
