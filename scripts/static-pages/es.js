// Acerca de, Política de privacidad y Términos de servicio en español. Sigue scripts/static-pages/en.js (misma forma, mismas claves).
// El cuerpo de los textos es HTML: conserva las etiquetas, href, mailto y los nombres de servicios; traduce solo las palabras.
module.exports = {
  ui: {
    skip: 'Saltar al contenido',
    back: 'Volver al mapa',
    about: 'Acerca de',
    privacy: 'Privacidad',
    terms: 'Términos',
    contact: 'Contacto',
    languages: 'Idiomas',
    translationNote: 'Esto es una traducción; si difiere de la versión en inglés, prevalece la versión en inglés.',
  },

  about: {
    title: 'Acerca de Bouldeer',
    metaTitle: 'Acerca de — Bouldeer',
    description: 'Bouldeer es un mapa gratuito de rocódromos para escaladores que viajan: más de 3600 rocódromos de búlder, top rope y de primero en más de 80 países, en 9 idiomas.',
    body: `
    <p class="lede t-text-lg">Bouldeer es un mapa gratuito de rocódromos para escaladores que viajan. Allí donde aterrices, te muestra los muros de búlder, top rope y de primero cercanos: más de 3600 rocódromos en más de 80 países, cada uno con su dirección, sus tipos de escalada y cómo llegar, además de los precios de la entrada de día y los horarios cuando los hemos confirmado.</p>

    <h2>Pensado para escalar de viaje</h2>
    <ul>
      <li><strong>Encuentra un muro antes de hacer la maleta.</strong> Busca por ciudad, país o nombre del rocódromo, o abre el mapa donde estés, y filtra por búlder, top rope o de primero.</li>
      <li><strong>Busca en la escritura local.</strong> Escribe 成都, 東京 o 서울 con la misma facilidad que Chengdu, Tokio o Seúl. Cuando un rocódromo tiene nombre en su propio idioma, Bouldeer lo muestra junto al nombre en inglés.</li>
      <li><strong>Llega sin compartir idioma.</strong> Muchos rocódromos muestran su dirección en la escritura local para enseñársela a un taxista, con un botón para copiarla y cómo llegar en Google Maps, o en Amap en China continental.</li>
      <li><strong>Léelo en tu idioma.</strong> Bouldeer está disponible en inglés, chino simplificado y tradicional, japonés, coreano, alemán, francés, español y portugués de Brasil.</li>
      <li><strong>Recuerda tus viajes.</strong> Inicia sesión para guardar rocódromos, marcar aquellos en los que has escalado, hacer check-in para conseguir un sello de pasaporte por cada ciudad y llevar un diario de tus sesiones.</li>
    </ul>

    <h2>De dónde sale la información</h2>
    <p>Cada rocódromo se investiga uno por uno a partir de su propio sitio web y sus redes sociales y de fichas públicas de mapas, y se comprueba antes de que aparezca en el mapa. Cuando no hemos confirmado un dato, como un precio o un horario, Bouldeer lo dice en lugar de adivinar. Si algo está desactualizado, <strong>Sugerir un cambio</strong> o <strong>Informar de un problema</strong> en la página del rocódromo nos lo hace llegar, y cada corrección se revisa antes de publicarse.</p>

    <h2>Para quién es</h2>
    <p>Para escaladores que viajan: de vacaciones, en un viaje de trabajo, en un viaje largo por varios países o recién llegados a una ciudad. No necesitas una cuenta para usar el mapa.</p>
`,
    faqTitle: 'Preguntas',
    faq: [
      ['¿Qué es Bouldeer?', 'Bouldeer es un sitio web y una aplicación web gratuitos que mapean rocódromos de todo el mundo, pensados para escaladores que viajan. Incluye más de 3600 rocódromos de búlder, top rope y de primero en más de 80 países.'],
      ['¿Cómo encuentro un rocódromo de búlder cuando viajo?', 'Abre www.bouldeer.com, busca la ciudad que visitas (en inglés o en la escritura local) o usa tu ubicación, y filtra por búlder. Cada página de rocódromo muestra la dirección, cómo llegar y, cuando están confirmados, los precios de la entrada de día y los horarios.'],
      ['¿Bouldeer es gratis?', 'Sí. Bouldeer es gratis, no muestra anuncios y no necesita cuenta para usar el mapa. Solo hace falta una cuenta para guardar rocódromos, hacer check-in y llevar un diario.'],
      ['¿Qué países cubre Bouldeer?', 'Más de 80 países de todos los continentes, con más rocódromos en Estados Unidos, China, Japón, Alemania, Francia, Reino Unido, Corea del Sur, Canadá, España y Australia.'],
      ['¿Puedo encontrar rocódromos en China?', 'Sí. Bouldeer incluye casi 500 rocódromos en más de 40 ciudades chinas, muchos con su nombre y dirección en chino y un enlace para abrir la dirección en Amap.'],
      ['¿Bouldeer vende entradas de día o gestiona reservas?', 'No. Bouldeer no tiene relación con los rocódromos que lista y no gestiona reservas ni pagos. Compra las entradas y reserva directamente en el rocódromo.'],
      ['¿Los precios y horarios están actualizados?', 'Bouldeer solo muestra los datos que ha confirmado y marca el resto como aún sin confirmar. Los rocódromos cambian sus horarios y precios, así que consulta con el rocódromo antes de ir.'],
      ['¿En qué idiomas está disponible Bouldeer?', 'Inglés, chino simplificado, chino tradicional, japonés, coreano, alemán, francés, español y portugués de Brasil.'],
    ],
    contact: `
    <h2>Contacto</h2>
    <p>Preguntas o correcciones: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Cómo tratamos tus datos: <a href="{privacy}">Privacidad</a> y <a href="{terms}">Términos</a>.</p>
`,
  },

  privacy: {
    title: 'Política de privacidad',
    metaTitle: 'Política de privacidad — Bouldeer',
    description: 'Qué guarda Bouldeer, quién puede verlo, dónde se procesa y cómo eliminar tu cuenta.',
    updated: 'Última actualización: 26 de noviembre de 2026',
    body: `
    <p>Bouldeer es un pequeño mapa gratuito de rocódromos para escaladores que viajan, gestionado desde Nueva Gales del Sur, Australia. Recopilamos lo mínimo posible. No mostramos publicidad, no usamos analítica y no vendemos ni compartimos tus datos con fines publicitarios.</p>

    <h2>Sin cuenta</h2>
    <p>Puedes usar el mapa, la búsqueda y las páginas de los rocódromos sin iniciar sesión. Bouldeer no instala cookies y no te rastrea. Los servicios que entregan el sitio (listados más abajo) ven los datos habituales de una solicitud, como tu dirección IP y tu navegador.</p>

    <h2>Con cuenta</h2>
    <p>Debes tener al menos 16 años para crear una cuenta. Inicias sesión con un enlace por correo electrónico o con Google, a través de nuestro proveedor de inicio de sesión, Supabase. Guardamos:</p>
    <ul>
      <li>Tu dirección de correo electrónico, para que puedas iniciar sesión. Si usas Google, Google también comparte tu perfil básico (nombre y foto de perfil) con nuestro proveedor de inicio de sesión. Nada de esto se muestra en Bouldeer.</li>
      <li>Un nombre visible opcional.</li>
      <li>Tus rocódromos guardados y escalados, tus check-ins (el rocódromo, la hora y una nota corta o un enlace a una foto, opcionales) y tu diario (fechas, vías, grados, estados de ánimo y notas).</li>
      <li>Lo que nos envías: nuevos rocódromos, ediciones sugeridas e informes de problemas, vinculados a tu cuenta.</li>
    </ul>
    <p>Usamos esto para gestionar tu cuenta y las funciones que eliges. También lo usamos para revisar y publicar la información de los rocódromos y para mantener el sitio libre de abusos.</p>

    <h2>Quién puede ver qué</h2>
    <ul>
      <li><strong>Todo el mundo:</strong> los datos aprobados de los rocódromos y tu nombre visible, si lo has puesto. Los nombres visibles son públicos. Aparecen como &ldquo;añadido por&nbsp;&hellip;&rdquo; en los rocódromos que añadiste y están vinculados a un número de cuenta interno, nunca a tu correo electrónico. No pongas información personal en los datos de un rocódromo.</li>
      <li><strong>Moderadores:</strong> lo que nos envías, el nombre visible de la cuenta que lo envió y los puntos de contribución, para poder revisar los envíos. Nunca ven tu correo electrónico.</li>
      <li><strong>Solo tú:</strong> tu correo electrónico, tus rocódromos guardados y escalados, check-ins y diario.</li>
    </ul>
    <p>Los datos privados están protegidos por reglas de acceso de la base de datos y viajan cifrados (HTTPS). La persona que gestiona Bouldeer tiene acceso de administrador a la base de datos y lo usa solo para operar y proteger el sitio.</p>

    <h2>Ubicación</h2>
    <p>Bouldeer solo te pide la ubicación cuando usas el botón de localizar, &ldquo;Usar mi ubicación&rdquo; en Añadir un rocódromo, o haces check-in desde un teléfono (tienes que estar a menos de unos 500&nbsp;metros del rocódromo). Tu navegador te lo pregunta antes y puedes decir que no.</p>
    <ul>
      <li><strong>Botón de localizar y check-in:</strong> tu posición se usa solo en tu dispositivo. Nunca se nos envía ni se guarda. Un check-in registra el rocódromo y la hora, no dónde estabas.</li>
      <li><strong>Añadir un rocódromo:</strong> &ldquo;Usar mi ubicación&rdquo; mueve el marcador adonde estás. El marcador que envías nos llega como la ubicación del rocódromo y se publica una vez aprobado, así que colócalo primero sobre el rocódromo.</li>
    </ul>

    <h2>Guardado en tu dispositivo</h2>
    <p>Sin cookies. El almacenamiento de tu navegador conserva:</p>
    <ul>
      <li>tu sesión;</li>
      <li>un borrador sin enviar de Añadir un rocódromo, incluida la posición del marcador;</li>
      <li>el diseño de tu lista, la última vista del mapa, tus búsquedas recientes y el idioma que elegiste;</li>
      <li>notas para que la introducción y los mensajes de bienvenida y de hito se muestren una sola vez;</li>
      <li>copias sin conexión del sitio, de las imágenes del mapa que has visto y de la lista pública de rocódromos.</li>
    </ul>
    <p>Cerrar sesión o eliminar tu cuenta pone fin a tu sesión. Si borras los datos del sitio en tu navegador, se elimina todo lo demás.</p>

    <h2>Dónde se procesan tus datos</h2>
    <p>Los datos de tu cuenta se almacenan en Singapur. Nuestros proveedores también procesan datos en Estados Unidos y en otros países. Cada uno tiene su propia política de privacidad:</p>
    <ul>
      <li><strong>Supabase:</strong> base de datos e inicio de sesión; los datos de tu cuenta se almacenan en Singapur.</li>
      <li><strong>Resend:</strong> envía los correos de inicio de sesión, por lo que ve tu correo electrónico. Almacena datos en Estados Unidos y conserva los registros de correo 30 días.</li>
      <li><strong>Vercel:</strong> aloja el sitio en todo el mundo y conserva registros de las solicitudes.</li>
      <li><strong>CARTO:</strong> imágenes de mapa, basadas en datos de OpenStreetMap. Acorta las direcciones IP y conserva sus registros 30 días en Estados Unidos.</li>
      <li><strong>Google:</strong> inicio de sesión con Google (solo si lo eliges), Google Fonts y Google Maps cuando tocas Cómo llegar.</li>
      <li><strong>Amap:</strong> solo cuando eliges abrir una dirección en Amap.</li>
      <li><strong>unpkg.com y cdn.jsdelivr.net:</strong> las bibliotecas de código para el mapa y la conexión con la base de datos.</li>
      <li><strong>Alojamientos de fotos:</strong> las fotos de los rocódromos son enlaces, así que tu navegador las carga desde el sitio que las aloja.</li>
    </ul>

    <h2>Cuánto tiempo conservamos los datos</h2>
    <ul>
      <li><strong>Datos de la cuenta:</strong> hasta que elimines tu cuenta.</li>
      <li><strong>Rocódromos, ediciones e informes que enviaste:</strong> se conservan como parte del mapa. Cuando eliminas tu cuenta, dejan de estar vinculados a ti.</li>
      <li><strong>Registros de los proveedores:</strong> Resend y CARTO conservan los registros 30 días. Vercel y Supabase conservan los registros de solicitudes durante los plazos que ellos fijan.</li>
    </ul>

    <h2>Eliminar tu cuenta</h2>
    <p>Usa <strong>Eliminar cuenta</strong> al final de tu página Yo para eliminar tu cuenta al instante. Puedes hacerlo en cualquier navegador en bouldeer.com: inicia sesión, abre Yo y elige Eliminar cuenta. Los pasos también están en <a href="{delete}">Eliminar tu cuenta</a>.</p>
    <p>Al eliminarla se borran tu correo electrónico, tu nombre visible, tus rocódromos guardados y escalados, check-ins, diario y puntos. Los rocódromos, ediciones e informes que enviaste siguen en el mapa, incluido cualquier texto que escribieras, pero dejan de estar vinculados a ti.</p>

    <h2>Tus derechos</h2>
    <p>Puedes pedirnos acceder a tus datos, corregirlos o exportarlos, u oponerte a cómo los usamos: escribe a <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Para corregir los datos de un rocódromo, usa Sugerir un cambio o Informar de un problema en su página. Si no te satisface nuestra respuesta, puedes presentar una queja ante la Office of the Australian Information Commissioner (oaic.gov.au), la autoridad de protección de datos de tu país en la UE o la Information Commissioner&rsquo;s Office del Reino Unido (ico.org.uk).</p>

    <h2>Menores</h2>
    <p>Bouldeer no está pensado para menores. Debes tener al menos 16 años para crear una cuenta.</p>

    <h2>Cambios</h2>
    <p>Si Bouldeer empieza a recopilar algo nuevo, actualizaremos primero esta página y cambiaremos la fecha de arriba. En los cambios importantes, también publicaremos un aviso en el sitio.</p>

    <h2>Contacto</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Consulta también los <a href="{terms}">Términos del servicio</a>.</p>
`,
  },

  terms: {
    title: 'Términos del servicio',
    metaTitle: 'Términos del servicio — Bouldeer',
    description: 'Los términos para usar Bouldeer, el mapa gratuito de rocódromos para escaladores que viajan.',
    updated: 'Última actualización: 26 de noviembre de 2026',
    body: `
    <p>Bouldeer (antes Climb Atlas) es un mapa gratuito e informativo de rocódromos para escaladores que viajan, gestionado desde Nueva Gales del Sur, Australia. No tiene relación con los rocódromos listados y no gestiona reservas ni pagos. Al usar Bouldeer aceptas estos términos. La <a href="{privacy}">Política de privacidad</a> explica cómo tratamos tus datos.</p>

    <h2>Comprueba antes de ir</h2>
    <p>Los datos de los rocódromos se investigan en fuentes públicas, como los sitios web y las cuentas de redes sociales de los propios rocódromos y los listados de mapas, y a partir de las correcciones que nos envía la gente. Pueden estar desactualizados o ser incorrectos. Comprueba con el propio rocódromo el horario, los precios y si sigue abierto. La escalada conlleva riesgos reales: escalas bajo tu propia responsabilidad y eres responsable de tu propia seguridad.</p>

    <h2>Tu cuenta</h2>
    <ul>
      <li>Debes tener al menos 16 años para crear una cuenta.</li>
      <li>No compartas tu inicio de sesión. Eres responsable de lo que se haga con tu cuenta.</li>
      <li>Puedes eliminar tu cuenta en cualquier momento desde tu página Yo (consulta <a href="{delete}">Eliminar tu cuenta</a>).</li>
      <li>Podemos suspender o eliminar las cuentas que incumplan estos términos o abusen del sitio. Normalmente te explicaremos por qué, salvo que el abuso sea grave o decírtelo pudiera causar un daño, y puedes responder a <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</li>
    </ul>

    <h2>Lo que nos envías</h2>
    <ul>
      <li>Envía solo información que creas exacta y que tengas derecho a compartir. No incluyas información personal de nadie.</li>
      <li>Nada de spam, contenido ofensivo ni información deliberadamente falsa.</li>
      <li>Conservas los derechos que tengas sobre lo que envías. Nos concedes una licencia gratuita, no exclusiva, mundial y permanente para alojar, mostrar, editar, traducir y conservar ese contenido como parte de Bouldeer, también después de que elimines tu cuenta.</li>
      <li>Los moderadores revisan los nuevos rocódromos y las ediciones, y pueden editar, rechazar o eliminar cualquier envío.</li>
    </ul>

    <h2>Uso razonable</h2>
    <p>Por favor, no extraigas ni copies en masa los datos del mapa, ni sobrecargues el sitio hasta el punto de afectar a otras personas, sin preguntarnos antes. Los buscadores y los asistentes de IA pueden leer y enlazar páginas individuales. Los datos del mapa son &copy; los colaboradores de OpenStreetMap y CARTO. Los simples hechos sobre los rocódromos, como sus direcciones, no son nuestros.</p>

    <h2>Sin garantía</h2>
    <p>Bouldeer se ofrece tal cual, sin ninguna garantía de que sea exacto o esté siempre disponible. En la medida que la ley lo permita, no somos responsables de las pérdidas derivadas de usar el sitio o de fiarse de su información. Nada de estos términos excluye los derechos que tengas conforme a la Australian Consumer Law (ley australiana de consumo) u otras leyes que no puedan excluirse. Los sitios enlazados y los servicios que usamos para mapas, alojamiento e inicio de sesión quedan fuera de nuestro control.</p>

    <h2>Traducciones</h2>
    <p>Estos términos y la Política de privacidad también están disponibles en otros idiomas. Si una traducción difiere de la versión en inglés, prevalece la versión en inglés.</p>

    <h2>Cambios y ley aplicable</h2>
    <p>Podemos actualizar estos términos. En los cambios importantes, publicaremos un aviso en el sitio al menos 14 días antes de que se apliquen. Si no estás de acuerdo, puedes dejar de usar Bouldeer y eliminar tu cuenta. Estos términos se rigen por las leyes de Nueva Gales del Sur, Australia. Esto no te quita ninguna protección que tengas según las leyes del país donde vives. Preguntas: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },

  delete: {
    title: 'Eliminar tu cuenta',
    metaTitle: 'Eliminar tu cuenta de Bouldeer',
    description: 'Cómo eliminar tu cuenta de Bouldeer, qué se elimina y qué se conserva.',
    updated: 'Última actualización: 26 de noviembre de 2026',
    body: `
    <p>Puedes eliminar tu cuenta de Bouldeer tú mismo en cualquier momento, desde el sitio web o la app. Tiene efecto al instante.</p>

    <h2>Cómo eliminar tu cuenta</h2>
    <ol>
      <li>Ve a <a href="https://www.bouldeer.com/">bouldeer.com</a> en cualquier navegador (o abre la app de Bouldeer) e inicia sesión con el correo electrónico o la cuenta de Google que usas para Bouldeer.</li>
      <li>Abre <strong>Yo</strong>.</li>
      <li>Al final de la página, elige <strong>Eliminar cuenta</strong>, marca la casilla de confirmación y pulsa el botón.</li>
    </ol>
    <p>No necesitas instalar nada: iniciar sesión en el sitio web funciona igual que en la app.</p>

    <h2>Qué se elimina</h2>
    <p>Tu correo electrónico y tus datos de inicio de sesión, tu nombre visible, los rocódromos guardados y escalados, los check-ins, el diario y los puntos.</p>

    <h2>Qué se conserva y por qué</h2>
    <p>Los rocódromos, ediciones e informes de problemas que enviaste siguen en el mapa, incluido cualquier texto que escribieras, porque otros escaladores cuentan con ellos. Dejan de estar vinculados a ti. Los registros de corta duración de nuestros proveedores caducan según sus propios plazos (Resend y CARTO conservan los registros 30 días).</p>

    <h2>Preguntas</h2>
    <p>Escribe a <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Consulta también la <a href="{privacy}">Política de privacidad</a>.</p>
`,
  },
};
