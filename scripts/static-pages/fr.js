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
    description: 'Ce que Bouldeer enregistre, qui peut le voir, quels services il utilise et comment supprimer votre compte.',
    updated: 'Dernière mise à jour : 22 novembre 2026',
    body: `
    <p>Bouldeer est une petite carte gratuite des salles d&rsquo;escalade pour les grimpeurs qui voyagent. Nous collectons le moins possible, nous n&rsquo;utilisons ni publicité ni outil d&rsquo;analyse, et nous ne vendons pas vos données.</p>

    <h2>Sans compte</h2>
    <p>Vous pouvez utiliser la carte, la recherche et les pages de salles sans vous connecter. Bouldeer ne dépose aucun cookie et n&rsquo;utilise aucun traçage. Les services qui diffusent le site (listés ci-dessous) voient les informations ordinaires d&rsquo;une requête, comme votre adresse IP et votre navigateur.</p>

    <h2>Avec un compte</h2>
    <p>Vous vous connectez avec un lien envoyé par e-mail ou avec Google, via Supabase, notre fournisseur de base de données et de connexion. Nous enregistrons&nbsp;:</p>
    <ul>
      <li>Votre adresse e-mail (et, si vous utilisez Google, les informations de profil de base que Google transmet) pour que vous puissiez vous connecter. Elle n&rsquo;est jamais affichée sur Bouldeer.</li>
      <li>Un nom d&rsquo;affichage facultatif, affiché publiquement sous la forme &laquo;&nbsp;ajoutée par&nbsp;&hellip;&nbsp;&raquo; sur les salles que vous ajoutez.</li>
      <li>Vos salles enregistrées et celles où vous avez grimpé, vos enregistrements sur place et votre carnet&nbsp;: les salles, dates, notes, humeurs et niveaux que vous saisissez.</li>
      <li>Ce que vous nous envoyez&nbsp;: nouvelles salles, modifications suggérées et signalements de problèmes, liés à votre compte.</li>
    </ul>

    <h2>Qui peut voir quoi</h2>
    <ul>
      <li><strong>Tout le monde&nbsp;:</strong> les informations approuvées sur les salles, et votre nom d&rsquo;affichage sur les salles que vous avez ajoutées. Ne mettez pas d&rsquo;informations personnelles dans les informations d&rsquo;une salle.</li>
      <li><strong>Les modérateurs&nbsp;:</strong> ce que vous nous envoyez, et de quel compte cela provient, afin de pouvoir le vérifier.</li>
      <li><strong>Vous seul&nbsp;:</strong> votre adresse e-mail, vos salles enregistrées et celles où vous avez grimpé, vos enregistrements sur place, votre carnet et vos points.</li>
    </ul>
    <p>Les données privées sont protégées par des règles d&rsquo;accès à la base de données. La personne qui gère Bouldeer dispose d&rsquo;un accès administrateur à la base de données et ne l&rsquo;utilise que pour faire fonctionner et sécuriser le site.</p>

    <h2>Localisation</h2>
    <p>Bouldeer ne demande votre position que lorsque vous utilisez le bouton de localisation, «&nbsp;Utiliser ma position&nbsp;» dans Ajouter une salle, ou lorsque vous vous enregistrez sur place depuis un téléphone (vous devez alors vous trouver à moins de 500&nbsp;mètres environ de la salle). Votre navigateur vous le demande d&rsquo;abord, et vous pouvez refuser. Votre position est utilisée sur votre appareil et n&rsquo;est jamais envoyée ni enregistrée chez nous : un enregistrement sur place retient la salle et l&rsquo;heure, pas l&rsquo;endroit où vous étiez.</p>

    <h2>Stocké sur votre appareil</h2>
    <p>Aucun cookie. Le stockage de votre navigateur conserve votre session de connexion, un brouillon non envoyé d&rsquo;Ajouter une salle, la disposition de votre liste, la dernière position de la carte, vos recherches récentes et la langue choisie, une note pour qu&rsquo;un message d&rsquo;étape ne s&rsquo;affiche qu&rsquo;une fois par visite, ainsi que des copies hors ligne du site, des tuiles de carte consultées et de la liste publique des salles. Effacer les données du site dans votre navigateur supprime tout cela.</p>

    <h2>Services que nous utilisons</h2>
    <p>Chacun de ces services voit votre adresse IP et les informations de votre navigateur, et possède sa propre politique de confidentialité&nbsp;:</p>
    <ul>
      <li><strong>Supabase&nbsp;:</strong> base de données et connexion. Il enregistre les données de votre compte et envoie les e-mails de connexion.</li>
      <li><strong>Vercel&nbsp;:</strong> héberge le site et conserve des journaux de requêtes.</li>
      <li><strong>Google&nbsp;:</strong> connexion avec Google (uniquement si vous la choisissez), Google Fonts, et Google Maps lorsque vous touchez Itinéraire.</li>
      <li><strong>Amap&nbsp;:</strong> uniquement lorsque vous choisissez d&rsquo;ouvrir une adresse dans Amap.</li>
      <li><strong>CARTO&nbsp;:</strong> tuiles de carte, construites à partir des données d&rsquo;OpenStreetMap.</li>
      <li><strong>unpkg.com et cdn.jsdelivr.net&nbsp;:</strong> les bibliothèques de code pour la carte et la connexion à la base de données.</li>
      <li><strong>Hébergeurs de photos&nbsp;:</strong> les photos de salles sont des liens, votre navigateur les charge donc depuis le site qui les héberge.</li>
    </ul>

    <h2>Supprimer votre compte</h2>
    <p>Utilisez <strong>Supprimer le compte</strong> en bas de votre page Moi pour supprimer votre compte immédiatement, ou écrivez à <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a> depuis l&rsquo;adresse avec laquelle vous vous connectez et nous le supprimerons dans un délai de 30 jours. Dans les deux cas, cela supprime votre adresse e-mail, votre nom d&rsquo;affichage, vos salles enregistrées et celles où vous avez grimpé, vos enregistrements sur place, votre carnet et vos points. Les salles, modifications et signalements que vous avez envoyés sont conservés, le lien avec vous étant supprimé. Les copies présentes dans les journaux et sauvegardes de nos prestataires expirent selon leurs propres calendriers.</p>
    <p>Vous pouvez aussi nous écrire pour savoir ce que nous conservons à votre sujet ou pour le faire corriger. Pour corriger les informations d&rsquo;une salle, utilisez Suggérer une modification ou Signaler un problème sur sa page.</p>

    <h2>Modifications</h2>
    <p>Si Bouldeer commence à collecter quoi que ce soit de nouveau, nous mettrons d&rsquo;abord cette page à jour et changerons la date ci-dessus.</p>

    <h2>Contact</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Voir aussi les <a href="{terms}">Conditions d&rsquo;utilisation</a>.</p>
`,
  },

  terms: {
    title: 'Conditions d’utilisation',
    metaTitle: 'Conditions d’utilisation — Bouldeer',
    description: 'Les conditions d’utilisation de Bouldeer, la carte gratuite des salles d’escalade pour les grimpeurs qui voyagent.',
    updated: 'Dernière mise à jour : 21 novembre 2026',
    body: `
    <p>Bouldeer (anciennement Climb Atlas) est une carte gratuite et informative des salles d&rsquo;escalade pour les grimpeurs qui voyagent. Elle n&rsquo;est liée à aucune des salles recensées et ne prend ni réservation ni paiement. En utilisant Bouldeer, vous acceptez ces conditions&nbsp;; la <a href="{privacy}">Politique de confidentialité</a> explique comment nous traitons vos données.</p>

    <h2>Vérifiez avant d&rsquo;y aller</h2>
    <p>Les informations sur les salles sont recueillies à partir de sources publiques, comme les sites web et comptes de réseaux sociaux des salles et les fiches de cartes, et à partir des corrections que l&rsquo;on nous envoie. Elles peuvent être périmées ou erronées. Vérifiez auprès de la salle elle-même ses horaires, ses tarifs et si elle est toujours ouverte. L&rsquo;escalade comporte de vrais risques&nbsp;: vous grimpez à vos propres risques et vous êtes responsable de votre propre sécurité.</p>

    <h2>Votre compte</h2>
    <ul>
      <li>Gardez vos identifiants de connexion pour vous. Vous êtes responsable de ce qui est fait avec votre compte.</li>
      <li>Vous pouvez nous demander de supprimer votre compte à tout moment. Nous pouvons suspendre ou supprimer les comptes qui enfreignent ces conditions ou abusent du site.</li>
    </ul>

    <h2>Ce que vous nous envoyez</h2>
    <ul>
      <li>N&rsquo;envoyez que des informations que vous croyez exactes et que vous avez le droit de partager. N&rsquo;incluez aucune information personnelle sur qui que ce soit.</li>
      <li>Pas de spam, de contenu offensant ni d&rsquo;informations délibérément fausses.</li>
      <li>Vous autorisez Bouldeer à afficher sur la carte ce que vous envoyez et à l&rsquo;y conserver, y compris après la suppression de votre compte.</li>
      <li>Les modérateurs vérifient les nouvelles salles et les modifications, et peuvent modifier, rejeter ou supprimer tout ce qui est envoyé.</li>
    </ul>

    <h2>Utilisation raisonnable</h2>
    <p>Veuillez ne pas aspirer ni copier en masse les données de la carte, ni solliciter le site au point d&rsquo;affecter d&rsquo;autres personnes, sans nous demander d&rsquo;abord. Les moteurs de recherche et les assistants d&rsquo;IA peuvent lire les pages individuelles et y faire des liens. Le code et le design du site appartiennent à Bouldeer&nbsp;; les simples faits sur les salles, comme leurs adresses, ne sont pas à nous.</p>

    <h2>Absence de garantie</h2>
    <p>Bouldeer est fourni tel quel, sans aucune garantie d&rsquo;exactitude ni de disponibilité permanente. Dans la mesure permise par la loi, nous ne sommes pas responsables des pertes résultant de l&rsquo;utilisation du site ou de la confiance accordée à ses informations. Les sites liés et les services que nous utilisons pour les cartes, l&rsquo;hébergement et la connexion échappent à notre contrôle.</p>

    <h2>Traductions</h2>
    <p>Ces conditions et la Politique de confidentialité sont aussi disponibles dans d&rsquo;autres langues. Si une traduction diffère de la version anglaise, la version anglaise prévaut.</p>

    <h2>Modifications et droit applicable</h2>
    <p>Nous pouvons mettre à jour ces conditions&nbsp;; la date ci-dessus indique la dernière version. Ces conditions sont régies par le droit de la Nouvelle-Galles du Sud (New South Wales), Australie. Questions&nbsp;: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },
};
