// English interface text: the default and the fallback for every other language (js/modules/i18n.js).
// Keys are stable ids (area.thing), never the English text; a plural message is {one, other}. {name} is a parameter.
// Every key here must exist in each enabled language's dictionary (tests/i18n.test.js); brand names stay as they are.
export default {
  'app.name': 'Bouldeer',

  'nav.primary': 'Primary',
  'nav.explore': 'Explore',
  'nav.regions': 'Regions',
  'nav.log': 'Log',
  'nav.me': 'Me',
  'nav.checkin': 'Check in',
  'nav.start.aria': 'Start: check in at a gym or log a session',

  'topbar.addGym': 'Add a gym',
  'topbar.addShort': 'Add',
  'auth.signIn': 'Sign in',
  'auth.signOut': 'Sign out',

  'lang.label': 'Language',
  'lang.pickerAria': 'Language',
  'lang.section': 'Language',
  'lang.help': 'Changes the app\'s buttons and menus. Gym names and addresses stay in their own language.',

  'me.title': 'Me',
  'me.signedOutIntro': 'Save gyms, mark the ones you have climbed and keep a log of your sessions.',
  'me.tabsAria': 'Your gyms',
  'me.saved': 'Saved',
  'me.climbed': 'Climbed',
  'me.passport': 'Passport',
  'me.emptySaved': 'Save a gym from its page or the map, and it will show up here.',
  'me.emptyClimbed': 'Mark a gym as climbed from its page or the map, and it will show up here.',
  'me.account': 'Account',
  'me.pendingReview': 'Pending review',
  'me.about': 'About',
  'me.privacy': 'Privacy',
  'me.terms': 'Terms',

  'common.notConfirmed': 'Not confirmed yet',
  'common.gymCount': { one: '{count} gym', other: '{count} gyms' },
};
