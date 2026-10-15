import type { Topic } from '../../../types'

export const arquiteturaFront: Topic[] = [
{ id: 'estado', stage: 'arquitetura-front', level: 'essencial', title: 'Tipos de estado e onde guardá-los', short: 'Estado',
  resumo: `Estado de servidor, de URL, de formulário e de interface pedem ferramentas diferentes.`,
  porque: `Muita complexidade de front vem de colocar tudo num store global. Separar os tipos de estado reduz código, bugs de sincronização e re-renders.`,
  como: [
    `<b>Estado do servidor</b> (pedidos, produtos) é uma cópia em cache de dados que pertencem ao backend: use React Query, SWR, Apollo ou loaders do framework. <b>Estado da URL</b> (filtros, página, aba ativa) fica na rota e nos query params, assim pode ser compartilhado e sobrevive ao recarregar. <b>Estado de formulário</b> fica com o formulário (React Hook Form, ou o próprio HTML).`,
    `<b>Estado de interface</b> (modal aberto, item expandido) costuma ser local ao componente. O que sobra de verdadeiramente global (tema, usuário logado, carrinho) cabe em Context ou numa store pequena (Zustand, Jotai, Redux Toolkit). Regra prática: mantenha o estado o mais perto possível de quem usa e derive o resto em vez de duplicar.`,
  ],
  conecta: [['data-fetching', 'Estado de servidor tem ferramentas próprias.'], ['perf-runtime', 'Onde o estado mora define o que re-renderiza.'], ['backend/cache', 'O estado do servidor no cliente é um cache.'], ['arquitetura/acoplamento-coesao', 'Store global gigante acopla a aplicação inteira.'], ['fundamentos/sistemas-tipos', 'Estados modelados com uniões discriminadas.']],
  front: `Se você tem um <code>useEffect</code> que copia uma prop para um estado, ou um store global guardando a resposta de uma API, há uma boa chance de esse código poder ser removido.`,
  ex: { lang: 'tsx', code: `function Pedidos() {
  // estado da URL: filtros compartilháveis e que sobrevivem ao reload
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "todos";

  // estado do servidor: cache, revalidação e loading prontos
  const { data, isPending } = useQuery({
    queryKey: ["pedidos", status],
    queryFn: () => api.pedidos({ status }),
  });

  // estado de interface: local
  const [selecionado, setSelecionado] = useState<number | null>(null);

  // derivado, não duplicado
  const total = data?.reduce((s, p) => s + p.total, 0) ?? 0;
  ...
}` },
  docs: [['React · Choosing the state structure', 'https://react.dev/learn/choosing-the-state-structure'], ['React · You might not need an effect', 'https://react.dev/learn/you-might-not-need-an-effect'], ['TkDodo · React Query as a state manager', 'https://tkdodo.eu/blog/react-query-as-a-state-manager']],
  perguntas: [`Que parte do seu store global é, na verdade, estado do servidor?`, `Que filtros da sua aplicação deveriam estar na URL?`, `Que estado duplicado poderia ser derivado?`] },

{ id: 'data-fetching', stage: 'arquitetura-front', level: 'essencial', title: 'Busca de dados no cliente', short: 'Data fetching',
  resumo: `Buscar, cachear, revalidar e alterar dados do servidor sem reinventar a roda.`,
  porque: `Loading, erro, cache, deduplicação, retry, paginação e atualização otimista aparecem em toda tela. Fazer isso à mão com useEffect gera race conditions e código repetido; é aqui que o front mais conversa com o desenho da API.`,
  como: [
    `Bibliotecas como <b>TanStack Query</b>, <b>SWR</b>, <b>RTK Query</b> e <b>Apollo</b> tratam respostas como cache identificado por chave, com deduplicação, revalidação ao focar a janela, retry com backoff, paginação e infinite scroll. Frameworks com loaders (React Router, Next.js, Remix) buscam dados antes de renderizar a rota, evitando cascatas.`,
    `<b>Mutations</b> alteram dados e depois invalidam ou atualizam o cache. <b>Atualização otimista</b> mostra o resultado na hora e desfaz se o servidor recusar. Evite <b>cascatas</b> (componente pai busca, renderiza o filho, que só então busca): busque em paralelo ou no nível da rota.`,
  ],
  conecta: [['estado', 'Estado do servidor tem dono certo.'], ['backend/rest', 'O formato da API molda a busca de dados.'], ['cache-assets', 'Cache de dados no cliente.'], ['backend/idempotencia', 'Retries automáticos em mutations exigem cuidado.'], ['server-components', 'Buscar no servidor é outra opção.']],
  front: `Uma busca com useEffect sem cancelamento pode exibir o resultado de uma requisição antiga que chegou depois da nova: é uma race condition no front.`,
  ex: { lang: 'tsx', code: `const qc = useQueryClient();

const curtir = useMutation({
  mutationFn: (id: number) => api.curtir(id),
  // atualização otimista
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: ["post", id] });
    const anterior = qc.getQueryData<Post>(["post", id]);
    qc.setQueryData<Post>(["post", id], (p) => p && { ...p, curtidas: p.curtidas + 1 });
    return { anterior };
  },
  onError: (_e, id, ctx) => qc.setQueryData(["post", id], ctx?.anterior), // desfaz
  onSettled: (_d, _e, id) => qc.invalidateQueries({ queryKey: ["post", id] }),
});` },
  docs: [['TanStack Query · Overview', 'https://tanstack.com/query/latest/docs/framework/react/overview'], ['TanStack Query · Optimistic updates', 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates'], ['React Router · Data loading', 'https://reactrouter.com/start/framework/data-loading']],
  perguntas: [`Que tela do seu app tem uma cascata de requisições?`, `Quando uma atualização otimista é arriscada?`, `Como evitar exibir a resposta de uma requisição antiga?`] },

{ id: 'design-system', stage: 'arquitetura-front', level: 'importante', title: 'Design systems e bibliotecas de componentes', short: 'Design system',
  resumo: `Tokens, componentes e documentação compartilhados entre produtos e times.`,
  porque: `Sem um design system, cada time reinventa botões e modais, com comportamentos e acessibilidade diferentes. Com ele, consistência e qualidade se espalham, mas surge um produto interno que precisa de dono, versionamento e governança.`,
  como: [
    `Camadas: <b>design tokens</b> (cores, espaçamentos, tipografia como variáveis, sincronizadas com o Figma), <b>componentes base</b> acessíveis (muitas vezes construídos sobre primitives headless como Radix ou React Aria), <b>padrões</b> compostos e <b>documentação</b> viva (Storybook com exemplos e testes visuais).`,
    `Decisões de arquitetura: pacote versionado com SemVer e changelog, ou componentes copiados para o projeto (estilo shadcn/ui); estratégia de estilo (CSS Modules, CSS-in-JS, Tailwind, vanilla-extract); temas e modo escuro via tokens; e testes de regressão visual (Chromatic, Playwright screenshots).`,
  ],
  conecta: [['a11y-fundamentos', 'Componentes acessíveis espalham acessibilidade.'], ['monorepo', 'Design systems costumam viver em monorepos.'], ['praticas/versionamento-semantico', 'Mudanças precisam ser comunicadas por versão.'], ['testes-front', 'Testes visuais protegem os componentes.']],
  front: `Esse é o ponto de encontro entre design e engenharia no front. Tokens bem definidos fazem o modo escuro e uma mudança de marca virarem troca de variáveis, não reescrita.`,
  ex: { lang: 'css', code: `/* tokens: a fonte única de cores e espaçamentos */
:root {
  --color-bg: #ffffff;
  --color-fg: #111827;
  --color-accent: #2563eb;
  --space-2: 8px;
  --radius-md: 8px;
}
[data-theme="dark"] {
  --color-bg: #0b1020;
  --color-fg: #e5e7eb;
}

/* componente consome tokens, nunca valores soltos */
.button {
  background: var(--color-accent);
  padding: var(--space-2) calc(var(--space-2) * 2);
  border-radius: var(--radius-md);
}` },
  docs: [['Storybook · Documentação', 'https://storybook.js.org/docs'], ['W3C · Design Tokens Format', 'https://www.designtokens.org/'], ['Radix Primitives', 'https://www.radix-ui.com/primitives'], ['shadcn/ui', 'https://ui.shadcn.com/docs']],
  perguntas: [`Quem é dono do design system na sua empresa?`, `Como uma mudança quebrando um componente chega aos produtos que o usam?`, `Quantos botões diferentes existem hoje no seu produto?`] },

{ id: 'microfrontends', stage: 'arquitetura-front', level: 'importante', title: 'Microfrontends', short: 'Microfrontends',
  resumo: `Dividir uma interface entre times que publicam suas partes de forma independente.`,
  porque: `Em empresas com muitos times trabalhando no mesmo produto, publicar tudo junto vira gargalo. Microfrontends resolvem isso, mas com custos reais de performance, consistência e complexidade.`,
  como: [
    `Formas de compor: <b>por rota</b> (cada caminho é uma aplicação, ligadas por links ou um shell), <b>Module Federation</b> (o host carrega módulos remotos em tempo de execução), <b>Web Components</b>, <b>composição no servidor ou no edge</b> (fragmentos de HTML), e iframes nos casos de isolamento extremo.`,
    `Desafios: dependências duplicadas (várias cópias do React), versões conflitantes, consistência visual (design system compartilhado), comunicação entre partes (eventos, URL, contratos explícitos), roteamento e observabilidade. Só vale quando o problema organizacional é real; para um time só, um monorepo modular resolve com menos custo.`,
  ],
  conecta: [['backend/microsservicos', 'A mesma ideia e os mesmos trade-offs no backend.'], ['arquitetura/conway', 'Uma resposta à estrutura dos times.'], ['monorepo', 'A alternativa mais simples para muitos casos.'], ['design-system', 'Essencial para manter consistência.'], ['arquitetura/strangler', 'Também serve para migrar o front aos poucos.']],
  front: `Antes de adotar, pergunte: o problema é técnico ou é de vários times esperando um deploy único? Se for o segundo, microfrontends podem ajudar; se for o primeiro, provavelmente não.`,
  ex: { lang: 'javascript', code: `// vite.config.js do shell (host) com Module Federation
import federation from "@originjs/vite-plugin-federation";

export default {
  plugins: [
    federation({
      name: "shell",
      remotes: {
        checkout: "https://checkout.loja.com/assets/remoteEntry.js",
        catalogo: "https://catalogo.loja.com/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],   // evita cópias duplicadas
    }),
  ],
};

// uso no shell
const Checkout = lazy(() => import("checkout/App"));` },
  docs: [['Martin Fowler · Micro Frontends', 'https://martinfowler.com/articles/micro-frontends.html'], ['Module Federation', 'https://module-federation.io/'], ['micro-frontends.org', 'https://micro-frontends.org/']],
  perguntas: [`Que problema organizacional justificaria microfrontends na sua empresa?`, `Como evitar baixar várias cópias do React?`, `Como duas partes independentes da interface devem se comunicar?`] },

{ id: 'monorepo', stage: 'arquitetura-front', level: 'importante', title: 'Monorepos', short: 'Monorepo',
  resumo: `Vários projetos e pacotes num único repositório, com ferramentas para não perder velocidade.`,
  porque: `Monorepos facilitam compartilhar tipos, design system e configuração entre front, back e apps, e mudanças atômicas entre pacotes. Sem as ferramentas certas, o CI fica lento e as fronteiras se perdem.`,
  como: [
    `Gerenciadores de pacotes com <b>workspaces</b> (pnpm, npm, Yarn) ligam os pacotes locais. Ferramentas de build (<b>Turborepo</b>, <b>Nx</b>) entendem o grafo de dependências, rodam só o que foi afetado por uma mudança e fazem <b>cache</b> de resultados, inclusive remoto e compartilhado entre o time e o CI.`,
    `Boas práticas: fronteiras explícitas entre pacotes (exports definidos, regras de dependência), versões únicas de dependências críticas, e CODEOWNERS para definir quem revisa cada área. O contraponto é o <b>polyrepo</b>: mais isolamento, mas mudanças entre projetos viram vários PRs coordenados.`,
  ],
  conecta: [['design-system', 'O design system como pacote compartilhado.'], ['devops/pipelines', 'Executar só o afetado e cachear no CI.'], ['backend/linguagem', 'Compartilhar tipos entre front e back em TypeScript.'], ['arquitetura/monolito-modular', 'As mesmas regras de fronteira.']],
  front: `Um pacote <code>@loja/contracts</code> com os tipos e schemas da API, usado tanto pelo backend quanto pelo front, elimina uma classe inteira de bugs de integração.`,
  ex: { lang: 'json', code: `// pnpm-workspace.yaml → packages: ["apps/*", "packages/*"]
// estrutura
//   apps/web        (React)
//   apps/api        (Node)
//   packages/ui     (design system)
//   packages/contracts (tipos e schemas compartilhados)

// turbo.json: roda o afetado e cacheia o resto
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test":  { "dependsOn": ["^build"] },
    "lint":  {}
  }
}` },
  docs: [['monorepo.tools', 'https://monorepo.tools/'], ['Turborepo · Documentação', 'https://turbo.build/repo/docs'], ['Nx · Documentação', 'https://nx.dev/getting-started/intro'], ['pnpm · Workspaces', 'https://pnpm.io/workspaces']],
  perguntas: [`O que front e back do seu time poderiam compartilhar num monorepo?`, `Como evitar que o CI de um monorepo rode tudo a cada commit?`, `Qual a desvantagem de um polyrepo para mudanças entre projetos?`] },

{ id: 'testes-front', stage: 'arquitetura-front', level: 'essencial', title: 'Estratégia de testes no front', short: 'Testes de front',
  resumo: `Testes de componente, de integração, end-to-end e visuais, cada um no seu lugar.`,
  porque: `Testar detalhes de implementação deixa a suíte frágil; não testar nada deixa o deploy arriscado. Uma estratégia clara dá confiança sem desacelerar o time.`,
  como: [
    `<b>Unitários</b> para lógica pura (formatação, cálculos, hooks complexos). <b>Componente/integração</b> com Testing Library, testando como o usuário usa (pelo papel e texto, não por classe CSS) e com a API simulada pelo <b>MSW</b>. <b>End-to-end</b> com Playwright ou Cypress para os fluxos críticos, como login e checkout. <b>Regressão visual</b> para o design system.`,
    `Diretrizes: teste comportamento, não implementação; prefira poucos E2E estáveis a muitos frágeis; use dados determinísticos; e rode testes de contrato ou valide schemas para que os mocks do MSW não divirjam da API real.`,
  ],
  conecta: [['backend/testes', 'A mesma pirâmide (ou troféu) de testes.'], ['backend/contratos', 'Contratos mantêm os mocks fiéis à API.'], ['a11y-testes', 'Consultas por papel testam acessibilidade de graça.'], ['praticas/tdd', 'Escrever testes antes do código.']],
  front: `Se um refactor que não muda o comportamento quebra vários testes, eles provavelmente estão testando detalhes de implementação.`,
  ex: { lang: 'tsx', code: `// Testing Library + MSW: testa como o usuário usa
import { http, HttpResponse } from "msw";

server.use(
  http.post("/api/pedidos", () => HttpResponse.json({ id: 981, status: "PENDENTE" }, { status: 201 })),
);

test("finaliza o pedido e mostra a confirmação", async () => {
  const user = userEvent.setup();
  render(<Checkout />);

  await user.type(screen.getByLabelText("CEP"), "01001-000");
  await user.click(screen.getByRole("button", { name: "Finalizar pedido" }));

  expect(await screen.findByText("Pedido 981 recebido")).toBeInTheDocument();
});` },
  docs: [['Testing Library · Guiding principles', 'https://testing-library.com/docs/guiding-principles'], ['MSW · Documentação', 'https://mswjs.io/docs/'], ['Playwright · Documentação', 'https://playwright.dev/docs/intro'], ['Vitest', 'https://vitest.dev/guide/']],
  perguntas: [`Que fluxo do seu produto merece um teste end-to-end?`, `Seus testes quebram quando você refatora sem mudar comportamento?`, `Como garantir que os mocks continuam iguais à API real?`] },
]
