import { readFileSync } from 'node:fs';

const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const fail = message => { console.error('DATA VALIDATION FAILED: ' + message); process.exitCode = 1; };
const events = readJson('../data/events.json');
const countries = readJson('../data/countries.json');
const statuses = new Set(['confirmed', 'limited', 'unverified', 'demo']);
const categories = new Set(['conflict', 'diplomacy', 'politics', 'economy', 'energy', 'humanitarian', 'security', 'crisis', 'incident']);
const ids = new Set();

if (!Array.isArray(events.records)) fail('events.records must be an array');
else for (const [index, event] of events.records.entries()) {
  const at = 'events.records[' + index + ']';
  if (!event.id || ids.has(event.id)) fail(at + ': missing or duplicate id');
  ids.add(event.id);
  for (const field of ['title', 'category', 'summary', 'status']) if (typeof event[field] !== 'string' || !event[field]) fail(at + ': ' + field + ' is required');
  if (!statuses.has(event.status)) fail(at + ': unsupported status ' + event.status);
  if (!categories.has(event.category)) fail(at + ': unsupported category ' + event.category);
  if (!Array.isArray(event.sources)) fail(at + ': sources must be an array');
  else for (const [sourceIndex, source] of event.sources.entries()) {
    if (!source.name || !source.url) fail(at + '.sources[' + sourceIndex + ']: name and url required');
    try { if (new URL(source.url).protocol !== 'https:') fail(at + '.sources[' + sourceIndex + ']: source URL must use HTTPS'); }
    catch { fail(at + '.sources[' + sourceIndex + ']: invalid source URL'); }
  }
  if (event.coordinates !== undefined && event.coordinates !== null) {
    const c = event.coordinates;
    if (!Array.isArray(c) || c.length !== 2 || !c.every(Number.isFinite) || Math.abs(c[0]) > 180 || Math.abs(c[1]) > 90) fail(at + ': coordinates must be [longitude, latitude] within valid bounds');
  }
  if (event.date && !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) fail(at + ': date must use YYYY-MM-DD');
}

if (!Array.isArray(countries.profiles)) fail('countries.profiles must be an array');
else for (const [index, profile] of countries.profiles.entries()) {
  const at = 'countries.profiles[' + index + ']';
  if (profile.iso3 && !/^[A-Z]{3}$/.test(profile.iso3)) fail(at + ': iso3 must be a three-letter uppercase ISO code');
  if (profile.confidence && !statuses.has(profile.confidence)) fail(at + ': unsupported confidence value');
  if (!Array.isArray(profile.sources)) fail(at + ': sources must be an array');
}

if (!process.exitCode) console.log('Data validation passed: ' + events.records.length + ' event record(s), ' + countries.profiles.length + ' country profile(s).');
