import type { Topic } from '../../../types'

export const performance: Topic[] = [
{ id: 'core-web-vitals', stage: 'performance', level: 'essencial', title: 'Core Web Vitals', short: 'Web Vitals',
  resumo: `LCP, INP e CLS: as métricas que o Google usa para medir a experiência de carregamento, resposta e estabilidade.`,
  porque: `São o vocabulário comum de performance entre front, produto e SEO, e afetam o ranqueamento no Google. Também são SLIs naturais para o front.`,
  como: [
    `<b>LCP</b> (Largest Contentful Paint): quando o maior elemento visível (imagem ou bloco de texto) aparece; bom é até <b>2,5 s</b>. <b>INP</b> (Interaction to Next Paint): o atraso entre interações e a próxima pintura, ao longo de toda a visita; bom é até <b>200 ms</b>. <b>CLS</b> (Cumulative Layout Shift): quanto o conteúdo pula de lugar; bom é até <b>0,1</b>.`,
    `As metas valem para o <b>percentil 75</b> das visitas reais. Causas comuns: LCP alto por TTFB lento, imagem descoberta tarde ou JS bloqueante; INP alto por tarefas longas e hidratação pesada; CLS por imagens sem dimensões, anúncios e fontes que trocam de tamanho. Métricas de apoio: TTFB e FCP.`,
  ],
  conecta: [['medicao', 'Como coletar essas métricas em laboratório e em campo.'], ['critical-rendering-path', 'O principal fator do LCP.'], ['event-loop-browser', 'O principal fator do INP.'], ['devops/slo', 'Web Vitals funcionam como SLIs do front.']],
  front: `Um banner de cookies que empurra a página, uma fonte web que muda a largura do texto e um carrossel que carrega a primeira imagem via JavaScript são as fontes clássicas de CLS e LCP ruins.`,
  ex: { lang: 'javascript', code: `import { onCLS, onINP, onLCP } from "web-vitals";

function enviar(metric) {
  navigator.sendBeacon("/rum", JSON.stringify({
    nome: metric.name,        // LCP, INP, CLS
    valor: metric.value,
    rating: metric.rating,    // good | needs-improvement | poor
    pagina: location.pathname,
  }));
}

onLCP(enviar);
onINP(enviar);
onCLS(enviar);` },
  docs: [['web.dev · Web Vitals', 'https://web.dev/articles/vitals'], ['web.dev · Optimize LCP', 'https://web.dev/articles/optimize-lcp'], ['web.dev · Optimize INP', 'https://web.dev/articles/optimize-inp'], ['GoogleChrome/web-vitals', 'https://github.com/GoogleChrome/web-vitals']],
  perguntas: [`Qual Core Web Vital está pior no seu produto, segundo dados reais?`, `Por que as metas usam o percentil 75 e não a média?`, `Que elemento é o LCP da sua página principal?`] },

{ id: 'carregamento', stage: 'performance', level: 'essencial', title: 'Code splitting e lazy loading', short: 'Code splitting',
  resumo: `Enviar só o JavaScript necessário para a tela atual e carregar o resto sob demanda.`,
  porque: `JavaScript é o recurso mais caro da web: precisa ser baixado, analisado e executado na thread principal. Bundles grandes pioram LCP e INP, especialmente em celulares modestos.`,
  como: [
    `<b>Code splitting</b> divide o bundle em pedaços (chunks). O ponto natural de divisão é a <b>rota</b>: cada página carrega seu código. Dentro da página, componentes pesados e raramente usados (editor rico, gráficos, modais) entram com <code>import()</code> dinâmico e <code>React.lazy</code>.`,
    `<b>Lazy loading</b> também vale para imagens e iframes fora da tela (<code>loading="lazy"</code>). Equilibre com <b>prefetch</b> do que o usuário provavelmente vai precisar (ao passar o mouse num link, por exemplo). Tree shaking e trocar dependências pesadas por alternativas menores completam o trabalho.`,
  ],
  conecta: [['bundlers', 'O bundler cria os chunks.'], ['modulos-js', 'import() dinâmico e tree shaking dependem de ESM.'], ['core-web-vitals', 'Menos JS melhora LCP e INP.'], ['critical-rendering-path', 'Menos JS bloqueando a primeira renderização.']],
  front: `Um teste rápido: veja no relatório do bundle se bibliotecas como moment, lodash inteiro ou um editor de gráficos estão no chunk inicial de uma página que não as usa.`,
  ex: { lang: 'tsx', code: `import { lazy, Suspense } from "react";

// só baixado quando a rota ou o componente é usado
const Relatorios = lazy(() => import("./pages/Relatorios"));
const EditorRico = lazy(() => import("./components/EditorRico"));

export function App() {
  return (
    <Suspense fallback={<Carregando />}>
      <Routes>
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </Suspense>
  );
}

// prefetch quando há intenção de navegar
<a href="/relatorios" onMouseEnter={() => import("./pages/Relatorios")}>Relatórios</a>` },
  docs: [['web.dev · Reduce JavaScript payloads with code splitting', 'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting'], ['React · lazy', 'https://react.dev/reference/react/lazy'], ['MDN · Lazy loading', 'https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading']],
  perguntas: [`Qual é o tamanho do JavaScript inicial da sua página principal?`, `Que componente pesado poderia ser carregado sob demanda?`, `Quando o lazy loading piora a experiência em vez de melhorar?`] },

{ id: 'imagens-fontes', stage: 'performance', level: 'essencial', title: 'Imagens e fontes', short: 'Imagens e fontes',
  resumo: `Os recursos mais pesados da maioria das páginas, e os que mais causam LCP e CLS ruins.`,
  porque: `Imagens costumam ser a maior parte dos bytes de uma página e frequentemente são o elemento de LCP. Fontes mal carregadas causam texto invisível ou saltos de layout.`,
  como: [
    `<b>Imagens</b>: formatos modernos (<b>AVIF</b>, <b>WebP</b>), tamanhos responsivos com <code>srcset</code> e <code>sizes</code>, <code>width</code> e <code>height</code> sempre declarados (evitam CLS), <code>loading="lazy"</code> abaixo da dobra e <code>fetchpriority="high"</code> na imagem principal. Serviços de imagem e CDNs geram variantes automaticamente.`,
    `<b>Fontes</b>: use <code>font-display: swap</code> (ou <code>optional</code>), formato WOFF2, subconjuntos com os caracteres usados, <code>preload</code> da fonte principal e fallbacks com métricas ajustadas (<code>size-adjust</code>) para reduzir o salto na troca. Menos variações de peso significam menos arquivos.`,
  ],
  conecta: [['core-web-vitals', 'Afetam diretamente LCP e CLS.'], ['critical-rendering-path', 'Preload e prioridade de recursos.'], ['devops/cdn-edge', 'CDNs de imagem geram e cacheiam variantes.'], ['devops/finops', 'Imagens menores reduzem transferência de dados.']],
  front: `O componente de imagem do seu framework (next/image, @unpic, nuxt/image) já resolve boa parte disso; vale conferir se ele está sendo usado na imagem de LCP com prioridade.`,
  ex: { lang: 'html', code: `<img
  src="/produtos/teclado-800.avif"
  srcset="/produtos/teclado-400.avif 400w,
          /produtos/teclado-800.avif 800w,
          /produtos/teclado-1600.avif 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  width="800" height="600"
  alt="Teclado mecânico com teclas cinza"
  fetchpriority="high"
/>

<style>
  @font-face {
    font-family: "Marca";
    src: url("/fonts/marca.woff2") format("woff2");
    font-display: swap;
  }
</style>` },
  docs: [['web.dev · Learn Images', 'https://web.dev/learn/images/'], ['web.dev · Best practices for fonts', 'https://web.dev/articles/font-best-practices'], ['MDN · Responsive images', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Responsive_images']],
  perguntas: [`A imagem de LCP do seu site tem width, height e prioridade alta?`, `Quantos arquivos de fonte a sua página baixa?`, `Por que declarar dimensões evita CLS?`] },

{ id: 'cache-assets', stage: 'performance', level: 'importante', title: 'Cache de assets e de dados no cliente', short: 'Cache no front',
  resumo: `Fazer o navegador e a CDN reaproveitar o que já baixaram, sem servir versão velha.`,
  porque: `Cache bem configurado faz visitas repetidas carregarem quase instantaneamente. Mal configurado, causa o famoso "limpa o cache que funciona" depois de cada deploy.`,
  como: [
    `Padrão consolidado: arquivos com <b>hash no nome</b> (<code>app.3f9a.js</code>) recebem <code>Cache-Control: max-age=31536000, immutable</code>; o <b>HTML</b> recebe cache curto ou <code>no-cache</code> (sempre revalida). Como o HTML aponta para os nomes novos, cada deploy é visto na hora, e os assets antigos continuam disponíveis para abas já abertas.`,
    `Para dados de API, o cache acontece na aplicação: <b>React Query</b>, SWR ou Apollo mantêm respostas em memória com <code>staleTime</code>, revalidação ao focar a janela e invalidação após mutations. É o mesmo stale-while-revalidate dos headers HTTP, só que controlado por código.`,
  ],
  conecta: [['backend/cache', 'Os conceitos de cache e headers HTTP.'], ['devops/cdn-edge', 'A CDN aplica as mesmas regras.'], ['service-workers', 'Mais uma camada de cache controlada por código.'], ['data-fetching', 'Cache de dados do servidor no cliente.']],
  front: `Depois de um deploy, um erro "Failed to fetch dynamically imported module" costuma significar que a aba antiga pediu um chunk que não existe mais. Manter os assets de versões anteriores por um tempo evita isso.`,
  ex: { lang: 'nginx', code: `# HTML: sempre revalida
location = /index.html {
  add_header Cache-Control "no-cache";
}

# assets com hash: cache longo e imutável
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}` },
  docs: [['web.dev · HTTP cache', 'https://web.dev/articles/http-cache'], ['MDN · Cache-Control', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control'], ['TanStack Query · Caching', 'https://tanstack.com/query/latest/docs/framework/react/guides/caching']],
  perguntas: [`Que headers de cache o seu HTML e os seus assets recebem hoje?`, `Por que manter chunks antigos disponíveis depois de um deploy?`, `Qual a relação entre staleTime e stale-while-revalidate?`] },

{ id: 'perf-runtime', stage: 'performance', level: 'importante', title: 'Performance em execução', short: 'Runtime',
  resumo: `Interface fluida depois de carregada: re-renders, listas grandes, animações e memória.`,
  porque: `Uma página pode carregar rápido e ainda assim ser lenta de usar. Digitação com atraso, rolagem travando e cliques demorados vêm do que roda depois do carregamento.`,
  como: [
    `Em React: evite re-renders desnecessários (estado no nível certo, <code>memo</code>, <code>useMemo</code> e <code>useCallback</code> onde o profiler mostrar ganho, ou o React Compiler fazendo isso automaticamente), use <code>useTransition</code> e <code>useDeferredValue</code> para atualizações não urgentes e <b>virtualize</b> listas longas (TanStack Virtual) em vez de renderizar milhares de itens.`,
    `No navegador: anime só <code>transform</code> e <code>opacity</code> (não disparam layout), use <code>content-visibility: auto</code> para seções fora da tela, debounce em handlers de input e scroll, e procure vazamentos de memória (listeners e timers não removidos) com a aba Memory.`,
  ],
  conecta: [['event-loop-browser', 'Tudo isso disputa a thread principal.'], ['core-web-vitals', 'INP mede o resultado.'], ['medicao', 'O profiler mostra onde está o custo.'], ['estado', 'Onde o estado mora define o que re-renderiza.'], ['fundamentos/memoria-gc', 'Vazamentos e pausas de coleta de lixo.']],
  front: `Antes de espalhar useMemo pelo código, grave um perfil com o React DevTools Profiler e veja quais componentes realmente renderizam demais.`,
  ex: { lang: 'tsx', code: `function Busca({ produtos }: { produtos: Produto[] }) {
  const [texto, setTexto] = useState("");
  const textoAdiado = useDeferredValue(texto);   // o input continua fluido

  const filtrados = useMemo(
    () => produtos.filter((p) => p.nome.includes(textoAdiado)),
    [produtos, textoAdiado],
  );

  return (
    <>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <ListaVirtual itens={filtrados} />  {/* só renderiza o que está visível */}
    </>
  );
}` },
  docs: [['React · useDeferredValue', 'https://react.dev/reference/react/useDeferredValue'], ['React · React Compiler', 'https://react.dev/learn/react-compiler'], ['web.dev · Animations guide', 'https://web.dev/articles/animations-guide'], ['TanStack Virtual', 'https://tanstack.com/virtual/latest']],
  perguntas: [`Qual interação do seu app parece mais lenta, e o que o profiler mostra sobre ela?`, `Por que animar transform é mais barato que animar top e left?`, `Quando virtualizar uma lista vale a pena?`] },

{ id: 'medicao', stage: 'performance', level: 'essencial', title: 'Medir: laboratório, campo e orçamentos', short: 'Medição',
  resumo: `Lighthouse, RUM, profiling e orçamentos de performance no CI.`,
  porque: `Otimizar sem medir é chute. E medir só na sua máquina rápida esconde o que o usuário real, num celular modesto e rede ruim, vive todos os dias.`,
  como: [
    `<b>Dados de laboratório</b> (Lighthouse, WebPageTest, aba Performance) são reproduzíveis e ótimos para diagnosticar, mas simulam uma condição. <b>Dados de campo</b> (RUM: CrUX, web-vitals enviando para sua ferramenta, Sentry, Datadog) mostram a distribuição real, por página, dispositivo e país.`,
    `Para não regredir, use <b>orçamentos de performance</b>: limites de tamanho de bundle (size-limit), pontuação mínima ou métricas máximas no Lighthouse CI, verificados em cada pull request. Ao investigar, compare sempre com o mesmo throttling de CPU e rede.`,
  ],
  conecta: [['core-web-vitals', 'As métricas que mais importam.'], ['backend/observabilidade', 'RUM é observabilidade do lado do cliente.'], ['arquitetura/fitness-functions', 'Orçamentos são fitness functions de front.'], ['observabilidade-front', 'Coletar métricas e erros de usuários reais.']],
  front: `O Chrome UX Report (CrUX) já tem dados de campo de sites populares; o PageSpeed Insights mostra lado a lado os dados de campo e de laboratório da sua URL.`,
  ex: { lang: 'json', code: `// lighthouserc.json: falha o PR se a performance regredir
{
  "ci": {
    "collect": { "url": ["http://localhost:4173/", "http://localhost:4173/produto/1"] },
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-byte-weight": ["warn", { "maxNumericValue": 1000000 }]
      }
    }
  }
}` },
  docs: [['Chrome · Lighthouse', 'https://developer.chrome.com/docs/lighthouse/overview'], ['web.dev · Lab and field data', 'https://web.dev/articles/lab-and-field-data-differences'], ['Lighthouse CI', 'https://github.com/GoogleChrome/lighthouse-ci'], ['PageSpeed Insights', 'https://pagespeed.web.dev/']],
  perguntas: [`O seu time olha dados de campo ou só o Lighthouse local?`, `Que orçamento de performance faria sentido no seu CI?`, `Por que a nota do Lighthouse varia entre execuções?`] },
]
