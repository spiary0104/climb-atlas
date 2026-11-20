// Region names (country + STATES_BY_COUNTRY code). Pure: no DOM. stateLabel: the interface language (places-<code>.js via
// i18n.regionName), English when not listed; stateLabelEn: always English (search matches both). Codes, URLs and filters
// never change with the language. map.js re-exports both for its existing importers.
import { regionName } from './i18n.js';
import { STATES_BY_COUNTRY } from './regions.js';

export function stateLabelEn(country, state){
  const entry = (STATES_BY_COUNTRY[country] || []).find(([code]) => code === state);
  return entry ? entry[1] : state;
}
export const stateLabel = (country, state) => regionName(country, state, stateLabelEn(country, state));
