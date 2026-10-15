import type { Topic } from '../../../types'

export const navegador: Topic[] = [
{ id: 'navegador-pipeline', stage: 'navegador', level: 'essencial', title: 'Da URL ao pixel', short: 'URL ao pixel',
  resumo: `Tudo o que acontece entre digitar um endereço e ver a página pronta.`,
  porque: `É a pergunta clássica de entrevista porque conecta rede, backend e renderização. Saber cada etapa ajuda a descobrir onde uma página lenta está perdendo tempo e com qual time conversar.`,
  como: [
    `<b>Rede</b>: resolução DNS, conexão TCP (ou QUIC), handshake TLS, requisição HTTP e espera pela resposta (TTFB). Redirecionamentos e cadeias de requisições somam idas e voltas. O navegador começa a processar o HTML assim que os primeiros bytes chegam, sem esperar o documento inteiro.`,
    `<b>Renderização</b>: o HTML vira <b>DOM</b>, o CSS vira <b>CSSOM</b>, os dois formam a <b>render tree</b>, depois vêm <b>layout</b> (posição e tamanho), <b>paint</b> (pixels de cada camada) e <b>composite</b> (juntar as camadas, muitas vezes na GPU). Scripts síncronos pausam o parser; CSS bloqueia a renderização.`,
    `Navegadores modernos usam vários processos: um por site (isolamento de segurança), um para a GPU e um para a rede. Dentro do processo de renderização, a <b>thread principal</b> faz quase tudo: parse, estilo, layout e JavaScript.`,
  ],
  conecta: [['backend/dns', 'O primeiro passo de toda navegação.'], ['backend/https-tls', 'O handshake que antecede a primeira resposta.'], ['critical-rendering-path', 'O detalhe da parte de renderização.'], ['core-web-vitals', 'Como medir a experiência resultante.']],
  front: `A aba Network (cascata de requisições) e a aba Performance (atividade da thread principal) mostram exatamente essas etapas na sua própria aplicação.`,
  ex: { lang: 'texto', code: `DNS ─ TCP ─ TLS ─ Requisição ─ TTFB ─ Download do HTML
                                        │
          parse HTML → DOM ─────────────┤
          CSS → CSSOM ──────────────────┤
                                        ▼
                     render tree → layout → paint → composite
                                        ▲
          JS síncrono pausa o parser ───┘` },
  docs: [['web.dev · How browsers work', 'https://web.dev/articles/howbrowserswork'], ['Chrome · Inside look at modern web browser', 'https://developer.chrome.com/blog/inside-browser-part1'], ['MDN · Populating the page: how browsers work', 'https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work']],
  perguntas: [`Em qual etapa a página principal do seu produto perde mais tempo?`, `Por que um script síncrono no head atrasa a primeira pintura?`, `O que acontece de diferente quando você visita o site pela segunda vez?`] },

{ id: 'critical-rendering-path', stage: 'navegador', level: 'essencial', title: 'Critical rendering path', short: 'CRP',
  resumo: `Os recursos e passos mínimos até a primeira pintura, e como encurtá-los.`,
  porque: `Uma página pode ter 3 MB e aparecer rápido, ou ter 300 KB e demorar, dependendo de quais recursos bloqueiam a renderização. Otimizar o caminho crítico é o que mais melhora o FCP e o LCP.`,
  como: [
    `<b>CSS bloqueia a renderização</b>: o navegador não pinta sem o CSSOM. <b>JavaScript síncrono bloqueia o parser</b> e ainda espera o CSS anterior. Por isso: CSS crítico pequeno (ou inline), scripts com <code>defer</code> ou <code>type="module"</code> (que já é deferido), e <code>async</code> só para scripts independentes, como analytics.`,
    `<b>Resource hints</b> ajudam o navegador a descobrir cedo o que importa: <code>preconnect</code> para origens de terceiros, <code>preload</code> para a imagem de LCP ou a fonte principal, e <code>fetchpriority="high"</code> na imagem mais importante. O preload scanner do navegador já encontra recursos no HTML; o problema são os escondidos dentro de CSS ou JS.`,
  ],
  conecta: [['navegador-pipeline', 'A parte de renderização do caminho.'], ['core-web-vitals', 'FCP e LCP dependem do caminho crítico.'], ['imagens-fontes', 'Fontes e imagens costumam estar no caminho crítico.'], ['carregamento', 'Dividir o JS reduz o que bloqueia.']],
  front: `Aplicações SPA costumam ter o pior caminho crítico possível: HTML vazio, um JS grande e só então uma requisição de dados. Por isso o SSR e o streaming existem.`,
  ex: { lang: 'html', code: `<head>
  <!-- conexão antecipada com a origem das imagens -->
  <link rel="preconnect" href="https://img.loja.com" />
  <!-- a imagem de LCP é buscada cedo e com prioridade -->
  <link rel="preload" as="image" href="/hero.avif" fetchpriority="high" />
  <!-- CSS crítico pequeno; o resto carrega depois -->
  <link rel="stylesheet" href="/critico.css" />
  <!-- módulo: não bloqueia o parser, executa na ordem -->
  <script type="module" src="/app.js"></script>
  <!-- independente: executa assim que chegar -->
  <script async src="https://analytics.exemplo.com/a.js"></script>
</head>` },
  docs: [['web.dev · Critical rendering path', 'https://web.dev/articles/critical-rendering-path'], ['web.dev · Fetch priority', 'https://web.dev/articles/fetch-priority'], ['MDN · rel=preload', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload']],
  perguntas: [`Qual a diferença entre defer e async?`, `Por que o CSS bloqueia a renderização?`, `Que recurso do seu site o navegador só descobre tarde?`] },

{ id: 'event-loop-browser', stage: 'navegador', level: 'essencial', title: 'Event loop e a thread principal', short: 'Main thread',
  resumo: `Por que um JavaScript pesado congela a página, e como evitar.`,
  porque: `Cliques que demoram a responder (INP ruim) quase sempre vêm de tarefas longas na thread principal. Entender o event loop é o que separa "adicionar um setTimeout até funcionar" de resolver o problema.`,
  como: [
    `A thread principal executa uma <b>tarefa</b> por vez (eventos, timers, mensagens). Depois de cada tarefa, roda todas as <b>microtarefas</b> (promises) e, quando é hora de um quadro, executa <code>requestAnimationFrame</code>, estilo, layout e pintura. Uma tarefa acima de <b>50 ms</b> é considerada longa: durante ela, nenhum clique é processado e nada é pintado.`,
    `Para manter a página responsiva: quebre trabalho grande em pedaços e <b>ceda a thread</b> entre eles (<code>scheduler.yield()</code> onde disponível, ou <code>setTimeout</code>), mova cálculo pesado para <b>Web Workers</b>, evite <b>layout thrashing</b> (ler e escrever medidas alternadamente) e adie o que não é urgente com <code>requestIdleCallback</code>.`,
  ],
  conecta: [['backend/async', 'O mesmo modelo de event loop do Node.'], ['perf-runtime', 'Otimizar o que roda na thread principal.'], ['core-web-vitals', 'INP mede a responsividade.'], ['backend/threads', 'Workers são threads com memória isolada.']],
  front: `Microtarefas encadeadas sem fim também travam a página: uma promise que agenda outra promise nunca deixa o navegador pintar.`,
  ex: { lang: 'javascript', code: `// trabalho grande quebrado em pedaços, cedendo a thread entre eles
async function processar(itens) {
  for (let i = 0; i < itens.length; i++) {
    calcular(itens[i]);
    if (i % 100 === 0) await ceder();   // deixa cliques e pinturas acontecerem
  }
}

const ceder = () =>
  globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r, 0));

console.log("1 síncrono");
setTimeout(() => console.log("4 tarefa"), 0);
Promise.resolve().then(() => console.log("3 microtarefa"));
console.log("2 síncrono");` },
  docs: [['MDN · Event loop', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop'], ['web.dev · Optimize long tasks', 'https://web.dev/articles/optimize-long-tasks'], ['Jake Archibald · In The Loop (vídeo)', 'https://www.youtube.com/watch?v=cCOL7MC4Pl0']],
  perguntas: [`Em que ordem os quatro console.log do exemplo aparecem, e por quê?`, `O que é layout thrashing?`, `Que cálculo do seu app poderia ir para um Web Worker?`] },

{ id: 'storage-browser', stage: 'navegador', level: 'importante', title: 'Armazenamento no navegador', short: 'Storage',
  resumo: `Cookies, localStorage, sessionStorage, IndexedDB e Cache API: o que usar para quê.`,
  porque: `Guardar token no lugar errado abre brechas de segurança; guardar muito dado no lugar errado trava a interface. Cada mecanismo tem limites, escopo e implicações diferentes.`,
  como: [
    `<b>Cookies</b>: pequenos (~4 KB), enviados automaticamente ao servidor, controlados por flags (<code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>). Ideais para sessão. <b>localStorage</b> e <b>sessionStorage</b>: chave-valor de texto, síncronos (bloqueiam a thread), alguns MB, acessíveis por qualquer script da página. <b>IndexedDB</b>: banco assíncrono para volumes maiores e dados estruturados. <b>Cache API</b>: respostas HTTP inteiras, usada com Service Workers.`,
    `Todos são separados por origem e podem ser apagados pelo navegador (pressão de espaço, modo privado, políticas de privacidade como o ITP do Safari). Nunca trate armazenamento local como fonte da verdade.`,
  ],
  conecta: [['backend/autenticacao', 'Onde guardar sessão e tokens.'], ['service-workers', 'Cache API e IndexedDB permitem uso offline.'], ['backend/owasp', 'Dados acessíveis por script ficam expostos a XSS.'], ['seguranca/tokens-sessoes', 'Ciclo de vida de tokens no cliente.']],
  front: `Uma regra prática: sessão em cookie HttpOnly; preferências de interface em localStorage; dados offline e caches grandes em IndexedDB (com uma biblioteca como idb).`,
  ex: { lang: 'texto', code: `                Tamanho   Enviado ao   Acessível   Síncrono   Uso típico
                          servidor     por JS
Cookie          ~4 KB     sim          opcional*   —          sessão
localStorage    ~5 MB     não          sim         sim        preferências
sessionStorage  ~5 MB     não          sim         sim        estado da aba
IndexedDB       grande    não          sim         não        dados offline
Cache API       grande    não          sim         não        respostas HTTP
* HttpOnly impede o acesso via JavaScript` },
  docs: [['MDN · Web Storage API', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API'], ['MDN · IndexedDB', 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API'], ['web.dev · Storage for the web', 'https://web.dev/articles/storage-for-the-web']],
  perguntas: [`Por que o localStorage não é um bom lugar para tokens de acesso?`, `Que problema de performance o localStorage pode causar?`, `O que acontece com os dados locais no modo privado?`] },

{ id: 'service-workers', stage: 'navegador', level: 'importante', title: 'Service Workers e PWA', short: 'Service Worker',
  resumo: `Um proxy programável entre a página e a rede, base de apps offline e instaláveis.`,
  porque: `Service Workers permitem funcionar offline, carregar instantaneamente em visitas repetidas e receber push. Também são fonte de bugs difíceis, como usuários presos numa versão antiga.`,
  como: [
    `O Service Worker é um script que roda separado da página, intercepta as requisições (<code>fetch</code>) e decide responder do cache ou da rede. Estratégias comuns: <b>cache first</b> (assets), <b>network first</b> (HTML e API) e <b>stale-while-revalidate</b>. Ele tem um <b>ciclo de vida</b> próprio: instala, espera as abas antigas fecharem e então ativa.`,
    `Uma <b>PWA</b> combina Service Worker, um <b>manifest</b> (nome, ícones, cores) e HTTPS, permitindo instalar o site como app. O Workbox simplifica as estratégias de cache. O cuidado principal é a atualização: sem estratégia clara, usuários podem ficar dias com a versão antiga.`,
  ],
  conecta: [['storage-browser', 'Usa Cache API e IndexedDB.'], ['cache-assets', 'Mais uma camada de cache, controlada por código.'], ['arquitetura/case-notificacoes', 'Push no navegador depende do Service Worker.'], ['backend/https-tls', 'Só funciona em contexto seguro.'], ['mobile/abordagens', 'PWA comparado a apps nativos e multiplataforma.']],
  front: `Se depois de um deploy alguns usuários continuam vendo a versão antiga, confira se há um Service Worker servindo o HTML do cache sem revalidar.`,
  ex: { lang: 'javascript', code: `// sw.js: stale-while-revalidate para as requisições da API de catálogo
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith("/api/catalogo")) return;

  event.respondWith(
    caches.open("catalogo").then(async (cache) => {
      const emCache = await cache.match(event.request);
      const daRede = fetch(event.request).then((res) => {
        cache.put(event.request, res.clone());
        return res;
      });
      return emCache ?? daRede;   // responde do cache e atualiza em segundo plano
    }),
  );
});` },
  docs: [['MDN · Service Worker API', 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API'], ['web.dev · Learn PWA', 'https://web.dev/learn/pwa/'], ['Chrome · Workbox', 'https://developer.chrome.com/docs/workbox']],
  perguntas: [`Por que um Service Worker novo não ativa imediatamente?`, `Que estratégia de cache faz sentido para o HTML?`, `Que funcionalidade do seu produto se beneficiaria de funcionar offline?`] },
]
