# Owner manual checks: USA Mid-Atlantic + New England (2026-10-06-us-northeast)

These gyms were researched but deferred by the "keep low-confidence gyms out" rule. Each has one question; none is in the staged batch. Answering a question turns it into a follow-up section (never an edit of this one).

1. **BrattCave Bouldering Gym**, Brattleboro, VT (candidate `brattcave-brattleboro`)
   - URL: http://brattcavebouldering.com/
   - Question: Is BrattCave open again after the ownership change (the site said closed 5-6 Oct 2026 "in the process of Changing hands")?
   - Findings: Own site describes a bouldering-only community gym in the Cotton Mill building (74 Cotton Mill Hill, Suite A-252) with an October 2026 calendar, but a notice says it is closed Mon Oct 5 and Tue Oct 6 because of a "temporary bump in the process of Changing hands". Bouldering is clear; current operation is not. The Nominatim address returns two nodes 80 m apart, so the pin also needs a look.

2. **City Climb Gym**, New Haven, CT (candidate `city-climb-new-haven`)
   - URL: https://www.cityclimbgym.com/
   - Question: Does City Climb have a real bouldering area (walls, problems), or only a few low walls next to the rope walls?
   - Findings: Own site is clearly open (hours Mon-Fri 2-10pm, Sat-Sun 10am-8pm, classes, camps, 342 Winchester Ave). The only bouldering text is the FAQ line that new climbers without a reservation can "come in an boulder (shorter climbs without ropes)"; no bouldering area, wall height or problem count is given. OSM places the gym on Gibbs Street, 350 m from the pin on the gym's own map.

3. **Diamond Rock Gym**, East Hanover, NJ (candidate `diamond-rock-gym-east-hanover`)
   - URL: https://www.diamondrockgym.com/climbing-options
   - Question: Is Diamond Rock Gym open to the public for drop-in climbing, or really by appointment only?
   - Findings: Own site: 3,000 sq ft of rope walls (25-33 ft) inside Diamond City Sports plus "a bouldering area ... between 12-15 boulder problems VB-V4", but the climbing-options page says "ALL CLIMBING IS BY APPOINTMENT ONLY. Please call ahead (973-560-0413)". No hours or day-pass page found.

4. **First Ascent Station Square**, Pittsburgh, PA (candidate `fa-climbing-station-square`)
   - URL: http://faclimbing.com/pittsburgh
   - Question: Is First Ascent (FA Climbing) Station Square open, and does it have a bouldering area? (the official site could not be read)
   - Findings: Official page (faclimbing.com/pittsburgh/station-square) returns HTTP 403 to plain requests and to the fetch tool, so no primary text was read. A directory lists it at 195 W Station Square Dr; OSM has an element at 125 West Station Square Drive carrying that URL. No claim about open status or bouldering is made.

5. **GOAT Climbing Gym**, Hackensack, NJ (candidate `goat-hackensack`)
   - URL: https://goatclimbinggym.com/
   - Question: Does GOAT Climbing Gym have a bouldering area?
   - Findings: Own home page (read through the fetch tool; plain requests get a bot check) gives 77 River Street, hours Mon-Fri 10am-10pm, Sat 10am-8pm, Sun 10am-6pm and describes "roped climbing options on state-of-the-art walls ranging from 25-60 ft"; no bouldering is mentioned on the page read. Other pages were not checked.

6. **The Gravity Vault Radnor**, Radnor, PA (candidate `gv-radnor`)
   - URL: https://gravityvault.com/locations/radnor-pa
   - Question: Does Gravity Vault Radnor have a bouldering area, or only a MoonBoard?
   - Findings: Official page lists "100+ Rope Stations (78 Top-Rope Stations)", lead areas, rappel tower, auto-belays and, under bouldering, only "Bouldering (Moon Board)" (a training board); no square footage or problem count. The other ten Gravity Vault gyms in this section state their bouldering area. Two OSM positions for 175 King of Prussia Rd differ by 510 m (gym node vs address polygon).

