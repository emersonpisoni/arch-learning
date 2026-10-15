import type { Topic } from '../../../types'

export const renderizacao: Topic[] = [
{ id: 'estrategias-renderizacao', stage: 'renderizacao', level: 'essencial', title: 'CSR, SSR, SSG e ISR', short: 'Renderização',
  resumo: `Onde e quando o HTML é gerado: no navegador, no servidor a cada pedido, no build ou com revalidação.`,
  porque: `Essa escolha afeta desempenho, SEO, custo de infraestrutura e o que o backend precisa oferecer. É uma das decisões de arquitetura de front com mais impacto, e envolve diretamente o time de infra.`,
  como: [
    `<b>CSR</b> (client-side rendering): o servidor manda um HTML quase vazio e o JavaScript monta a página. Simples de hospedar (só arquivos estáticos), mas o conteúdo aparece tarde e depende de JS. <b>SSR</b>: o servidor gera o HTML a cada requisição, com dados. Conteúdo aparece cedo e bom para SEO, mas exige servidor rodando e aumenta o TTFB se os dados forem lentos.`,
    `<b>SSG</b> (static site generation): o HTML é gerado no build e servido pela CDN. Rapidíssimo e barato, mas os dados ficam congelados até o próximo build. <b>ISR</b> e revalidação: páginas estáticas regeneradas em segundo plano depois de um tempo ou sob demanda. Frameworks como Next.js, Nuxt, Remix/React Router e Astro permitem misturar estratégias por rota.`,
  ],
  conecta: [['hidratacao', 'SSR e SSG precisam hidratar para ficar interativos.'], ['devops/cdn-edge', 'SSG e ISR vivem na CDN.'], ['devops/cloud-modelos', 'SSR exige servidor ou funções serverless.'], ['core-web-vitals', 'Cada estratégia afeta LCP e TTFB de um jeito.']],
  front: `Escolha por rota: página de marketing estática, catálogo com ISR, carrinho e área logada com SSR ou CSR. Não precisa ser uma decisão única para o site inteiro.`,
  ex: { lang: 'texto', code: `           HTML gerado      Dados          Infra            Bom para
CSR        no navegador     no cliente     só CDN           apps logados, painéis
SSR        a cada pedido    no servidor    servidor/funções conteúdo dinâmico e SEO
SSG        no build         no build       só CDN           docs, blog, marketing
ISR        build + revalida no servidor    CDN + funções    catálogos grandes` },
  docs: [['web.dev · Rendering on the web', 'https://web.dev/articles/rendering-on-the-web'], ['Next.js · Rendering', 'https://nextjs.org/docs/app/building-your-application/rendering'], ['Patterns.dev · Rendering patterns', 'https://www.patterns.dev/react/']],
  perguntas: [`Qual estratégia de renderização cada rota do seu produto usa hoje?`, `Que infraestrutura o SSR exige que o CSR não exige?`, `Quando os dados congelados do SSG viram problema?`] },

{ id: 'hidratacao', stage: 'renderizacao', level: 'essencial', title: 'Hidratação, islands e resumabilidade', short: 'Hidratação',
  resumo: `Tornar interativo um HTML que veio pronto do servidor, e o custo disso.`,
  porque: `SSR mostra conteúdo cedo, mas a página só responde a cliques depois da hidratação. Esse intervalo, e os erros de "hydration mismatch", são problemas comuns em apps React e Vue com SSR.`,
  como: [
    `Na <b>hidratação</b>, o framework baixa o JavaScript dos componentes, recria a árvore no navegador e liga os eventos ao HTML existente. O custo é proporcional ao tamanho da página, mesmo nas partes que nunca serão interativas. Se o HTML do servidor for diferente do que o cliente renderiza (datas, valores aleatórios, <code>window</code> no render), ocorre um <b>mismatch</b>.`,
    `Alternativas para reduzir o custo: <b>hidratação parcial/islands</b> (Astro: só os componentes interativos recebem JS), <b>hidratação progressiva</b> (por prioridade ou visibilidade), <b>Server Components</b> (componentes que nunca vão para o cliente) e <b>resumabilidade</b> (Qwik: retoma o estado sem reexecutar os componentes).`,
  ],
  conecta: [['estrategias-renderizacao', 'SSR e SSG produzem o HTML que é hidratado.'], ['server-components', 'Reduzem o que precisa ser hidratado.'], ['core-web-vitals', 'Hidratação pesada piora o INP.'], ['event-loop-browser', 'A hidratação ocupa a thread principal.']],
  front: `Se um botão renderizado pelo servidor "não responde" nos primeiros segundos, ele está esperando a hidratação. Mostrar um estado de carregamento ou usar formulários HTML nativos ajuda nesse intervalo.`,
  ex: { lang: 'tsx', code: `// causa mismatch: servidor e cliente geram valores diferentes
function Agora() {
  return <span>{new Date().toLocaleTimeString()}</span>;
}

// solução: renderizar o valor só depois de montar no cliente
function AgoraSeguro() {
  const [hora, setHora] = useState<string | null>(null);
  useEffect(() => setHora(new Date().toLocaleTimeString()), []);
  return <span>{hora ?? "—"}</span>;
}` },
  docs: [['React · hydrateRoot', 'https://react.dev/reference/react-dom/client/hydrateRoot'], ['Astro · Islands architecture', 'https://docs.astro.build/en/concepts/islands/'], ['Patterns.dev · Progressive hydration', 'https://www.patterns.dev/react/progressive-hydration/']],
  perguntas: [`O que causa um hydration mismatch?`, `Por que hidratar uma página inteira pode ser desperdício?`, `Que partes do seu site realmente precisam de JavaScript?`] },

{ id: 'server-components', stage: 'renderizacao', level: 'importante', title: 'React Server Components', short: 'RSC',
  resumo: `Componentes que rodam só no servidor e enviam resultado, não código, ao navegador.`,
  porque: `RSC mudam a fronteira entre front e back: componentes acessam banco e APIs diretamente, e bibliotecas pesadas deixam de ir para o bundle. Entender o modelo é essencial para trabalhar com o App Router do Next.js e outros frameworks que o adotam.`,
  como: [
    `<b>Server Components</b> (padrão no App Router) rodam no servidor durante o render, podem ser <code>async</code> e ler dados diretamente; seu código não vai para o cliente. <b>Client Components</b>, marcados com <code>"use client"</code>, são os que têm estado, efeitos e eventos, e são hidratados no navegador. Um Server Component pode renderizar um Client Component, passando props serializáveis.`,
    `<b>Server Actions</b> (<code>"use server"</code>) são funções do servidor chamadas a partir de formulários ou do cliente, sem criar uma rota de API manualmente. Cuidados: segredos e acesso a dados ficam no servidor, mas toda Server Action é um endpoint público e precisa validar entrada e verificar autorização.`,
  ],
  conecta: [['hidratacao', 'Menos componentes para hidratar.'], ['backend/gateway', 'Server Components fazem papel de BFF.'], ['data-fetching', 'Busca de dados no servidor em vez de no cliente.'], ['backend/autorizacao', 'Server Actions precisam checar permissão.']],
  front: `O modelo mental: tudo que não precisa de interatividade fica no servidor; o "use client" marca a fronteira onde começa o JavaScript do navegador. Quanto mais baixo na árvore essa fronteira, menor o bundle.`,
  ex: { lang: 'tsx', code: `// app/pedidos/page.tsx: Server Component (padrão)
export default async function Pedidos() {
  const pedidos = await db.pedido.findMany({ take: 20 }); // roda só no servidor
  return <ListaPedidos pedidos={pedidos} />;
}

// app/pedidos/cancelar.tsx
"use client";
export function BotaoCancelar({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return <button disabled={pending} onClick={() => start(() => cancelar(id))}>Cancelar</button>;
}

// app/pedidos/actions.ts
"use server";
export async function cancelar(id: number) {
  const user = await sessaoAtual();               // é um endpoint público: autorize!
  await pedidos.cancelar(id, user.id);
}` },
  docs: [['React · Server Components', 'https://react.dev/reference/rsc/server-components'], ['React · Server Functions', 'https://react.dev/reference/rsc/server-functions'], ['Next.js · Server and Client Components', 'https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns']],
  perguntas: [`Que parte da sua aplicação poderia virar Server Component?`, `Por que uma Server Action precisa de verificação de autorização?`, `O que define onde colocar o "use client"?`] },

{ id: 'streaming-ssr', stage: 'renderizacao', level: 'importante', title: 'Streaming e Suspense', short: 'Streaming',
  resumo: `Enviar o HTML em partes, mostrando o que já está pronto enquanto o resto carrega.`,
  porque: `Com SSR tradicional, a página espera a consulta mais lenta antes de enviar qualquer coisa. Streaming permite mostrar a estrutura e o conteúdo rápido imediatamente, melhorando TTFB e a percepção de velocidade.`,
  como: [
    `O servidor envia o HTML em pedaços pela mesma resposta HTTP. Partes que dependem de dados lentos ficam dentro de <code>&lt;Suspense&gt;</code>: primeiro chega o fallback (skeleton), e depois o conteúdo real é enviado no mesmo stream e encaixado no lugar.`,
    `Isso exige que a infraestrutura não acumule a resposta inteira antes de repassá-la (atenção a proxies, compressão e algumas CDNs) e que os dados lentos sejam isolados por fronteiras de Suspense bem escolhidas. Headers e status HTTP são enviados antes do primeiro pedaço, por isso redirecionamentos e erros precisam ser decididos cedo.`,
  ],
  conecta: [['estrategias-renderizacao', 'Uma evolução do SSR.'], ['core-web-vitals', 'Melhora TTFB e FCP.'], ['backend/http', 'Usa respostas HTTP em partes (chunked).'], ['devops/cdn-edge', 'CDN e proxies precisam repassar o stream sem acumular.']],
  front: `Fronteiras de Suspense bem posicionadas são decisões de UX: o que aparece imediatamente, o que mostra skeleton e o que pode carregar por último.`,
  ex: { lang: 'tsx', code: `export default function Produto({ id }: { id: string }) {
  return (
    <>
      <Cabecalho />                         {/* enviado imediatamente */}
      <DetalhesProduto id={id} />          {/* dado rápido */}
      <Suspense fallback={<AvaliacoesSkeleton />}>
        <Avaliacoes id={id} />             {/* consulta lenta: chega depois, no mesmo stream */}
      </Suspense>
    </>
  );
}` },
  docs: [['React · Suspense', 'https://react.dev/reference/react/Suspense'], ['React · renderToReadableStream', 'https://react.dev/reference/react-dom/server/renderToReadableStream'], ['Next.js · Loading UI and Streaming', 'https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming']],
  perguntas: [`Qual parte da sua página mais importante depende de um dado lento?`, `Por que o status HTTP precisa ser decidido antes do primeiro pedaço?`, `O que pode impedir o streaming de chegar em partes ao navegador?`] },
]
