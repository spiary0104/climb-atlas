"""Page header art (docs/DESIGN.md sec. 13A): three flat-vector scenes for the Regions, Log and Me pages.

Dev-only, like trace_mascot.py: writes assets/art/{regions-wall,log-still-life,me-shelf}.svg byte for byte (seeded).
Same drawing rules as the deer derivatives (sec. 12.0): one even ink outline, flat fills with at most one shade step,
the character palette only, no gradients or texture. No character in these scenes (sec. 12.2: one character per screen,
never in region page bodies). Canvas 1260 x 540 (21:9); everything that matters sits inside the central 960 x 420 so the
page can crop to 16:9 (phones) or 3:1 (desktop) with object-fit: cover.

    python design/tools/page_art.py
"""
import math
import os
import random

W, H = 1260, 540
INK = '#171B16'
SW = 3.5
C = {
    'bg': '#F2DFC0', 'cream': '#FAE9C7', 'paper': '#FFFCF4', 'fawn': '#DD9F53', 'fawnshade': '#BD823E', 'fawnlight': '#EBC596',
    'bark': '#754D33', 'forest': '#40634B', 'forestdark': '#2F4B39', 'mustard': '#DDA23A', 'mustardshade': '#C08A22',
    'orange': '#E37832', 'granite': '#83817F', 'slate': '#2E3230',
}
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def f(n):
    return ('%.1f' % n).rstrip('0').rstrip('.')


def pts(points):
    return ' '.join(f(x) + ',' + f(y) for x, y in points)


