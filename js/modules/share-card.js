// Share card (DESIGN.md sec. 11.5): a 1080 x 1350 image on cream: the stamp large, the title in Fraunces, the place and
// date, the head lockup bottom-right at 5% width. Drawn on a canvas (the stamp is redrawn natively: an SVG drawn as an
// image cannot use the page's web fonts). Shared through the Web Share API with the file when the browser can, else
// downloaded. No feed, no likes: the card leaves the product. Colours come from the tokens.
import { stampDate, stampTilt } from './stamp-html.js';
import { showToast } from './utils.js';

const W = 1080, H = 1350;
const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function loadImage(src){
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
}

// Text on a circle, centred on the top (dir 1) or bottom (dir -1, reads left to right) of the ring.
function arcText(ctx, text, cx, cy, r, dir, tracking){
  const chars = [...text];
  const widths = chars.map(ch => ctx.measureText(ch).width + tracking);
  const total = widths.reduce((a, b) => a + b, 0) - tracking;
  let a = (dir > 0 ? -Math.PI / 2 : Math.PI / 2) - dir * (total / 2) / r;
  ctx.textAlign = 'center';
  ctx.textBaseline = dir > 0 ? 'alphabetic' : 'hanging';
  chars.forEach((ch, i) => {
    const half = (widths[i] - tracking) / 2 / r;
    a += dir * half;
    ctx.save();
    ctx.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.rotate(a + dir * Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    a += dir * (half + tracking / r);
  });
}

function fitFont(ctx, text, weight, family, max, min, width){
  let size = max;
  do { ctx.font = `${weight} ${size}px ${family}`; if(ctx.measureText(text).width <= width) break; size -= 2; } while(size > min);
  return size;
}

// card: {title (stamp + heading), place, date (ISO), seed}
export async function renderShareCard(card){
  await Promise.all([document.fonts.load('600 64px Fraunces'), document.fonts.load('600 40px Inter'), document.fonts.load('500 36px Inter')]).catch(() => {});
  const [head, stampHead] = await Promise.all([loadImage('assets/mascot/head.svg'), loadImage('assets/mascot/stamp-head.svg')]);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const ink = token('--color-stamp-ink'), text = token('--color-text-primary'), muted = token('--color-text-secondary');
  const display = token('--font-display'), body = token('--font-text');
  ctx.fillStyle = token('--color-surface-canvas');
  ctx.fillRect(0, 0, W, H);

  // The stamp, scaled from the 120-unit component (k = 6.4 -> 768px across), tilted like the on-screen stamp.
  const k = 6.4, cx = W / 2, cy = 520;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(stampTilt(card.seed) * Math.PI / 180);
  ctx.translate(-cx, -cy);
  ctx.strokeStyle = ink; ctx.fillStyle = ink;
  ctx.lineWidth = 2 * k; ctx.setLineDash([3 * k, 2.2 * k]);
  ctx.beginPath(); ctx.arc(cx, cy, 56 * k, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.5 * k; ctx.setLineDash([2.4 * k, 2 * k]);
  ctx.beginPath(); ctx.arc(cx, cy, 38 * k, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  let name = String(card.title || '').trim().toUpperCase();
  if(name.length > 24) name = name.slice(0, 23).trim() + '…';
  const nameSize = Math.max(6.5, Math.min(11, 108 / Math.max(1, name.length * 0.74))) * k;
  ctx.font = `600 ${nameSize}px ${display}`;
  arcText(ctx, name, cx, cy, 43.5 * k, 1, 1.6 * k);
  ctx.font = `600 ${7.5 * k}px ${body}`;
  arcText(ctx, stampDate(card.date), cx, cy, 44 * k, -1, 1.4 * k);
  for(const x of [8.5, 111.5]){ ctx.beginPath(); ctx.arc(cx + (x - 60) * k, cy, 1.6 * k, 0, Math.PI * 2); ctx.fill(); }
  ctx.drawImage(stampHead, cx + (38 - 60) * k, cy + (41 - 60) * k, 44 * k, 37.5 * k);
  ctx.restore();

  // Title and place under the stamp
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = text;
  fitFont(ctx, card.title || '', 600, display, 72, 40, W - 160);
  ctx.fillText(card.title || '', W / 2, 1060);
  ctx.fillStyle = muted;
  ctx.font = `500 36px ${body}`;
  ctx.fillText([card.place, stampDate(card.date).replace(/^(\d+) ([A-Z])([A-Z]+)/, (m, d, a, b) => d + ' ' + a + b.toLowerCase())].filter(Boolean).join(' · '), W / 2, 1120);

  // Head lockup, bottom-right, 5% of the width
  const mark = Math.round(W * 0.05);
  ctx.font = `600 40px ${display}`;
  const word = 'Bouldeer', ww = ctx.measureText(word).width;
  const right = W - 60, baseline = H - 64;
  ctx.fillStyle = text; ctx.textAlign = 'right';
  ctx.fillText(word, right, baseline);
  ctx.drawImage(head, right - ww - 12 - mark, baseline - mark + 8, mark, mark);
  return canvas;
}

const slug = s => String(s || 'bouldeer').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'bouldeer';

export async function shareCard(card){
  try{
    const canvas = await renderShareCard(card);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const file = new File([blob], `bouldeer-${slug(card.title)}.png`, { type: 'image/png' });
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      await navigator.share({ files: [file], title: 'Bouldeer', text: [card.title, card.place].filter(Boolean).join(', ') });
      return 'shared';
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  }catch(err){
    if(err && err.name === 'AbortError') return 'cancelled';
    console.error(err);
    showToast('Could not make the share card');
    return 'failed';
  }
}
