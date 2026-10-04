/*
 * spots-prefetch.js — starts the Explore gym-list read before MapLibre loads.
 * ------------------------------------------------------------
 * Classic script, loaded right after supabase-init.js and auth.js and BEFORE
 * maplibre-gl.js (index.html). The app module (js/main.js) cannot run until
 * MapLibre has downloaded and executed, which on a slow phone left the network
 * idle for ~2 s before the gym list was even requested. This issues the same
 * read data-load.js would (same columns, same paging) so the rows download
 * while MapLibre loads; loadSpots() takes the result once and only when its
 * LIST_COLUMNS still match `columns` here (tests/perf-load.test.js checks it).
 */

window.spotsPrefetch = (function () {
  if (!window.sb) return null;
  const columns = 'id,name,suburb,state,country,lat,lng,types,address,photo,slug,community,edited,verified_at,created_at,submitted_by,description,hours';
  const PAGE = 1000;
  const page = (from, opts) => window.sb.from('spots').select(columns, opts).eq('status', 'approved')
    .order('id').range(from, from + PAGE - 1);
  const rows = (async () => {
    const first = await page(0, { count: 'exact' });
    if (first.error) throw first.error;
    const all = [...(first.data || [])];
    const total = Number.isFinite(first.count) ? first.count : all.length;
    const rest = [];
    for (let from = PAGE; from < total; from += PAGE) rest.push(page(from));
    for (const { data, error } of await Promise.all(rest)) {
      if (error) throw error;
      all.push(...(data || []));
    }
    return all;
  })();
  rows.catch(() => {});   // loadSpots() reports a failure; never an unhandled rejection here
  return { columns, rows };
})();
