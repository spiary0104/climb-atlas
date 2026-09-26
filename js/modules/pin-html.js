// Map pin markup (DESIGN.md sec. 7.7). Pure: returns an SVG string, no DOM, no appState; map.js passes in the state.
//   teardrop  16 x 21px (viewBox 24 x 32), climb-type fill, 1px ink outline, 4px paper centre dot   (zoom >= 12)
//   dot       6px filled circle with a 1px ink outline, no drop                                     (zoom <= 11)
// States are rings outside the outline, innermost first in priority order selected > saved > climbed; checked-in turns the
// centre dot forest. Colours are CSS classes resolved in css/explore.css (type roles and --map-pin-* tokens), never data.

// Multi-type gyms use boulder if present, else top rope, else lead (sec. 7.7). Unknown/empty types get the neutral pin.
export function pinType(types){
  const t = Array.isArray(types) ? types : [];
  if(t.includes('indoor-bouldering')) return 'boulder';
  if(t.includes('top-rope')) return 'toprope';
  if(t.includes('lead-climbing')) return 'lead';
  return 'other';
}

export const RING_ORDER = Object.freeze(['selected', 'saved', 'climbed']);
const TEARDROP = 'M12 31C12 31 2 19.5 2 11.5a10 10 0 0 1 20 0C22 19.5 12 31 12 31Z';

// kind: 'teardrop' | 'dot'. Units: 1px = 1.5 viewBox units for the teardrop (24 units / 16px), 1 unit for the dot.
export function pinSvg({ kind: requested = 'teardrop', types = [], selected = false, saved = false, climbed = false, checkedIn = false } = {}){
  const kind = requested === 'dot' ? 'dot' : 'teardrop';
  const on = { selected: !!selected, saved: !!saved, climbed: !!climbed };
  const rings = RING_ORDER.filter(r => on[r]);
  const type = pinType(types);
  const unit = kind === 'dot' ? 1 : 1.5, outline = unit, ringW = 2 * unit;
  // Draw the outermost ring first; each ring is the pin outline stroked wider, so the next one inward covers its inner half.
  const ringPaths = rings.map((r, i) => [r, outline + 2 * ringW * (i + 1)]).reverse();
  const shape = kind === 'dot'
    ? w => `<circle cx="3" cy="3" r="2.5" stroke-width="${w}"`
    : w => `<path d="${TEARDROP}" stroke-width="${w}"`;
  const parts = ringPaths.map(([r, w]) => `${shape(w)} class="pin-ring pin-ring--${r}"/>`);
  parts.push(`${shape(outline)} class="pin-body pin-body--${type}"/>`);
  if(kind !== 'dot') parts.push(`<circle cx="12" cy="11.5" r="3" class="pin-dot${checkedIn ? ' pin-dot--checked-in' : ''}"/>`);
  const box = kind === 'dot' ? 'width="6" height="6" viewBox="0 0 6 6"' : 'width="16" height="21" viewBox="0 0 24 32"';
  return `<svg class="pin-svg pin-svg--${kind}" ${box} aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
}
