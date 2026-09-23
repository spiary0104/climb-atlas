// Static config: type colours/labels, country labels + fly targets, zoom thresholds.

export const TYPE_COLORS = {'indoor-bouldering':'#3fb8a6','top-rope':'#8a6bb0','lead-climbing':'#4a90c9'};
export const TYPE_LABELS = {'indoor-bouldering':'Indoor bouldering','top-rope':'Top rope','lead-climbing':'Lead climbing'};
export const COUNTRY_LABELS = {AU:'Australia', US:'United States', JP:'Japan', CA:'Canada', NZ:'New Zealand', CN:'China', GB:'United Kingdom', DE:'Germany', FR:'France', SE:'Sweden', NL:'Netherlands', IT:'Italy', BE:'Belgium', KR:'South Korea', ES:'Spain', PT:'Portugal', AT:'Austria', CH:'Switzerland', PL:'Poland', DK:'Denmark', FI:'Finland', IE:'Ireland', NO:'Norway', MX:'Mexico', BR:'Brazil', HU:'Hungary', GR:'Greece', CZ:'Czech Republic', IS:'Iceland', RO:'Romania', HR:'Croatia', RU:'Russia', BG:'Bulgaria', AR:'Argentina', PH:'Philippines', CO:'Colombia', CL:'Chile', VE:'Venezuela', IN:'India', IL:'Israel', ID:'Indonesia', TW:'Taiwan', ZA:'South Africa', EC:'Ecuador', VN:'Vietnam', LT:'Lithuania', RS:'Serbia', BO:'Bolivia', IR:'Iran', EE:'Estonia', MY:'Malaysia', TH:'Thailand', UA:'Ukraine', SK:'Slovakia', CY:'Cyprus', PA:'Panama', PE:'Peru', TR:'Turkey', LV:'Latvia', SG:'Singapore', BA:'Bosnia and Herzegovina', AD:'Andorra', AE:'United Arab Emirates', GE:'Georgia', LU:'Luxembourg', SI:'Slovenia', KZ:'Kazakhstan', CR:'Costa Rica', BY:'Belarus', UY:'Uruguay', SA:'Saudi Arabia', HK:'Hong Kong', EG:'Egypt', KE:'Kenya', QA:'Qatar', AM:'Armenia', LB:'Lebanon', JO:'Jordan', NP:'Nepal', GT:'Guatemala', ME:'Montenegro', MN:'Mongolia', OM:'Oman', PY:'Paraguay'};
// Fixed camera target per country for the "fly to this country" click on
// its sidebar label -- picked to frame that country's actual spread of
// seed spots (e.g. US needs a wide zoom to fit both NY and CA), not a
// geographic center of the whole country (Canada's real geographic
// center is in the Arctic, nowhere near where any of its seed spots are).
export const COUNTRY_FLY_TARGETS = {
  AU: {center:[134,-25], zoom:3.6},
  US: {center:[-98,39], zoom:3.2},
  JP: {center:[138,38], zoom:4.6},
  CA: {center:[-97,50], zoom:3.2},
  NZ: {center:[172,-41], zoom:4.6},
  CN: {center:[110,32], zoom:3.6},
  GB: {center:[-2.5,54.5], zoom:4.8},
  DE: {center:[10.5,51], zoom:4.6},
  FR: {center:[2.5,46.3], zoom:5.2},
  SE: {center:[15,58.5], zoom:4.4},
  NL: {center:[5.2,52.1], zoom:7},
  IT: {center:[11,43.3], zoom:5.2},
  BE: {center:[4.6,50.7], zoom:6.6},
  KR: {center:[128,36], zoom:5.4},
  ES: {center:[-1,40.5], zoom:5.5},
  PT: {center:[-8.5,39.5], zoom:6.2},
  AT: {center:[14,47.7], zoom:6.2},
  CH: {center:[8,47.3], zoom:7.2},
  PL: {center:[18,52], zoom:5.8},
  DK: {center:[10,56], zoom:6},
  FI: {center:[26,63], zoom:4.8},
  IE: {center:[-7.5,53.2], zoom:6.5},
  NO: {center:[10,63], zoom:3.8},
  MX: {center:[-101,22], zoom:4.2},
  BR: {center:[-46,-22], zoom:5},
  HU: {center:[19,47.3], zoom:6.5},
  GR: {center:[24,38], zoom:5.5},
  CZ: {center:[15,49.9], zoom:6.5},
  IS: {center:[-19,65], zoom:5.2},
  RO: {center:[24.5,46], zoom:5.8},
  HR: {center:[16,44.5], zoom:5.6},
  RU: {center:[35,58], zoom:3.6},
  BG: {center:[24.5,42.7], zoom:6.5},
  AR: {center:[-63,-35], zoom:4.2},
  PH: {center:[121.8,12.5], zoom:5.2},
  CO: {center:[-74.3,5.5], zoom:5},
  CL: {center:[-72,-37], zoom:4.4},
  VE: {center:[-68,9], zoom:5.2},
  IN: {center:[77,22], zoom:4},
  IL: {center:[35,32], zoom:7},
  ID: {center:[110,-3], zoom:4},
  TW: {center:[121,24.3], zoom:7},
  ZA: {center:[26,-29], zoom:4.4},
  EC: {center:[-78.5,-1.5], zoom:5.8},
  VN: {center:[106,16], zoom:5},
  LT: {center:[24,55.3], zoom:6.5},
  RS: {center:[20.3,44.9], zoom:7},
  BO: {center:[-67.1,-16.9], zoom:5.6},
  IR: {center:[51,35.5], zoom:5.6},
  EE: {center:[25,58.6], zoom:6.5},
  MY: {center:[103,3.5], zoom:5.6},
  TH: {center:[99.7,13.5], zoom:4.6},
  UA: {center:[27.3,50.1], zoom:5.4},
  SK: {center:[19.1,48.7], zoom:6.8},
  CY: {center:[33.2,35.05], zoom:8.6},
  PA: {center:[-80.5,8.6], zoom:6.2},
  PE: {center:[-75,-11.5], zoom:5.4},
  TR: {center:[31,40.2], zoom:6},
  LV: {center:[24.17,56.97], zoom:9.5},
  SG: {center:[103.85,1.36], zoom:10.4},
  BA: {center:[17.6,43.9], zoom:6.6},
  AD: {center:[1.55,42.53], zoom:10.6},
  AE: {center:[54.9,24.8], zoom:7.6},
  GE: {center:[44.76,41.72], zoom:9.4},
  LU: {center:[6.05,49.56], zoom:9.6},
  SI: {center:[14.8,46.1], zoom:7.4},
  KZ: {center:[74,47.2], zoom:4.4},
  CR: {center:[-84.4,10.0], zoom:7.6},
  BY: {center:[26,53.1], zoom:5.8},
  UY: {center:[-56.0,-33.2], zoom:6.2},
  SA: {center:[44.5,24.5], zoom:5.0},
  HK: {center:[114.17,22.36], zoom:9.8},
  EG: {center:[31.1,30.0], zoom:8.6},
  KE: {center:[36.9,-0.6], zoom:7.4},
  QA: {center:[51.4,25.3], zoom:8.4},
  AM: {center:[44.51,40.17], zoom:8.4},
  LB: {center:[35.5,33.8], zoom:8.4},
  JO: {center:[35.9,31.9], zoom:8.6},
  NP: {center:[84.6,27.95], zoom:7.0},
  GT: {center:[-90.9,14.65], zoom:7.6},
  ME: {center:[19.0,42.43], zoom:8.8},
  MN: {center:[106.92,47.89], zoom:9.4},
  OM: {center:[58.14,23.62], zoom:9.4},
  PY: {center:[-57.55,-25.28], zoom:9.0}
};
// Which sidebar region-group each country belongs to -- same grouping as
// the `.region-group[data-region]` wrappers in index.html, kept here too
// so the map's own continent-tier labels/fly-targets don't need to read
// the DOM to know a country's continent.
export const COUNTRY_TO_REGION = {
  CN:'asia', JP:'asia', KR:'asia', PH:'asia', IN:'asia', IL:'asia', ID:'asia', TW:'asia', VN:'asia', IR:'asia', MY:'asia', TH:'asia', SG:'asia', AE:'asia', GE:'asia', KZ:'asia', SA:'asia', HK:'asia', QA:'asia', AM:'asia', LB:'asia', JO:'asia', NP:'asia', MN:'asia', OM:'asia',
  DE:'europe', GB:'europe', FR:'europe', SE:'europe', NL:'europe', IT:'europe', BE:'europe', LT:'europe',
  ES:'europe', PT:'europe', AT:'europe', CH:'europe', PL:'europe', DK:'europe', FI:'europe', IE:'europe',
  NO:'europe', HU:'europe', GR:'europe', CZ:'europe', IS:'europe',
  RO:'europe', HR:'europe', RU:'europe', BG:'europe', RS:'europe', EE:'europe', UA:'europe', SK:'europe',
  CY:'europe', TR:'europe', LV:'europe', BA:'europe', AD:'europe', LU:'europe', SI:'europe', BY:'europe', ME:'europe',
  CA:'north-america', US:'north-america', MX:'north-america', PA:'north-america', CR:'north-america', GT:'north-america',
  AU:'oceania', NZ:'oceania',
  BR:'south-america', AR:'south-america', CO:'south-america', CL:'south-america', VE:'south-america',
  EC:'south-america', BO:'south-america', PE:'south-america', UY:'south-america', PY:'south-america',
  ZA:'africa', EG:'africa', KE:'africa'
};
export const REGION_LABELS = {asia:'Asia', europe:'Europe', 'north-america':'North America', oceania:'Oceania', 'south-america':'South America', africa:'Africa'};
// Same idea as COUNTRY_FLY_TARGETS, one tier coarser -- framing every
// country currently in that region, not just one. Africa currently has
// only South Africa, so this matches ZA's own fly target for now -- widen
// it once a second African country is added, same as every other region.
export const REGION_FLY_TARGETS = {
  asia: {center:[125,32], zoom:2.6},
  europe: {center:[8,50], zoom:3.2},
  'north-america': {center:[-100,45], zoom:2.4},
  oceania: {center:[155,-30], zoom:3},
  'south-america': {center:[-58,-15], zoom:3},
  africa: {center:[26,-2], zoom:2.6}
};
// Below this zoom, a spot with no nearby neighbours (so supercluster hands
// it back as a lone, unclustered point rather than grouping it) still paints
// as a small numbered badge instead of the hold-shaped icon -- at globe/
// country zoom a 20px icon for a single far-off spot (e.g. Japan, viewed
// from the default mid-Pacific camera) reads as a stray dot; a numbered
// badge matches the visual language clusters already use and stays legible.
export const HOLD_ICON_ZOOM = 9;
// Below this zoom, region labels show the country name (e.g. "Japan")
// rather than individual states/prefectures/cities (e.g. "Tokyo") --
// at globe/continent zoom, a country name orients a viewer faster than a
// handful of same-country city names clustered together would.
export const COUNTRY_LABEL_ZOOM = 5;
// Below this (coarser than COUNTRY_LABEL_ZOOM), labels show the continent
// name (e.g. "Europe") instead of individual countries -- at true globe
// zoom, several nearby countries (Germany/France/Italy/... all in Europe)
// are usually too close together on screen to be worth telling apart yet,
// and a continent name orients a viewer faster.
export const CONTINENT_LABEL_ZOOM = 3.5;
// Camera animations respect the OS reduced-motion preference: every
// flyTo/easeTo duration goes through this so they collapse to a cut.
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const motion = ms => REDUCED_MOTION ? 0 : ms;
export const MOOD_EMOJI = {great:'🤩', good:'🙂', ok:'😐', tired:'😮‍💨', rough:'😫'};
