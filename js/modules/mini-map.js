// Small non-interactive maps on pages (gym page Essentials thumbnail, region/city pages): paper-toned (Positron recoloured
// to the paper tokens by paperBasemap; Brand Pass, sec. 8), centred on a point. Explore alone keeps the dark map. Pages render a slot (page-html.js mapThumbHtml: data-mini-map + numeric data-lat/-lng/
// -zoom); mountMiniMaps() fills every slot in a container. Region pages pass their gyms as `points`, drawn as the same
// type-colour dots Explore uses at that zoom. Each map holds a WebGL context, so pages destroy them on leave and before
// re-rendering. The page itself never waits for MapLibre: the maps appear once the library has loaded.
import { PAPER_STYLE, mapLibrary, paperBasemap } from './map.js';
import { pinSvg } from './pin-html.js';

let minis = [];
let generation = 0;          // bumped on destroy: a mount still waiting for the library is dropped

export function destroyMiniMaps(){
  generation++;
  minis.forEach(m => m.remove());
  minis = [];
}

export function mountMiniMaps(root, { points = [] } = {}){
  destroyMiniMaps();
  const mine = generation;
  mapLibrary().then(maplibregl => {
    if(mine === generation) mount(maplibregl, root, points);
  }).catch(err => console.warn('No mini map: MapLibre could not load', err));
}

function mount(maplibregl, root, points){
  root.querySelectorAll('[data-mini-map]').forEach(el => {
    const lat = Number(el.dataset.lat), lng = Number(el.dataset.lng), zoom = Number(el.dataset.zoom);
    if(![lat, lng, zoom].every(Number.isFinite)) return;
    const m = new maplibregl.Map({ container: el, style: PAPER_STYLE, center: [lng, lat], zoom, interactive: false, attributionControl: false, fadeDuration: 0 });
    m.once('style.load', () => { try{ paperBasemap(m); }catch(err){ console.warn('Could not tone the mini map', err); } });
    if('points' in el.dataset){
      for(const p of points){
        if(!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
        const dot = document.createElement('span');
        dot.className = 'pin pin--dot';
        dot.innerHTML = pinSvg({ kind: 'dot', types: p.types });
        new maplibregl.Marker({ element: dot }).setLngLat([p.lng, p.lat]).addTo(m);
      }
    }
    minis.push(m);
  });
}