7. **Triangle Rock Club Richmond**, Richmond, VA (candidate `triangle-rock-club-richmond`)
   - URL: http://www.trianglerockclub.com/richmond
   - Question: Is Triangle Rock Club Richmond still open, and does it have a bouldering area?
   - Findings: The gym page (trianglerockclub.com/richmond) returns 404 to the fetch tool and 403 to plain requests; the indoorclimbinggym.com directory still lists 4700 Thalbro St and OSM has a gym element there. No primary source could be read for open status or bouldering.

8. **Vertical Dreams (Manchester; also Nashua, 25 E. Otterson St)**, Manchester, NH (candidate `vertical-dreams-manchester`)
   - URL: https://verticaldreams.com/
   - Question: Are Vertical Dreams Manchester and Nashua still open (the site shows "Copyright 2017" and no 2026 content)?
   - Findings: Own site says "New Hampshire's tallest climbing wall with top roping, lead climbing, bouldering" and lists hours (Mon-Fri 3-9pm, Sat 11-8, Sun 11-7) at 250 Commercial St, 5th floor of the Waumbec Mill, but the footer is 2017, the Nashua page redirects into an "oldwebsitearchive" path and no dated content was found. Bouldering extent not stated. Nashua has no candidate record (no coordinate source).

9. **Warehouse ROCKS Climbing and Fitness**, Abbottstown, PA (candidate `warehouse-rocks-abbottstown`)
   - URL: https://warehouserockspa.com/
   - Question: Is Warehouse ROCKS still operating (no dated 2026 content on its site)?
   - Findings: Own site has a detailed About page (80-100 bouldering routes, 14 ft walls, 100-120 roped routes, Kilter Board), hours (Mon-Fri 5-9pm, Sat 12-9pm, Sun 12-3pm) and 301 Pleasant Street, but the footer reads "Copyright 2021" and no 2026 event, news or price date was found. The indoorclimbinggym.com directory lists it, which is not enough for open status.

## Researched leads with no candidate record

No coordinate source, or no bouldering evidence on the pages read, so no candidate was written:

