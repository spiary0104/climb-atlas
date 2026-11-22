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
    description: 'Qué guarda Bouldeer, quién puede verlo, qué servicios usa y cómo eliminar tu cuenta.',
    updated: 'Última actualización: 22 de noviembre de 2026',
    body: `
    <p>Bouldeer es un pequeño mapa gratuito de rocódromos para escaladores que viajan. Recopilamos lo mínimo posible, no usamos publicidad ni analítica y no vendemos tus datos.</p>

    <h2>Sin cuenta</h2>
    <p>Puedes usar el mapa, la búsqueda y las páginas de los rocódromos sin iniciar sesión. Bouldeer no instala cookies ni usa rastreo. Los servicios que entregan el sitio (listados más abajo) ven los datos habituales de una solicitud, como tu dirección IP y tu navegador.</p>

    <h2>Con cuenta</h2>
    <p>Inicias sesión con un enlace por correo electrónico o con Google, a través de Supabase, nuestro proveedor de base de datos e inicio de sesión. Guardamos:</p>
    <ul>
      <li>Tu dirección de correo electrónico (y, si usas Google, los datos básicos de perfil que Google comparte) para que puedas iniciar sesión. Nunca se muestra en Bouldeer.</li>
      <li>Un nombre visible opcional, que se muestra públicamente como &ldquo;añadido por&nbsp;&hellip;&rdquo; en los rocódromos que añades.</li>
      <li>Tus rocódromos guardados y escalados, tus check-ins y tu diario: los rocódromos, fechas, notas, estados de ánimo y grados que introduces.</li>
      <li>Lo que nos envías: nuevos rocódromos, ediciones sugeridas e informes de problemas, vinculados a tu cuenta.</li>
    </ul>

    <h2>Quién puede ver qué</h2>
    <ul>
      <li><strong>Todo el mundo:</strong> los datos aprobados de los rocódromos y tu nombre visible en los rocódromos que añadiste. No pongas información personal en los datos de un rocódromo.</li>
      <li><strong>Moderadores:</strong> lo que nos envías y desde qué cuenta, para poder revisarlo.</li>
      <li><strong>Solo tú:</strong> tu correo electrónico, tus rocódromos guardados y escalados, check-ins, diario y puntos.</li>
    </ul>
    <p>Los datos privados están protegidos por reglas de acceso de la base de datos. La persona que gestiona Bouldeer tiene acceso de administrador a la base de datos y lo usa solo para operar y proteger el sitio.</p>

    <h2>Ubicación</h2>
    <p>Bouldeer solo te pide la ubicación cuando usas el botón de localizar, &ldquo;Usar mi ubicación&rdquo; en Añadir un rocódromo, o haces check-in desde un teléfono (tienes que estar a menos de unos 500&nbsp;metros del rocódromo). Tu navegador te lo pregunta antes y puedes decir que no. Tu posición se usa en tu dispositivo y nunca se nos envía ni se guarda: un check-in registra el rocódromo y la hora, no dónde estabas.</p>

    <h2>Guardado en tu dispositivo</h2>
    <p>Sin cookies. El almacenamiento de tu navegador conserva tu sesión, un borrador sin enviar de Añadir un rocódromo, el diseño de tu lista, la última posición del mapa, tus búsquedas recientes y el idioma que elegiste, una nota para que un mensaje de hito se muestre una sola vez por visita, y copias sin conexión del sitio, de las teselas de mapa que has visto y de la lista pública de rocódromos. Si borras los datos del sitio en tu navegador, se elimina todo ello.</p>

    <h2>Servicios que usamos</h2>
    <p>Cada uno de ellos ve tu dirección IP y los datos de tu navegador y tiene su propia política de privacidad:</p>
    <ul>
      <li><strong>Supabase:</strong> base de datos e inicio de sesión. Guarda los datos de tu cuenta y envía los correos de inicio de sesión.</li>
      <li><strong>Vercel:</strong> aloja el sitio y conserva registros de las solicitudes.</li>
      <li><strong>Google:</strong> inicio de sesión con Google (solo si lo eliges), Google Fonts y Google Maps cuando tocas Cómo llegar.</li>
      <li><strong>Amap:</strong> solo cuando eliges abrir una dirección en Amap.</li>
      <li><strong>CARTO:</strong> teselas de mapa, basadas en datos de OpenStreetMap.</li>
      <li><strong>unpkg.com y cdn.jsdelivr.net:</strong> las bibliotecas de código para el mapa y la conexión con la base de datos.</li>
      <li><strong>Alojamientos de fotos:</strong> las fotos de los rocódromos son enlaces, así que tu navegador las carga desde el sitio que las aloja.</li>
    </ul>

    <h2>Eliminar tu cuenta</h2>
    <p>Usa <strong>Eliminar cuenta</strong> al final de tu página Yo para eliminar tu cuenta al instante, o escribe a <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a> desde la dirección con la que inicias sesión y la eliminaremos en un plazo de 30 días. En ambos casos, esto borra tu correo electrónico, tu nombre visible, tus rocódromos guardados y escalados, check-ins, diario y puntos. Los rocódromos, ediciones e informes que enviaste se conservan, sin el vínculo contigo. Las copias en los registros y copias de seguridad de nuestros proveedores caducan según sus propios plazos.</p>
    <p>También puedes escribirnos para preguntar qué datos tenemos sobre ti o para que los corrijamos. Para corregir los datos de un rocódromo, usa Sugerir un cambio o Informar de un problema en su página.</p>

    <h2>Cambios</h2>
    <p>Si Bouldeer empieza a recopilar algo nuevo, actualizaremos primero esta página y cambiaremos la fecha de arriba.</p>

    <h2>Contacto</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Consulta también los <a href="{terms}">Términos de servicio</a>.</p>
`,
  },

  terms: {
    title: 'Términos de servicio',
    metaTitle: 'Términos de servicio — Bouldeer',
    description: 'Los términos para usar Bouldeer, el mapa gratuito de rocódromos para escaladores que viajan.',
    updated: 'Última actualización: 21 de noviembre de 2026',
    body: `
    <p>Bouldeer (antes Climb Atlas) es un mapa gratuito e informativo de rocódromos para escaladores que viajan. No tiene relación con los rocódromos listados y no gestiona reservas ni pagos. Al usar Bouldeer aceptas estos términos; la <a href="{privacy}">Política de privacidad</a> explica cómo tratamos tus datos.</p>

    <h2>Comprueba antes de ir</h2>
    <p>Los datos de los rocódromos se investigan a partir de fuentes públicas, como los sitios web y las redes sociales de los propios rocódromos y las fichas de mapas, y de las correcciones que la gente nos envía. Pueden estar desactualizados o ser incorrectos. Consulta con el propio rocódromo sus horarios, sus precios y si sigue abierto. La escalada conlleva riesgos reales: escalas bajo tu propio riesgo y eres responsable de tu propia seguridad.</p>

    <h2>Tu cuenta</h2>
    <ul>
      <li>No compartas tus datos de acceso. Eres responsable de lo que se haga con tu cuenta.</li>
      <li>Puedes pedirnos que eliminemos tu cuenta en cualquier momento. Podemos suspender o eliminar cuentas que incumplan estos términos o abusen del sitio.</li>
    </ul>

    <h2>Lo que nos envías</h2>
    <ul>
      <li>Envía solo información que creas exacta y que tengas derecho a compartir. No incluyas información personal de nadie.</li>
      <li>Nada de spam, contenido ofensivo ni información deliberadamente falsa.</li>
      <li>Permites que Bouldeer muestre en el mapa lo que envías y lo mantenga allí, incluso después de que elimines tu cuenta.</li>
      <li>Los moderadores revisan los nuevos rocódromos y las ediciones, y pueden editar, rechazar o eliminar cualquier envío.</li>
    </ul>

    <h2>Uso razonable</h2>
    <p>Por favor, no extraigas ni copies en masa los datos del mapa, ni sobrecargues el sitio hasta el punto de afectar a otras personas, sin preguntarnos antes. Los buscadores y los asistentes de IA pueden leer y enlazar páginas individuales. El código y el diseño del sitio pertenecen a Bouldeer; los simples hechos sobre los rocódromos, como sus direcciones, no son algo de lo que podamos ser propietarios.</p>

    <h2>Sin garantía</h2>
    <p>Bouldeer se ofrece tal cual, sin ninguna garantía de que sea exacto o esté siempre disponible. En la medida que la ley lo permita, no somos responsables de las pérdidas derivadas de usar el sitio o de fiarse de su información. Los sitios enlazados y los servicios que usamos para mapas, alojamiento e inicio de sesión quedan fuera de nuestro control.</p>

    <h2>Traducciones</h2>
    <p>Estos términos y la Política de privacidad también están disponibles en otros idiomas. Si una traducción difiere de la versión en inglés, prevalece la versión en inglés.</p>

    <h2>Cambios y ley aplicable</h2>
    <p>Podemos actualizar estos términos; la fecha de arriba indica la versión más reciente. Estos términos se rigen por las leyes de Nueva Gales del Sur (New South Wales), Australia. Preguntas: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },
};
