// Small non-interactive maps on pages (gym page Essentials thumbnail, region pages): the Explore basemap, warmed the same
// way, centred on a point. Pages render a slot (page-html.js mapThumbHtml: data-mini-map + numeric data-lat/-lng/-zoom);
// mountMiniMaps() fills every slot in a container. Each map holds a WebGL context, so pages destroy them on leave and
// before re-rendering.
import { BASEMAP_STYLE, warmBasemap } from './map.js';

let minis = [];

export function destroyMiniMaps(){
  minis.forEach(m => m.remove());
  minis = [];
}

export function mountMiniMaps(root){
  destroyMiniMaps();
  root.querySelectorAll('[data-mini-map]').forEach(el => {
    const lat = Number(el.dataset.lat), lng = Number(el.dataset.lng), zoom = Number(el.dataset.zoom);
    if(![lat, lng, zoom].every(Number.isFinite)) return;
    const m = new maplibregl.Map({ container: el, style: BASEMAP_STYLE, center: [lng, lat], zoom, interactive: false, attributionControl: false, fadeDuration: 0 });
    m.once('style.load', () => { try{ warmBasemap(m); }catch(err){ console.warn('Could not warm the mini map', err); } });
    minis.push(m);
  });
}
