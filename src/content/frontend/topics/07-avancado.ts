import type { Topic } from '../../../types'

export const avancado: Topic[] = [
{ id: 'reatividade', stage: 'avancado', level: 'importante', title: 'Como frameworks funcionam: reatividade, signals e compiladores', short: 'Reatividade',
  resumo: `Virtual DOM, signals e compiladores: as estratégias para atualizar a tela quando o estado muda.`,
  porque: `Entender o modelo de reatividade explica por que um componente re-renderiza, por que memo às vezes não ajuda e por que frameworks novos parecem tão rápidos. Também ajuda a escolher e migrar entre frameworks.`,
  como: [
    `<b>Virtual DOM</b> (React): a cada mudança de estado, o componente roda de novo, gera uma árvore virtual e o framework compara com a anterior para aplicar o mínimo de mudanças no DOM. Simples de raciocinar, mas re-executa muito código. O <b>React Compiler</b> automatiza a memoização para reduzir esse custo.`,
    `<b>Signals</b> (Solid, Preact Signals, Vue, Angular, Svelte 5 runes): valores reativos que sabem quem depende deles; uma mudança atualiza só aquele ponto do DOM, sem re-renderizar o componente inteiro. <b>Compiladores</b> (Svelte, Solid, Vue Vapor) analisam o template no build e geram código que atualiza o DOM diretamente. Há também propostas para trazer signals ao próprio JavaScript.`,
  ],
  conecta: [['perf-runtime', 'O modelo define o custo de cada atualização.'], ['estado', 'Onde o estado mora define o que atualiza.'], ['hidratacao', 'Frameworks diferem também na hidratação.'], ['devops/k8s-operators', 'A mesma ideia de reconciliação declarativa.']],
  front: `Saber que no React um setState re-executa o componente e os filhos (salvo memoização) muda a forma de organizar o estado e de investigar lentidão.`,
  ex: { lang: 'typescript', code: `// React: o componente inteiro roda de novo a cada mudança
function Contador() {
  const [n, setN] = useState(0);
  console.log("render");                    // a cada clique
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}

// Solid (signals): o componente roda uma vez; só o texto do botão atualiza
function ContadorSolid() {
  const [n, setN] = createSignal(0);
  console.log("setup");                     // uma vez só
  return <button onClick={() => setN(n() + 1)}>{n()}</button>;
}` },
  docs: [['React · Render and commit', 'https://react.dev/learn/render-and-commit'], ['Solid · Fine-grained reactivity', 'https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity'], ['TC39 · Signals proposal', 'https://github.com/tc39/proposal-signals']],
  perguntas: [`O que acontece, no React, com os filhos de um componente cujo estado mudou?`, `Por que signals evitam re-renderizar o componente inteiro?`, `O que um compilador de framework faz no build?`] },

{ id: 'web-workers-wasm', stage: 'avancado', level: 'aprofundar', title: 'Web Workers e WebAssembly', short: 'Workers e Wasm',
  resumo: `Tirar trabalho pesado da thread principal e rodar código compilado no navegador.`,
  porque: `Processar imagens, planilhas, criptografia ou PDFs no navegador trava a interface se rodar na thread principal. Workers e WebAssembly permitem fazer trabalho pesado no cliente com a interface fluida, e trazer bibliotecas de outras linguagens para a web.`,
  como: [
    `<b>Web Workers</b> rodam JavaScript em outra thread, sem acesso ao DOM, conversando por mensagens (<code>postMessage</code>); objetos grandes podem ser <b>transferidos</b> sem cópia. Bibliotecas como Comlink deixam o worker com cara de chamada de função. <b>SharedArrayBuffer</b> permite memória compartilhada, exigindo isolamento de origem (COOP/COEP).`,
    `<b>WebAssembly</b> (Wasm) executa código compilado de C, C++, Rust ou Go com desempenho próximo do nativo. Usos: editores de imagem e vídeo, bancos no navegador (SQLite, DuckDB-Wasm), jogos e bibliotecas científicas. Combina naturalmente com workers.`,
  ],
  conecta: [['event-loop-browser', 'Tirar tarefas longas da thread principal.'], ['perf-runtime', 'Interface fluida durante processamento.'], ['backend/threads', 'Mesma ideia de threads isoladas.'], ['ia/modelos-abertos', 'Modelos rodando no navegador usam Wasm e WebGPU.']],
  front: `Exportar uma planilha de 100 mil linhas ou comprimir imagens antes do upload são casos clássicos para um worker.`,
  ex: { lang: 'typescript', code: `// main.ts: o processamento roda em outra thread
const worker = new Worker(new URL("./exportar.worker.ts", import.meta.url), { type: "module" });
worker.postMessage({ linhas });                  // a interface continua respondendo
worker.onmessage = (e) => baixarArquivo(e.data);

// exportar.worker.ts
self.onmessage = (e: MessageEvent<{ linhas: Linha[] }>) => {
  const csv = gerarCsv(e.data.linhas);           // trabalho pesado fora da main thread
  const blob = new Blob([csv], { type: "text/csv" });
  self.postMessage(blob);
};` },
  docs: [['MDN · Using Web Workers', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers'], ['MDN · WebAssembly', 'https://developer.mozilla.org/en-US/docs/WebAssembly'], ['Comlink', 'https://github.com/GoogleChromeLabs/comlink']],
  perguntas: [`Que processamento do seu app poderia ir para um worker?`, `Por que workers não acessam o DOM?`, `Que biblioteca de outra linguagem faria sentido rodar em Wasm?`] },

{ id: 'graficos-web', stage: 'avancado', level: 'aprofundar', title: 'Canvas, WebGL e WebGPU', short: 'Gráficos',
  resumo: `Desenhar diretamente na tela quando o DOM não dá conta.`,
  porque: `Gráficos com milhares de pontos, mapas, editores visuais e visualizações 3D ficam lentos com elementos DOM ou SVG. As APIs de desenho permitem renderizar muito mais, ao custo de mais trabalho com acessibilidade e interação.`,
  como: [
    `<b>SVG</b>: gráficos vetoriais como elementos DOM; ótimo até alguns milhares de elementos e acessível. <b>Canvas 2D</b>: desenho imediato em pixels, rápido para muitos objetos, mas sem elementos individuais (hit testing e acessibilidade ficam por sua conta). <b>WebGL</b> e <b>WebGPU</b>: acesso à GPU para 3D e milhões de pontos; WebGPU também permite computação geral na GPU.`,
    `Bibliotecas: D3 (visualização sobre SVG ou Canvas), Three.js e Babylon.js (3D), PixiJS (2D acelerado), deck.gl (mapas e dados geográficos). <b>OffscreenCanvas</b> permite desenhar dentro de um worker. Sempre ofereça alternativa acessível (tabela de dados, descrição) para conteúdo desenhado.`,
  ],
  conecta: [['web-workers-wasm', 'OffscreenCanvas em workers.'], ['perf-runtime', 'Desenho eficiente para muitos objetos.'], ['a11y-fundamentos', 'Conteúdo desenhado precisa de alternativa acessível.'], ['ia/modelos-abertos', 'WebGPU também roda modelos de IA.']],
  front: `A regra prática: SVG para gráficos de negócio comuns, Canvas para dezenas de milhares de pontos e WebGL/WebGPU para 3D ou volumes ainda maiores.`,
  ex: { lang: 'typescript', code: `// Canvas 2D: 50 mil pontos sem criar 50 mil elementos no DOM
const ctx = canvas.getContext("2d")!;
const dpr = window.devicePixelRatio;
canvas.width = canvas.clientWidth * dpr;            // nitidez em telas de alta densidade
canvas.height = canvas.clientHeight * dpr;
ctx.scale(dpr, dpr);

for (const p of pontos) {
  ctx.fillStyle = p.cor;
  ctx.fillRect(escalaX(p.x), escalaY(p.y), 2, 2);
}
// acessibilidade: <canvas aria-label="Vendas por hora"> + tabela com os dados ao lado` },
  docs: [['MDN · Canvas API', 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API'], ['MDN · WebGPU API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API'], ['Three.js', 'https://threejs.org/docs/']],
  perguntas: [`Quando um gráfico em SVG deixa de ser a melhor opção?`, `Como tornar acessível um conteúdo desenhado em canvas?`, `Para que serve o devicePixelRatio ao desenhar?`] },

{ id: 'local-first', stage: 'avancado', level: 'aprofundar', title: 'Local-first e sincronização', short: 'Local-first',
  resumo: `Apps que funcionam primeiro com dados locais e sincronizam com o servidor em segundo plano.`,
  porque: `Apps local-first respondem instantaneamente, funcionam offline e lidam bem com rede ruim. É uma abordagem crescente (Linear, Figma, Notion) que muda a fronteira entre front e back.`,
  como: [
    `Os dados vivem numa base <b>local</b> (IndexedDB, SQLite no navegador via Wasm e OPFS) e a interface lê e escreve nela, com latência zero. Um <b>motor de sincronização</b> envia mudanças ao servidor e recebe as de outras pessoas, resolvendo conflitos (CRDTs, last-write-wins por campo ou regras de domínio).`,
    `Ferramentas: Replicache, Zero, ElectricSQL, PowerSync, Triplit, Automerge e Yjs. Desafios: sincronização parcial (o usuário não deve baixar o banco inteiro), autorização (o que cada um pode sincronizar), migrações de schema em dados locais e o tamanho dos dados no dispositivo.`,
  ],
  conecta: [['arquitetura/crdt', 'Resolução de conflitos sem servidor central.'], ['storage-browser', 'IndexedDB e OPFS como base local.'], ['service-workers', 'Funcionar offline.'], ['data-fetching', 'Uma alternativa ao modelo de buscar a cada tela.'], ['mobile/offline-first-mobile', 'O mesmo problema em apps de celular.']],
  front: `Numa app local-first, a maior parte das telas lê dados locais de forma síncrona; spinners de carregamento praticamente somem, e o estado de "sincronizando" passa a ser o que precisa de interface.`,
  ex: { lang: 'typescript', code: `// modelo de uso típico de um motor de sincronização (pseudo-API)
const db = await abrirBancoLocal("loja");            // IndexedDB/SQLite no navegador

// leitura: instantânea, reativa, funciona offline
const tarefas = useQuery(db.tarefas.where({ projetoId }).orderBy("criadaEm"));

// escrita: aplicada localmente na hora e enviada ao servidor em segundo plano
await db.tarefas.update(id, { concluida: true });

// o motor sincroniza: envia mudanças locais, recebe as remotas, resolve conflitos
sync.status;   // "sincronizado" | "pendente" | "offline"` },
  docs: [['Ink & Switch · Local-first software', 'https://www.inkandswitch.com/essay/local-first/'], ['localfirstweb.dev', 'https://localfirstweb.dev/'], ['MDN · Origin private file system', 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system']],
  perguntas: [`Que parte do seu produto ficaria muito melhor funcionando offline?`, `Como decidir quais dados sincronizar para cada usuário?`, `Que estados de interface uma app local-first precisa ter?`] },

{ id: 'i18n', stage: 'avancado', level: 'importante', title: 'Internacionalização', short: 'i18n',
  resumo: `Preparar a aplicação para outros idiomas, formatos regionais e direções de escrita.`,
  porque: `Expandir para outros países costuma revelar textos fixos no código, datas no formato errado, plurais quebrados e layouts que não cabem em alemão. Internacionalizar desde cedo é muito mais barato do que depois.`,
  como: [
    `Textos em catálogos de mensagens com chaves (i18next, FormatJS/react-intl, Lingui), usando o formato <b>ICU</b> para plurais, gênero e variáveis. Formatação com a <b>API Intl</b> do navegador: números, moedas, datas, listas e tempo relativo conforme o idioma e a região (<b>locale</b>).`,
    `Cuidados: textos que crescem 30% ou mais em outros idiomas, idiomas da direita para a esquerda (<b>RTL</b>, use propriedades lógicas do CSS como <code>margin-inline-start</code>), ordenação e comparação de texto com <code>Intl.Collator</code>, fusos horários e não concatenar frases a partir de pedaços. O backend também precisa de i18n em e-mails e mensagens de erro.`,
  ],
  conecta: [['dados/tipos-dados', 'Datas, fusos e moedas.'], ['a11y-fundamentos', 'O atributo lang importa para leitores de tela.'], ['design-system', 'Componentes preparados para textos longos e RTL.'], ['backend/rest', 'Mensagens de erro traduzíveis por código.']],
  front: `Uma regra de ouro: nunca monte frases concatenando pedaços ("Você tem " + n + " itens"); use mensagens com variáveis e plurais, porque a ordem das palavras muda entre idiomas.`,
  ex: { lang: 'typescript', code: `// plural com ICU (FormatJS / i18next com ICU)
// pt-BR: "{n, plural, =0 {Carrinho vazio} one {# item no carrinho} other {# itens no carrinho}}"
t("carrinho.itens", { n: 3 });                 // "3 itens no carrinho"

// formatação nativa conforme o locale
new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(1999.9); // R$ 1.999,90
new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());          // 15 de outubro de 2026
new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(-1, "day");          // ontem
new Intl.ListFormat("pt-BR").format(["Pix", "cartão", "boleto"]);                     // Pix, cartão e boleto` },
  docs: [['MDN · Intl', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl'], ['FormatJS · ICU message syntax', 'https://formatjs.github.io/docs/core-concepts/icu-syntax/'], ['W3C · Internationalization', 'https://www.w3.org/International/']],
  perguntas: [`Quantos textos fixos existem hoje nos componentes do seu projeto?`, `Por que não concatenar pedaços de frases?`, `Que propriedades de CSS ajudam a suportar idiomas da direita para a esquerda?`] },

{ id: 'view-transitions', stage: 'avancado', level: 'importante', title: 'Animações e View Transitions', short: 'Animações',
  resumo: `Movimento que explica a interface, com boa performance e respeito a quem prefere menos movimento.`,
  porque: `Boas transições ajudam o usuário a entender o que mudou e de onde veio cada elemento; transições ruins atrasam, enjoam e travam em celulares modestos. A API de View Transitions trouxe para a web transições entre estados e páginas que antes exigiam bibliotecas pesadas.`,
  como: [
    `Prefira animar <code>transform</code> e <code>opacity</code> (rodam na composição, sem layout). Use transições CSS para o simples, a <b>Web Animations API</b> para controle por JavaScript e bibliotecas (Motion, GSAP) para coreografias complexas. Durações curtas (150 a 300 ms) e curvas de aceleração naturais funcionam melhor.`,
    `A <b>View Transitions API</b> captura o estado antes e depois de uma mudança do DOM (ou de uma navegação entre páginas) e anima entre eles; elementos com o mesmo <code>view-transition-name</code> se transformam de um no outro. Respeite <code>prefers-reduced-motion</code>, trocando movimentos grandes por transições discretas ou nenhuma.`,
  ],
  conecta: [['perf-runtime', 'Animar propriedades baratas.'], ['a11y-fundamentos', 'Movimento reduzido é uma necessidade de acessibilidade.'], ['core-web-vitals', 'Animações mal feitas pioram o INP e o CLS.'], ['estrategias-renderizacao', 'Transições entre páginas em apps com várias páginas.']],
  front: `Com View Transitions, uma lista que abre um detalhe pode animar a miniatura até a imagem grande com poucas linhas, sem biblioteca de animação.`,
  ex: { lang: 'typescript', code: `// transição animada entre dois estados da tela
function abrirDetalhe(produto: Produto) {
  if (!document.startViewTransition) return render(produto);   // fallback sem animação
  document.startViewTransition(() => render(produto));
}

/* CSS: a miniatura e a imagem grande compartilham o nome e se transformam uma na outra
.miniatura-981, .imagem-detalhe { view-transition-name: produto-981; }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation: none; }
} */` },
  docs: [['MDN · View Transition API', 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API'], ['Chrome · Smooth transitions with the View Transition API', 'https://developer.chrome.com/docs/web-platform/view-transitions'], ['web.dev · prefers-reduced-motion', 'https://web.dev/articles/prefers-reduced-motion']],
  perguntas: [`Que transição do seu produto ajudaria o usuário a entender uma mudança de tela?`, `Por que animar transform é mais barato que animar width?`, `Como respeitar quem prefere menos movimento?`] },

{ id: 'web-components', stage: 'avancado', level: 'aprofundar', title: 'Web Components', short: 'Web Components',
  resumo: `Componentes nativos do navegador, reutilizáveis entre qualquer framework.`,
  porque: `Design systems usados por times com frameworks diferentes, widgets embutidos em sites de terceiros e microfrontends costumam usar Web Components. Saber seus pontos fortes e fracos evita escolhas ruins.`,
  como: [
    `Três peças: <b>Custom Elements</b> (definir tags próprias como <code>&lt;loja-botao&gt;</code> com ciclo de vida), <b>Shadow DOM</b> (estilos e marcação encapsulados) e <b>templates e slots</b> (conteúdo projetado de fora). Bibliotecas como Lit reduzem o código repetitivo. Funcionam em React, Vue, Angular ou HTML puro.`,
    `Pontos de atenção: SSR mais limitado (Declarative Shadow DOM ajuda), formulários exigem <code>ElementInternals</code> para participar de <code>&lt;form&gt;</code>, acessibilidade através do Shadow DOM (referências por id não atravessam a fronteira), estilização externa por variáveis CSS e <code>::part</code>, e integração com o sistema de eventos de alguns frameworks.`,
  ],
  conecta: [['design-system', 'Design systems independentes de framework.'], ['microfrontends', 'Uma forma de compor partes de times diferentes.'], ['a11y-fundamentos', 'Cuidados de acessibilidade com Shadow DOM.'], ['reatividade', 'Uma alternativa aos componentes de framework.']],
  front: `Se o seu design system precisa servir apps React, um site em Angular e páginas em HTML puro, Web Components são a opção mais natural.`,
  ex: { lang: 'typescript', code: `import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("loja-selo")
export class LojaSelo extends LitElement {
  static styles = css\`
    :host { display: inline-flex; padding: 2px 8px; border-radius: 99px;
            background: var(--selo-bg, #eef); }   /* customizável por variável CSS */
  \`;
  @property() tipo: "novo" | "promo" = "novo";
  render() { return html\`<slot></slot>\`; }      // conteúdo vem de fora
}

// uso em qualquer framework: <loja-selo tipo="promo">-20%</loja-selo>` },
  docs: [['MDN · Web Components', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components'], ['Lit', 'https://lit.dev/docs/'], ['web.dev · Declarative Shadow DOM', 'https://web.dev/articles/declarative-shadow-dom']],
  perguntas: [`Em que situação Web Components seriam melhores que componentes React?`, `Que cuidado de acessibilidade o Shadow DOM exige?`, `Como permitir que outros times personalizem o estilo de um Web Component?`] },

{ id: 'seo', stage: 'avancado', level: 'importante', title: 'SEO técnico', short: 'SEO',
  resumo: `Fazer buscadores e redes sociais encontrarem, entenderem e exibirem bem as páginas.`,
  porque: `Para muitos produtos, busca orgânica é o maior canal de aquisição. As decisões técnicas de front (renderização, URLs, metadados, performance) pesam diretamente no tráfego, e são responsabilidade do time de front.`,
  como: [
    `Base: conteúdo no HTML que chega do servidor (SSR ou SSG; buscadores renderizam JavaScript, mas com atraso e limites), <b>título</b> e <b>meta description</b> únicos por página, HTML semântico com títulos hierárquicos, URLs limpas e estáveis, <b>canonical</b> para evitar duplicação, <b>sitemap</b> e <b>robots.txt</b>.`,
    `Também: <b>dados estruturados</b> (JSON-LD de schema.org para produtos, artigos, avaliações) que geram resultados ricos, metadados <b>Open Graph</b> para compartilhamento, <b>hreflang</b> para versões em outros idiomas, redirecionamentos 301 ao mudar URLs e Core Web Vitals, que entram como sinal de ranqueamento.`,
  ],
  conecta: [['estrategias-renderizacao', 'HTML vindo do servidor para buscadores.'], ['core-web-vitals', 'Experiência de página como sinal.'], ['a11y-fundamentos', 'HTML semântico ajuda leitores de tela e buscadores.'], ['i18n', 'hreflang para versões em outros idiomas.']],
  front: `Uma SPA com HTML vazio e todo o conteúdo carregado por JavaScript é o problema de SEO mais comum; renderizar no servidor as páginas que precisam ser encontradas resolve a maior parte.`,
  ex: { lang: 'html', code: `<head>
  <title>Teclado Mecânico TKL Switch Azul | Loja</title>
  <meta name="description" content="Teclado mecânico compacto com switches azuis, ABNT2 e iluminação RGB." />
  <link rel="canonical" href="https://loja.com/produtos/teclado-tkl-azul" />
  <meta property="og:title" content="Teclado Mecânico TKL Switch Azul" />
  <meta property="og:image" content="https://img.loja.com/teclado-tkl-1200x630.jpg" />
  <script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "Product",
    "name": "Teclado Mecânico TKL Switch Azul",
    "offers": { "@type": "Offer", "price": "399.90", "priceCurrency": "BRL", "availability": "https://schema.org/InStock" } }
  </script>
</head>` },
  docs: [['Google Search Central · SEO starter guide', 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide'], ['Google · JavaScript SEO basics', 'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics'], ['schema.org', 'https://schema.org/docs/gs.html']],
  perguntas: [`As páginas que precisam ser encontradas no seu produto chegam com conteúdo no HTML?`, `Para que serve a URL canônica?`, `Que dados estruturados fariam sentido nas suas páginas?`] },
]
