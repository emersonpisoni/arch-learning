import type { Topic } from '../../../types'

export const acessibilidade: Topic[] = [
{ id: 'a11y-fundamentos', stage: 'acessibilidade', level: 'essencial', title: 'WCAG e HTML semântico', short: 'WCAG',
  resumo: `As diretrizes de acessibilidade e a base de tudo: usar o elemento HTML certo.`,
  porque: `Uma parte grande das pessoas tem alguma deficiência, temporária ou permanente, e muitas leis (no Brasil, a Lei Brasileira de Inclusão) exigem acessibilidade. HTML semântico resolve a maior parte dos problemas sem nenhum custo extra.`,
  como: [
    `As <b>WCAG</b> se organizam em quatro princípios: <b>perceptível</b>, <b>operável</b>, <b>compreensível</b> e <b>robusto</b>, com níveis A, AA e AAA; o <b>AA</b> é a meta usual. Exemplos de critérios: contraste mínimo de 4,5:1 para texto normal, todo conteúdo operável por teclado, imagens com texto alternativo e formulários com rótulos.`,
    `<b>HTML semântico</b> dá papel, nome e comportamento de graça: <code>&lt;button&gt;</code> é focável e responde a Enter e Espaço; <code>&lt;a href&gt;</code> navega; <code>&lt;label for&gt;</code> liga o rótulo ao campo; <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code> e títulos <code>h1</code> a <code>h6</code> em ordem formam o mapa que leitores de tela usam para navegar.`,
  ],
  conecta: [['aria', 'ARIA só entra onde o HTML não basta.'], ['teclado-foco', 'Operar sem mouse é um critério central.'], ['a11y-testes', 'Como verificar conformidade.'], ['design-system', 'Componentes acessíveis espalham acessibilidade pelo produto.']],
  front: `Uma <code>div</code> com <code>onClick</code> não é um botão: não recebe foco, não responde ao teclado e não é anunciada como botão. Trocar por <code>&lt;button&gt;</code> resolve os três problemas.`,
  ex: { lang: 'html', code: `<!-- ruim: sem foco, sem teclado, sem papel -->
<div class="btn" onclick="salvar()">Salvar</div>

<!-- bom: tudo de graça -->
<button type="button" onclick="salvar()">Salvar</button>

<!-- campo com rótulo associado e erro anunciado -->
<label for="email">E-mail</label>
<input id="email" type="email" aria-describedby="email-erro" aria-invalid="true" />
<p id="email-erro">Informe um e-mail válido, como nome@empresa.com.</p>

<img src="grafico.png" alt="Vendas cresceram 30% entre janeiro e março" />` },
  docs: [['W3C · WCAG 2.2 em resumo', 'https://www.w3.org/WAI/standards-guidelines/wcag/'], ['W3C · Referência rápida WCAG', 'https://www.w3.org/WAI/WCAG22/quickref/'], ['MDN · Acessibilidade', 'https://developer.mozilla.org/en-US/docs/Web/Accessibility'], ['web.dev · Learn Accessibility', 'https://web.dev/learn/accessibility/']],
  perguntas: [`Quantos elementos clicáveis do seu produto não são button nem a?`, `O texto secundário da sua interface passa no contraste de 4,5:1?`, `Como um leitor de tela descobre a estrutura da sua página?`] },

{ id: 'aria', stage: 'acessibilidade', level: 'importante', title: 'ARIA', short: 'ARIA',
  resumo: `Atributos que descrevem papel, estado e relações quando o HTML nativo não basta.`,
  porque: `Componentes customizados (abas, combobox, menus, modais) precisam comunicar seu estado para tecnologias assistivas. ARIA mal usado, porém, piora a acessibilidade em vez de melhorar.`,
  como: [
    `A primeira regra do ARIA é <b>não usar ARIA</b> se existir um elemento nativo. Quando necessário: <b>papéis</b> (<code>role="tab"</code>, <code>role="dialog"</code>), <b>estados e propriedades</b> (<code>aria-expanded</code>, <code>aria-selected</code>, <code>aria-controls</code>), <b>nomes acessíveis</b> (<code>aria-label</code>, <code>aria-labelledby</code>) e <b>regiões vivas</b> (<code>aria-live</code>) para anunciar mudanças dinâmicas.`,
    `ARIA só muda o que é anunciado; não adiciona comportamento. Um <code>role="button"</code> continua precisando de foco e de tratar teclado. O <b>ARIA Authoring Practices Guide</b> descreve padrões completos de teclado e atributos para cada componente; bibliotecas como Radix, React Aria e Headless UI já os implementam.`,
  ],
  conecta: [['a11y-fundamentos', 'HTML semântico vem primeiro.'], ['teclado-foco', 'ARIA não dá comportamento de teclado.'], ['design-system', 'Componentes acessíveis prontos evitam reimplementar.']],
  front: `Mensagens como "item adicionado ao carrinho" ou erros que aparecem sem recarregar a página só são ouvidas por leitores de tela se estiverem numa região <code>aria-live</code>.`,
  ex: { lang: 'html', code: `<div role="tablist" aria-label="Detalhes do produto">
  <button role="tab" id="t1" aria-selected="true"  aria-controls="p1">Descrição</button>
  <button role="tab" id="t2" aria-selected="false" aria-controls="p2" tabindex="-1">Avaliações</button>
</div>
<div role="tabpanel" id="p1" aria-labelledby="t1">…</div>
<div role="tabpanel" id="p2" aria-labelledby="t2" hidden>…</div>

<!-- anunciado pelo leitor de tela quando o texto muda -->
<p aria-live="polite" id="status">Item adicionado ao carrinho.</p>` },
  docs: [['W3C · ARIA Authoring Practices Guide', 'https://www.w3.org/WAI/ARIA/apg/'], ['MDN · ARIA', 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA'], ['React Aria', 'https://react-spectrum.adobe.com/react-aria/']],
  perguntas: [`Qual é a primeira regra do ARIA?`, `Que componente customizado do seu produto não anuncia o próprio estado?`, `Que mudança dinâmica da sua interface deveria estar numa região aria-live?`] },

{ id: 'teclado-foco', stage: 'acessibilidade', level: 'essencial', title: 'Teclado e gerenciamento de foco', short: 'Teclado e foco',
  resumo: `Tudo deve funcionar sem mouse, com foco visível e previsível.`,
  porque: `Usuários de leitores de tela, de teclado e de dispositivos alternativos dependem do foco. Modais que não prendem o foco e rotas que não o movem são falhas comuns em SPAs.`,
  como: [
    `Todo elemento interativo deve ser alcançável com <b>Tab</b>, ativável com Enter ou Espaço e ter <b>foco visível</b> (use <code>:focus-visible</code>, nunca remova o outline sem substituto). A ordem de tabulação deve seguir a ordem visual; evite <code>tabindex</code> positivo.`,
    `Em SPAs, o foco precisa ser <b>gerenciado</b>: ao abrir um modal, mova o foco para dentro, mantenha-o preso enquanto aberto (ou use <code>&lt;dialog&gt;</code> com <code>showModal()</code> e o atributo <code>inert</code>), feche com Esc e devolva o foco ao botão que abriu. Ao trocar de rota, mova o foco para o título da nova página. Um link "pular para o conteúdo" ajuda quem navega por teclado.`,
  ],
  conecta: [['a11y-fundamentos', 'Operabilidade por teclado é critério WCAG.'], ['aria', 'Componentes customizados exigem tratar o teclado.'], ['a11y-testes', 'Testar com teclado é o primeiro teste manual.']],
  front: `O elemento <code>&lt;dialog&gt;</code> nativo com <code>showModal()</code> já resolve o foco preso, o Esc e o fundo inerte; vale a pena antes de construir um modal do zero.`,
  ex: { lang: 'tsx', code: `function Modal({ aberto, onFechar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current!;
    if (aberto) dialog.showModal();   // foco preso, Esc e fundo inerte nativos
    else dialog.close();
  }, [aberto]);

  return (
    <dialog ref={ref} onClose={onFechar} aria-labelledby="modal-titulo">
      <h2 id="modal-titulo">Confirmar exclusão</h2>
      {children}
    </dialog>
  );
}

/* foco visível só para quem navega por teclado */
/* button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } */` },
  docs: [['MDN · dialog', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog'], ['web.dev · Focus', 'https://web.dev/learn/accessibility/focus'], ['W3C · Keyboard interface (APG)', 'https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/']],
  perguntas: [`Você consegue concluir uma compra no seu produto só com o teclado?`, `Para onde vai o foco quando um modal do seu app fecha?`, `Por que evitar tabindex positivo?`] },

{ id: 'a11y-testes', stage: 'acessibilidade', level: 'importante', title: 'Testar acessibilidade', short: 'Testes a11y',
  resumo: `Ferramentas automáticas, testes com teclado e leitores de tela.`,
  porque: `Ferramentas automáticas encontram só parte dos problemas (algo em torno de um terço). O resto exige testes manuais simples que qualquer pessoa do time pode aprender.`,
  como: [
    `<b>Automático</b>: axe-core (extensão, Playwright, jest-axe), Lighthouse e o lint <code>eslint-plugin-jsx-a11y</code> pegam contraste, rótulos faltando, atributos ARIA inválidos e imagens sem alt. Rode no CI para não regredir.`,
    `<b>Manual</b>: navegar só com teclado; usar um leitor de tela (VoiceOver no macOS e iOS, NVDA no Windows, TalkBack no Android); dar zoom de 200% e 400%; testar com redução de movimento e alto contraste. Testes com pessoas com deficiência trazem o que nenhuma ferramenta pega. Usar <code>getByRole</code> no Testing Library já força componentes acessíveis.`,
  ],
  conecta: [['a11y-fundamentos', 'Os critérios que os testes verificam.'], ['testes-front', 'Testing Library incentiva consultas acessíveis.'], ['devops/pipelines', 'Verificações automáticas entram no CI.']],
  front: `Se um teste com <code>getByRole("button", { name: "Salvar" })</code> não encontra o botão, um leitor de tela provavelmente também não vai encontrá-lo.`,
  ex: { lang: 'typescript', code: `// Playwright + axe: falha o teste se houver violações
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("checkout não tem violações de acessibilidade", async ({ page }) => {
  await page.goto("/checkout");
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(resultado.violations).toEqual([]);
});` },
  docs: [['Deque · axe-core', 'https://github.com/dequelabs/axe-core'], ['Playwright · Testes de acessibilidade', 'https://playwright.dev/docs/accessibility-testing'], ['W3C · Easy checks', 'https://www.w3.org/WAI/test-evaluate/preliminary/']],
  perguntas: [`Que parte dos problemas de acessibilidade as ferramentas automáticas não pegam?`, `Você já navegou pelo seu produto com um leitor de tela?`, `Que verificação de acessibilidade poderia entrar no seu CI amanhã?`] },
]