- GraniteWorks Gym, Keene, NH, 310 Marlboro St (https://www.graniteworksgym.com/): site is JavaScript-only and returned nothing readable. Question: does it have a bouldering area?
- Stone Age Rock Gym, Manchester, CT, 195 Adams St (https://www.stoneagerockgym.com/): site is open (membership page, top-rope belay lesson) but no bouldering mention found. Question: does it have a bouldering area?
- Indoor Ascent, Dover, NH, Broadway (https://www.indoorascent.com/): tiny site (2026 climbing camp post) with no address, hours or bouldering text read. Question: open to the public, and is there bouldering?
- The Goat Fort, Warren, PA, 20 Clark St Suite C (http://www.goatfort.com/): site returned an empty page. Question: open, and is there bouldering?
- Climb Nittany, Boalsburg, PA, 328 Discovery Dr (https://climbnittany.com/): site shows "Keystone member exclusive access" re-opening text with no dated 2026 content. Question: currently open to the public, and is there bouldering?
- Spray Rock Climbing Performance Center (Alliance Fitness Center), Reading, PA, 1 Meridian Blvd (https://www.alliancefitnesscenter.com/climbing-performance/): private training space with spray wall and boulder problems. Question: public drop-in or members/appointment only?
- Kinetic Climbing, Williamstown, NJ, 1155 S Black Horse Pike (https://www.kineticclimbingnj.com/): site loads only a header; no hours or bouldering text read. Question: open, and is there bouldering?
- High Exposure Rock Climbing, Northvale, NJ, 266 Union St: no official website was found (the OSM element has no website tag and guessed domains did not load). Question: open, and is there bouldering?
- Virginia Beach Rock Gym, 5049 Southern Blvd (https://virginiabeachrockgym.com/): site read, no bouldering text found. Question: does it have a bouldering area?
- Wilkes-Barre Indoor Rock Climbing (OSM node 6103589414, South Main Street): no working official site found. Question: open, and is there bouldering?

## Follow-up 2026-11-11 (public-source verification)

Method: checked by Claude (AI) on public sources; ChatGPT leads re-verified; nothing written to production. No row was settled by a later commit or review file (only the section commit itself mentions these gyms), so none is ALREADY RESOLVED unless stated.

- **BrattCave Bouldering Gym, Brattleboro VT**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Gym's own site shows it staffed with public hours (Mon-Wed 6-9 pm, Sat 11-2) and a notice 'Tuesday, 11/10 slight delayed opening: 630-9pm public hours', plus 'prices will be changing soon due to ownership changeover', so it is open again under the new owner. The name and listing mark it as a bouldering gym; the fetched page text did not quote bouldering, so confidence M. The two-node pin question is separate and needs map inspection (NEEDS HUMAN). Sources: http://brattcavebouldering.com/ (checked 2026-11-11). Next: stage; owner picks the correct pin of the two nodes.
- **City Climb Gym, New Haven CT**: STATUS: OPEN (confidence L). Gym's own site shows hours and a 'closed 9/26 for inclement weather' notice (so it is operating) but describes only climbing courses; no bouldering area or boulder text on the pages read. Pin offset (OSM place 350 m away) still needs map inspection. Sources: https://www.cityclimbgym.com/ (checked 2026-11-11). Next: ask the gym (203-891-7627); pin is NEEDS HUMAN.
- **Diamond Rock Gym, East Hanover NJ**: STATUS: RESOLVED: keep out (confidence M). Gym's own page says 'ALL CLIMBING IS BY APPOINTMENT ONLY' (call 973-560-0413) and lists only auto-belay passes and instructor-led sessions, with no bouldering mention. Not open for drop-in. Sources: https://www.diamondrockgym.com/climbing-options (checked 2026-11-11). Next: none unless it later offers drop-in bouldering.
- **First Ascent Station Square, Pittsburgh**: STATUS: OPEN (confidence L). faclimbing.com/pittsburgh returned HTTP 403 to this tool; not verified. Sources: http://faclimbing.com/pittsburgh (checked 2026-11-11). Next: owner opens in a browser.
- **GOAT Climbing Gym, Hackensack NJ**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Gym's own site (page dated 2026-11-02) lists Bouldering Classes and weekly hours (Mon-Fri 10-10, Sat 10-8, Sun 10-6) alongside 25-60 ft roped walls. A bouldering area is not described in detail, hence M. Reconcile first: a record with this name may already exist. Sources: https://goatclimbinggym.com/ (checked 2026-11-11). Next: stage after reconcile; check for an existing GOAT record.
- **The Gravity Vault Radnor, PA**: STATUS: OPEN (confidence M). Gym's own page lists address 175 King of Prussia Rd, hours, and a single 'Bouldering (Moon Board)' item in its feature list; no dedicated boulder area is described. Two OSM positions 510 m apart still need map inspection. Sources: https://gravityvault.com/locations/radnor-pa (checked 2026-11-11). Next: ask the gym whether there are boulder problems beyond the MoonBoard; pin is NEEDS HUMAN.
- **Triangle Rock Club Richmond, VA**: STATUS: OPEN (confidence L). trianglerockclub.com/richmond returned HTTP 404 to this tool; not verified. Sources: http://www.trianglerockclub.com/richmond (checked 2026-11-11). Next: check the chain's current location list.
- **Vertical Dreams Manchester (and Nashua), NH**: STATUS: OPEN (confidence M). Gym's Manchester page (250 Commercial St) says it offers 'top roping, lead climbing, bouldering, and routes for all abilities' and phone (603) 625-6919, but shows no hours or dates; Nashua is not mentioned on the page. Site footer was 2017. Sources: https://verticaldreams.com/ (checked 2026-11-11). Next: check /rates-hours/ or phone; Nashua unknown.
- **Warehouse ROCKS Climbing and Fitness, Abbottstown PA**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Gym's own site shows 'open today 5:00 pm to 9:00 pm' (live) and describes top roping and bouldering. No dated 2026 post was read, but the live hours show it operating. Sources: https://warehouserockspa.com/ (checked 2026-11-11). Next: stage through the import pipeline.
- **GraniteWorks Gym, Keene NH**: STATUS: OPEN (confidence L). Fetch failed (socket hang up); not verified. Sources: https://www.graniteworksgym.com/ (checked 2026-11-11). Next: retry or open in a browser.
- **Stone Age Rock Gym, Manchester CT**: STATUS: OPEN (confidence L). Home page read had only navigation (Indoor and Outside climbing pages); no bouldering text, hours or dates. Sources: https://www.stoneagerockgym.com/ (checked 2026-11-11). Next: read /indoor.html and /contact.html.
- **Indoor Ascent, Dover NH**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Gym's own site describes a 'massive bouldering room' with a new 45-degree wall over 15 ft overhangs, sells day passes, punch passes and memberships, and lists weekly hours. A price-change note ('as of May 1st') has no year, hence M. Sources: https://www.indoorascent.com/ (checked 2026-11-11). Next: stage through the import pipeline.
- **The Goat Fort, Warren PA**: STATUS: OPEN (confidence L). Fetch returned no usable page content; not verified. Sources: http://www.goatfort.com/ (checked 2026-11-11). Next: owner opens in a browser.
- **Climb Nittany, Boalsburg PA**: STATUS: RESOLVED: eligible, accept through the import pipeline (confidence M). Gym's own site sells public day passes ($20 individual) and lists bouldering among its terrain, with Mon closed and Tue-Sun public hours (Members Only blocks noted). No dated notice read, so M. Sources: https://climbnittany.com/ (checked 2026-11-11). Next: stage through the import pipeline.
- **Spray Rock Climbing Performance Center (Alliance Fitness), Reading PA**: STATUS: RESOLVED: keep out (confidence M). Gym's own page says 'Membership is limited to coaching lessons, training consultations and assessments' and describes boulder problems on a Grasshopper LED wall and spray wall, but no general public drop-in; the only drop-in is a $35 early-morning 'Climbing + Gym Access' promotion with a 15-person limit. Treat as members/coaching only. Sources: https://www.alliancefitnesscenter.com/climbing-performance/ (checked 2026-11-11). Next: revisit if it advertises public day passes.
- **Kinetic Climbing, Williamstown NJ**: STATUS: OPEN (confidence L). Gym's home page describes routes and walls but not bouldering; hours are on another page. Sources: https://www.kineticclimbingnj.com/ (checked 2026-11-11). Next: read /contact--hours.html.
- **High Exposure Rock Climbing, Northvale NJ**: STATUS: OPEN (confidence L). No gym-controlled page read. Third-party listings (News 12, Wellhub, Daily Voice) put it at 266 Union St, Northvale, with 17 top ropes and steep bouldering, but one article says the climbing area was closed for repairs (undated). Sources: https://newjersey.news12.com/road-trip-high-exposure-climbing-gym-is-perfect-indoor-spot-for-those-craving-outdoor-activities ; https://wellhub.com/en-us/search/partners/high-exposure-rock-climbing-ninja-warrior-parkour (checked 2026-11-11). Next: phone 201-768-8600 to confirm the climbing area is open.
- **Virginia Beach Rock Gym, VA**: STATUS: OPEN (confidence L). WARNING: virginiabeachrockgym.com now serves an online-casino/betting page, so the domain appears hijacked and is not a gym source. No other source read; status unknown. Sources: https://virginiabeachrockgym.com/ (checked 2026-11-11). Next: find the gym's Facebook/Instagram; do not link this domain.
- **Wilkes-Barre Indoor Rock Climbing, PA**: STATUS: OPEN (confidence L). Not researched in this pass (no working site; OSM node only). Sources: - (checked 2026-11-11). Next: find an operator page or social.
