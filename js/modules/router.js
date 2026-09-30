// Router (DESIGN.md sec. 6.2): real URLs via the History API, with a hash fallback (/#/gym/slug) for hosts that cannot
// rewrite unknown paths to index.html. Explore keeps its own state in the query string and stays mounted while a page
// is shown, so Back from a gym page returns to the exact Explore view (map, filters, list). Pages render into
// <main id="view">. Internal links are <a href="/..." data-link>; one delegated listener turns them into pushState.
export const ROUTES = [
  { name: 'explore', re: /^\/(?:index\.html)?$/ },
  { name: 'gym', re: /^\/gym\/([^/]+)\/?$/, keys: ['slug'] },
  { name: 'regions', re: /^\/in\/?$/ },
  { name: 'country', re: /^\/in\/([a-z]{2,5})\/?$/, keys: ['country'] },
  { name: 'region', re: /^\/in\/([a-z]{2,5})\/([^/]+)\/?$/, keys: ['country', 'region'] },
  { name: 'city', re: /^\/in\/([a-z]{2,5})\/([^/]+)\/([^/]+)\/?$/, keys: ['country', 'region', 'city'] },
  { name: 'log', re: /^\/log\/?$/ },
  { name: 'me', re: /^\/me(?:\/(saved|climbed))?\/?$/, keys: ['section'] },
  { name: 'mod', re: /^\/mod\/?$/ },
  { name: 'add', re: /^\/add\/?$/ },
  { name: 'passport', re: /^\/me\/passport\/?$/ },
];
// Which navigation area each page belongs to (top bar / tab bar active state).
const AREA = { explore: 'explore', gym: 'explore', regions: 'regions', country: 'regions', region: 'regions', city: 'regions', log: 'log', me: 'me', mod: 'me', add: null, passport: 'me', notfound: null };

// Pure: path -> {name, params}. Anything unknown is 'notfound' (the page, not a redirect).
export function matchRoute(path){
  for(const r of ROUTES){
    const m = r.re.exec(path);
    if(!m) continue;
    const params = {};
    (r.keys || []).forEach((k, i) => {
      if(m[i + 1] === undefined) return;
      try{ params[k] = decodeURIComponent(m[i + 1]); }catch(err){ params[k] = m[i + 1]; }
    });
    return { name: r.name, params };
  }
  return { name: 'notfound', params: {} };
}

// The app path: "#/gym/x" wins when present (hash fallback), otherwise the real path.
export function currentPath(){
  if(location.hash.startsWith('#/')) return location.hash.slice(1).split('?')[0].split('#')[0];
  return location.pathname;
}

const views = {};
let lastExploreUrl = '/';
let current = null;

// view: {enter(params, container), leave?()}; the explore view renders nothing into the container.
export function registerView(name, view){ views[name] = view; }
export const currentRoute = () => current;
export const isExplore = () => !current || current.name === 'explore';
export const exploreUrl = () => lastExploreUrl;

function setMeta(title, path){
  document.title = title;
  let link = document.querySelector('link[rel="canonical"]');
  if(link) link.href = location.origin + path;
}

// Pages call this once they know their title (e.g. the gym name).
export function setPageTitle(title){ setMeta(title ? title + ' · Bouldeer' : 'Bouldeer — community-sourced climbing map', current ? currentPath() : '/'); }

function markNav(area){
  document.querySelectorAll('[data-nav]').forEach(el => {
    if(!['explore', 'regions', 'log', 'me'].includes(el.dataset.nav)) return;
    if(el.dataset.nav === area) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
}

export function route({ focus = true } = {}){
  const prev = current;
  current = matchRoute(currentPath());
  const explore = current.name === 'explore';
  document.body.dataset.view = explore ? 'explore' : 'page';
  document.getElementById('explore').hidden = !explore;
  const view = document.getElementById('view');
  view.hidden = explore;
  markNav(AREA[current.name]);
  if(prev && prev.name !== current.name && views[prev.name] && views[prev.name].leave) views[prev.name].leave();
  if(explore){
    lastExploreUrl = location.pathname + location.search;
    if(views.explore) views.explore.enter(current.params, null, { returning: !!prev && prev.name !== 'explore', initial: !prev });
    setMeta('Bouldeer — community-sourced climbing map', '/');
    return;
  }
  const v = views[current.name] || views.notfound;
  view.innerHTML = '';
  view.scrollTop = 0;
  if(v) v.enter(current.params, view);
  if(focus && prev) view.focus({ preventScroll: true });   // move focus to the new page (not on first load)
}

// Re-render the current page (e.g. after the spots finish loading or a mark changes).
export function refreshPage(){
  if(!current || current.name === 'explore') return;
  const v = views[current.name] || views.notfound;
  const view = document.getElementById('view');
  const scroll = view.scrollTop;
  view.innerHTML = '';
  if(v) v.enter(current.params, view);
  view.scrollTop = scroll;
}

export function navigate(url, { replace = false } = {}){
  if(isExplore()) lastExploreUrl = location.pathname + location.search;
  history[replace ? 'replaceState' : 'pushState'](null, '', url);
  route();
}

export function initRouter(){
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-link]');
    if(!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if(url.origin !== location.origin) return;
    e.preventDefault();
    navigate(url.pathname + url.search);
  });
  window.addEventListener('popstate', () => route());
  route({ focus: false });
}
