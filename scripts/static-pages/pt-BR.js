// Sobre, Política de Privacidade e Termos de Uso em português do Brasil. Segue scripts/static-pages/en.js (mesma forma, mesmas chaves).
// O corpo dos textos é HTML: mantenha as tags, href, mailto e os nomes de serviços; traduza apenas as palavras.
module.exports = {
  ui: {
    skip: 'Ir para o conteúdo',
    back: 'Voltar ao mapa',
    about: 'Sobre',
    privacy: 'Privacidade',
    terms: 'Termos',
    contact: 'Contato',
    languages: 'Idiomas',
    translationNote: 'Esta é uma tradução; se ela diferir da versão em inglês, vale a versão em inglês.',
  },

  about: {
    title: 'Sobre o Bouldeer',
    metaTitle: 'Sobre — Bouldeer',
    description: 'O Bouldeer é um mapa gratuito de academias de escalada indoor para escaladores que viajam: mais de 3600 academias de boulder, top rope e guiada em mais de 80 países, em 9 idiomas.',
    body: `
    <p class="lede t-text-lg">O Bouldeer é um mapa gratuito de academias de escalada indoor para escaladores que viajam. Onde quer que você chegue, ele mostra os muros de boulder, top rope e guiada por perto: mais de 3600 academias em mais de 80 países, cada uma com endereço, tipos de escalada e como chegar, além de preços da diária e horários de funcionamento quando os confirmamos.</p>

    <h2>Feito para escalar na estrada</h2>
    <ul>
      <li><strong>Encontre um muro antes de arrumar a mala.</strong> Busque por cidade, país ou nome da academia, ou abra o mapa onde você estiver, e filtre por boulder, top rope ou guiada.</li>
      <li><strong>Busque na escrita local.</strong> Digite 成都, 東京 ou 서울 com a mesma facilidade que Chengdu, Tóquio ou Seul. Quando uma academia tem nome no próprio idioma, o Bouldeer o mostra ao lado do nome em inglês.</li>
      <li><strong>Chegue lá sem um idioma em comum.</strong> Muitas academias mostram o endereço na escrita local para você mostrar ao motorista de táxi, com botão de copiar e rotas no Google Maps, ou no Amap na China continental.</li>
      <li><strong>Leia no seu idioma.</strong> O Bouldeer está disponível em inglês, chinês simplificado e tradicional, japonês, coreano, alemão, francês, espanhol e português do Brasil.</li>
      <li><strong>Guarde suas viagens.</strong> Entre na sua conta para salvar academias, marcar as que você já escalou, fazer check-in para ganhar um carimbo de passaporte por cidade e manter um diário das suas sessões.</li>
    </ul>

    <h2>De onde vêm as informações</h2>
    <p>Cada academia é pesquisada uma a uma a partir do próprio site e das redes sociais dela e de listagens públicas de mapas, e é verificada antes de aparecer no mapa. Quando não confirmamos um detalhe, como um preço ou o horário de funcionamento, o Bouldeer diz isso em vez de adivinhar. Se algo estiver desatualizado, <strong>Sugerir edição</strong> ou <strong>Reportar problema</strong> na página da academia nos avisa, e toda correção é verificada antes de ir ao ar.</p>

    <h2>Para quem é</h2>
    <p>Escaladores que viajam: de férias, a trabalho, numa viagem longa por vários países ou recém-chegados a uma cidade. Você não precisa de uma conta para usar o mapa.</p>
`,
    faqTitle: 'Perguntas',
    faq: [
      ['O que é o Bouldeer?', 'O Bouldeer é um site e aplicativo web gratuito que mapeia academias de escalada indoor no mundo todo, feito para escaladores que viajam. Ele lista mais de 3600 academias de boulder, top rope e guiada em mais de 80 países.'],
      ['Como encontro uma academia de boulder quando viajo?', 'Abra www.bouldeer.com, busque a cidade que você vai visitar (em inglês ou na escrita local) ou use sua localização, e filtre por boulder. A página de cada academia mostra o endereço, como chegar e, quando confirmados, os preços da diária e os horários de funcionamento.'],
      ['O Bouldeer é gratuito?', 'Sim. O Bouldeer é gratuito, não exibe anúncios e não exige conta para usar o mapa. Só é preciso ter uma conta para salvar academias, fazer check-in e manter um diário.'],
      ['Quais países o Bouldeer cobre?', 'Mais de 80 países em todos os continentes, com mais academias nos Estados Unidos, na China, no Japão, na Alemanha, na França, no Reino Unido, na Coreia do Sul, no Canadá, na Espanha e na Austrália.'],
      ['Dá para encontrar academias de escalada na China?', 'Sim. O Bouldeer lista quase 500 academias de escalada em mais de 40 cidades chinesas, muitas com nome e endereço em chinês e um link para abrir o endereço no Amap.'],
      ['O Bouldeer vende diárias ou aceita reservas?', 'Não. O Bouldeer não tem ligação com as academias que lista e não aceita reservas nem pagamentos. Compre as entradas e reserve direto com a academia.'],
      ['Os preços e horários estão atualizados?', 'O Bouldeer mostra apenas os detalhes que confirmou e marca o restante como ainda não confirmado. As academias mudam seus horários e preços, então confirme com a academia antes de ir.'],
      ['Em quais idiomas o Bouldeer está disponível?', 'Inglês, chinês simplificado, chinês tradicional, japonês, coreano, alemão, francês, espanhol e português do Brasil.'],
    ],
    contact: `
    <h2>Contato</h2>
    <p>Dúvidas ou correções: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Como tratamos seus dados: <a href="{privacy}">Privacidade</a> e <a href="{terms}">Termos</a>.</p>
`,
  },

  privacy: {
    title: 'Política de Privacidade',
    metaTitle: 'Política de Privacidade — Bouldeer',
    description: 'O que o Bouldeer armazena, quem pode ver, onde os dados são processados e como excluir sua conta.',
    updated: 'Última atualização: 27 de novembro de 2026',
    body: `
    <p>O Bouldeer é um mapa pequeno e gratuito de academias de escalada para escaladores que viajam, administrado a partir de Nova Gales do Sul, na Austrália. Coletamos o mínimo possível. Não exibimos anúncios, não usamos ferramentas de análise e não vendemos nem compartilhamos seus dados para fins de publicidade.</p>

    <h2>Sem conta</h2>
    <p>Você pode usar o mapa, a busca e as páginas das academias sem entrar na sua conta. O Bouldeer não define cookies e não rastreia você. Os serviços que entregam o site (listados abaixo) veem os dados comuns de uma requisição, como seu endereço IP e seu navegador.</p>

    <h2>Com conta</h2>
    <p>Você precisa ter pelo menos 16 anos para criar uma conta. Você entra com um link enviado por e-mail ou com o Google, por meio do nosso provedor de login, o Supabase. Armazenamos:</p>
    <ul>
      <li>Seu endereço de e-mail, para que você possa entrar. Se você usar o Google, o Google também compartilha seu perfil básico (nome e foto de perfil) com nosso provedor de login. Nada disso é exibido no Bouldeer.</li>
      <li>Um nome de exibição opcional.</li>
      <li>Suas academias salvas e escaladas, check-ins (a academia, o horário e uma nota curta ou link de foto opcionais) e seu diário (datas, vias, graus, humores e anotações).</li>
      <li>O que você nos envia: novas academias, edições sugeridas e relatos de problemas, vinculados à sua conta.</li>
    </ul>
    <p>Usamos isso para operar sua conta e os recursos que você escolhe. Também usamos para verificar e publicar informações das academias e para manter o site livre de abusos.</p>

    <h2>Quem pode ver o quê</h2>
    <ul>
      <li><strong>Todos:</strong> os detalhes aprovados das academias e seu nome de exibição nas academias que você adicionou (mostrado como &ldquo;adicionada por&nbsp;&hellip;&rdquo;). Os nomes de exibição não aparecem listados em nenhum outro lugar: só você e os moderadores podem ler seu perfil. Não coloque informações pessoais nos detalhes de uma academia.</li>
      <li><strong>Moderadores:</strong> o que você nos envia, o nome de exibição da conta que enviou e os pontos de contribuição, para poderem verificar os envios. Eles nunca veem seu e-mail.</li>
      <li><strong>Somente você:</strong> seu e-mail, academias salvas e escaladas, check-ins e diário.</li>
    </ul>
    <p>Os dados privados são protegidos por regras de acesso do banco de dados e trafegam criptografados (HTTPS). A pessoa que administra o Bouldeer tem acesso de administrador ao banco de dados e o usa apenas para operar e proteger o site.</p>

    <h2>Localização</h2>
    <p>O Bouldeer só pede sua localização quando você usa o botão de localizar, &ldquo;Usar minha localização&rdquo; em Adicionar academia, ou faz check-in pelo celular (você precisa estar a cerca de 500&nbsp;metros da academia). Seu navegador pergunta antes, e você pode recusar.</p>
    <ul>
      <li><strong>Botão de localizar e check-in:</strong> sua posição é usada somente no seu dispositivo. Ela nunca é enviada para nós nem salva. Um check-in registra a academia e o horário, não onde você estava.</li>
      <li><strong>Adicionar academia:</strong> &ldquo;Usar minha localização&rdquo; move o marcador para onde você está. O marcador que você envia chega até nós como a localização da academia e é publicado depois de aprovado, então coloque-o primeiro sobre a academia.</li>
    </ul>

    <h2>Armazenado no seu dispositivo</h2>
    <p>Sem cookies. O armazenamento do seu navegador guarda:</p>
    <ul>
      <li>sua sessão de login;</li>
      <li>um rascunho não enviado de Adicionar academia, incluindo a posição do marcador;</li>
      <li>o layout da sua lista, a última visualização do mapa, buscas recentes e o idioma escolhido;</li>
      <li>anotações para que a introdução e as mensagens de boas-vindas e de marco apareçam só uma vez;</li>
      <li>cópias offline do site, das imagens do mapa que você viu e da lista pública de academias.</li>
    </ul>
    <p>Sair da conta ou excluí-la encerra sua sessão. Limpar os dados do site no navegador remove todo o resto.</p>

    <h2>Onde seus dados são processados</h2>
    <p>Os dados da sua conta são armazenados em Singapura. Nossos provedores também processam dados nos Estados Unidos e em outros países. Cada um tem sua própria política de privacidade:</p>
    <ul>
      <li><strong>Supabase:</strong> banco de dados e login; os dados da sua conta ficam armazenados em Singapura.</li>
      <li><strong>Resend:</strong> envia os e-mails de login, então vê seu e-mail. Armazena dados nos Estados Unidos e mantém registros de e-mail por 30 dias.</li>
      <li><strong>Vercel:</strong> hospeda o site no mundo todo e mantém registros de requisições.</li>
      <li><strong>CARTO:</strong> imagens de mapa, baseadas em dados do OpenStreetMap. Encurta os endereços IP e mantém seus registros por 30 dias nos Estados Unidos.</li>
      <li><strong>Google:</strong> login com o Google (somente se você escolher), Google Fonts e Google Maps quando você toca em Como chegar.</li>
      <li><strong>Amap:</strong> somente quando você escolhe abrir um endereço no Amap.</li>
      <li><strong>unpkg.com e cdn.jsdelivr.net:</strong> as bibliotecas de código do mapa e da conexão com o banco de dados.</li>
      <li><strong>Hospedagens de fotos:</strong> as fotos das academias são links, então seu navegador as carrega do site que as hospeda.</li>
    </ul>

    <h2>Por quanto tempo guardamos os dados</h2>
    <ul>
      <li><strong>Dados da conta:</strong> até você excluir sua conta.</li>
      <li><strong>Academias, edições e relatos que você enviou:</strong> permanecem como parte do mapa. Depois que você exclui sua conta, deixam de estar vinculados a você.</li>
      <li><strong>Registros dos provedores:</strong> o Resend e o CARTO mantêm registros por 30 dias. A Vercel e o Supabase mantêm registros de requisições por períodos que eles definem.</li>
    </ul>

    <h2>Excluir sua conta</h2>
    <p>Use <strong>Excluir conta</strong> no final da sua página Eu para excluir sua conta na hora. Você pode fazer isso em qualquer navegador em bouldeer.com: entre na sua conta, abra Eu e escolha Excluir conta. Os passos também estão em <a href="{delete}">Excluir sua conta</a>.</p>
    <p>A exclusão remove seu e-mail, nome de exibição, academias salvas e escaladas, check-ins, diário e pontos. As academias, edições e relatos que você enviou permanecem no mapa, inclusive qualquer texto que você escreveu, mas deixam de estar vinculados a você.</p>

    <h2>Seus direitos</h2>
    <p>Você pode pedir para acessar, corrigir ou exportar seus dados, ou se opor ao uso que fazemos deles: escreva para <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Para corrigir os detalhes de uma academia, use Sugerir edição ou Reportar problema na página dela. Se você não ficar satisfeito com nossa resposta, pode reclamar ao Office of the Australian Information Commissioner (oaic.gov.au), à autoridade de proteção de dados do seu país na UE ou ao Information Commissioner&rsquo;s Office do Reino Unido (ico.org.uk).</p>

    <h2>Crianças</h2>
    <p>O Bouldeer não foi feito para crianças. Você precisa ter pelo menos 16 anos para criar uma conta.</p>

    <h2>Alterações</h2>
    <p>Se o Bouldeer passar a coletar qualquer coisa nova, atualizaremos esta página primeiro e mudaremos a data acima. Em alterações importantes, também publicaremos um aviso no site.</p>

    <h2>Contato</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Veja também os <a href="{terms}">Termos de Serviço</a>.</p>
`,
  },

  terms: {
    title: 'Termos de Serviço',
    metaTitle: 'Termos de Serviço — Bouldeer',
    description: 'Os termos para usar o Bouldeer, o mapa gratuito de academias de escalada para escaladores que viajam.',
    updated: 'Última atualização: 26 de novembro de 2026',
    body: `
    <p>O Bouldeer (antes Climb Atlas) é um mapa gratuito e informativo de academias de escalada para escaladores que viajam, administrado a partir de Nova Gales do Sul, na Austrália. Ele não tem ligação com as academias listadas e não faz reservas nem recebe pagamentos. Ao usar o Bouldeer, você concorda com estes termos. A <a href="{privacy}">Política de Privacidade</a> explica como tratamos seus dados.</p>

    <h2>Confirme antes de ir</h2>
    <p>Os detalhes das academias são pesquisados em fontes públicas, como os sites e as contas de redes sociais das próprias academias e listagens de mapas, e em correções que as pessoas nos enviam. Eles podem estar desatualizados ou errados. Confirme com a própria academia o horário de funcionamento, os preços e se ela ainda está aberta. A escalada envolve riscos reais: você escala por sua conta e risco e é responsável pela sua própria segurança.</p>

    <h2>Sua conta</h2>
    <ul>
      <li>Você precisa ter pelo menos 16 anos para criar uma conta.</li>
      <li>Mantenha seu login só para você. Você é responsável pelo que for feito com sua conta.</li>
      <li>Você pode excluir sua conta a qualquer momento na sua página Eu (veja <a href="{delete}">Excluir sua conta</a>).</li>
      <li>Podemos suspender ou remover contas que violem estes termos ou abusem do site. Em geral, diremos o motivo, a menos que o abuso seja grave ou que contar possa causar dano, e você pode responder para <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</li>
    </ul>

    <h2>O que você nos envia</h2>
    <ul>
      <li>Envie apenas informações que você acredite serem corretas e que tenha o direito de compartilhar. Não inclua informações pessoais de ninguém.</li>
      <li>Nada de spam, conteúdo ofensivo ou informações deliberadamente falsas.</li>
      <li>Você mantém os direitos que tiver sobre o que envia. Você nos concede uma licença gratuita, não exclusiva, mundial e permanente para hospedar, exibir, editar, traduzir e guardar esse conteúdo como parte do Bouldeer, inclusive depois que você excluir sua conta.</li>
      <li>Os moderadores verificam novas academias e edições e podem editar, rejeitar ou remover qualquer envio.</li>
    </ul>

    <h2>Uso justo</h2>
    <p>Por favor, não extraia nem copie em massa os dados do mapa, nem sobrecarregue o site a ponto de afetar outras pessoas, sem nos perguntar antes. Mecanismos de busca e assistentes de IA podem ler e linkar páginas individuais. Os dados do mapa são &copy; colaboradores do OpenStreetMap e CARTO. Fatos simples sobre as academias, como seus endereços, não são nossos.</p>

    <h2>Sem garantia</h2>
    <p>O Bouldeer é oferecido como está, sem nenhuma garantia de que seja preciso ou esteja sempre disponível. Na medida em que a lei permitir, não somos responsáveis por perdas decorrentes do uso do site ou da confiança em suas informações. Nada nestes termos exclui direitos que você tenha segundo a Australian Consumer Law (lei australiana de defesa do consumidor) ou outras leis que não possam ser excluídos. Sites vinculados e os serviços que usamos para mapas, hospedagem e login estão fora do nosso controle.</p>

    <h2>Traduções</h2>
    <p>Estes termos e a Política de Privacidade também estão disponíveis em outros idiomas. Se uma tradução diferir da versão em inglês, vale a versão em inglês.</p>

    <h2>Alterações e lei aplicável</h2>
    <p>Podemos atualizar estes termos. Em alterações importantes, publicaremos um aviso no site pelo menos 14 dias antes de elas passarem a valer. Se você não concordar, pode parar de usar o Bouldeer e excluir sua conta. Estes termos são regidos pelas leis de Nova Gales do Sul, Austrália. Isso não retira nenhuma proteção que você tenha segundo as leis do país onde mora. Dúvidas: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },

  delete: {
    title: 'Excluir sua conta',
    metaTitle: 'Excluir sua conta do Bouldeer',
    description: 'Como excluir sua conta do Bouldeer, o que é excluído e o que permanece.',
    updated: 'Última atualização: 26 de novembro de 2026',
    body: `
    <p>Você pode excluir sua conta do Bouldeer por conta própria a qualquer momento, pelo site ou pelo app. A exclusão vale na hora.</p>

    <h2>Como excluir sua conta</h2>
    <ol>
      <li>Acesse <a href="https://www.bouldeer.com/">bouldeer.com</a> em qualquer navegador (ou abra o app do Bouldeer) e entre com o e-mail ou a conta do Google que você usa no Bouldeer.</li>
      <li>Abra <strong>Eu</strong>.</li>
      <li>No final da página, escolha <strong>Excluir conta</strong>, marque a caixa de confirmação e toque no botão.</li>
    </ol>
    <p>Você não precisa instalar nada: entrar pelo site funciona do mesmo jeito que no app.</p>

    <h2>O que é excluído</h2>
    <p>Seu e-mail e dados de login, nome de exibição, academias salvas e escaladas, check-ins, diário e pontos.</p>

    <h2>O que permanece, e por quê</h2>
    <p>As academias, edições e relatos de problemas que você enviou permanecem no mapa, inclusive qualquer texto que você escreveu, porque outros escaladores contam com eles. Eles deixam de estar vinculados a você. Os registros temporários dos nossos provedores expiram conforme os prazos de cada um (o Resend e o CARTO mantêm registros por 30 dias).</p>

    <h2>Dúvidas</h2>
    <p>Escreva para <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Veja também a <a href="{privacy}">Política de Privacidade</a>.</p>
`,
  },
};
