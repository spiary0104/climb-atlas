// Boulder Atlas seed data — the starting dataset of climbing spots.
// This is exposed as a global so app.js can read it without a bundler/module step.
// Add/rearrange entries here directly; app.js never needs to change for data edits.

  const IB = 'indoor-bouldering', OB = 'outdoor-bouldering', TR = 'top-rope';

  window.SEED_GYMS = [
    // --- NSW / Sydney ---
    {name:"9 Degrees Alexandria", suburb:"Alexandria", state:"NSW", lat:-33.9042, lng:151.1968, types:[IB]},
    {name:"9 Degrees Lane Cove", suburb:"Lane Cove West", state:"NSW", lat:-33.8138, lng:151.1667, types:[IB]},
    {name:"9 Degrees Parramatta", suburb:"Rydalmere", state:"NSW", lat:-33.8153, lng:151.0270, types:[IB]},
    {name:"9 Degrees Waterloo", suburb:"Waterloo", state:"NSW", lat:-33.8994, lng:151.2094, types:[IB]},
    {name:"NOMAD Bouldering", suburb:"Annandale", state:"NSW", lat:-33.8853, lng:151.1706, types:[IB]},
    {name:"NOMAD Bouldering Gladesville", suburb:"Gladesville", state:"NSW", lat:-33.8332, lng:151.1276, types:[IB]},
    {name:"Sydney Indoor Climbing Gym – St Peters", suburb:"St Peters", state:"NSW", lat:-33.9098, lng:151.1804, types:[IB,TR]},
    {name:"Elevate Climbing Villawood", suburb:"Villawood", state:"NSW", lat:-33.8823, lng:150.9757, types:[IB,TR], notes:"Formerly Sydney Indoor Climbing Gym Villawood — one of the largest lead/top-rope venues in the country."},
    {name:"Climb Fit St Leonards", suburb:"St Leonards", state:"NSW", lat:-33.8230, lng:151.1953, types:[IB,TR]},
    {name:"Climb Fit Macquarie", suburb:"Macquarie Park", state:"NSW", lat:-33.7739, lng:151.1224, types:[IB,TR], notes:"Top rope + bouldering, but no lead routes."},
    {name:"Climb Fit Kirrawee", suburb:"Kirrawee", state:"NSW", lat:-34.0333, lng:151.0833, types:[IB,TR]},
    {name:"The Ledge Climbing Centre", suburb:"Camperdown", state:"NSW", lat:-33.8886, lng:151.1786, notes:"Sydney Uni's climbing club gym — top rope + bouldering, no lead.", types:[IB,TR]},
    {name:"The Edge Rock Climbing Centre", suburb:"Castle Hill", state:"NSW", lat:-33.7315, lng:150.9885, types:[IB,TR]},
    {name:"The Climbing Centre", suburb:"Penrith", state:"NSW", lat:-33.7530, lng:150.6890, types:[TR], notes:"Top rope only — no bouldering wall, no lead."},
    {name:"BlocHaus Marrickville", suburb:"Marrickville", state:"NSW", lat:-33.9111, lng:151.1547, types:[IB]},
    {name:"BlocHaus Leichhardt", suburb:"Leichhardt", state:"NSW", lat:-33.8834, lng:151.1567, types:[IB]},
    {name:"Beta One Bouldering Gym", suburb:"South Granville", state:"NSW", lat:-33.8391, lng:151.0090, types:[IB]},
    {name:"Climbing Collective", suburb:"Jamisontown", state:"NSW", lat:-33.7580, lng:150.6950, types:[IB]},
    {name:"1UP Bouldering", suburb:"Chullora", state:"NSW", lat:-33.8927, lng:151.0447, types:[IB]},
    {name:"Northern Beaches Rockhouse", suburb:"Brookvale", state:"NSW", lat:-33.7677, lng:151.2688, types:[IB,TR]},
    {name:"Skywood Climbing", suburb:"Freshwater", state:"NSW", lat:-33.7833, lng:151.2883, types:[IB]},
    {name:"Hangdog Climbing Gym", suburb:"Coniston", state:"NSW", lat:-34.4300, lng:150.8850, types:[IB], notes:"Unverified this pass — flag if the type mix is off."},
    {name:"Camp Street Climbing", suburb:"Katoomba", state:"NSW", lat:-33.7139, lng:150.3111, types:[IB], notes:"Unverified this pass — flag if the type mix is off."},
    {name:"Pulse Climbing", suburb:"Warners Bay", state:"NSW", lat:-32.9686, lng:151.6372, types:[IB], notes:"Unverified this pass — flag if the type mix is off."},
    {name:"Albury Indoor Rock Climbing", suburb:"Albury", state:"NSW", lat:-36.0737, lng:146.9135, types:[IB], notes:"Unverified this pass — flag if the type mix is off."},

    // --- ACT ---
    {name:"Mountain Strong", suburb:"Fyshwick", state:"ACT", lat:-35.3336, lng:149.1642, types:[IB]},
    {name:"BlocHaus Bouldering Canberra", suburb:"Fyshwick", state:"ACT", lat:-35.3340, lng:149.1660, types:[IB]},
    {name:"BlocHaus Bouldering Mitchell", suburb:"Mitchell", state:"ACT", lat:-35.2270, lng:149.1470, types:[IB]},

    // --- VIC / Melbourne ---
    {name:"Hardrock Climbing", suburb:"Melbourne CBD", state:"VIC", lat:-37.8136, lng:144.9631, types:[IB,TR]},
    {name:"Hardrock Climbing Company", suburb:"Nunawading", state:"VIC", lat:-37.8156, lng:145.1789, types:[IB,TR]},
    {name:"BlocHaus Bouldering", suburb:"Port Melbourne", state:"VIC", lat:-37.8397, lng:144.9330, types:[IB]},
    {name:"Bayside Rock Climbing", suburb:"Carrum Downs", state:"VIC", lat:-38.0866, lng:145.1667, types:[IB,TR]},
    {name:"Northside Boulders", suburb:"Brunswick", state:"VIC", lat:-37.7666, lng:144.9599, types:[IB]},
    {name:"Northside Boulders", suburb:"Northcote", state:"VIC", lat:-37.7708, lng:145.0000, types:[IB]},
    {name:"Urban Climb", suburb:"Collingwood", state:"VIC", lat:-37.8033, lng:144.9852, types:[IB,TR]},
    {name:"Urban Climb", suburb:"Blackburn", state:"VIC", lat:-37.8189, lng:145.1544, types:[IB,TR], notes:"$15M flagship — Australia's tallest lead wall at 17m."},
    {name:"Boulder Lab", suburb:"Ferntree Gully", state:"VIC", lat:-37.8817, lng:145.2836, types:[IB]},
    {name:"Gravity Worx", suburb:"Pascoe Vale", state:"VIC", lat:-37.7202, lng:144.9310, types:[IB,TR]},
    {name:"UP Climbing", suburb:"Balaclava", state:"VIC", lat:-37.8676, lng:145.0009, types:[IB]},
    {name:"La Roca Boulders", suburb:"Oakleigh South", state:"VIC", lat:-37.9245, lng:145.0919, types:[IB]},
    {name:"Boulder Project", suburb:"Prahran", state:"VIC", lat:-37.8501, lng:144.9909, types:[IB]},

    // --- QLD ---
    {name:"9 Degrees Bouldering", suburb:"Enoggera", state:"QLD", lat:-27.4167, lng:152.9833, types:[IB]},
    {name:"Urban Climb Milton", suburb:"Milton", state:"QLD", lat:-27.4685, lng:153.0028, types:[IB], notes:"Bouldering-focused — no lead/top-rope here, unlike other Urban Climb sites."},
    {name:"Urban Climb Newstead", suburb:"Newstead", state:"QLD", lat:-27.4523, lng:153.0432, types:[IB,TR]},
    {name:"Urban Climb West End", suburb:"West End", state:"QLD", lat:-27.4823, lng:153.0084, types:[IB,TR]},
    {name:"BOUNCE Hendra", suburb:"Hendra", state:"QLD", lat:-27.4204, lng:153.0592, types:[IB,TR], notes:"Formerly Urban Xtreme — rock climbing is now one zone inside a larger trampoline/ninja park."},
    {name:"Rockit Climbing Gym", suburb:"Warana", state:"QLD", lat:-26.7716, lng:153.1235, types:[IB,TR]},
    {name:"Core Climbing", suburb:"Carrara", state:"QLD", lat:-28.0028, lng:153.3676, types:[IB], notes:"Queensland's largest dedicated bouldering gym."},
    {name:"Bould Move", suburb:"Birtinya", state:"QLD", lat:-26.7847, lng:153.1266, types:[IB]},

    // --- WA / Perth ---
    {name:"Adrenaline Vault", suburb:"Belmont", state:"WA", lat:-31.9581, lng:115.9297, types:[IB,TR], notes:"Largest indoor climbing centre in Perth."},
    {name:"Rockface", suburb:"Northbridge", state:"WA", lat:-31.9459, lng:115.8555, types:[IB,TR]},
    {name:"City Summit", suburb:"Malaga", state:"WA", lat:-31.8628, lng:115.8949, types:[IB]},
    {name:"Portside Boulders", suburb:"O'Connor", state:"WA", lat:-32.0525, lng:115.7883, types:[IB]},
    {name:"Portside Boulders", suburb:"Osborne Park", state:"WA", lat:-31.8945, lng:115.8202, types:[IB]},

    // --- SA / Adelaide ---
    {name:"Adelaide's Bouldering Club (BoulderZone)", suburb:"Thebarton", state:"SA", lat:-34.9186, lng:138.5749, types:[IB]},
    {name:"Beyond Bouldering", suburb:"Kent Town", state:"SA", lat:-34.9195, lng:138.6180, types:[IB]},
    {name:"Beyond Bouldering", suburb:"Keswick", state:"SA", lat:-34.9391, lng:138.5751, types:[IB]},
    {name:"Beyond Bouldering", suburb:"Clovelly Park", state:"SA", lat:-35.0170, lng:138.5658, types:[IB]},
    {name:"Vertical Reality Climbing", suburb:"Holden Hill", state:"SA", lat:-34.8560, lng:138.6583, types:[IB,TR], notes:"Adelaide's only rope-climbing gym."},
    {name:"Southern Boulder", suburb:"Hope Forest", state:"SA", lat:-35.2833, lng:138.6167, types:[IB]},

    // --- Outdoor bouldering / climbing areas ---
    {name:"Mount Arapiles", suburb:"Natimuk", state:"VIC", lat:-36.7444, lng:141.8272, types:[OB], notes:"World-renowned trad climbing, plus overlooked bouldering (Watchtower Faces, Golden Streak)."},
    {name:"The Grampians – Mt Stapylton", suburb:"Grampians National Park", state:"VIC", lat:-37.1500, lng:142.4167, types:[OB], notes:"Often called the best bouldering on earth — hundreds of sandstone problems plus trad/sport routes."},
    {name:"Blue Mountains – Blackheath", suburb:"Blackheath", state:"NSW", lat:-33.6333, lng:150.2833, types:[OB], notes:"Sandstone sport & trad climbing with solid bouldering, ~2hrs from Sydney."},
    {name:"Nowra", suburb:"Nowra", state:"NSW", lat:-34.8809, lng:150.6014, types:[OB], notes:"Primarily sport/trad lead climbing, not bouldering — tagged as outdoor bouldering as a placeholder since this map no longer tracks lead climbing separately. Flag for a better category or removal."},
    {name:"Frog Buttress", suburb:"Mount French", state:"QLD", lat:-28.0167, lng:152.5333, types:[OB], notes:"Primarily trad lead climbing, not bouldering — tagged as outdoor bouldering as a placeholder since this map no longer tracks lead climbing separately. Flag for a better category or removal."},
    {name:"The You Yangs", suburb:"Little River", state:"VIC", lat:-37.9428, lng:144.4145, types:[OB], notes:"Granite regional park close to Melbourne — short face and slab boulders spread across several sectors (Saddle, Turntable, Lower Picnic Ground)."},
    {name:"Mundaring Weir Bouldering", suburb:"Mundaring", state:"WA", lat:-31.9427, lng:116.1311, types:[OB], notes:"Granite bouldering in the Perth hills (Pipelines/Winjan/Trailblazer sectors) — roughly a 45min walk in from the Hardy Rd carpark."},
    {name:"Oatlands", suburb:"Oatlands", state:"TAS", lat:-42.3059, lng:147.3776, types:[OB], notes:"Tasmania's best-developed bouldering venue — solid sandstone roofs and faces, about an hour north of Hobart."},
    {name:"The Enchanted Forest", suburb:"Mount Crawford", state:"SA", lat:-34.5975, lng:138.9983, types:[OB], notes:"SA's largest dedicated bouldering venue, in the Kaiserstuhl Forestry Reserve north of Adelaide. Closes on days of extreme fire danger."},
    {name:"Cooleman Ridge Bouldering", suburb:"Chapman", state:"ACT", lat:-35.3618, lng:149.0342, types:[OB], notes:"Canberra's main bouldering venue — six sectors from beginner-friendly slabs to steep highballs. (Black Mountain, ACT's other well-known boulder field, is currently closed to climbing by Parks ACT — not included here.)"},
    {name:"Girraween National Park", suburb:"Wallangarra", state:"QLD", lat:-28.8515, lng:151.9647, types:[OB], notes:"Granite national park on the QLD/NSW border — mostly slab and face routes, but with genuine bouldering, notably around Castle Rock and Turtle Rock. Climbing is banned on First Pyramid and The Sphinx."},
    {name:"Kurraba Point", suburb:"Kurraba Point", state:"NSW", lat:-33.8458, lng:151.2233, types:[OB], notes:"Sandstone harbourside bouldering in Sydney, part of the wider North Shore bouldering scene (one of roughly 40 North Shore bouldering spots)."},

    // --- US indoor gyms ---
    {name:"Movement Boulder", suburb:"Boulder", state:"CO", country:"US", lat:40.0177, lng:-105.2508, types:[IB,TR]},
    {name:"Movement Baker", suburb:"Denver", state:"CO", country:"US", lat:39.7211, lng:-104.9925, types:[IB,TR]},
    {name:"Bouldering Project Somerville", suburb:"Somerville", state:"MA", country:"US", lat:42.3876, lng:-71.0995, types:[IB,TR], notes:"Formerly Brooklyn Boulders Somerville, rebranded to Bouldering Project."},
    {name:"Brooklyn Boulders Chicago", suburb:"West Loop, Chicago", state:"IL", country:"US", lat:41.8819, lng:-87.6648, types:[IB,TR]},
    {name:"Austin Bouldering Project – Springdale", suburb:"Austin", state:"TX", country:"US", lat:30.2686, lng:-97.7031, types:[IB,TR]},
    {name:"Vertical World Seattle", suburb:"Magnolia, Seattle", state:"WA", country:"US", lat:47.6425, lng:-122.3988, types:[IB,TR], notes:"America's first indoor climbing gym, opened 1987."},
    {name:"Sender One Climbing – LAX", suburb:"Los Angeles", state:"CA", country:"US", lat:33.9447, lng:-118.3859, types:[IB,TR]},
    {name:"Planet Granite San Francisco", suburb:"Presidio, San Francisco", state:"CA", country:"US", lat:37.8014, lng:-122.4668, types:[IB,TR]},
    {name:"The Cliffs at LIC", suburb:"Long Island City", state:"NY", country:"US", lat:40.7503, lng:-73.9425, types:[IB,TR], notes:"One of NYC's largest climbing gyms."},
    {name:"Refuge Climbing & Fitness", suburb:"Las Vegas", state:"NV", country:"US", lat:36.1055, lng:-115.1919, types:[IB], notes:"Unverified this pass — flag if the type mix is off."},

    // --- US outdoor bouldering / climbing areas ---
    {name:"Hueco Tanks – North Mountain", suburb:"El Paso", state:"TX", country:"US", lat:31.9226, lng:-106.0449, types:[OB], notes:"Legendary desert bouldering. North Mountain is self-guided; the rest of the park requires a guided tour."},
    {name:"Buttermilks", suburb:"Bishop", state:"CA", country:"US", lat:37.3182, lng:-118.5871, types:[OB], notes:"World-famous highball granite bouldering in the Eastern Sierra."},
    {name:"Joshua Tree National Park", suburb:"Joshua Tree", state:"CA", country:"US", lat:34.0138, lng:-116.1713, types:[OB], notes:"Famous mostly for short face/crack routes on granite formations, but with real V-graded bouldering scattered through Hidden Valley and beyond."},
    {name:"Kraft Boulders", suburb:"Red Rock Canyon", state:"NV", country:"US", lat:36.1601, lng:-115.4170, types:[OB], notes:"Dedicated sandstone bouldering area 20 minutes from Las Vegas."},
    {name:"Rocktown", suburb:"Pigeon Mountain", state:"GA", country:"US", lat:34.6636, lng:-85.3923, types:[OB], notes:"Sandstone bouldering on the Appalachian Plateau, one of the best in the Southeast."},
    {name:"Little Cottonwood Canyon", suburb:"Sandy", state:"UT", country:"US", lat:40.5943, lng:-111.7337, types:[OB], notes:"Granite bouldering minutes from Salt Lake City."},
    {name:"Horse Pens 40", suburb:"Steele", state:"AL", country:"US", lat:33.9243, lng:-86.2802, types:[OB], notes:"Privately run sandstone bouldering park, longtime host of the Triple Crown Bouldering Series."},
    {name:"Little Rock City (Stone Fort)", suburb:"South Pittsburg", state:"TN", country:"US", lat:35.2488, lng:-85.2063, types:[OB], notes:"Classic Southern sandstone bouldering near Chattanooga."},
    {name:"Flagstaff Mountain", suburb:"Boulder", state:"CO", country:"US", lat:40.0040, lng:-105.2986, types:[OB], notes:"Dedicated bouldering venue minutes from downtown Boulder."},
    {name:"Icicle Creek Bouldering", suburb:"Leavenworth", state:"WA", country:"US", lat:47.5575, lng:-120.7600, types:[OB], notes:"Granite bouldering in the Cascades, over 1,200 documented problems."},
    {name:"Shawangunks – Sky Top", suburb:"New Paltz", state:"NY", country:"US", lat:41.7648, lng:-74.1540, types:[OB], notes:"World-renowned trad climbing (\"The Gunks\"), plus real documented bouldering nearby."}
  ].map((g,i)=>({...g, id:'seed-'+i, community:false, country: g.country || 'AU'}));
