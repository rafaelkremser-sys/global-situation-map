const map=L.map('map',{worldCopyJump:true}).setView([22,10],2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',{attribution:'&copy; OpenStreetMap &copy; CARTO',maxZoom:8}).addTo(map);
const demo=[{type:'conflict',name:'Beispiel: Konfliktzone',place:'Marker ist illustrative Darstellung',lat:32,lon:36,status:'DEMO',desc:'Dieser Marker dient nur zur Demonstration. Vor einer Veröffentlichung werden Lage und Quellen verifiziert.'},{type:'event',name:'Beispiel: Diplomatisches Ereignis',place:'Demo-Marker',lat:48,lon:15,status:'DEMO',desc:'Illustrativer Eintrag; kein aktueller Nachrichtenclaim.'},{type:'event',name:'Beispiel: Krisenregion',place:'Demo-Marker',lat:-5,lon:25,status:'DEMO',desc:'Illustrativer Eintrag; keine Lagebehauptung.'}];
const colors={conflict:'#d45d5d',event:'#5c94cf'};let layers={events:[],conflicts:[]};
demo.forEach(d=>{const m=L.circleMarker([d.lat,d.lon],{radius:7,color:colors[d.type],fillColor:colors[d.type],fillOpacity:.8,weight:1}).bindPopup('<b>'+d.name+'</b><br>'+d.place+'<br><small>'+d.status+'</small><p>'+d.desc+'</p>');(d.type==='conflict'?layers.conflicts:layers.events).push(m);m.addTo(map)});
function toggle(id,arr){const on=document.getElementById(id).checked;arr.forEach(m=>on?m.addTo(map):map.removeLayer(m))}
document.getElementById('eventsToggle').addEventListener('change',()=>toggle('eventsToggle',layers.events));document.getElementById('conflictsToggle').addEventListener('change',()=>toggle('conflictsToggle',layers.conflicts));
document.getElementById('influenceToggle').addEventListener('change',e=>{if(e.target.checked)alert('Einfluss- und Bündnislayer wird nach Quellenprüfung ergänzt.');});
document.getElementById('conflictCount').textContent='Demo';document.getElementById('eventCount').textContent='Demo';
const feed=document.getElementById('feed');demo.forEach(d=>{const el=document.createElement('article');el.className='event';el.innerHTML='<div class="tag">'+(d.type==='conflict'?'Konflikt / Demo':'Ereignis / Demo')+'</div><h3>'+d.name+'</h3><p>'+d.desc+'</p><div class="source">STATUS: '+d.status+'</div>';feed.append(el)});
/* Country outline layer from public GeoJSON. This is geographic boundary data, not a source of current political claims. */
const countryStyle={color:'#62798b',weight:0.65,fillColor:'#34424e',fillOpacity:0.10};
let countriesLayer;
fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson').then(r=>{if(!r.ok)throw Error('GeoJSON unavailable');return r.json()}).then(data=>{
 countriesLayer=L.geoJSON(data,{style:countryStyle,onEachFeature:(feature,layer)=>{
  const p=feature.properties||{};const name=p.ADMIN||p.name||p.NAME||'Land';
  layer.bindTooltip(name,{sticky:true});
  layer.on('click',()=>{
   map.fitBounds(layer.getBounds(),{padding:[20,20],maxZoom:5});
   const box=document.querySelector('.right');const info=document.createElement('div');info.className='note';info.innerHTML='<b>'+name+'</b><p>Geografisches Profil. Aktuelle politische, militärische und wirtschaftliche Daten werden erst nach Quellenprüfung ergänzt.</p><p><span class="source">Grenzdaten: öffentliches GeoJSON · keine politische Bewertung</span></p>';
   const old=document.getElementById('countryInfo');if(old)old.remove();info.id='countryInfo';box.insertBefore(info,box.firstChild.nextSibling);
  });
 }}).addTo(map);
}).catch(err=>console.warn('Country boundaries could not be loaded:',err));