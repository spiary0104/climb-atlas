// Link previews and crawler metadata (final-stage audit 2026-10-03). Vercel serves the static app shell (index.html) for
// every /gym/* and /in/* URL, so chats and crawlers that do not run JavaScript saw one generic title and image for all
// 2,348 gyms. vercel.json routes ONLY crawler and link-unfurler user agents for those paths here; people get the static
// shell as before. This function returns the same shell with per-page <title>, description, canonical and Open Graph /
// Twitter tags. Gyms: the live row by slug (public read, anon key from js/supabase-init.js) through the app's own builders
// (js/modules/seo-meta.js, loaded from its source). Places: api/_places.json (scripts/build-sitemap.js, same builders).
// It never breaks a page: any error or a slow upstream returns the unmodified shell; an unknown gym returns it with 404.
// A Vercel Function in api/ with an .mjs extension needs no package.json (no framework).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const config = { maxDuration: 10 };

const ORIGIN = 'https://www.bouldeer.com';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const roots = [path.join(HERE, '..'), process.cwd()];

async function readAsset(rel){
  let last;
  for(const root of roots){ try{ return await readFile(path.join(root, rel), 'utf8'); }catch(err){ last = err; } }
  throw last;
}

let assetsPromise = null;
function assets(){
  if(!assetsPromise){
    assetsPromise = (async () => {
      const [shell, init, metaSrc, placesSrc] = await Promise.all([readAsset('index.html'), readAsset('js/supabase-init.js'),
        readAsset('js/modules/seo-meta.js'), readAsset('api/_places.json')]);
      // seo-meta.js has no imports, so its source loads as a module from a data: URL: exactly the app's builders.
      const meta = await import('data:text/javascript;base64,' + Buffer.from(metaSrc).toString('base64'));
      const url = (/https:\/\/[a-z0-9]+\.supabase\.co/.exec(init) || [])[0];
      const key = (/['"](eyJ[^'"]+|sb_publishable_[^'"]+)['"]/.exec(init) || [])[1];
      return { shell, meta, supabase: url && key ? { url, key } : null, places: JSON.parse(placesSrc) };
    })().catch(err => { assetsPromise = null; throw err; });
  }
  return assetsPromise;
}

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Replaces the shell's generic tags (index.html head) with the page's own; tags the shell lacks are added before </head>.
export function injectMeta(shell, { title, description, url, image, imageAlt, type = 'website' }){
  let html = shell;
  const set = (re, tag) => { html = re.test(html) ? html.replace(re, tag) : html.replace('</head>', tag + '\n</head>'); };
  set(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  set(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`);
  set(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(url)}">`);
  set(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  set(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`);
  set(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${esc(type)}">`);
  set(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(url)}">`);
  if(image){
    set(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(image)}">`);
    html = html.replace(/<meta property="og:image:width" content="[^"]*">\s*/, '').replace(/<meta property="og:image:height" content="[^"]*">\s*/, '');
    set(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${esc(imageAlt || title)}">`);
    set(/<meta name="twitter:card" content="[^"]*">/, '<meta name="twitter:card" content="summary_large_image">');
  }
  set(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(title)}">`);
  set(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(description)}">`);
  return html;
}

const httpsUrl = v => { try{ const u = new URL(String(v)); return u.protocol === 'https:' ? u.href : ''; }catch(err){ return ''; } };

async function gymMeta(a, slug){
  if(!a.supabase || !/^[a-z0-9-]{1,200}$/.test(slug)) return null;
  const q = `${a.supabase.url}/rest/v1/spots?slug=eq.${encodeURIComponent(slug)}&status=eq.approved&select=name,suburb,state,country,address,types,slug,photo&limit=1`;
  const r = await fetch(q, { headers: { apikey: a.supabase.key, Authorization: 'Bearer ' + a.supabase.key }, signal: AbortSignal.timeout(2500) });
  if(!r.ok) throw new Error('spots read ' + r.status);
  const [g] = await r.json();
  if(!g) return { notFound: true };
  const region = a.places.regions[g.country + ':' + g.state] || g.state || '';
  const country = a.places.countries[g.country] || g.country || '';
  const { title, description } = a.meta.gymSeo(g, { region, country });
  return { title: a.meta.fullTitle(title), description, url: `${ORIGIN}/gym/${g.slug}`, image: httpsUrl(g.photo), imageAlt: g.name, type: 'place' };
}

function placeMeta(a, pathname){
  const p = a.places.places[pathname];
  return p ? { title: a.meta.fullTitle(p.title), description: p.description, url: ORIGIN + pathname } : null;
}

function html(body, status = 200){
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400', 'X-Robots-Tag': 'all' } });
}

export async function GET(request){
  let a;
  try{ a = await assets(); }catch(err){ return new Response('', { status: 302, headers: { Location: '/' } }); }
  try{
    const url = new URL(request.url);
    // vercel.json passes the original path: /gym/<slug> as ?slug=, /in/... as ?path=.
    const slug = url.searchParams.get('slug');
    const place = url.searchParams.get('path');
    if(slug != null){
      const m = await gymMeta(a, slug.toLowerCase());
      if(m && m.notFound) return html(a.shell, 404);
      return html(m ? injectMeta(a.shell, m) : a.shell);
    }
    if(place != null){
      const pathname = '/in' + (place ? '/' + place.split('/').filter(Boolean).map(s => { try{ return encodeURIComponent(decodeURIComponent(s).toLowerCase()); }catch(err){ return encodeURIComponent(s.toLowerCase()); } }).join('/') : '');
      const m = pathname === '/in'
        ? { title: a.meta.fullTitle('Regions'), description: 'Every climbing gym on Bouldeer by country, region and city.', url: ORIGIN + '/in' }
        : placeMeta(a, pathname);
      return html(m ? injectMeta(a.shell, m) : a.shell);
    }
    return html(a.shell);
  }catch(err){
    return html(a.shell);       // upstream slow or down: the generic shell, never an error page
  }
}
