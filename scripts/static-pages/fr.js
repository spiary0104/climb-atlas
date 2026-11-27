// À propos, Politique de confidentialité et Conditions d’utilisation en français. Suit scripts/static-pages/en.js (même forme, mêmes clés).
// Le corps des textes est du HTML : conserver les balises, href, mailto et noms de services ; ne traduire que les mots.
module.exports = {
  ui: {
    skip: 'Aller au contenu',
    back: 'Retour à la carte',
    about: 'À propos',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    contact: 'Contact',
    languages: 'Langues',
    translationNote: 'Ceci est une traduction ; en cas de différence avec la version anglaise, la version anglaise prévaut.',
  },

  about: {
    title: 'À propos de Bouldeer',
    metaTitle: 'À propos — Bouldeer',
    description: 'Bouldeer est une carte gratuite des salles d’escalade en intérieur pour les grimpeurs qui voyagent : plus de 3 600 salles de bloc, de moulinette et de tête dans plus de 80 pays, en 9 langues.',
    body: `
    <p class="lede t-text-lg">Bouldeer est une carte gratuite des salles d&rsquo;escalade en intérieur pour les grimpeurs qui voyagent. Où que vous atterrissiez, elle affiche les murs de bloc, de moulinette et de tête à proximité&nbsp;: plus de 3&nbsp;600 salles dans plus de 80 pays, chacune avec son adresse, ses types d&rsquo;escalade et l&rsquo;itinéraire pour s&rsquo;y rendre, ainsi que les tarifs de l&rsquo;entrée à la journée et les horaires d&rsquo;ouverture lorsque nous les avons confirmés.</p>

    <h2>Pensé pour grimper en voyage</h2>
    <ul>
      <li><strong>Trouvez un mur avant de ranger vos chaussons.</strong> Cherchez par ville, pays ou nom de salle, ou ouvrez la carte là où vous êtes, et filtrez par bloc, moulinette ou tête.</li>
      <li><strong>Cherchez dans l&rsquo;écriture locale.</strong> Saisissez 成都, 東京 ou 서울 aussi facilement que Chengdu, Tokyo ou Séoul. Lorsqu&rsquo;une salle a un nom dans sa propre langue, Bouldeer l&rsquo;affiche à côté du nom anglais.</li>
      <li><strong>Arrivez à destination sans langue commune.</strong> De nombreuses salles affichent leur adresse en écriture locale, à montrer à un chauffeur de taxi, avec un bouton de copie et l&rsquo;itinéraire dans Google Maps, ou Amap en Chine continentale.</li>
      <li><strong>Lisez-le dans votre langue.</strong> Bouldeer est disponible en anglais, chinois simplifié et traditionnel, japonais, coréen, allemand, français, espagnol et portugais brésilien.</li>
      <li><strong>Gardez le souvenir de vos voyages.</strong> Connectez-vous pour enregistrer des salles, marquer celles où vous avez grimpé, vous enregistrer pour recevoir un tampon de passeport pour chaque ville et tenir un carnet de vos séances.</li>
    </ul>

    <h2>D&rsquo;où viennent les informations</h2>
    <p>Chaque salle est étudiée une à une à partir de son propre site web et de ses comptes de réseaux sociaux ainsi que des fiches de cartes publiques, puis vérifiée avant d&rsquo;apparaître sur la carte. Lorsque nous n&rsquo;avons pas confirmé une information, comme un tarif ou des horaires, Bouldeer le dit au lieu de deviner. Si quelque chose est périmé, <strong>Suggérer une modification</strong> ou <strong>Signaler un problème</strong> sur la page de la salle nous le transmet, et chaque correction est vérifiée avant sa mise en ligne.</p>

    <h2>À qui il s&rsquo;adresse</h2>
    <p>Aux grimpeurs qui voyagent&nbsp;: en vacances, en déplacement professionnel, lors d&rsquo;un long voyage dans plusieurs pays ou nouvellement arrivés dans une ville. Vous n&rsquo;avez pas besoin de compte pour utiliser la carte.</p>
`,
    faqTitle: 'Questions',
    faq: [
      ['Qu’est-ce que Bouldeer ?', 'Bouldeer est un site web et une application web gratuits qui cartographient les salles d’escalade en intérieur dans le monde entier, conçus pour les grimpeurs qui voyagent. Il recense plus de 3 600 salles de bloc, de moulinette et de tête dans plus de 80 pays.'],
      ['Comment trouver une salle de bloc en voyage ?', 'Ouvrez www.bouldeer.com, cherchez la ville que vous visitez (en anglais ou dans l’écriture locale) ou utilisez votre position, puis filtrez par bloc. Chaque page de salle indique l’adresse, l’itinéraire et, lorsqu’ils sont confirmés, les tarifs de l’entrée à la journée et les horaires d’ouverture.'],
      ['Bouldeer est-il gratuit ?', 'Oui. Bouldeer est gratuit, n’affiche aucune publicité et ne nécessite aucun compte pour utiliser la carte. Un compte n’est utile que pour enregistrer des salles, s’enregistrer sur place et tenir un carnet.'],
      ['Quels pays Bouldeer couvre-t-il ?', 'Plus de 80 pays sur tous les continents, avec le plus grand nombre de salles aux États-Unis, en Chine, au Japon, en Allemagne, en France, au Royaume-Uni, en Corée du Sud, au Canada, en Espagne et en Australie.'],
      ['Peut-on trouver des salles d’escalade en Chine ?', 'Oui. Bouldeer recense près de 500 salles d’escalade dans plus de 40 villes chinoises, beaucoup avec leur nom et leur adresse en chinois et un lien pour ouvrir l’adresse dans Amap.'],
      ['Bouldeer vend-il des entrées à la journée ou prend-il des réservations ?', 'Non. Bouldeer n’est lié à aucune des salles qu’il recense et ne prend ni réservation ni paiement. Achetez vos entrées et réservez directement auprès de la salle.'],
      ['Les tarifs et les horaires sont-ils à jour ?', 'Bouldeer n’affiche que les informations qu’il a confirmées et indique les autres comme pas encore confirmées. Les salles modifient leurs horaires et leurs tarifs : vérifiez auprès de la salle avant d’y aller.'],
      ['Dans quelles langues Bouldeer est-il disponible ?', 'Anglais, chinois simplifié, chinois traditionnel, japonais, coréen, allemand, français, espagnol et portugais brésilien.'],
    ],
    contact: `
    <h2>Contact</h2>
    <p>Questions ou corrections&nbsp;: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Comment nous traitons vos données&nbsp;: <a href="{privacy}">Confidentialité</a> et <a href="{terms}">Conditions</a>.</p>
`,
  },

  privacy: {
    title: 'Politique de confidentialité',
    metaTitle: 'Politique de confidentialité — Bouldeer',
    description: 'Ce que Bouldeer enregistre, qui peut le voir, où cela est traité et comment supprimer votre compte.',
    updated: 'Dernière mise à jour : 27 novembre 2026',
    body: `
    <p>Bouldeer est une petite carte gratuite des salles d&rsquo;escalade pour les grimpeurs qui voyagent, gérée depuis la Nouvelle-Galles du Sud, en Australie. Nous collectons le moins possible. Nous n&rsquo;affichons pas de publicité, nous n&rsquo;utilisons pas d&rsquo;outil d&rsquo;analyse, et nous ne vendons ni ne partageons vos données à des fins publicitaires.</p>

    <h2>Sans compte</h2>
    <p>Vous pouvez utiliser la carte, la recherche et les pages de salles sans vous connecter. Bouldeer ne dépose aucun cookie et ne vous suit pas. Les services qui diffusent le site (listés ci-dessous) voient les informations ordinaires d&rsquo;une requête, comme votre adresse IP et votre navigateur.</p>

    <h2>Avec un compte</h2>
    <p>Vous devez avoir au moins 16&nbsp;ans pour créer un compte. Vous vous connectez avec un lien envoyé par e-mail ou avec Google, via notre fournisseur de connexion, Supabase. Nous enregistrons&nbsp;:</p>
    <ul>
      <li>Votre adresse e-mail, pour que vous puissiez vous connecter. Si vous utilisez Google, Google transmet aussi votre profil de base (nom et photo de profil) à notre fournisseur de connexion. Rien de tout cela n&rsquo;est affiché sur Bouldeer.</li>
      <li>Un nom d&rsquo;affichage facultatif.</li>
      <li>Vos salles enregistrées et celles où vous avez grimpé, vos enregistrements sur place (la salle, l&rsquo;heure, et une courte note ou un lien de photo facultatifs) et votre carnet (dates, voies, niveaux, humeurs et notes).</li>
      <li>Ce que vous nous envoyez&nbsp;: nouvelles salles, modifications suggérées et signalements de problèmes, liés à votre compte.</li>
    </ul>
    <p>Nous utilisons ces données pour faire fonctionner votre compte et les fonctionnalités que vous choisissez. Nous les utilisons aussi pour vérifier et publier les informations sur les salles et pour protéger le site des abus.</p>

    <h2>Qui peut voir quoi</h2>
    <ul>
      <li><strong>Tout le monde&nbsp;:</strong> les informations approuvées sur les salles, et votre nom d&rsquo;affichage sur les salles que vous avez ajoutées (affiché sous la forme &laquo;&nbsp;ajoutée par&nbsp;&hellip;&nbsp;&raquo;). Les noms d&rsquo;affichage ne sont listés nulle part ailleurs&nbsp;: seuls vous et les modérateurs pouvez lire votre profil. Ne mettez pas d&rsquo;informations personnelles dans les informations d&rsquo;une salle.</li>
      <li><strong>Les modérateurs&nbsp;:</strong> ce que vous nous envoyez, le nom d&rsquo;affichage du compte qui l&rsquo;a envoyé et les points de contribution, afin de pouvoir vérifier les envois. Ils ne voient jamais votre e-mail.</li>
      <li><strong>Vous seul&nbsp;:</strong> votre adresse e-mail, vos salles enregistrées et celles où vous avez grimpé, vos enregistrements sur place et votre carnet.</li>
    </ul>
    <p>Les données privées sont protégées par des règles d&rsquo;accès à la base de données et circulent chiffrées (HTTPS). La personne qui gère Bouldeer dispose d&rsquo;un accès administrateur à la base de données et ne l&rsquo;utilise que pour faire fonctionner et sécuriser le site.</p>

    <h2>Localisation</h2>
    <p>Bouldeer ne demande votre position que lorsque vous utilisez le bouton de localisation, &laquo;&nbsp;Utiliser ma position&nbsp;&raquo; dans Ajouter une salle, ou lorsque vous vous enregistrez sur place depuis un téléphone (vous devez alors vous trouver à moins de 500&nbsp;mètres environ de la salle). Votre navigateur vous demande d&rsquo;abord, et vous pouvez refuser.</p>
    <ul>
      <li><strong>Bouton de localisation et enregistrement sur place&nbsp;:</strong> votre position n&rsquo;est utilisée que sur votre appareil. Elle n&rsquo;est jamais envoyée ni enregistrée chez nous. Un enregistrement sur place conserve la salle et l&rsquo;heure, pas l&rsquo;endroit où vous étiez.</li>
      <li><strong>Ajouter une salle&nbsp;:</strong> &laquo;&nbsp;Utiliser ma position&nbsp;&raquo; place le repère là où vous êtes. Le repère que vous envoyez nous est transmis comme emplacement de la salle et il est publié une fois approuvé&nbsp;: placez-le donc d&rsquo;abord sur la salle.</li>
    </ul>

    <h2>Stocké sur votre appareil</h2>
    <p>Aucun cookie. Le stockage de votre navigateur conserve&nbsp;:</p>
    <ul>
      <li>votre session de connexion&nbsp;;</li>
      <li>un brouillon non envoyé d&rsquo;Ajouter une salle, y compris la position du repère&nbsp;;</li>
      <li>la disposition de votre liste, la dernière vue de la carte, vos recherches récentes et la langue choisie&nbsp;;</li>
      <li>des notes pour que l&rsquo;introduction, le message de bienvenue et les messages d&rsquo;étape ne s&rsquo;affichent qu&rsquo;une fois&nbsp;;</li>
      <li>des copies hors ligne du site, des images de carte consultées et de la liste publique des salles.</li>
    </ul>
    <p>Vous déconnecter ou supprimer votre compte met fin à votre session. Effacer les données du site dans votre navigateur supprime tout le reste.</p>

    <h2>Où vos données sont traitées</h2>
    <p>Les données de votre compte sont stockées à Singapour. Nos prestataires traitent aussi des données aux États-Unis et dans d&rsquo;autres pays. Chacun a sa propre politique de confidentialité&nbsp;:</p>
    <ul>
      <li><strong>Supabase&nbsp;:</strong> base de données et connexion&nbsp;; les données de votre compte sont stockées à Singapour.</li>
      <li><strong>Resend&nbsp;:</strong> envoie les e-mails de connexion, et voit donc votre adresse e-mail. Il stocke des données aux États-Unis et conserve les journaux d&rsquo;e-mails 30&nbsp;jours.</li>
      <li><strong>Vercel&nbsp;:</strong> héberge le site dans le monde entier et conserve des journaux de requêtes.</li>
      <li><strong>CARTO&nbsp;:</strong> images de carte, construites à partir des données d&rsquo;OpenStreetMap. Il raccourcit les adresses IP et conserve ses journaux 30&nbsp;jours aux États-Unis.</li>
      <li><strong>Google&nbsp;:</strong> connexion avec Google (uniquement si vous la choisissez), Google Fonts, et Google Maps lorsque vous touchez Itinéraire.</li>
      <li><strong>Amap&nbsp;:</strong> uniquement lorsque vous choisissez d&rsquo;ouvrir une adresse dans Amap.</li>
      <li><strong>unpkg.com et cdn.jsdelivr.net&nbsp;:</strong> les bibliothèques de code pour la carte et la connexion à la base de données.</li>
      <li><strong>Hébergeurs de photos&nbsp;:</strong> les photos de salles sont des liens, votre navigateur les charge donc depuis le site qui les héberge.</li>
    </ul>

    <h2>Combien de temps nous conservons les données</h2>
    <ul>
      <li><strong>Données du compte&nbsp;:</strong> jusqu&rsquo;à ce que vous supprimiez votre compte.</li>
      <li><strong>Salles, modifications et signalements que vous avez envoyés&nbsp;:</strong> conservés dans le cadre de la carte. Une fois votre compte supprimé, ils ne sont plus liés à vous.</li>
      <li><strong>Journaux des prestataires&nbsp;:</strong> Resend et CARTO conservent leurs journaux 30&nbsp;jours. Vercel et Supabase conservent les journaux de requêtes pendant des durées qu&rsquo;ils fixent eux-mêmes.</li>
    </ul>

    <h2>Supprimer votre compte</h2>
    <p>Utilisez <strong>Supprimer le compte</strong> en bas de votre page Moi pour supprimer votre compte immédiatement. Vous pouvez le faire dans n&rsquo;importe quel navigateur sur bouldeer.com&nbsp;: connectez-vous, ouvrez Moi et choisissez Supprimer le compte. Les étapes figurent aussi sur <a href="{delete}">Supprimer votre compte</a>.</p>
    <p>La suppression retire votre adresse e-mail, votre nom d&rsquo;affichage, vos salles enregistrées et celles où vous avez grimpé, vos enregistrements sur place, votre carnet et vos points. Les salles, modifications et signalements que vous avez envoyés restent sur la carte, y compris les textes que vous avez écrits, mais ils ne sont plus liés à vous.</p>

    <h2>Vos droits</h2>
    <p>Vous pouvez nous demander d&rsquo;accéder à vos données, de les corriger ou de les exporter, ou vous opposer à leur utilisation&nbsp;: écrivez à <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Pour corriger les informations d&rsquo;une salle, utilisez Suggérer une modification ou Signaler un problème sur sa page. Si notre réponse ne vous satisfait pas, vous pouvez saisir l&rsquo;Office of the Australian Information Commissioner (oaic.gov.au), l&rsquo;autorité de protection des données de votre pays dans l&rsquo;UE, ou l&rsquo;Information Commissioner&rsquo;s Office du Royaume-Uni (ico.org.uk).</p>

    <h2>Enfants</h2>
    <p>Bouldeer n&rsquo;est pas conçu pour les enfants. Vous devez avoir au moins 16&nbsp;ans pour créer un compte.</p>

    <h2>Modifications</h2>
    <p>Si Bouldeer commence à collecter quoi que ce soit de nouveau, nous mettrons d&rsquo;abord cette page à jour et changerons la date ci-dessus. En cas de changements importants, nous afficherons aussi un avis sur le site.</p>

    <h2>Contact</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Voir aussi les <a href="{terms}">Conditions d&rsquo;utilisation</a>.</p>
`,
  },

  terms: {
    title: 'Conditions d\'utilisation',
    metaTitle: 'Conditions d\'utilisation — Bouldeer',
    description: 'Les conditions d\'utilisation de Bouldeer, la carte gratuite des salles d\'escalade pour les grimpeurs qui voyagent.',
    updated: 'Dernière mise à jour : 26 novembre 2026',
    body: `
    <p>Bouldeer (anciennement Climb Atlas) est une carte gratuite et informative des salles d&rsquo;escalade pour les grimpeurs qui voyagent, gérée depuis la Nouvelle-Galles du Sud, en Australie. Elle n&rsquo;est liée à aucune des salles recensées et ne prend ni réservation ni paiement. En utilisant Bouldeer, vous acceptez ces conditions. La <a href="{privacy}">Politique de confidentialité</a> explique comment nous traitons vos données.</p>

    <h2>Vérifiez avant d&rsquo;y aller</h2>
    <p>Les informations sur les salles sont recherchées dans des sources publiques, comme les sites web et comptes de réseaux sociaux des salles et les fiches de cartes, ainsi que dans les corrections que des personnes nous envoient. Elles peuvent être périmées ou erronées. Vérifiez les horaires, les tarifs et si une salle est toujours ouverte auprès de la salle elle-même. L&rsquo;escalade comporte de vrais risques&nbsp;: vous grimpez à vos propres risques et vous êtes responsable de votre propre sécurité.</p>

    <h2>Votre compte</h2>
    <ul>
      <li>Vous devez avoir au moins 16&nbsp;ans pour créer un compte.</li>
      <li>Gardez votre identifiant de connexion pour vous. Vous êtes responsable de ce qui est fait avec votre compte.</li>
      <li>Vous pouvez supprimer votre compte à tout moment depuis votre page Moi (voir <a href="{delete}">Supprimer votre compte</a>).</li>
      <li>Nous pouvons suspendre ou supprimer les comptes qui enfreignent ces conditions ou abusent du site. Nous vous en indiquerons en général la raison, sauf si l&rsquo;abus est grave ou si vous la communiquer causerait un préjudice, et vous pouvez répondre à <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</li>
    </ul>

    <h2>Ce que vous nous envoyez</h2>
    <ul>
      <li>N&rsquo;envoyez que des informations que vous croyez exactes et que vous avez le droit de partager. N&rsquo;incluez pas d&rsquo;informations personnelles sur qui que ce soit.</li>
      <li>Pas de spam, de contenu choquant ni d&rsquo;informations délibérément fausses.</li>
      <li>Vous conservez les droits que vous avez sur ce que vous envoyez. Vous nous accordez une licence gratuite, non exclusive, mondiale et permanente pour héberger, afficher, modifier, traduire et conserver ces contenus dans le cadre de Bouldeer, y compris après la suppression de votre compte.</li>
      <li>Les modérateurs vérifient les nouvelles salles et les modifications, et peuvent modifier, rejeter ou supprimer tout ce qui est envoyé.</li>
    </ul>

    <h2>Utilisation raisonnable</h2>
    <p>Veuillez ne pas aspirer ni copier en masse les données de la carte, ni solliciter le site au point de gêner d&rsquo;autres personnes, sans nous demander d&rsquo;abord. Les moteurs de recherche et les assistants IA peuvent lire et lier des pages individuelles. Les données de la carte sont &copy; les contributeurs d&rsquo;OpenStreetMap et CARTO. Les simples faits sur les salles, comme leurs adresses, ne nous appartiennent pas.</p>

    <h2>Absence de garantie</h2>
    <p>Bouldeer est fourni tel quel, sans aucune garantie d&rsquo;exactitude ni de disponibilité permanente. Dans la mesure permise par la loi, nous ne sommes pas responsables des pertes résultant de l&rsquo;utilisation du site ou de la confiance accordée à ses informations. Rien dans ces conditions n&rsquo;exclut les droits que vous confère l&rsquo;Australian Consumer Law (droit australien de la consommation) ou d&rsquo;autres lois auxquelles on ne peut pas déroger. Les sites liés et les services que nous utilisons pour les cartes, l&rsquo;hébergement et la connexion échappent à notre contrôle.</p>

    <h2>Traductions</h2>
    <p>Ces conditions et la Politique de confidentialité sont aussi disponibles dans d&rsquo;autres langues. Si une traduction diffère de la version anglaise, la version anglaise prévaut.</p>

    <h2>Modifications et droit applicable</h2>
    <p>Nous pouvons mettre à jour ces conditions. En cas de changements importants, nous afficherons un avis sur le site au moins 14&nbsp;jours avant leur application. Si vous n&rsquo;êtes pas d&rsquo;accord, vous pouvez cesser d&rsquo;utiliser Bouldeer et supprimer votre compte. Ces conditions sont régies par les lois de la Nouvelle-Galles du Sud, en Australie. Cela ne vous prive d&rsquo;aucune protection prévue par les lois du pays où vous vivez. Questions&nbsp;: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },

  delete: {
    title: 'Supprimer votre compte',
    metaTitle: 'Supprimer votre compte Bouldeer',
    description: 'Comment supprimer votre compte Bouldeer, ce qui est supprimé et ce qui est conservé.',
    updated: 'Dernière mise à jour : 26 novembre 2026',
    body: `
    <p>Vous pouvez supprimer vous-même votre compte Bouldeer à tout moment, depuis le site web ou l&rsquo;application. La suppression est immédiate.</p>

    <h2>Comment supprimer votre compte</h2>
    <ol>
      <li>Rendez-vous sur <a href="https://www.bouldeer.com/">bouldeer.com</a> dans n&rsquo;importe quel navigateur (ou ouvrez l&rsquo;application Bouldeer) et connectez-vous avec l&rsquo;adresse e-mail ou le compte Google que vous utilisez pour Bouldeer.</li>
      <li>Ouvrez <strong>Moi</strong>.</li>
      <li>En bas de la page, choisissez <strong>Supprimer le compte</strong>, cochez la case de confirmation et appuyez sur le bouton.</li>
    </ol>
    <p>Vous n&rsquo;avez rien à installer&nbsp;: se connecter sur le site web fonctionne comme dans l&rsquo;application.</p>

    <h2>Ce qui est supprimé</h2>
    <p>Votre adresse e-mail et vos informations de connexion, votre nom d&rsquo;affichage, vos salles enregistrées et celles où vous avez grimpé, vos enregistrements sur place, votre carnet et vos points.</p>

    <h2>Ce qui est conservé, et pourquoi</h2>
    <p>Les salles, modifications et signalements de problèmes que vous avez envoyés restent sur la carte, y compris les textes que vous avez écrits, car d&rsquo;autres grimpeurs s&rsquo;appuient dessus. Ils ne sont plus liés à vous. Les journaux de courte durée de nos prestataires expirent selon leurs propres calendriers (Resend et CARTO conservent leurs journaux 30&nbsp;jours).</p>

    <h2>Questions</h2>
    <p>Écrivez à <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Voir aussi la <a href="{privacy}">Politique de confidentialité</a>.</p>
`,
  },
};
