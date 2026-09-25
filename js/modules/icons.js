// The one icon system (Phosphor Regular sprite in assets/icons.svg; DESIGN.md sec. 16.3). Pure, no DOM, so HTML builders
// and tests can use it. Only names in ICON_NAMES are accepted: an unknown name is a programming error, never data.
export const ICON_NAMES = Object.freeze([
  'arrow-left', 'book-open', 'bookmark-simple', 'caret-down', 'caret-right', 'check', 'check-circle', 'flag', 'info',
  'magnifying-glass', 'map-trifold', 'navigation-arrow', 'pencil-simple', 'plus', 'smiley', 'smiley-meh', 'smiley-nervous',
  'smiley-sad', 'smiley-wink', 'squares-four', 'user', 'warning-circle', 'x',
]);
const KNOWN = new Set(ICON_NAMES);
const SIZES = { sm: ' icon-sm', md: '', lg: ' icon-lg' };

// icon('check') -> decorative <svg> (aria-hidden). Give the surrounding control its accessible name.
export function icon(name, { size = 'md', className = '' } = {}){
  if(!KNOWN.has(name)) throw new Error('Unknown icon: ' + name);
  const extra = /^[a-z0-9 -]*$/.test(className) && className ? ' ' + className : '';
  return `<svg class="icon${SIZES[size] ?? ''}${extra}" aria-hidden="true" focusable="false"><use href="assets/icons.svg#i-${name}"/></svg>`;
}
