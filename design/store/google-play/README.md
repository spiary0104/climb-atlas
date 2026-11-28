# Google Play listing images (not part of the app)

Made 2026-11-28 from the live site and the site's own tokens, fonts and artwork. Nothing here is served by the app.

| File | Size | What |
|---|---|---|
| `feature-graphic.png` | 1024 x 500 | Store banner: head lockup, tagline, the Regions wall art and the backpacker deer |
| `feature-graphic.html` | | Source of the banner (edit this, then re-render) |
| `phone-01-explore.png` | 1080 x 1920 | Explore, Tokyo (14:00 local, so gyms show Open) |
| `phone-02-gym.png` | 1080 x 1920 | Gym page: The Climbing Hangar Liverpool (day pass, hours, website) |
| `phone-03-regions.png` | 1080 x 1920 | Regions: 3,644 gyms in 84 countries |
| `phone-04-search.png` | 1080 x 1920 | Search in local script: 東京 finds Tokyo and its gyms |
| `phone-05-dark-map.png` | 1080 x 1920 | The optional dark map, Sydney |

The 512 x 512 store icon is `icons/icon-512.png`. Check the current size and format rules in Play Console when uploading.

## Re-making them
- **Screenshots:** a 360 x 640 viewport at device scale 3, mobile + touch, locale en-GB, with the browser clock set to
  14:00 in the city shown (otherwise opening hours read Closed at night), intro card dismissed. Taken with Playwright.
- **Banner:** serve the repo (`python -m http.server 8000`), open
  `http://localhost:8000/design/store/google-play/feature-graphic.html` at 1024 x 500 and screenshot `#graphic`.
- Gym counts in the images are as of 2026-11-28; re-take before a release if they have moved a lot.
