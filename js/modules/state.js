// All mutable app state lives on this one object so every module shares the same values.
// Modules read and write it as appState.<name>.
export const appState = {
  spots: [],            // approved spot rows only — what the public map shows
  usingFallback: false, // true if Supabase is unreachable/unconfigured and we fell back to the bundled seed data
  climbedIds: new Set(),
  bookmarkedIds: new Set(),
  isModerator: false,
  pendingSpots: [],  // new-spot submissions awaiting approval (moderator-only)
  pendingEdits: [],  // proposed edits to live spots awaiting approval (moderator-only)
  pendingReports: [], // "report incorrect info" messages awaiting review (moderator-only)

  sessions: [],      // the signed-in user's own logbook entries, each with an embedded session_climbs array
  draftClimbs: [],   // climb rows being built in the currently-open "Log a session" modal, before save

  activeStates: new Set(['ALL']),
  activeTypes: new Set(['indoor-bouldering','top-rope','lead-climbing']),
  showClimbedOnly: false,
  showBookmarkedOnly: false,
  searchTerm: '',
  visibleIndex: {},    // id -> spot, for whatever currently passes filters (feeds the cluster index)
  markerEls: {},       // id -> {marker, el} for individual spot markers currently painted on screen
  clusterMarkers: {},  // cluster_id -> maplibregl.Marker for cluster badges currently painted
  supercluster: null,
  lastIconBucket: null, // 'icon' | 'number' | null -- which style ungrouped spot markers were last painted in
  regionCentroids: {}, // "country:state" -> {lat,lng,country,state}, recomputed whenever the filtered spot set changes
  countryCentroids: {}, // country code -> {lat,lng,country,count}, same idea one tier up
  continentCentroids: {}, // region id -> {lat,lng,region,count}, same idea one tier up again
  regionLabelMarkers: {}, // "country:state" -> maplibregl.Marker, for the basic city/state labels shown below HOLD_ICON_ZOOM
  placingPin: null, // {lat,lng} while add-modal open
  currentEditId: null,
  currentEditPin: null, // {lat,lng} while edit-modal open
  currentReportId: null, // spot id being reported while report-modal open
  isPlacing: false,
  placingMode: null, // 'add' | 'edit'
  lastFocused: null,

  seedDataPromise: null, // in-flight fetch of data/gyms.json (see data-load.js ensureSeedData)
  gymSelectPopulated: false,
};
