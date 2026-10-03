// Bouldeer brand marks (docs/DESIGN.md sec. 1A): the BOULDEER seal as inline SVG. Pure (no DOM, no appState).
// The seal is the one mark that frames everything you collect: the lettered seal on /me now, stamps and share cards in
// Phase 5. Colour version: fawn-cream disc, ink object ring, the colour head (assets/mascot/head.svg). Mono version:
// single stamp ink with the stamp head (assets/mascot/stamp-head.svg). "BOULDEER" is live Fraunces on an arc
// (textPath, baseline radius 41.5: centred between the rings), so it needs the page's fonts; at avatar size the lettering is dropped (see .avatar.mascot--avatar).
import { escapeHtml } from './html-safe.js';

let seq = 0;

// First-run art (sec. 12.2 tier 4): full-body poses, flat-vector traces of design/mascot/deer, at spot size (96px max),
// decorative (the empty state's text carries the meaning). Only these kinds exist; anything else renders nothing.
// field-notes (2026-10-03) on a first-run /me; the backpacker on a first-ever Explore visit (sec. 7.10).
const FIRST_RUN = { log: 'chalking-up', saved: 'field-notes', passport: 'traveller-passport', explore: 'backpacker' };
export function firstRunArt(kind){
  const pose = Object.hasOwn(FIRST_RUN, kind) ? FIRST_RUN[kind] : null;   // own keys only (not constructor, toString...)
  return pose ? `<img class="mascot mascot--spot" src="assets/mascot/${pose}.svg" alt="" width="96" height="96" loading="lazy">` : '';
}

// Milestone art (sec. 12.3): the one sheet where the character may break an edge at 160px. topped-out for the first
// stamp, fresh-stamp for travel milestones (new country, first abroad, every 5th gym), dyno for a new highest grade.
// Decorative; the sheet's title carries the meaning.
const MILESTONE = { 'topped-out': 'topped-out-flag', 'fresh-stamp': 'fresh-stamp', dyno: 'dyno' };
export function milestoneArt(pose){
  const file = Object.hasOwn(MILESTONE, pose) ? MILESTONE[pose] : MILESTONE['topped-out'];
  return `<img class="mascot mascot--milestone milestone-art" src="assets/mascot/${file}.svg" alt="" width="160" height="160">`;
}

// The antler crest (assets/brand/antlers.svg), drawn small at the foot of the seal.
const CREST = '<path d="M47 58 C40 50 30 42 23 32 C19 25 17 18 17 8"/><path d="M25 35 C19 32 12 29 7 22"/><path d="M29 40 C31 32 33 26 33 17"/>'
  + '<path d="M53 58 C60 50 70 42 77 32 C81 25 83 18 83 8"/><path d="M75 35 C81 32 88 29 93 22"/><path d="M71 40 C69 32 67 26 67 17"/>';

export function sealSvg({ mono = false, label = 'Bouldeer' } = {}){
  const n = ++seq, arc = 'sealArc' + n, clip = 'sealClip' + n;
  const head = mono
    ? '<image href="assets/mascot/stamp-head.svg" x="30" y="36" width="60" height="51"/>'
    : `<image href="assets/mascot/head.svg" x="28" y="27" width="64" height="64" clip-path="url(#${clip})"/>`;
  return `<svg class="seal${mono ? ' seal--mono' : ''}" viewBox="0 0 120 120" role="img" aria-label="${escapeHtml(label)} seal" focusable="false">`
    + `<defs><path id="${arc}" d="M 18.5 60 A 41.5 41.5 0 0 1 101.5 60"/><clipPath id="${clip}"><circle cx="60" cy="60" r="35"/></clipPath></defs>`
    + '<circle class="seal-disc" cx="60" cy="60" r="57"/><circle class="seal-inner" cx="60" cy="60" r="36"/>'
    + `<text class="seal-text" font-size="13" letter-spacing="2.6"><textPath href="#${arc}" startOffset="50%" text-anchor="middle">BOULDEER</textPath></text>`
    + `<g class="seal-mark" transform="translate(49 99) scale(0.22)">${CREST}</g>`
    + head + '</svg>';
}
