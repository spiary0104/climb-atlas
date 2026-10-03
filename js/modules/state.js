// All mutable app state lives on this one object so every module shares the same values.
// Modules read and write it as appState.<name>.
export const appState = {
  spots: [],            // approved spot rows only — what the public map shows
  usingFallback: false, // true if Supabase is unreachable/unconfigured and we fell back to the bundled seed data
  loaded: false,        // false until the first loadSpots() finishes (the list shows skeletons until then)
  climbedIds: new Set(),
  bookmarkedIds: new Set(),
  isModerator: false,
  pendingSpots: [],  // new-spot submissions awaiting approval (moderator-only)
  pendingEdits: [],  // proposed edits to live spots awaiting approval (moderator-only)
  pendingReports: [], // "report incorrect info" messages awaiting review (moderator-only)

  sessions: [],      // the signed-in user's own logbook entries, each with an embedded session_climbs array
  draftClimbs: [],   // climb rows being built in the currently-open "Log a session" modal, before save

  // --- Explore filters (DESIGN.md sec. 7.6); mirrored in the URL query (geo.js encodeExploreState) ---
  activeTypes: new Set(['indoor-bouldering','top-rope','lead-climbing']),
  showClimbedOnly: false,
  showBookmarkedOnly: false,
  showPhotosOnly: false,
  placeFilter: null,   // search-index place entry ({kind, key, label, country, state?, bounds}) shown as the region pill
  searchTerm: '',      // free-text filter applied with Enter in the search field (shown as a pill)

  // --- Explore view ---
  filtered: [],        // spots passing the filters (feeds the cluster index and the scoped list)
  inView: [],          // filtered spots inside scopeBounds, sorted
  scopeBounds: null,   // {west,south,east,north} the list is scoped to; follows the map while searchAsMove is on
  searchAsMove: true,
  exploreFirstRun: false, // sec. 7.10: first visit on this device and no home area found (backpacker + "Where are you climbing?")
  sortBy: null,        // 'distance' | 'name' | 'recent'; null = default (distance when location is known, else name)
  listView: 'rows',    // 'rows' | 'cards' (remembered in localStorage)
  userLocation: null,  // {lat,lng} once the visitor used the locate control
  selectedId: null,    // gym whose peek card is open / pin is selected
  hoverId: null,       // gym hovered in the list or on the map
  carouselIds: [],     // mobile pin-tap carousel contents
  searchIndex: null,   // search-index.js index, rebuilt when spots change
  bySlug: new Map(),   // gym slug -> spot (gym pages)
  sessionsLoaded: false, // the signed-in user's sessions have been fetched (gym page "Your history here")
  contributorCounts: new Map(), // spot id -> distinct contributors (only gyms with 2+), for provenance marks
  provenanceCache: new Map(),   // spot id -> spot_provenance() row (or null), gym page line
  myEditCache: new Map(),       // spot id -> the signed-in user's latest proposal for it (or null)
  myCommunity: null,
  checkins: [],         // Phase 5: the signed-in person's check-ins, newest first (checkin.js loadCheckins)
  checkinsLoaded: false,
  checkinsAvailable: null, // false until the checkins migration exists in the project            // /me: {displayName, points, gyms, edits, submissions} for the signed-in user

  // --- map painting (map.js) ---
  visibleIndex: {},    // id -> spot, for whatever currently passes filters (feeds the cluster index)
  markerEls: {},       // id -> {marker, el, kind} for individual spot pins currently painted on screen
  clusterMarkers: {},  // cluster_id -> maplibregl.Marker for cluster discs currently painted
  supercluster: null,
  stackOffsets: new Map(), // id -> [dx,dy] pixel offsets for gyms sharing a coordinate (geo.js stackOffsets)
  lastPinKind: null,   // 'teardrop' | 'dot' | null -- which style spot pins were last painted in
  regionCentroids: {}, // "country:state" -> {lat,lng,country,state}, recomputed whenever the filtered spot set changes
  countryCentroids: {}, // country code -> {lat,lng,country,count}, same idea one tier up
  continentCentroids: {}, // region id -> {lat,lng,region,count}, same idea one tier up again
  regionLabelMarkers: {}, // "country:state" -> maplibregl.Marker, for the basic city/state labels shown below HOLD_ICON_ZOOM

  currentEditId: null,
  currentEditPin: null, // {lat,lng} while edit-modal open
  currentReportId: null, // spot id being reported while report-modal open
  isPlacing: false,
  placingMode: null, // 'edit' (the edit form's pin; adding a gym uses the /add page's own map)
  lastFocused: null,

  seedDataPromise: null, // in-flight fetch of data/gyms.json (see data-load.js ensureSeedData)
};
