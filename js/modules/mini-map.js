// Small non-interactive maps on pages (gym page Essentials thumbnail, region/city pages): the Explore basemap, warmed the
// same way, centred on a point. Pages render a slot (page-html.js mapThumbHtml: data-mini-map + numeric data-lat/-lng/
// -zoom); mountMiniMaps() fills every slot in a container. Region pages pass their gyms as `points`, drawn as the same
// type-colour dots Explore uses at that zoom. Each map holds a WebGL context, so pages destroy them on leave and before
// re-rendering.
import { BASEMAP_STYLE, warmBasemap } from './map.js';
import { pinSvg } from './pin-html.js';

let minis = [];

export function destroyMiniMaps(){
  minis.forEach(m => m.remove());
  minis = [];
}

export function mountMiniMaps(root, { points = [] } = {}){
  destroyMiniMaps();
  root.querySelectorAll('[data-mini-map]').forEach(el => {
    const lat = Number(el.dataset.lat), lng = Number(el.dataset.lng), zoom = Number(el.dataset.zoom);
    if(![lat, lng, zoom].every(Number.isFinite)) return;
    const m = new maplibregl.Map({ container: el, style: BASEMAP_STYLE, center: [lng, lat], zoom, interactive: false, attributionControl: false, fadeDuration: 0 });
    m.once('style.load', () => { try{ warmBasemap(m); }catch(err){ console.warn('Could not warm the mini map', err); } });
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
