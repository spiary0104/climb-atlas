"""Flat-vector trace of a Bouldeer source render (design/mascot/deer/*.png) -> assets/mascot/*.svg.

Dev-time design tool (not part of the app; needs Python 3 + Pillow). Faithful by construction: background pixels are set
aside, every character pixel snaps to the nearest sample of the BRAND palette below (each sample names its output colour:
the artwork palette of assets/mascot/head.svg and css/tokens.css; one fur shade step is kept, all other shading merges
into its base colour, which removes the soft AI gradient look), then each colour region's pixel boundary is traced,
simplified (Douglas-Peucker) and drawn as smooth quadratic curves, ink last. See docs/DESIGN.md sec. 12.0.

Usage (the settings every committed pose uses; colors=0 selects the brand palette):
    python design/tools/trace_mascot.py design/mascot/deer/<pose>.png assets/mascot/<pose>.svg 512 0 12 1.1
Arguments: SRC OUT [size=384] [colors=14, 0 = brand palette] [merge=26, median-cut mode only] [eps=1.0] [extras, e.g. granite]
Always compare the result with the source (design/review/ sheet or a side-by-side) at full size and at 96px.
"""
import sys, math
from collections import defaultdict
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
SIZE = int(sys.argv[3]) if len(sys.argv) > 3 else 384
NCOL = int(sys.argv[4]) if len(sys.argv) > 4 else 14
MERGE = float(sys.argv[5]) if len(sys.argv) > 5 else 26
EPS = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0

im = Image.open(src).convert('RGB').resize((SIZE, SIZE), Image.LANCZOS).filter(ImageFilter.MedianFilter(3))
W = H = SIZE
px = list(im.get_flattened_data()) if hasattr(im, 'get_flattened_data') else list(im.getdata())

def lum(c): return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]
import colorsys
def hs(c):
    h, l, s_ = colorsys.rgb_to_hls(c[0]/255, c[1]/255, c[2]/255)
    return h*360, s_, l
def same_family(a, b):
    ha, sa, la = hs(a); hb, sb, lb = hs(b)
    if sa < 0.18 and sb < 0.18: return True            # greys / near-neutrals
    dh = min(abs(ha-hb), 360-abs(ha-hb))
    return dh < 16 and abs(sa-sb) < 0.35
def dist(a, b):
    rm = (a[0]+b[0]) / 2
    return math.sqrt((2+rm/256)*(a[0]-b[0])**2 + 4*(a[1]-b[1])**2 + (2+(255-rm)/256)*(a[2]-b[2])**2)

bg = im.getpixel((3, 3))
# Brand palette mode (colors=0): every character pixel snaps to the nearest SAMPLE; each sample names its OUTPUT colour
# (the artwork palette of assets/mascot/head.svg and css/tokens.css). One fur shade step is kept (flat + one shade).
def h2c(h): return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16))
BRAND = [  # (sample, output)
  ('#171B16', '#171B16'), ('#191B16', '#171B16'), ('#232523', '#171B16'), ('#24241D', '#171B16'),
  ('#DD9F53', '#DD9F53'), ('#D49852', '#DD9F53'), ('#D39650', '#DD9F53'), ('#E0AF5B', '#DD9F53'),
  ('#B9802C', '#BD823E'), ('#C28F52', '#BD823E'), ('#866639', '#BD823E'), ('#A7752F', '#BD823E'),
  ('#FAE9C7', '#FAE9C7'), ('#F7E0BE', '#FAE9C7'), ('#F6E3C6', '#FAE9C7'), ('#E9D4B3', '#FAE9C7'), ('#F7DFBC', '#FAE9C7'),
  ('#754D33', '#754D33'), ('#6A4B32', '#754D33'), ('#5A4834', '#754D33'), ('#4C3A2B', '#754D33'), ('#41372D', '#754D33'),
  ('#D5A431', '#DDA23A'), ('#E3A73D', '#DDA23A'), ('#E4A73D', '#DDA23A'), ('#DAAC60', '#DDA23A'), ('#E1A134', '#DDA23A'),
  ('#40634B', '#40634B'), ('#40513F', '#40634B'), ('#425141', '#40634B'), ('#48624A', '#40634B'), ('#344939', '#40634B'), ('#535B44', '#40634B'),
  ('#3C362E', '#2E3230'), ('#31342E', '#2E3230'), ('#2E363D', '#2E3230'),
  ('#FFFFFF', '#FFFDF8'), ('#FDFAF4', '#FFFDF8'),
  ('#E27832', '#E37832'), ('#EF7E35', '#E37832'),
  ('#E57F6B', '#E07B6A'), ('#C95F55', '#E07B6A'), ('#8E3A2E', '#8E3A2E'), ('#6B2A24', '#8E3A2E'),
  ('#83817F', '#83817F'), ('#A29987', '#A29987'), ('#C9A26A', '#C9A26A'), ('#785931', '#8A6A3E'),
]
# Opt-in sample groups (7th argument, comma-separated), so adding one never changes poses traced without it.
EXTRAS = {
  # granite (the topped-out boulder): base + one shade step, flat like the fur
  'granite': [('#787878', '#83817F'), ('#909090', '#83817F'), ('#848478', '#83817F'), ('#B4B4B4', '#83817F'),
              ('#606060', '#666462'), ('#545454', '#666462'), ('#484848', '#666462')],
}
for name in (sys.argv[7].split(',') if len(sys.argv) > 7 and sys.argv[7] else []):
    BRAND = BRAND + EXTRAS[name]
BG = -1
if NCOL == 0:
    samples = [(h2c(a), h2c(b)) for a, b in BRAND]
    outs = sorted({b for _, b in samples})
    cols = outs
    grid = []
    for p in px:
        if dist(p, bg) <= 22: grid.append(BG); continue
        smp = min(samples, key=lambda sb: dist(p, sb[0]))
        grid.append(outs.index(smp[1]))
    palette = list(range(len(outs)))
