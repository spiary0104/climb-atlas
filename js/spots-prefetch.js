/*
 * spots-prefetch.js — starts the Explore gym-list read before the app runs.
 * ------------------------------------------------------------
 * Classic script, loaded right after supabase-init.js and auth.js (index.html).
 * The app module (js/main.js) runs only once the whole document is parsed and
 * its module graph has loaded; on a slow phone that left the network idle for
 * seconds before the gym list was even requested. This issues the same
 * read data-load.js would (same columns, same paging) so the rows download
 * while the app's modules load; loadSpots() takes the result once and only when
 * its LIST_COLUMNS still match `columns` here (tests/perf-load.test.js checks it).
 * Pages are read BATCH at a time in parallel, without asking for the total
 * first (that cost a whole extra round trip before the rest could start).
 */

window.spotsPrefetch = (function () {
  if (!window.sb) return null;
  const columns = 'id,name,suburb,state,country,lat,lng,types,address,photo,slug,community,edited,verified_at,created_at,submitted_by,description,hours';
  const PAGE = 1000, BATCH = 3;   // 2,419 gyms in October 2026: one round trip up to 3,000
  const page = from => window.sb.from('spots').select(columns).eq('status', 'approved')
    .order('id').range(from, from + PAGE - 1);
  const rows = (async () => {
    const all = [];
    for (let from = 0; ; from += PAGE * BATCH) {
      const res = await Promise.all(Array.from({ length: BATCH }, (_, k) => page(from + k * PAGE)));
      for (const { data, error } of res) {
        if (error) throw error;
        all.push(...(data || []));
      }
      if ((res[BATCH - 1].data || []).length < PAGE) return all;   // the last page of the batch was not full
    }
  })();
  rows.catch(() => {});   // loadSpots() reports a failure; never an unhandled rejection here
  return { columns, rows };
})();