def blob_path(cx, cy, r, rng, n=8, jitter=0.24, squash=1.0):
    """Closed smooth blob (Catmull-Rom through jittered radial points), the shape of a climbing hold."""
    rot = rng.uniform(0, math.tau)
    p = []
    for i in range(n):
        a = rot + i * math.tau / n
        rr = r * (1 + rng.uniform(-jitter, jitter))
        p.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr * squash))
    d = 'M' + f(p[0][0]) + ' ' + f(p[0][1])
    for i in range(n):
        p0, p1, p2, p3 = p[(i - 1) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += 'C' + f(c1[0]) + ' ' + f(c1[1]) + ' ' + f(c2[0]) + ' ' + f(c2[1]) + ' ' + f(p2[0]) + ' ' + f(p2[1])
    return d + 'Z'


def outline(stroke, extra):
    """The default ink outline; an override in `extra` (stroke= / stroke-width=) replaces that part of it."""
    if not stroke:
        return ''
    return ('' if ' stroke="' in extra else f' stroke="{INK}"') + ('' if ' stroke-width=' in extra else f' stroke-width="{SW}"')


def path(d, fill, stroke=True, extra=''):
    s = outline(stroke, extra)
    return f'<path d="{d}" fill="{fill}"{s}{extra}/>'


def rect(x, y, w, h, fill, r=0, stroke=True, extra=''):
    s = outline(stroke, extra)
    rr = f' rx="{f(r)}"' if r else ''
    return f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"{rr} fill="{fill}"{s}{extra}/>'


def circle(cx, cy, r, fill, stroke=True, extra=''):
    s = outline(stroke, extra)
    return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{fill}"{s}{extra}/>'


def line(x1, y1, x2, y2, color=INK, w=SW, extra=''):
    return f'<path d="M{f(x1)} {f(y1)}L{f(x2)} {f(y2)}" fill="none" stroke="{color}" stroke-width="{f(w)}" stroke-linecap="round"{extra}/>'


def pin(x, y, s=1.0):
    """Orange map pin, tip at (x, y): the travel prop from the deer art (sec. 12.0)."""
    r = 15 * s
    cy = y - 30 * s
    d = (f'M{f(x)} {f(y)}C{f(x - 4 * s)} {f(y - 10 * s)} {f(x - r)} {f(cy + 9 * s)} {f(x - r)} {f(cy)}'
         f'A{f(r)} {f(r)} 0 0 1 {f(x + r)} {f(cy)}C{f(x + r)} {f(cy + 9 * s)} {f(x + 4 * s)} {f(y - 10 * s)} {f(x)} {f(y)}Z')
    return path(d, C['orange']) + circle(x, cy, 5.5 * s, C['cream'])


def svg(title, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">'
            f'<title>{title}</title><g stroke-linejoin="round" stroke-linecap="round">' + ''.join(body) + '</g></svg>\n')


def crash_pad(x, y, w, h, top=22):
    """Slate pad with a forest top band and a cream stitch line."""
    return [rect(x, y, w, h, C['slate'], 18), rect(x, y, w, top + 8, C['forest'], 18),
            rect(x + 2, y + top, w - 4, 10, C['forest'], 0, False),
            line(x + 18, y + top + 2, x + w - 18, y + top + 2, C['slate'], 3.5),
            line(x + 26, y + h - 14, x + w - 26, y + h - 14, C['cream'], 2.2, ' stroke-dasharray="10 9"')]


def chalk_bag(x, y, s=1.0):
    """Forest chalk bag (cylinder) with a cream fleece rim and a chalk heap; (x, y) = bottom centre."""
    w, h = 70 * s, 86 * s
    out = [path(f'M{f(x - w / 2)} {f(y - h)}L{f(x - w / 2 + 4 * s)} {f(y - 8 * s)}Q{f(x)} {f(y + 6 * s)} {f(x + w / 2 - 4 * s)} {f(y - 8 * s)}L{f(x + w / 2)} {f(y - h)}Z', C['forest'])]
    out.append(path(f'M{f(x - 26 * s)} {f(y - 30 * s)}Q{f(x)} {f(y - 22 * s)} {f(x + 26 * s)} {f(y - 30 * s)}', 'none', True, f' stroke="{C["forestdark"]}"'))
    out.append(rect(x - w / 2 - 5 * s, y - h - 16 * s, w + 10 * s, 22 * s, C['cream'], 11 * s))
    out.append(path(f'M{f(x - 22 * s)} {f(y - h - 12 * s)}Q{f(x - 10 * s)} {f(y - h - 34 * s)} {f(x)} {f(y - h - 30 * s)}Q{f(x + 14 * s)} {f(y - h - 36 * s)} {f(x + 24 * s)} {f(y - h - 12 * s)}Z', C['paper']))
    return out


def brush(x, y, angle=-8, s=1.0):
    g = (f'<g transform="translate({f(x)} {f(y)}) rotate({f(angle)})">'
         + rect(0, -9 * s, 92 * s, 18 * s, C['bark'], 9 * s) + rect(88 * s, -13 * s, 44 * s, 26 * s, C['cream'], 6 * s)
         + ''.join(line((96 + i * 9) * s, -9 * s, (96 + i * 9) * s, 9 * s, C['fawnlight'], 2) for i in range(4)) + '</g>')
    return [g]


def shoe(x, y, s=1.0, rot=0, fill=None):
    """A climbing shoe in side view, toe to the right, heel bottom at (x, y): downturned toe, bark rand, forest strap."""
    fill = fill or C['mustard']
    body = [
        path('M0 0C-9 -18 -8 -44 4 -60L54 -50C82 -40 112 -26 150 -13C168 -7 174 2 165 8L10 8C1 8 -3 4 0 0Z', fill),
        path('M4 -60L54 -50C42 -42 20 -44 4 -60Z', C['bark']),
        path('M-3 3L166 3C174 7 170 14 160 14L8 14C-1 14 -5 9 -3 3Z', C['bark']),
        path('M112 -25C134 -18 156 -11 166 0', 'none', True, f' stroke="{C["bark"]}" stroke-width="7"'),
        path('M60 -49L88 -39L80 6L52 6Z', C['forest']),
        path('M2 -58C-12 -70 -4 -84 10 -73', 'none'),
    ]
    return [f'<g transform="translate({f(x)} {f(y)}) rotate({f(rot)}) scale({f(s)})">' + ''.join(body) + '</g>']


def regions_wall():
    rng = random.Random(7)
    out = [rect(0, 0, W, H, C['bg'], 0, False)]
    wx, wy, ww, wh = 170, 40, 920, 400
    out.append(rect(wx, wy, ww, wh, C['cream'], 14))
    out.append(line(wx + ww / 2, wy + 6, wx + ww / 2, wy + wh - 6, C['fawnlight'], 2.5))
    for gx in range(wx + 24, wx + ww - 10, 36):
        for gy in range(wy + 22, wy + wh - 10, 36):
            out.append(circle(gx, gy, 2.2, C['fawnlight'], False))
    continents = [  # (outline, holds): a simplified world map painted on the plywood, west to east
        ([(250, 95), (330, 76), (430, 82), (482, 108), (458, 150), (422, 176), (402, 214), (372, 240), (346, 226), (330, 190), (290, 170), (254, 142)], 13),
        ([(395, 255), (442, 258), (482, 290), (472, 340), (446, 386), (424, 402), (414, 360), (400, 310)], 6),
        ([(582, 104), (640, 92), (692, 106), (682, 140), (642, 160), (600, 156), (578, 130)], 6),
        ([(588, 176), (662, 168), (708, 200), (702, 252), (672, 310), (646, 346), (624, 320), (608, 270), (584, 222)], 8),
        ([(702, 90), (800, 74), (922, 84), (992, 110), (988, 152), (942, 190), (902, 216), (860, 236), (820, 212), (770, 202), (730, 172), (704, 136)], 15),
        ([(878, 300), (940, 288), (978, 314), (962, 352), (910, 360), (876, 336)], 5)]
    for outline_pts, _ in continents:
        out.append(f'<polygon points="{pts(outline_pts)}" fill="{C["fawnlight"]}" stroke="{C["fawnlight"]}" stroke-width="18" opacity="0.8"/>')
    palette = ['forest', 'mustard', 'fawn', 'bark', 'forest', 'mustard']
    placed = []
    holds = []

    def inside(x, y, poly):
        hit = False
        for i in range(len(poly)):
            (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                hit = not hit
        return hit
    for ci, (poly, n) in enumerate(continents):
        xs, ys = [q[0] for q in poly], [q[1] for q in poly]
        tries = 0
        k = 0
        while k < n and tries < 4000:
            tries += 1
            x, y, r = rng.uniform(min(xs), max(xs)), rng.uniform(min(ys), max(ys)), rng.uniform(10, 21)
            if not inside(x, y, poly) or any(math.hypot(x - px, y - py) < r + pr + 5 for px, py, pr in placed):
                continue
            placed.append((x, y, r))
            holds.append((x, y, r, palette[(ci + k) % len(palette)]))
            k += 1
    for x, y, r in [(250, 380, 9), (560, 410, 8), (760, 400, 10), (1030, 90, 9), (980, 410, 8), (520, 70, 8)]:
        holds.append((x, y, r, 'granite'))   # a few small footholds between the continents
    for x, y, r, col in holds:
        out.append(path(blob_path(x, y, r, rng, n=rng.choice([6, 7, 8])), C[col]))
        out.append(circle(x + r * 0.15, y - r * 0.1, max(2.6, r * 0.16), INK, False))
    for x, y, s in [(360, 120, 1.0), (636, 116, 0.9), (850, 140, 1.05), (926, 316, 0.85)]:
        out.append(pin(x, y, s))
    out += crash_pad(130, 428, 1000, 78)
    out += brush(250, 450, -6, 0.9)
    out += chalk_bag(1010, 452, 0.9)
    return svg('A bouldering wall whose holds form a map of the world', out)


def log_still_life():
    rng = random.Random(11)
    out = [rect(0, 0, W, H, C['bg'], 0, False)]
    # the pad's top face (forest) and its slate front
    out.append(rect(120, 430, 1020, 74, C['slate'], 18))
    out.append(rect(120, 210, 1020, 250, C['forest'], 22))
    out.append(line(150, 236, 1110, 236, C['forestdark'], 3))
    out.append(line(146, 486, 1114, 486, C['cream'], 2.2, ' stroke-dasharray="10 9"'))
    # mug
    out.append(rect(196, 238, 70, 82, C['cream'], 12))
    out.append(rect(196, 262, 70, 18, C['forestdark'], 0, False))
    out.append(rect(196, 238, 70, 82, 'none', 12))
    out.append(path('M266 256C292 256 292 302 266 302', 'none'))
    for dx in (214, 236):
        out.append(path(f'M{dx} 226C{dx - 8} 214 {dx + 8} 206 {dx} 192', 'none', True, f' stroke="{C["fawnshade"]}"'))
    # calendar card with session days
    out.append(rect(300, 226, 158, 150, C['paper'], 10))
    out.append(rect(300, 226, 158, 30, C['forest'], 10))
    out.append(rect(301.7, 246, 154.6, 10, C['forest'], 0, False))
    out.append(line(300, 256, 458, 256))
    days = {3, 8, 9, 15, 19, 24}
    for i in range(28):
        cx, cy = 318 + (i % 7) * 20.5, 272 + (i // 7) * 24
        if i in days:
            out.append(circle(cx, cy, 7.5, C['mustard'], True, ' stroke-width="2.4"'))
        else:
            out.append(circle(cx, cy, 2.6, C['fawnlight'], False))
    # open logbook
    out.append(rect(486, 168, 352, 222, C['forestdark'], 14))
    out.append(path('M496 180L662 186L662 376L496 370Z', C['paper']))
    out.append(path('M828 180L662 186L662 376L828 370Z', C['paper']))
    out.append(line(662, 186, 662, 376, C['fawnshade'], 3))
    for row in range(7):
        y = 212 + row * 22
        out.append(line(512, y + 1, 646, y + 3, C['fawnlight'], 2))
        out.append(line(678, y + 3, 812, y + 1, C['fawnlight'], 2))
    for row, (x0, x1) in enumerate([(514, 632), (514, 600), (514, 640), (514, 588), (680, 790), (680, 760)]):
        y = 207 + (row % 4) * 22 + (0 if row < 4 else 0)
        y = 207 + row * 22 if row < 4 else 207 + (row - 4) * 22
        d = f'M{x0} {y}' + ''.join(f'Q{x0 + (i + 0.5) * 12} {y + (-5 if i % 2 else 5)} {x0 + (i + 1) * 12} {y}' for i in range(int((x1 - x0) / 12)))
        out.append(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>')
    # pencil across the right page
    out.append('<g transform="translate(700 330) rotate(-18)">' + rect(0, -8, 150, 16, C['mustard'], 3)
               + path('M150 -8L176 0L150 8Z', C['cream']) + path('M168 -2.8L176 0L168 2.8Z', INK, False)
               + rect(-18, -8, 20, 16, C['fawnlight'], 3) + '</g>')
    # a pair of climbing shoes, one behind the other
    out += shoe(870, 300, 0.82, 0, C['mustardshade'])
    out += shoe(884, 344, 0.82, 0, C['mustard'])
    # chalk bag with a little spilled chalk
    out += chalk_bag(1068, 420, 0.95)
    for x, y, r in [(1018, 424, 5), (1030, 432, 3.5), (1104, 426, 4)]:
        out.append(circle(x, y, r, C['paper'], False))
    # brush and tape roll on the pad
    out += brush(332, 412, -4, 0.95)
    out.append(circle(560, 418, 28, C['paper']))
    out.append(circle(560, 418, 13, C['forest']))
    return svg('A climbing logbook, calendar, shoes and chalk bag laid out on a crash pad', out)


def me_shelf():
    rng = random.Random(23)
    out = [rect(0, 0, W, H, C['bg'], 0, False)]
    # pegboard
    out.append(rect(190, 40, 880, 304, C['fawnlight'], 12))
    for gx in range(214, 1060, 34):
        for gy in range(62, 336, 34):
            out.append(circle(gx, gy, 3, C['fawnshade'], False))
    # folded paper map with pins and a ribbon
    out.append(path('M262 92L332 82L402 92L472 82L472 252L402 262L332 252L262 262Z', C['paper']))
    out.append(line(332, 82, 332, 252, C['fawnlight'], 2.5))
    out.append(line(402, 92, 402, 262, C['fawnlight'], 2.5))
    out.append(path(blob_path(312, 150, 34, rng, 9, 0.3, 0.8), C['forest'] , True, ' stroke-width="2.6"'))
    out.append(path(blob_path(420, 200, 30, rng, 9, 0.3, 0.9), C['forest'], True, ' stroke-width="2.6"'))
    out.append(path('M276 222C320 200 360 236 400 214S450 170 462 178', 'none', True, f' stroke="{C["mustard"]}" stroke-width="4"'))
    for x, y in [(306, 150), (372, 118), (430, 204)]:
        out.append(pin(x, y, 0.75))
    out.append(path('M448 82L448 150L460 138L472 150L472 82Z', C['mustard']))
    # two postcards of climbing walls
    for (x, y, rot, holds) in [(520, 96, -5, 7), (668, 112, 4, 6)]:
        g = [rect(0, 0, 124, 150, C['paper'], 6), rect(12, 12, 100, 104, C['cream'], 3, True, ' stroke-width="2.4"')]
        for i in range(holds):
            hx, hy = 24 + rng.uniform(0, 76), 24 + rng.uniform(0, 80)
            g.append(path(blob_path(hx, hy, rng.uniform(5, 9), rng, 6), C[['forest', 'mustard', 'bark', 'fawn'][i % 4]], True, ' stroke-width="2"'))
        g.append(line(18, 132, 84, 132, C['fawnlight'], 3))
        out.append(f'<g transform="translate({x} {y}) rotate({rot} 62 75)">' + ''.join(g) + '</g>')
        out.append(circle(x + 62, y + 6, 6, C['granite']))
    # climbing shoes hanging toe-down by their heel loops from a peg
    out.append(rect(858, 66, 120, 12, C['granite'], 6))
    for x, y in ((872, 96), (930, 104)):
        out.append(line(x + 48, 78, x + 48, y - 1, INK, 2.6))
    out += shoe(872, 96, 0.78, 90, C['mustardshade'])
    out += shoe(930, 104, 0.78, 90, C['mustard'])
    # shelf
    out.append(rect(160, 336, 940, 26, C['bark'], 6))
    for x in (250, 1000):
        out.append(path(f'M{x} 362L{x} 396L{x + 30} 362Z', C['bark']))
    # open passport with round stamps
    out.append(rect(304, 262, 264, 76, C['forestdark'], 8))
    out.append(path('M312 270L434 274L434 334L312 330Z', C['paper']))
    out.append(path('M560 270L434 274L434 334L560 330Z', C['paper']))
    for x, y, col in [(350, 300, 'mustard'), (398, 304, 'forest'), (478, 298, 'bark'), (526, 306, 'mustard')]:
        out.append(circle(x, y, 17, 'none', True, f' stroke="{C[col]}" stroke-width="3.2"'))
        out.append(path(f'M{x - 8} {y + 5}L{x - 2} {y - 6}L{x + 3} {y + 1}L{x + 6} {y - 3}L{x + 10} {y + 5}', 'none', True, f' stroke="{C[col]}" stroke-width="2.4"'))
    # chalk bag, coiled strap, plant
    out += chalk_bag(660, 336, 0.82)
    out.append(path('M744 334C744 300 816 300 816 334Z', C['mustard']))
    out.append(path('M756 334C756 312 804 312 804 334', 'none'))
    out.append(path('M768 334C768 322 792 322 792 334', 'none'))
    out.append(path('M1000 336L994 296L1062 296L1056 336Z', C['bark']))
    out.append(rect(990, 286, 76, 14, C['fawnshade'], 4))
    for d in ['M1028 288C1012 254 988 250 982 242C1004 238 1024 254 1028 288Z', 'M1028 288C1036 246 1060 232 1072 232C1068 256 1046 272 1028 288Z',
              'M1028 288C1024 250 1030 226 1036 212C1048 232 1042 264 1028 288Z']:
        out.append(path(d, C['forest']))
    return svg('A climber pegboard and shelf: a pinned map, postcards of walls, hanging shoes and a stamped passport', out)


def main():
    out_dir = os.path.join(ROOT, 'assets', 'art')
    os.makedirs(out_dir, exist_ok=True)
    for name, fn in (('regions-wall', regions_wall), ('log-still-life', log_still_life), ('me-shelf', me_shelf)):
        data = fn()
        with open(os.path.join(out_dir, name + '.svg'), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(data)
        print(name, len(data.encode('utf-8')), 'bytes')


if __name__ == '__main__':
    main()
