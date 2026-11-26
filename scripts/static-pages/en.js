// About, Privacy, Terms and Delete account in English: the source the translations follow (scripts/static-pages/<code>.js, same shape).
// scripts/build-static-pages.js turns each language into /about.html, /privacy.html, /terms.html (English) and
// /<prefix>/about.html ... (other languages). Edit here, then run: node scripts/build-static-pages.js
// Body text is HTML: keep tags, hrefs, mailto and the service names exactly; translate only the words.
// Facts must stay true: these pages are read by people, search engines and AI assistants alike.
module.exports = {
  ui: {
    skip: 'Skip to content',
    back: 'Back to map',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    languages: 'Languages',
    translationNote: '',   // other languages: "This is a translation; if it differs from the English version, the English version applies."
  },

  about: {
    title: 'About Bouldeer',
    metaTitle: 'About — Bouldeer',
    description: 'Bouldeer is a free map of indoor climbing gyms for climbers who travel: 3,600+ bouldering, top rope and lead gyms in 80+ countries, in 9 languages.',
    body: `
    <p class="lede t-text-lg">Bouldeer is a free map of indoor climbing gyms for climbers who travel. Wherever you land, it shows the bouldering, top rope and lead walls nearby: more than 3,600 gyms in over 80 countries, each with its address, climbing types and directions, plus day-pass prices and opening hours where we have confirmed them.</p>

    <h2>Built for climbing on the road</h2>
    <ul>
      <li><strong>Find a wall before you pack your shoes.</strong> Search by city, country or gym name, or open the map wherever you are, and filter by bouldering, top rope or lead.</li>
      <li><strong>Search in the local script.</strong> Type 成都, 東京 or 서울 as easily as Chengdu, Tokyo or Seoul. Where a gym has a name in its own language, Bouldeer shows it next to the English one.</li>
      <li><strong>Get there without a shared language.</strong> Many gyms show their address in the local script to hand to a taxi driver, with a copy button and directions in Google Maps, or Amap in mainland China.</li>
      <li><strong>Read it in your language.</strong> Bouldeer is available in English, Simplified and Traditional Chinese, Japanese, Korean, German, French, Spanish and Brazilian Portuguese.</li>
      <li><strong>Remember your trips.</strong> Sign in to save gyms, mark the ones you have climbed, check in to collect a passport stamp for each city and keep a logbook of your sessions.</li>
    </ul>

    <h2>Where the information comes from</h2>
    <p>Every gym is researched one by one from its own website and social accounts and from public map listings, and checked before it appears on the map. When we have not confirmed a detail, such as a price or opening hours, Bouldeer says so instead of guessing. If something is out of date, <strong>Suggest an edit</strong> or <strong>Report a problem</strong> on the gym&rsquo;s page sends it to us, and every correction is checked before it goes live.</p>

    <h2>Who it&rsquo;s for</h2>
    <p>Climbers who travel: on holiday, on a work trip, on a long trip through several countries, or new in town. You don&rsquo;t need an account to use the map.</p>
`,
    faqTitle: 'Questions',
    faq: [
      ['What is Bouldeer?', 'Bouldeer is a free website and web app that maps indoor climbing gyms worldwide, made for climbers who travel. It lists more than 3,600 bouldering, top rope and lead climbing gyms in over 80 countries.'],
      ['How do I find a bouldering gym when I travel?', 'Open www.bouldeer.com, search for the city you are visiting (in English or the local script) or use your location, and filter by bouldering. Each gym page has the address, directions and, where confirmed, day-pass prices and opening hours.'],
      ['Is Bouldeer free?', 'Yes. Bouldeer is free, shows no ads and needs no account to use the map. An account is only needed to save gyms, check in and keep a logbook.'],
      ['Which countries does Bouldeer cover?', 'Over 80 countries on every continent, with the most gyms in the United States, China, Japan, Germany, France, the United Kingdom, South Korea, Canada, Spain and Australia.'],
      ['Can I find climbing gyms in China?', 'Yes. Bouldeer lists nearly 500 climbing gyms in more than 40 Chinese cities, many with their Chinese name and address and a link to open the address in Amap.'],
      ['Does Bouldeer sell day passes or take bookings?', 'No. Bouldeer is not connected to the gyms it lists and takes no bookings or payments. Buy passes and book directly with the gym.'],
      ['Are prices and opening hours up to date?', 'Bouldeer shows only details it has confirmed and marks the rest as not confirmed yet. Gyms change their hours and prices, so check with the gym before you go.'],
      ['Which languages is Bouldeer available in?', 'English, Simplified Chinese, Traditional Chinese, Japanese, Korean, German, French, Spanish and Brazilian Portuguese.'],
    ],
    contact: `
    <h2>Contact</h2>
    <p>Questions or corrections: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. How we handle your data: <a href="{privacy}">Privacy</a> and <a href="{terms}">Terms</a>.</p>
`,
  },

  privacy: {
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy — Bouldeer',
    description: 'What Bouldeer stores, who can see it, where it is processed, and how to delete your account.',
    updated: 'Last updated: 26 November 2026',
    body: `
    <p>Bouldeer is a small, free map of climbing gyms for climbers who travel, run from New South Wales, Australia. We collect as little as we can. We don&rsquo;t show ads, we don&rsquo;t use analytics, and we don&rsquo;t sell or share your data for advertising.</p>

    <h2>Without an account</h2>
    <p>You can use the map, search and gym pages without signing in. Bouldeer sets no cookies and doesn&rsquo;t track you. The services that deliver the site (listed below) see ordinary request details such as your IP address and browser.</p>

    <h2>With an account</h2>
    <p>You need to be at least 16 to create an account. You sign in with an email link or with Google, through our sign-in provider, Supabase. We store:</p>
    <ul>
      <li>Your email address, so you can sign in. If you use Google, Google also shares your basic profile (name and profile picture) with our sign-in provider. None of this is shown on Bouldeer.</li>
      <li>An optional display name.</li>
      <li>Your saved and climbed gyms, check-ins (the gym, the time, and an optional short note or photo link) and your logbook (dates, climbs, grades, moods and notes).</li>
      <li>What you send us: new gyms, suggested edits and problem reports, linked to your account.</li>
    </ul>
    <p>We use this to run your account and the features you choose. We also use it to check and publish gym information and to keep the site free of abuse.</p>

    <h2>Who can see what</h2>
    <ul>
      <li><strong>Everyone:</strong> approved gym details, and your display name if you set one. Display names are public. They appear as &ldquo;added by&nbsp;&hellip;&rdquo; on gyms you added, and are linked to an internal account number, never to your email. Don&rsquo;t put personal information in gym details.</li>
      <li><strong>Moderators:</strong> what you send us, the display name of the account that sent it, and contribution points, so they can check submissions. They never see your email.</li>
      <li><strong>Only you:</strong> your email address, saved and climbed gyms, check-ins and logbook.</li>
    </ul>
    <p>Private data is protected by database access rules and travels encrypted (HTTPS). The person who runs Bouldeer has administrator access to the database and uses it only to run and secure the site.</p>

    <h2>Location</h2>
    <p>Bouldeer asks for your location only when you use the locate button, &ldquo;Use my location&rdquo; on Add a gym, or check in on a phone (you need to be within about 500&nbsp;metres of the gym). Your browser asks first, and you can say no.</p>
    <ul>
      <li><strong>Locate button and check-in:</strong> your position is used on your device only. It&rsquo;s never sent to us or saved. A check-in records the gym and the time, not where you were.</li>
      <li><strong>Add a gym:</strong> &ldquo;Use my location&rdquo; moves the pin to where you are. The pin you submit is sent to us as the gym&rsquo;s location and is published once approved, so move it onto the gym first.</li>
    </ul>

    <h2>Stored on your device</h2>
    <p>No cookies. Your browser&rsquo;s storage keeps:</p>
    <ul>
      <li>your sign-in session;</li>
      <li>an unsent Add a gym draft, including the pin position;</li>
      <li>your list layout, last map view, recent searches and chosen language;</li>
      <li>notes so the intro, the welcome and milestone messages show only once;</li>
      <li>offline copies of the site, map images you&rsquo;ve viewed and the public gym list.</li>
    </ul>
    <p>Signing out or deleting your account ends your session. Clearing the site&rsquo;s data in your browser removes everything else.</p>

    <h2>Where your data is processed</h2>
    <p>Your account data is stored in Singapore. Our providers also process data in the United States and other countries. Each has its own privacy policy:</p>
    <ul>
      <li><strong>Supabase:</strong> database and sign-in; your account data is stored in Singapore.</li>
      <li><strong>Resend:</strong> delivers sign-in emails, so it sees your email address. It stores data in the United States and keeps email logs for 30 days.</li>
      <li><strong>Vercel:</strong> hosts the site worldwide and keeps request logs.</li>
      <li><strong>CARTO:</strong> map images, built on OpenStreetMap data. It shortens IP addresses and keeps its logs for 30 days in the United States.</li>
      <li><strong>Google:</strong> Google sign-in (only if you choose it), Google Fonts, and Google Maps when you tap Directions.</li>
      <li><strong>Amap:</strong> only when you choose to open an address in Amap.</li>
      <li><strong>unpkg.com and cdn.jsdelivr.net:</strong> the code libraries for the map and the database connection.</li>
      <li><strong>Photo hosts:</strong> gym photos are links, so your browser loads them from the site that hosts them.</li>
    </ul>

    <h2>How long we keep data</h2>
    <ul>
      <li><strong>Account data:</strong> until you delete your account.</li>
      <li><strong>Gyms, edits and reports you sent:</strong> kept as part of the map. After you delete your account they&rsquo;re no longer linked to you.</li>
      <li><strong>Providers&rsquo; logs:</strong> Resend and CARTO keep logs for 30 days. Vercel and Supabase keep request logs for periods they set.</li>
    </ul>

    <h2>Deleting your account</h2>
    <p>Use <strong>Delete account</strong> at the bottom of your Me page to delete your account straight away. You can do this in any browser at bouldeer.com: sign in, open Me, and choose Delete account. The steps are also on <a href="{delete}">Delete your account</a>.</p>
    <p>Deleting removes your email address, display name, saved and climbed gyms, check-ins, logbook and points. Gyms, edits and reports you sent stay on the map, including any text you wrote, but they&rsquo;re no longer linked to you.</p>

    <h2>Your rights</h2>
    <p>You can ask us to access, correct or export your data, or object to how we use it: email <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. To fix a gym&rsquo;s details, use Suggest an edit or Report a problem on its page. If you&rsquo;re unhappy with our response, you can complain to the Office of the Australian Information Commissioner (oaic.gov.au), your local data protection authority in the EU, or the UK Information Commissioner&rsquo;s Office (ico.org.uk).</p>

    <h2>Children</h2>
    <p>Bouldeer isn&rsquo;t designed for children. You need to be at least 16 to create an account.</p>

    <h2>Changes</h2>
    <p>If Bouldeer starts collecting anything new, we&rsquo;ll update this page first and change the date above. For significant changes we&rsquo;ll also post a notice on the site.</p>

    <h2>Contact</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. See also the <a href="{terms}">Terms of Service</a>.</p>
`,
  },

  terms: {
    title: 'Terms of Service',
    metaTitle: 'Terms of Service — Bouldeer',
    description: 'The terms for using Bouldeer, the free climbing gym map for climbers who travel.',
    updated: 'Last updated: 26 November 2026',
    body: `
    <p>Bouldeer (formerly Climb Atlas) is a free, informational map of climbing gyms for climbers who travel, run from New South Wales, Australia. It isn&rsquo;t connected to the gyms listed and doesn&rsquo;t take bookings or payments. By using Bouldeer you agree to these terms. The <a href="{privacy}">Privacy Policy</a> explains how we handle your data.</p>

    <h2>Check before you go</h2>
    <p>Gym details are researched from public sources, such as the gyms&rsquo; own websites and social accounts and map listings, and from corrections people send us. They may be out of date or wrong. Check opening hours, prices and whether a gym is still open with the gym itself. Climbing carries real risk: you climb at your own risk and are responsible for your own safety.</p>

    <h2>Your account</h2>
    <ul>
      <li>You need to be at least 16 to create an account.</li>
      <li>Keep your sign-in to yourself. You&rsquo;re responsible for what&rsquo;s done with your account.</li>
      <li>You can delete your account at any time from your Me page (see <a href="{delete}">Delete your account</a>).</li>
      <li>We may suspend or remove accounts that break these terms or abuse the site. We&rsquo;ll usually tell you why, unless the abuse is serious or telling you would cause harm, and you can reply to <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</li>
    </ul>

    <h2>What you send us</h2>
    <ul>
      <li>Only send information you believe is accurate and have the right to share. Don&rsquo;t include personal information about anyone.</li>
      <li>No spam, offensive content or deliberately false information.</li>
      <li>You keep any rights you have in what you send. You give us a free, non-exclusive, worldwide, permanent licence to host, show, edit, translate and keep it as part of Bouldeer, including after you delete your account.</li>
      <li>Moderators check new gyms and edits, and can edit, reject or remove anything sent.</li>
    </ul>

    <h2>Fair use</h2>
    <p>Please don&rsquo;t scrape or bulk-copy the map data, or load the site hard enough to affect other people, without asking us first. Search engines and AI assistants may read and link to individual pages. Map data is &copy; OpenStreetMap contributors and CARTO. Plain facts about gyms, like their addresses, aren&rsquo;t ours to own.</p>

    <h2>No warranty</h2>
    <p>Bouldeer is provided as is, without any guarantee that it&rsquo;s accurate or always available. To the extent the law allows, we aren&rsquo;t liable for losses from using the site or relying on its information. Nothing in these terms excludes rights you have under the Australian Consumer Law or other laws that can&rsquo;t be excluded. Linked sites, and the services we use for maps, hosting and sign-in, are outside our control.</p>

    <h2>Translations</h2>
    <p>These terms and the Privacy Policy are also available in other languages. If a translation differs from the English version, the English version applies.</p>

    <h2>Changes and governing law</h2>
    <p>We may update these terms. For significant changes we&rsquo;ll post a notice on the site at least 14 days before they apply. If you don&rsquo;t agree, you can stop using Bouldeer and delete your account. These terms are governed by the laws of New South Wales, Australia. This doesn&rsquo;t take away any protection you have under the laws of the country where you live. Questions: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },

  delete: {
    title: 'Delete your account',
    metaTitle: 'Delete your Bouldeer account',
    description: 'How to delete your Bouldeer account, what is deleted, and what stays.',
    updated: 'Last updated: 26 November 2026',
    body: `
    <p>You can delete your Bouldeer account yourself at any time, from the website or the app. It takes effect straight away.</p>

    <h2>How to delete your account</h2>
    <ol>
      <li>Go to <a href="https://www.bouldeer.com/">bouldeer.com</a> in any browser (or open the Bouldeer app) and sign in with the email address or Google account you use for Bouldeer.</li>
      <li>Open <strong>Me</strong>.</li>
      <li>At the bottom of the page, choose <strong>Delete account</strong>, tick the box to confirm, and press the button.</li>
    </ol>
    <p>You don&rsquo;t need to install anything: signing in on the website works the same as in the app.</p>

    <h2>What&rsquo;s deleted</h2>
    <p>Your email address and sign-in details, display name, saved and climbed gyms, check-ins, logbook and points.</p>

    <h2>What stays, and why</h2>
    <p>Gyms, edits and problem reports you sent stay on the map, including any text you wrote, because other climbers rely on them. They&rsquo;re no longer linked to you. Our providers&rsquo; short-lived logs expire on their own schedules (Resend and CARTO keep logs for 30 days).</p>

    <h2>Questions</h2>
    <p>Email <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. See also the <a href="{privacy}">Privacy Policy</a>.</p>
`,
  },
};
