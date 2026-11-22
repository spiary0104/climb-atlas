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
    description: 'O que o Bouldeer armazena, quem pode ver, quais serviços ele usa e como excluir sua conta.',
    updated: 'Última atualização: 22 de novembro de 2026',
    body: `
    <p>O Bouldeer é um mapa pequeno e gratuito de academias de escalada para escaladores que viajam. Coletamos o mínimo possível, não usamos anúncios nem ferramentas de análise e não vendemos seus dados.</p>

    <h2>Sem conta</h2>
    <p>Você pode usar o mapa, a busca e as páginas das academias sem entrar na sua conta. O Bouldeer não define cookies e não usa rastreamento. Os serviços que entregam o site (listados abaixo) veem os dados comuns de uma requisição, como seu endereço IP e seu navegador.</p>

    <h2>Com conta</h2>
    <p>Você entra com um link enviado por e-mail ou com o Google, por meio do Supabase, nosso provedor de banco de dados e de login. Armazenamos:</p>
    <ul>
      <li>Seu endereço de e-mail (e, se você usar o Google, os dados básicos de perfil que o Google compartilha) para que você possa entrar. Ele nunca é exibido no Bouldeer.</li>
      <li>Um nome de exibição opcional, mostrado publicamente como &ldquo;adicionada por&nbsp;&hellip;&rdquo; nas academias que você adiciona.</li>
      <li>Suas academias salvas e escaladas, check-ins e diário: as academias, datas, anotações, humores e graus que você informa.</li>
      <li>O que você nos envia: novas academias, edições sugeridas e relatos de problemas, vinculados à sua conta.</li>
    </ul>

    <h2>Quem pode ver o quê</h2>
    <ul>
      <li><strong>Todos:</strong> os detalhes aprovados das academias e seu nome de exibição nas academias que você adicionou. Não coloque informações pessoais nos detalhes de uma academia.</li>
      <li><strong>Moderadores:</strong> o que você nos envia e de qual conta veio, para poderem verificar.</li>
      <li><strong>Somente você:</strong> seu e-mail, academias salvas e escaladas, check-ins, diário e pontos.</li>
    </ul>
    <p>Os dados privados são protegidos por regras de acesso do banco de dados. A pessoa que administra o Bouldeer tem acesso de administrador ao banco de dados e o usa apenas para operar e proteger o site.</p>

    <h2>Localização</h2>
    <p>O Bouldeer só pede sua localização quando você usa o botão de localizar, &ldquo;Usar minha localização&rdquo; em Adicionar uma academia, ou faz check-in pelo celular (você precisa estar a cerca de 500&nbsp;metros da academia). Seu navegador pergunta antes, e você pode recusar. Sua posição é usada no seu dispositivo e nunca é enviada a nós nem salva: um check-in registra a academia e o horário, não onde você estava.</p>

    <h2>Armazenado no seu dispositivo</h2>
    <p>Sem cookies. O armazenamento do seu navegador guarda sua sessão de login, um rascunho não enviado de Adicionar uma academia, o layout da sua lista, a última posição do mapa, buscas recentes e o idioma escolhido, uma anotação para que uma mensagem de marco apareça só uma vez por visita, e cópias offline do site, dos blocos de mapa visualizados e da lista pública de academias. Limpar os dados do site no navegador remove tudo isso.</p>

    <h2>Serviços que usamos</h2>
    <p>Cada um destes vê seu endereço IP e os dados do seu navegador e tem sua própria política de privacidade:</p>
    <ul>
      <li><strong>Supabase:</strong> banco de dados e login. Armazena os dados da sua conta e envia os e-mails de login.</li>
      <li><strong>Vercel:</strong> hospeda o site e mantém registros de requisições.</li>
      <li><strong>Google:</strong> login com o Google (somente se você escolher), Google Fonts e Google Maps quando você toca em Como chegar.</li>
      <li><strong>Amap:</strong> somente quando você escolhe abrir um endereço no Amap.</li>
      <li><strong>CARTO:</strong> blocos de mapa, baseados em dados do OpenStreetMap.</li>
      <li><strong>unpkg.com e cdn.jsdelivr.net:</strong> as bibliotecas de código do mapa e da conexão com o banco de dados.</li>
      <li><strong>Hospedagens de fotos:</strong> as fotos das academias são links, então seu navegador as carrega do site que as hospeda.</li>
    </ul>

    <h2>Excluir sua conta</h2>
    <p>Use <strong>Excluir conta</strong> no final da sua página Eu para excluir sua conta na hora, ou envie um e-mail para <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a> a partir do endereço com o qual você entra e a excluiremos em até 30 dias. Nas duas opções, isso remove seu e-mail, nome de exibição, academias salvas e escaladas, check-ins, diário e pontos. As academias, edições e relatos que você enviou permanecem, com o vínculo com você removido. As cópias nos registros e backups dos nossos provedores expiram conforme os prazos de cada um.</p>
    <p>Você também pode nos escrever para saber o que guardamos sobre você ou para corrigir esses dados. Para corrigir os detalhes de uma academia, use Sugerir edição ou Reportar problema na página dela.</p>

    <h2>Alterações</h2>
    <p>Se o Bouldeer passar a coletar algo novo, atualizaremos esta página primeiro e mudaremos a data acima.</p>

    <h2>Contato</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Veja também os <a href="{terms}">Termos de Uso</a>.</p>
`,
  },

  terms: {
    title: 'Termos de Uso',
    metaTitle: 'Termos de Uso — Bouldeer',
    description: 'Os termos para usar o Bouldeer, o mapa gratuito de academias de escalada para escaladores que viajam.',
    updated: 'Última atualização: 21 de novembro de 2026',
    body: `
    <p>O Bouldeer (antigo Climb Atlas) é um mapa gratuito e informativo de academias de escalada para escaladores que viajam. Ele não tem ligação com as academias listadas e não aceita reservas nem pagamentos. Ao usar o Bouldeer, você concorda com estes termos; a <a href="{privacy}">Política de Privacidade</a> explica como tratamos seus dados.</p>

    <h2>Confirme antes de ir</h2>
    <p>Os detalhes das academias são pesquisados em fontes públicas, como os sites e redes sociais das próprias academias e listagens de mapas, e a partir de correções que as pessoas nos enviam. Eles podem estar desatualizados ou errados. Confirme com a própria academia o horário de funcionamento, os preços e se ela ainda está aberta. A escalada envolve riscos reais: você escala por sua conta e risco e é responsável pela sua própria segurança.</p>

    <h2>Sua conta</h2>
    <ul>
      <li>Mantenha seu acesso só para você. Você é responsável pelo que for feito com a sua conta.</li>
      <li>Você pode pedir a exclusão da sua conta a qualquer momento. Podemos suspender ou remover contas que descumpram estes termos ou abusem do site.</li>
    </ul>

    <h2>O que você nos envia</h2>
    <ul>
      <li>Envie apenas informações que você acredita serem corretas e que você tem o direito de compartilhar. Não inclua informações pessoais de ninguém.</li>
      <li>Sem spam, conteúdo ofensivo ou informações deliberadamente falsas.</li>
      <li>Você permite que o Bouldeer mostre no mapa o que você envia e o mantenha lá, inclusive depois que você excluir sua conta.</li>
      <li>Os moderadores verificam as novas academias e edições e podem editar, rejeitar ou remover qualquer coisa enviada.</li>
    </ul>

    <h2>Uso justo</h2>
    <p>Por favor, não faça scraping nem cópia em massa dos dados do mapa, nem sobrecarregue o site a ponto de afetar outras pessoas, sem nos perguntar antes. Mecanismos de busca e assistentes de IA podem ler e linkar páginas individuais. O código e o design do site pertencem ao Bouldeer; fatos simples sobre as academias, como seus endereços, não são nossos.</p>

    <h2>Sem garantia</h2>
    <p>O Bouldeer é fornecido no estado em que se encontra, sem qualquer garantia de que seja preciso ou esteja sempre disponível. Na medida em que a lei permitir, não somos responsáveis por perdas decorrentes do uso do site ou da confiança em suas informações. Os sites vinculados e os serviços que usamos para mapas, hospedagem e login estão fora do nosso controle.</p>

    <h2>Traduções</h2>
    <p>Estes termos e a Política de Privacidade também estão disponíveis em outros idiomas. Se uma tradução diferir da versão em inglês, vale a versão em inglês.</p>

    <h2>Alterações e lei aplicável</h2>
    <p>Podemos atualizar estes termos; a data acima mostra a versão mais recente. Estes termos são regidos pelas leis de Nova Gales do Sul (New South Wales), Austrália. Dúvidas: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },
};
