const map = L.map('map', { worldCopyJump: true }).setView([22, 10], 2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 8
}).addTo(map);

const palette = {
  conflict: '#d45d5d', crisis: '#d2a449', incident: '#d2a449',
  diplomacy: '#5c94cf', politics: '#5c94cf', economy: '#64a77b',
  energy: '#64a77b', humanitarian: '#b58bd3', security: '#d2a449'
};
const state = { events: [], conflicts: [], data: null };
const feed = document.getElementById('feed');
const escapeText = value => String(value ?? '');
const safeExternalLink = (url) => {
  try { const parsed = new URL(url); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null; }
  catch { return null; }
};

function markerFor(record) {
  const coords = record.coordinates;
  if (!Array.isArray(coords) || coords.length < 2 || !coords.slice(0, 2).every(Number.isFinite)) return;
  const [lon, lat] = coords;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
  const category = String(record.category || 'politics').toLowerCase();
  const color = palette[category] || '#8da5b9';
  const marker = L.circleMarker([lat, lon], {
    radius: record.status === 'demo' ? 6 : 7, color, fillColor: color,
    fillOpacity: 0.82, weight: 1
  });
  const popup = document.createElement('div');
  const heading = document.createElement('b');
  heading.textContent = escapeText(record.title);
  const summary = document.createElement('p');
  summary.textContent = escapeText(record.summary);
  const status = document.createElement('small');
  status.textContent = 'Status: ' + escapeText(record.status) + ' · ' + escapeText(record.date || 'Datum nicht angegeben');
  popup.append(heading, summary, status);
  marker.bindPopup(popup);
  const bucket = ['conflict', 'crisis', 'incident'].includes(category) ? state.conflicts : state.events;
  bucket.push(marker);
  marker.addTo(map);
}

function renderFeed(records) {
  feed.replaceChildren();
  if (!records.length) {
    const empty = document.createElement('p');
    empty.className = 'source';
    empty.textContent = 'Keine veröffentlichten Ereignisse in diesem Datenstand.';
    feed.append(empty);
    return;
  }
  records.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).forEach(record => {
    const article = document.createElement('article');
    article.className = 'event';
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = String(record.status || 'unverified').toUpperCase() + ' · ' + String(record.category || 'Ereignis');
    const title = document.createElement('h3');
    title.textContent = escapeText(record.title);
    const summary = document.createElement('p');
    summary.textContent = escapeText(record.summary);
    const meta = document.createElement('div');
    meta.className = 'source';
    meta.textContent = [record.date || 'Datum offen', record.region || 'Region offen'].join(' · ');
    article.append(tag, title, summary, meta);
    (Array.isArray(record.sources) ? record.sources : []).forEach(source => {
      const href = safeExternalLink(source.url);
      if (!href) return;
      const link = document.createElement('a');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.name || 'Quelle';
      link.className = 'source-link';
      article.append(link);
    });
    feed.append(article);
  });
}

function applyLayerToggle(id, markers) {
  const enabled = document.getElementById(id).checked;
  markers.forEach(marker => enabled ? marker.addTo(map) : map.removeLayer(marker));
}
document.getElementById('eventsToggle').addEventListener('change', () => applyLayerToggle('eventsToggle', state.events));
document.getElementById('conflictsToggle').addEventListener('change', () => applyLayerToggle('conflictsToggle', state.conflicts));

document.getElementById('influenceToggle').addEventListener('change', event => {
  const enabled = event.target.checked;
  map.getContainer().classList.toggle('influence-preview', enabled);
  let note = document.getElementById('influenceInfo');
  if (enabled && !note) {
    note = document.createElement('div');
    note.id = 'influenceInfo';
    note.className = 'note';
    const heading = document.createElement('b');
    heading.textContent = 'Einfluss & Bündnisse';
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Noch keine verifizierten Einflussdaten veröffentlicht. Mitgliedschaft, Partnerschaft, wirtschaftliche Verflechtung und tatsächlicher Einfluss werden getrennt bewertet.';
    note.append(heading, paragraph);
    document.querySelector('.right').prepend(note);
  } else if (!enabled) note?.remove();
});

document.getElementById('conflictCount').textContent = '—';
document.getElementById('eventCount').textContent = '—';

fetch('data/events.json')
  .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
  .then(data => {
    if (!Array.isArray(data.records)) throw new Error('Ungültiges Ereignisformat: records fehlt.');
    state.data = data;
    data.records.forEach(record => {
      if (record.status === 'demo') return;
      markerFor(record);
    });
    renderFeed(data.records);
    document.getElementById('conflictCount').textContent = state.conflicts.length;
    document.getElementById('eventCount').textContent = state.events.length;
    applyLayerToggle('eventsToggle', state.events);
    applyLayerToggle('conflictsToggle', state.conflicts);
  })
  .catch(error => {
    console.error('Ereignisdaten konnten nicht geladen werden:', error);
    feed.replaceChildren();
    const message = document.createElement('p');
    message.className = 'source';
    message.textContent = 'Ereignisdaten derzeit nicht verfügbar. Es werden keine aktuellen Lagebehauptungen angezeigt.';
    feed.append(message);
  });

/* Country boundaries provide geographic context only; they do not imply sovereignty or control assessments. */
const countryStyle = { color: '#62798b', weight: 0.65, fillColor: '#34424e', fillOpacity: 0.10 };
fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
  .then(response => { if (!response.ok) throw new Error('GeoJSON unavailable'); return response.json(); })
  .then(data => {
    L.geoJSON(data, {
      style: countryStyle,
      onEachFeature: (feature, layer) => {
        const properties = feature.properties || {};
        const name = properties.ADMIN || properties.name || properties.NAME || 'Land';
        layer.bindTooltip(name, { sticky: true });
        layer.on('click', () => {
          map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 5 });
          let panel = document.getElementById('countryInfo');
          if (!panel) {
            panel = document.createElement('div');
            panel.id = 'countryInfo';
            panel.className = 'note';
            const right = document.querySelector('.right');
            right.insertBefore(panel, right.firstChild.nextSibling);
          }
          panel.replaceChildren();
          const heading = document.createElement('b');
          heading.textContent = name;
          panel.append(heading);
          const intro = document.createElement('p');
          intro.textContent = 'Profilstatus: Für dieses Land liegen in dieser Ausgabe noch keine geprüften Profildaten vor.';
          panel.append(intro);
          [
            ['Politik', 'Noch keine verifizierten Angaben.'],
            ['Bündnisse / Einfluss', 'Mitgliedschaften, Partnerschaften und Einfluss werden getrennt dokumentiert.'],
            ['Militär', 'Nur aggregierte, öffentlich belegte und nicht-taktische Angaben.'],
            ['Wirtschaft', 'Wird mit vergleichbaren Daten und klarer Bezugsperiode ergänzt.']
          ].forEach(([label, value]) => {
            const term = document.createElement('b');
            term.textContent = label;
            const detail = document.createElement('p');
            detail.textContent = value;
            panel.append(term, detail);
          });
          const source = document.createElement('p');
          source.className = 'source';
          source.textContent = 'Grenzdaten: öffentliches GeoJSON · keine politische Bewertung.';
          panel.append(source);
        });
      }
    }).addTo(map);
  })
  .catch(error => console.warn('Ländergrenzen konnten nicht geladen werden:', error));
