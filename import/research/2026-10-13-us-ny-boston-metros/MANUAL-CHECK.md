# Owner manual checks: USA New York and Boston metros (2026-10-13-us-ny-boston-metros)

Deferred by the "keep low-confidence gyms out" rule. None is in the staged batch. Answering a question turns it into a follow-up section (never an edit of this one).

1. **La Vida Rock Gym (Gordon College)**, Wenham, MA (candidate `la-vida-wenham`)
   - URL: https://www.gordon.edu/lavida/rock-gym
   - Question: Is the Open Gym (public day pass, Mon-Thu 6-9 pm) running this term, and which building on the Gordon campus holds the rock gym (La Vida Center)?
   - Findings: Page lists public Open Gym, boulder problems V0-V6 and copyright 2026, but the only coordinate is campus-level (precision area) and a search snippet described Open Gym as "temporarily closed" in a summer notice.

2. **Everyday Athlete**, 130 Clinton Street, Brooklyn Heights, NY (candidate `everyday-athlete-brooklyn-heights`)
   - URL: https://everydayathlete.com/
   - Question: Does Everyday Athlete still run adult drop-in "open climb" with bouldering (not just roped/kids programs)?
   - Findings: 2017-2019 news describes a 2,500 sq ft climbing wall (tallest in Brooklyn) and drop-in open climbs ($25); its site returns HTTP 403 to automated fetches, so nothing current was read.

3. **Beta Climbing & Fitness**, 45 Harbor Drive, Stamford, CT (no candidate record: no pin source)
   - URL: none found (directory listing only)
   - Question: Does it exist and is it open to day-pass climbers? A directory says "membership required, not open access".
   - Findings: Only a community-resource directory and a climbing directory list it (rock wall, bouldering wall, training, yoga; phone 203-580-9963).

4. **Hapik Yonkers** (Ridge Hill, Yonkers, NY; no candidate record: no pin source)
   - URL: https://www.hapik.com/ (could not be fetched)
   - Question: Does this family auto-belay "fun climbing" centre have a real bouldering area? The indoorclimbinggym.com directory tags it "bouldering" and "lead", but describes 150+ auto-belay routes.
   - Findings: Directory only; the gym's own site could not be fetched.

## Follow-up 2026-11-11 (public-source verification)

Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified; nothing written to production. No row was settled by a later commit or review file (only the section commit itself mentions these gyms), so none is ALREADY RESOLVED unless stated.

- **La Vida Rock Gym (Gordon College), Wenham MA**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence H). Gordon's own page says 'Open Gym currently runs Monday through Thursday from 6-9 p.m., and ages 3 through adult can boulder and climb', open to the general public (day pass $18, no reservation), at La Vida Center, 255 Grapevine Road, Wenham MA 01984. The page gives no term dates; phone 978-867-4111 can confirm this term. Sources: https://www.gordon.edu/lavida/rock-gym (checked 2026-11-11). Next: stage through the import pipeline.
- **Everyday Athlete, Brooklyn Heights**: STATUS: OPEN (confidence L). everydayathlete.com returned HTTP 403. A MapQuest listing shows 130 Clinton St as closed and directories describe it as kid-oriented; no adult drop-in evidence. Sources: https://startpage.mapquest.com/us/new-york/everyday-athlete-26840574 (checked 2026-11-11). Next: owner opens the site in a browser; keep out until adult drop-in is shown.
- **Beta Climbing & Fitness, Stamford CT**: STATUS: CONFLICTING (confidence L). Directories list 45 Harbor Drive, Stamford (203-580-9963) and an old Groupon with 20,000 sq ft of terrain, but an Airbnb listing shows it permanently closed; no official site or news found. Conflicting third-party signals only. Sources: https://99boulders.com/connecticut-climbing-gyms ; https://www.airbnb.com/things-to-do/places/12710122 (checked 2026-11-11). Next: phone 203-580-9963; keep out until confirmed.
- **Hapik Yonkers, Yonkers NY**: STATUS: OPEN (confidence L). hapik.com failed with a certificate error; not verified. Sources: https://www.hapik.com/ (checked 2026-11-11). Next: owner opens in a browser.