else:
    fg = [p for p in px if dist(p, bg) > 22]
    strip = Image.new('RGB', (len(fg), 1)); strip.putdata(fg)
    q = strip.quantize(colors=NCOL, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = q.getpalette()[:NCOL*3]
    cols = [tuple(pal[i*3:i*3+3]) for i in range(NCOL)]
    cnt = {i: c for c, i in q.getcolors()}
    order = sorted(cnt, key=lambda i: -cnt[i])
    rep = {}
    for i in order:
        rep[i] = i
        for j in order:
            if j == i: break
            if rep[j] == j and dist(cols[i], cols[j]) < MERGE * 3 and same_family(cols[i], cols[j]) and (lum(cols[i]) < 45) == (lum(cols[j]) < 45):
                rep[i] = j; break
    palette = sorted({rep[i] for i in order}, key=lambda i: -cnt[i])
    grid = []
    for p in px:
        if dist(p, bg) <= 22: grid.append(BG); continue
        grid.append(min(palette, key=lambda i: dist(p, cols[i])))

def at(x, y): return grid[y*W + x]
clean = grid[:]
for y in range(1, H-1):
    for x in range(1, W-1):
        c = at(x, y); n = defaultdict(int)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                n[at(x+dx, y+dy)] += 1
        if n[c] <= 2: clean[y*W + x] = max(n, key=n.get)
grid = clean

def loops_for(colour):
    edges = defaultdict(list)
    for y in range(H):
        row = y*W
        for x in range(W):
            if grid[row + x] != colour: continue
            if y == 0 or grid[row - W + x] != colour: edges[(x, y)].append((x+1, y))
            if x == W-1 or grid[row + x + 1] != colour: edges[(x+1, y)].append((x+1, y+1))
            if y == H-1 or grid[row + W + x] != colour: edges[(x+1, y+1)].append((x, y+1))
            if x == 0 or grid[row + x - 1] != colour: edges[(x, y+1)].append((x, y))
    loops = []
    while edges:
        start = next(iter(edges))
        loop = [start]; cur = start
        while True:
            outs = edges.get(cur)
            if not outs: break
            nxt = outs.pop()
            if not outs: del edges[cur]
            if nxt == start: break
            loop.append(nxt); cur = nxt
        if len(loop) >= 8: loops.append(loop)
    return loops

def dp(points, eps):
    if len(points) < 3: return points
    a, b = points[0], points[-1]
    ax, ay = a; bx, by = b
    L = math.hypot(bx-ax, by-ay) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(points)-1):
        x, y = points[i]
        d = abs((by-ay)*x - (bx-ax)*y + bx*ay - by*ax) / L
        if d > dmax: dmax, idx = d, i
    if dmax > eps: return dp(points[:idx+1], eps)[:-1] + dp(points[idx:], eps)
    return [a, b]

SCALE = 1024 / SIZE
def smooth_path(loop, eps):
    n = len(loop)
    k = max(range(n), key=lambda i: (loop[i][0]-loop[0][0])**2 + (loop[i][1]-loop[0][1])**2)
    pts = dp(loop[:k+1], eps)[:-1] + dp(loop[k:] + [loop[0]], eps)[:-1]
    if len(pts) < 3: return ''
    m = len(pts)
    mids = [((pts[i][0]+pts[(i+1) % m][0])/2, (pts[i][1]+pts[(i+1) % m][1])/2) for i in range(m)]
    d = 'M%d %d' % (round(mids[-1][0]*SCALE), round(mids[-1][1]*SCALE))
    for i in range(m):
        d += 'Q%d %d %d %d' % (round(pts[i][0]*SCALE), round(pts[i][1]*SCALE), round(mids[i][0]*SCALE), round(mids[i][1]*SCALE))
    return d + 'Z'

present = [c for c in palette if any(g == c for g in grid)]
ink = min(present, key=lambda c: lum(cols[c]))
xs = [i % W for i, g in enumerate(grid) if g != BG]; ys = [i // W for i, g in enumerate(grid) if g != BG]
pad = 4
x0, y0 = max(0, min(xs)-pad), max(0, min(ys)-pad); x1, y1 = min(W, max(xs)+pad), min(H, max(ys)+pad)
parts = []
area = {c: sum(1 for g in grid if g == c) for c in present}
for c in sorted([p for p in present if p != ink], key=lambda c: -area[c]) + [ink]:
    hexc = '#%02X%02X%02X' % cols[c]
    ds = [d for d in (smooth_path(l, EPS) for l in loops_for(c)) if d]
    if not ds: continue
    seam = '' if c == ink else ' stroke="%s" stroke-width="2" stroke-linejoin="round"' % hexc
    parts.append('<path fill="%s" fill-rule="evenodd"%s d="%s"/>' % (hexc, seam, ''.join(ds)))
name = src.replace('\\', '/').split('/')[-1]
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.0f %.0f %.0f %.0f" role="img" aria-label="Bouldeer deer">\n'
       % (x0*SCALE, y0*SCALE, (x1-x0)*SCALE, (y1-y0)*SCALE)
       + '<!-- Flat-vector trace of design/mascot/deer/%s: the character\'s own colours reduced to a flat palette (shading\n'
         '     merged), region boundaries traced and smoothed. Generated from the source; regenerate rather than hand-edit. -->\n' % name
       + '\n'.join(parts) + '\n</svg>\n')
open(out, 'w', encoding='utf-8').write(svg)
print(out, 'colours', len(parts), 'bytes', len(svg), ['#%02X%02X%02X %d' % (cols[c] + (area[c],)) for c in present])
