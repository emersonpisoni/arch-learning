import type { Topic } from '../../../types'

export const interfaceBase: Topic[] = [
{ id: 'css-moderno', stage: 'interface', level: 'essencial', title: 'CSS moderno: cascata, especificidade e camadas', short: 'CSS moderno',
  resumo: `Como o navegador decide qual regra vence, e as ferramentas atuais para manter o CSS sob controle.`,
  porque: `A maior parte dos bugs de estilo vem de não entender a cascata: uma regra que "não pega", um !important que se espalha, estilos que vazam entre componentes. O CSS evoluiu muito e resolve hoje problemas que antes exigiam bibliotecas.`,
  como: [
    `A <b>cascata</b> decide entre regras conflitantes nesta ordem: origem e importância, <b>camadas</b> (<code>@layer</code>), <b>especificidade</b> (ids > classes, atributos e pseudo-classes > elementos) e, por fim, a ordem no código. <code>@layer</code> permite declarar a prioridade de blocos inteiros (reset, base, componentes, utilitários) independentemente da especificidade.`,
    `Recursos modernos: <b>variáveis CSS</b> (custom properties) para temas e tokens; <code>:is()</code> e <code>:where()</code> (esta com especificidade zero); <code>:has()</code>, o "seletor de pai"; <b>aninhamento</b> nativo; unidades relativas (<code>rem</code>, <code>ch</code>, <code>dvh</code>) e funções como <code>clamp()</code> para tipografia fluida. Estratégias de organização: CSS Modules, utilitários (Tailwind), CSS-in-JS em tempo de build e convenções como BEM.`,
  ],
  conecta: [['layout-responsivo', 'Layout e responsividade com CSS moderno.'], ['design-system', 'Tokens viram variáveis CSS.'], ['critical-rendering-path', 'CSS bloqueia a renderização.'], ['web-components', 'Shadow DOM isola estilos.']],
  front: `Quando uma regra "não pega", abra o painel Styles do DevTools: ele mostra a regra vencedora e as riscadas, com a especificidade e a origem de cada uma.`,
  ex: { lang: 'css', code: `/* prioridade declarada por camada, não por especificidade */
@layer reset, base, componentes, utilitarios;

@layer componentes {
  .card {
    padding: var(--space-4);
    border-radius: var(--radius-md);
    &:hover { border-color: var(--color-accent); }      /* aninhamento nativo */
    &:has(img) { padding-top: 0; }                      /* "seletor de pai" */
  }
}

@layer utilitarios {
  .sem-padding { padding: 0; }    /* vence .card mesmo com especificidade igual */
}

h1 { font-size: clamp(2rem, 5vw, 3.5rem); }            /* tipografia fluida */` },
  docs: [['MDN · Cascade, specificity and inheritance', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts'], ['MDN · @layer', 'https://developer.mozilla.org/en-US/docs/Web/CSS/@layer'], ['web.dev · Learn CSS', 'https://web.dev/learn/css/']],
  perguntas: [`Que regra do seu projeto precisou de !important, e o que @layer resolveria?`, `Qual a diferença de especificidade entre :is() e :where()?`, `Que problema o :has() resolve que antes exigia JavaScript?`] },

{ id: 'layout-responsivo', stage: 'interface', level: 'essencial', title: 'Layout responsivo: Flexbox, Grid e container queries', short: 'Layout',
  resumo: `Montar interfaces que se adaptam a qualquer tela, sem gambiarras.`,
  porque: `Usuários acessam de celulares, tablets, monitores enormes e janelas redimensionadas. Layouts frágeis quebram em telas que ninguém testou, e o CSS atual tem ferramentas que tornam a responsividade quase natural.`,
  como: [
    `<b>Flexbox</b> distribui itens em uma dimensão (linha ou coluna): barras de navegação, alinhamentos, grupos de botões. <b>Grid</b> organiza em duas dimensões: layouts de página, galerias, formulários; <code>repeat(auto-fill, minmax(240px, 1fr))</code> cria colunas que se ajustam sozinhas. Use <code>gap</code> em vez de margens entre irmãos.`,
    `<b>Media queries</b> reagem ao tamanho da tela; <b>container queries</b> (<code>@container</code>) reagem ao tamanho do componente pai, o que torna componentes realmente reutilizáveis em qualquer lugar. Comece pelo celular (mobile first), use unidades relativas, imagens fluidas e teste com zoom de 200% e textos maiores.`,
  ],
  conecta: [['css-moderno', 'A base de cascata e variáveis.'], ['imagens-fontes', 'Imagens responsivas.'], ['a11y-fundamentos', 'Zoom e reflow são critérios de acessibilidade.'], ['mobile/ui-mobile', 'Interfaces para telas pequenas e toque.']],
  front: `Um card que se rearranja conforme a largura da coluna em que está (e não da tela) é o caso de uso perfeito para container queries.`,
  ex: { lang: 'css', code: `/* galeria que se ajusta sozinha, sem media query */
.produtos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* o card reage ao tamanho do próprio container */
.coluna { container-type: inline-size; }

.card { display: grid; gap: 8px; }
@container (min-width: 420px) {
  .card { grid-template-columns: 140px 1fr; }   /* imagem ao lado do texto */
}` },
  docs: [['MDN · CSS Grid layout', 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout'], ['MDN · Container queries', 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries'], ['CSS-Tricks · A complete guide to Flexbox', 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/']],
  perguntas: [`Quando usar Flexbox e quando usar Grid?`, `Que componente do seu projeto se beneficiaria de container queries?`, `Por que gap é melhor do que margens entre itens irmãos?`] },

{ id: 'formularios', stage: 'interface', level: 'essencial', title: 'Formulários e validação', short: 'Formulários',
  resumo: `Coletar dados do usuário com boa experiência, acessibilidade e segurança.`,
  porque: `Formulários estão em todo produto (cadastro, checkout, configurações) e são onde usuários mais desistem. Cada detalhe (rótulos, mensagens de erro, teclado certo no celular, preenchimento automático) muda a taxa de conclusão.`,
  como: [
    `Use o HTML a seu favor: <code>&lt;label&gt;</code> ligado a cada campo, <code>type</code> correto (<code>email</code>, <code>tel</code>, <code>number</code>) para o teclado certo no celular, <code>autocomplete</code> (<code>email</code>, <code>street-address</code>, <code>one-time-code</code>) para preenchimento automático, e validação nativa (<code>required</code>, <code>pattern</code>) como base.`,
    `<b>Validação</b>: no cliente para feedback rápido (de preferência ao sair do campo, não a cada tecla) e <b>sempre no servidor</b>. Mensagens perto do campo, específicas e associadas por <code>aria-describedby</code>; foco no primeiro erro ao enviar. Bibliotecas como React Hook Form e TanStack Form com schemas (Zod) compartilhados com o backend evitam regras duplicadas. Proteja contra envio duplo e preserve o que foi digitado em caso de erro.`,
  ],
  conecta: [['a11y-fundamentos', 'Rótulos e erros acessíveis.'], ['backend/rest', 'Erros de validação por campo vindos da API.'], ['seguranca/injecoes', 'A validação do servidor é a que protege.'], ['estado', 'Estado de formulário fica com o formulário.']],
  front: `Um erro de validação devolvido pela API no formato padronizado (campo + mensagem) pode ser mapeado direto para o campo certo do formulário.`,
  ex: { lang: 'tsx', code: `const Cadastro = z.object({
  email: z.string().email("Informe um e-mail válido, como nome@empresa.com"),
  cep: z.string().regex(/^\\d{5}-?\\d{3}$/, "CEP deve ter 8 dígitos"),
});

function Formulario() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(Cadastro), mode: "onBlur" });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate>
      <label htmlFor="email">E-mail</label>
      <input id="email" type="email" autoComplete="email"
             aria-invalid={!!errors.email} aria-describedby="email-erro" {...register("email")} />
      <p id="email-erro" role="alert">{errors.email?.message}</p>

      <button disabled={isSubmitting}>Criar conta</button>   {/* evita envio duplo */}
    </form>
  );
}` },
  docs: [['web.dev · Learn Forms', 'https://web.dev/learn/forms/'], ['MDN · Client-side form validation', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation'], ['React Hook Form', 'https://react-hook-form.com/get-started']],
  perguntas: [`Que formulário do seu produto tem a maior taxa de abandono, e por quê?`, `Por que validar ao sair do campo em vez de a cada tecla?`, `Como evitar que o usuário perca o que digitou quando o envio falha?`] },

{ id: 'roteamento', stage: 'interface', level: 'importante', title: 'Roteamento em aplicações web', short: 'Roteamento',
  resumo: `URLs, navegação, histórico e carregamento de dados por rota.`,
  porque: `A URL é a interface mais antiga da web: precisa ser compartilhável, funcionar com o botão voltar e refletir o que está na tela. SPAs que quebram isso frustram usuários e prejudicam SEO e acessibilidade.`,
  como: [
    `Em <b>aplicações multipágina</b>, cada navegação é uma requisição ao servidor. Em <b>SPAs</b>, um roteador (React Router, TanStack Router, Vue Router) intercepta a navegação e usa a <b>History API</b> para mudar a URL sem recarregar. Roteadores modernos fazem <b>busca de dados por rota</b> (loaders), code splitting por rota e rotas aninhadas com layouts compartilhados.`,
    `Frameworks como Next.js, Remix, SvelteKit e Nuxt usam <b>roteamento por arquivos</b>. Cuidados: guardar filtros e estado relevante na URL, restaurar a rolagem ao voltar, mover o foco ao trocar de página (acessibilidade), tratar 404 e rotas protegidas e configurar o servidor para devolver o HTML da SPA em qualquer rota.`,
  ],
  conecta: [['estado', 'A URL como estado compartilhável.'], ['data-fetching', 'Loaders buscam dados por rota.'], ['carregamento', 'Code splitting por rota.'], ['teclado-foco', 'Mover o foco ao trocar de página.'], ['seo', 'URLs estáveis e indexáveis.']],
  front: `Se ao recarregar uma rota da SPA aparece 404, o servidor ou a CDN não está configurado para devolver o index.html em todas as rotas.`,
  ex: { lang: 'tsx', code: `// React Router: rotas aninhadas, dados e código carregados por rota
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,                         // menu e rodapé compartilhados
    errorElement: <PaginaDeErro />,
    children: [
      { index: true, element: <Inicio /> },
      {
        path: "pedidos/:id",
        loader: ({ params }) => api.pedido(params.id),   // dados antes de renderizar
        lazy: () => import("./rotas/DetalhePedido"),     // código sob demanda
      },
      { path: "*", element: <NaoEncontrado /> },
    ],
  },
]);` },
  docs: [['React Router · Documentação', 'https://reactrouter.com/home'], ['MDN · History API', 'https://developer.mozilla.org/en-US/docs/Web/API/History_API'], ['TanStack Router', 'https://tanstack.com/router/latest/docs/framework/react/overview']],
  perguntas: [`Que estado do seu app deveria estar na URL e não está?`, `O que acontece com o foco e a rolagem quando a rota muda no seu app?`, `Por que uma SPA precisa de configuração especial no servidor?`] },
]
