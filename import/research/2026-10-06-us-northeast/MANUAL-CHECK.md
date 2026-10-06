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
