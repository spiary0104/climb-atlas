"""Static BOULDEER seal (assets/brand/seal.svg, seal-mono.svg): the same geometry as js/modules/brand.js sealSvg, with
"BOULDEER" as outlined Fraunces 72pt SuperSoft SemiBold glyphs (SIL OFL) laid on the arc, so the files need no fonts.
For marketing, the native app and share-card rendering outside the browser.

Dev-time design tool (not part of the app; needs Python 3 + fontTools: pip install --user fonttools).
Usage: python design/tools/build_seal.py   (downloads the Fraunces instance from Google Fonts into a temp folder once)
Keep SIZE/TRACK/R in step with brand.js (R = 41.5: the baseline sits centred between the rings).
"""
import math, os, re, tempfile, urllib.request
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
FONT = os.path.join(tempfile.gettempdir(), 'bouldeer-fraunces-72-600-soft100.ttf')
if not os.path.exists(FONT):
    css = urllib.request.urlopen('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@72,600,100').read().decode()
    urllib.request.urlretrieve(re.search(r'https://fonts\.gstatic\.com/[^)]+', css).group(0), FONT)
font = TTFont(FONT)
gs = font.getGlyphSet(); cmap = font.getBestCmap(); upem = font['head'].unitsPerEm; hmtx = font['hmtx']
SIZE, TRACK, R, CX, CY = 13.0, 2.6, 41.5, 60.0, 60.0
k = SIZE / upem
text = 'BOULDEER'
advs = [hmtx[cmap[ord(ch)]][0] * k for ch in text]
total = sum(advs) + TRACK * (len(text) - 1)
arc = math.pi * R
s = arc / 2 - total / 2
glyphs = []
for ch, adv in zip(text, advs):
    mid = s + adv / 2
    th = math.pi + mid / R                      # the path runs from (14,60) over the top to (106,60)
    x, y = CX + R * math.cos(th), CY + R * math.sin(th)
    rot = math.degrees(th) + 90
    pen = SVGPathPen(gs); gs[cmap[ord(ch)]].draw(pen)
    glyphs.append('<path transform="translate(%.3f %.3f) rotate(%.3f) translate(%.3f 0) scale(%.6f %.6f)" d="%s"/>'
                  % (x, y, rot, -adv / 2, k, -k, pen.getCommands()))
    s += adv + TRACK

CREST = ('<path d="M47 58 C40 50 30 42 23 32 C19 25 17 18 17 8"/><path d="M25 35 C19 32 12 29 7 22"/><path d="M29 40 C31 32 33 26 33 17"/>'
         '<path d="M53 58 C60 50 70 42 77 32 C81 25 83 18 83 8"/><path d="M75 35 C81 32 88 29 93 22"/><path d="M71 40 C69 32 67 26 67 17"/>')

def inner(path):
    src = open(path, encoding='utf-8').read()
    body = re.sub(r'<!--[\s\S]*?-->', '', src)
    return re.sub(r'^\s*<svg[^>]*>|</svg>\s*$', '', body.strip()).strip()

head = inner(os.path.join(ROOT, 'assets', 'mascot', 'head.svg'))
stamp = inner(os.path.join(ROOT, 'assets', 'mascot', 'stamp-head.svg'))

def seal(mono):
    ink = '#2F4B39' if mono else '#22312A'
    disc = 'fill="none" stroke="%s"' % ink if mono else 'fill="#F9EEDB" stroke="#171B16"'
    ring = 'fill="none" stroke="%s"' % ink if mono else 'fill="#FFFCF4" stroke="#EBC596"'
    crest = ink if mono else '#754D33'
    art = ('<g color="#2F4B39" transform="translate(30 36) scale(%.6f) translate(-212 -44)">%s</g>' % (60 / 610, stamp)) if mono else \
          ('<g clip-path="url(#sealClip)"><g transform="translate(28 27) scale(%.6f) translate(-212 -44)">%s</g></g>' % (64 / 610, head))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Bouldeer seal">\n'
            '<!-- The BOULDEER seal (docs/DESIGN.md sec. 1A), %s version: geometry of js/modules/brand.js sealSvg, the lettering as\n'
            '     outlined Fraunces 72pt SuperSoft SemiBold (SIL Open Font License), the head traced from design/mascot/deer.\n'
            '     Generated file: regenerate rather than hand-edit. In the app the seal is inline SVG with live text (brand.js). -->\n'
            '<defs><clipPath id="sealClip"><circle cx="60" cy="60" r="35"/></clipPath></defs>\n'
            '<circle cx="60" cy="60" r="57" %s stroke-width="3"/>\n<circle cx="60" cy="60" r="36" %s stroke-width="2"/>\n'
            '<g fill="%s">%s</g>\n'
            '<g fill="none" stroke="%s" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="translate(49 99) scale(0.22)">%s</g>\n'
            '%s\n</svg>\n') % ('mono' if mono else 'colour', disc, ring, ink, ''.join(glyphs), crest, CREST, art)

for name, mono in (('seal.svg', False), ('seal-mono.svg', True)):
    out = seal(mono)
    open(os.path.join(ROOT, 'assets', 'brand', name), 'w', encoding='utf-8').write(out)
    print(name, len(out), 'bytes')
