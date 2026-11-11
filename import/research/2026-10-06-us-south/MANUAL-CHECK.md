# Manual checks: USA South (2026-10-06-us-south)

Low-confidence gyms kept out of the batch (deferred). Each has one question for the owner. Nothing here was imported.

## 1. ROX Climbing Gym (Lake Nona Performance Club) (Orlando, FL)
- URL: https://lakenonaperformanceclub.com/program/rox-climbing-gym/
- Question: Can a non-member buy a day pass for ROX Climbing Gym at Lake Nona Performance Club?
- Findings: Hours and bouldering confirmed on the ROX page (2026-10-06); public access not stated.
- Candidate id: fl-rox-orlando

## 2. Cornerstone Rock Gym (Glen St. Mary, FL)
- URL: https://cornerstonerockgym.com/
- Question: Does Cornerstone Rock Gym have a dedicated bouldering area?
- Findings: Open (hours listed); only visitor testimonials on the home page mention bouldering routes.
- Candidate id: fl-cornerstone-rock-gym

## 3. On The Edge Rock Climbing Gym (Melbourne, FL)
- URL: https://ontheedgerockclimbing.com/
- Question: Does On The Edge Rock Climbing Gym (Melbourne, FL) have a bouldering area?
- Findings: Open with posted hours; no bouldering mention found on the site.
- Candidate id: fl-on-the-edge-melbourne

## 4. FirstHand Climbing (Winston-Salem, NC)
- URL: https://www.firsthandclimbing.com/
- Question: Is FirstHand Climbing (formerly Rock Box Bouldering) in Winston-Salem open today?
- Findings: firsthandclimbing.com lists hours but has a 2022 footer; rockboxbouldering.com still online; a directory shows Rock Box as closed.
- Candidate id: nc-firsthand-climbing

## 5. Rose Rock Climbing (Norman, OK)
- URL: https://www.roserockclimbing.com/
- Question: Place the pin for Rose Rock Climbing (2701 Washington Dr, Norman OK) on the building.
- Findings: Open with hours; bouldering, top rope and lead confirmed on its own site; current pin is only the street (Nominatim has no house number there).
- Candidate id: ok-rose-rock-climbing

## 6. eNeRGy Rock Gym (Charleston, WV)
- URL: https://energyrockgym.com/
- Question: Is eNeRGy Rock Gym (Charleston WV) open, and what are its hours and address?
- Findings: Site title/description say it is a bouldering gym in Charleston, WV; the page body needs a browser to read.
- Candidate id: wv-energy-rock-gym

## 7. The Silos Climbing, Yoga and Fitness (Oklahoma City, OK)
- URL: http://stoneyardclimbing.com/
- Question: Is The Silos climbing gym (200 SE 4th St, Oklahoma City, formerly Summit/Stoneyard) still open?
- Findings: Directory lists hours; stoneyardclimbing.com/the-silos returns 404 and the sister gym in Norman changed owners in 2026.
- Candidate id: ok-the-silos-climbing


## Follow-up 2026-11-11 (public-source verification)

Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified; nothing written to production. No row was settled by a later commit or review file (only the section commit itself mentions these gyms), so none is ALREADY RESOLVED unless stated.

- **ROX Climbing Gym (Lake Nona Performance Club), Orlando**: STATUS: OPEN (confidence M). Club's ROX page offers 'expansive bouldering terrain' and paid non-member classes (e.g. $15 Intro to Climbing Movement) but does not say whether non-members can buy a day pass or list day-pass prices. Phone (407) 216-5672. Sources: https://lakenonaperformanceclub.com/program/rox-climbing-gym/ (checked 2026-11-11). Next: phone the club; keep out until a day pass for non-members is shown.
- **Cornerstone Rock Gym, Glen St. Mary FL**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Gym's own site lists bouldering as one of its climbing options within 6,000+ sq ft and gives weekly hours (Wed closed); no dated notice, no separate boulder area described, hence M. Sources: https://cornerstonerockgym.com/ (checked 2026-11-11). Next: stage through the import pipeline.
- **On The Edge Rock Climbing Gym, Melbourne FL**: STATUS: OPEN (confidence L). Gym's site gives weekly hours but does not mention bouldering. Phone 321.724.8775. Sources: https://ontheedgerockclimbing.com/ (checked 2026-11-11). Next: ask the gym.
- **FirstHand Climbing (ex Rock Box Bouldering), Winston-Salem NC**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Gym's own site says 'We are a bouldering gym, meaning there are no ropes or harnesses involved' and lists weekly hours plus member-only blocks. The directory note about Rock Box being closed matches the rename; the site footer was 2022 and the page has no dated notice, so confirm open status by phone (336-747-3104) if desired. Sources: https://www.firsthandclimbing.com/ (checked 2026-11-11). Next: stage; reconcile with any existing Rock Box record to avoid a duplicate.
- **Rose Rock Climbing, Norman OK**: STATUS: NEEDS HUMAN (confidence H). Operator's site confirms bouldering (indoor bouldering wall, top rope, lead) and hours (Mon-Fri 11-10, Sat 10-10, Sun 10-8) but gives no street address or entrance; the building pin needs map inspection. Sources: https://www.roserockclimbing.com/ (checked 2026-11-11). Next: owner drops the pin at 2701 Washington Dr.
- **eNeRGy Rock Gym, Charleston WV**: STATUS: OPEN (confidence L). Operator's page read shows only the name and 'Charleston, WV 25302'; no hours, address or bouldering text. Sources: https://energyrockgym.com/ (checked 2026-11-11). Next: read the full site or social.
- **The Silos Climbing, Yoga and Fitness, Oklahoma City**: STATUS: OPEN (confidence L). stoneyardclimbing.com lists only 'The Silos' in its navigation with no details and a separate Norman location; no information on 200 SE 4th St, hours or status. Sources: http://stoneyardclimbing.com/ (checked 2026-11-11). Next: find the Silos' own site or social.
