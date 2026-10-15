import type { Topic } from '../../../types'

export const linguagens: Topic[] = [
{ id: 'paradigmas', stage: 'linguagens', level: 'essencial', title: 'Paradigmas: imperativo, orientado a objetos e funcional', short: 'Paradigmas',
  resumo: `Formas diferentes de organizar programas, e como as linguagens modernas misturam todas.`,
  porque: `Conhecer os paradigmas amplia o repertório para resolver problemas e facilita aprender linguagens novas. Frameworks atuais (React, Compose, SwiftUI, streams) misturam ideias funcionais e orientadas a objetos o tempo todo.`,
  como: [
    `<b>Imperativo</b>: passos que mudam o estado (laços, atribuições). <b>Orientado a objetos</b>: dados e comportamento juntos em objetos, com encapsulamento, polimorfismo e composição (herança com moderação). <b>Funcional</b>: funções puras (mesma entrada, mesma saída, sem efeitos colaterais), <b>imutabilidade</b>, funções como valores e composição (<code>map</code>, <code>filter</code>, <code>reduce</code>).`,
    `<b>Declarativo</b> descreve o resultado desejado, não os passos: SQL, HTML, CSS, JSX, Terraform. Na prática, código bom mistura: núcleo de regras com funções puras e fáceis de testar, efeitos (rede, banco, tela) nas bordas. Outros modelos: lógico (Prolog), orientado a eventos, reativo (streams, signals).`,
  ],
  conecta: [['sistemas-tipos', 'Tipos dão suporte a cada paradigma.'], ['backend/patterns', 'Padrões de projeto orientados a objetos.'], ['backend/hexagonal', 'Núcleo puro, efeitos nas bordas.'], ['frontend/reatividade', 'Programação reativa nos frameworks.']],
  front: `React é fortemente funcional: componentes são funções do estado, o estado é tratado como imutável e efeitos ficam isolados em <code>useEffect</code> e handlers.`,
  ex: { lang: 'typescript', code: `// imperativo
let total = 0;
for (const item of carrinho) {
  if (item.disponivel) total += item.preco * item.quantidade;
}

// funcional: sem mutação, composto de funções pequenas
const subtotal = (i: Item) => i.preco * i.quantidade;
const total2 = carrinho.filter((i) => i.disponivel).map(subtotal).reduce((a, b) => a + b, 0);

// atualização imutável (o objeto original não muda)
const atualizado = { ...pedido, itens: [...pedido.itens, novoItem] };` },
  docs: [['MDN · Functional programming', 'https://developer.mozilla.org/en-US/docs/Glossary/Functional_programming'], ['Structure and Interpretation of Computer Programs', 'https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.zip/index.html'], ['Professor Frisby’s Mostly Adequate Guide to FP', 'https://mostly-adequate.gitbook.io/mostly-adequate-guide']],
  perguntas: [`Que parte do seu código é difícil de testar por misturar regra de negócio com efeitos?`, `Por que imutabilidade facilita detectar mudanças?`, `Que ferramenta declarativa você usa todo dia sem pensar nisso?`] },

{ id: 'sistemas-tipos', stage: 'linguagens', level: 'essencial', title: 'Sistemas de tipos e TypeScript', short: 'Tipos',
  resumo: `Tipagem estática e dinâmica, forte e fraca, inferência e como modelar o domínio com tipos.`,
  porque: `Um bom uso de tipos elimina classes inteiras de bugs antes da execução, documenta o código e torna refatorações seguras. TypeScript é hoje a linguagem padrão de boa parte do front e do back em JavaScript, e as ideias valem para Kotlin, Swift, Rust e Go.`,
  como: [
    `<b>Estática</b> (verificada antes de rodar: TypeScript, Java, Go, Rust) ou <b>dinâmica</b> (verificada ao rodar: JavaScript, Python, Ruby). <b>Forte</b> ou <b>fraca</b> conforme as conversões implícitas que a linguagem faz. <b>Nominal</b> (o nome do tipo importa: Java) ou <b>estrutural</b> (a forma importa: TypeScript, Go). <b>Inferência</b> deduz tipos sem anotações.`,
    `Modelar com tipos: <b>uniões discriminadas</b> tornam estados impossíveis impossíveis de representar; <b>genéricos</b> reaproveitam com segurança; <code>unknown</code> em vez de <code>any</code> obriga a validar. Tipos somem em tempo de execução no TypeScript: dados externos (API, formulários) precisam de validação em runtime (Zod, Valibot), que também pode gerar os tipos.`,
  ],
  conecta: [['paradigmas', 'Tipos funcionais e orientados a objetos.'], ['compiladores', 'Onde a verificação de tipos acontece.'], ['backend/contratos', 'Tipos gerados a partir do contrato da API.'], ['frontend/estado', 'Estados de tela modelados com uniões.']],
  front: `Modelar o estado de uma requisição como união (<code>carregando | erro | sucesso</code>) em vez de três booleanos impede combinações como "carregando e com erro ao mesmo tempo".`,
  ex: { lang: 'typescript', code: `// três booleanos permitem 8 combinações, várias sem sentido
type EstadoRuim = { carregando: boolean; erro?: string; dados?: Pedido[] };

// união discriminada: só estados válidos existem
type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "sucesso"; dados: Pedido[] };

function render(e: Estado) {
  switch (e.tipo) {
    case "carregando": return "Carregando…";
    case "erro": return e.mensagem;           // só aqui "mensagem" existe
    case "sucesso": return \`\${e.dados.length} pedidos\`;
    default: { const nunca: never = e; return nunca; }   // erro se faltar um caso
  }
}

// dados externos: validar em runtime e derivar o tipo
const PedidoSchema = z.object({ id: z.string(), total: z.number().int() });
type Pedido = z.infer<typeof PedidoSchema>;` },
  docs: [['TypeScript · Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'], ['TypeScript · Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html'], ['Zod · Documentação', 'https://zod.dev/']],
  perguntas: [`Que estado do seu código usa vários booleanos que poderiam ser uma união?`, `Onde o seu código confia em dados externos sem validar em runtime?`, `Qual a diferença prática entre tipagem estrutural e nominal?`] },

{ id: 'compiladores', stage: 'linguagens', level: 'importante', title: 'Compiladores, interpretadores e JIT', short: 'Compiladores',
  resumo: `O caminho do código-fonte até instruções que a máquina executa.`,
  porque: `Ferramentas do dia a dia são compiladores: o TypeScript, o Babel, o bundler, o minificador, o linter. Entender as etapas explica mensagens de erro, source maps, o que é uma AST, por que o JavaScript "esquenta" e como codemods reescrevem milhares de arquivos.`,
  como: [
    `Etapas típicas: <b>análise léxica</b> (texto em tokens), <b>análise sintática</b> (tokens numa <b>AST</b>, a árvore do programa), <b>análise semântica</b> (tipos, escopos), <b>otimização</b> e <b>geração de código</b>. <b>Compiladores AOT</b> geram código de máquina antes (C, Rust, Go, Swift). <b>Interpretadores</b> executam a AST ou bytecode diretamente.`,
    `<b>JIT</b> (just-in-time) combina os dois: o V8 interpreta bytecode e compila as funções "quentes" para código de máquina otimizado, assumindo os tipos observados; se os tipos mudarem, ele desotimiza. <b>Transpiladores</b> traduzem entre linguagens de alto nível (TypeScript → JavaScript). Linters, formatadores e codemods trabalham sobre a AST.`,
  ],
  conecta: [['sistemas-tipos', 'A verificação de tipos é uma etapa do compilador.'], ['frontend/bundlers', 'Bundlers e transformações de código.'], ['praticas/lint-format', 'Linters analisam a AST.'], ['mobile/flutter', 'AOT em produção, JIT no desenvolvimento.']],
  front: `O AST Explorer mostra a árvore que o Babel, o ESLint e o TypeScript enxergam no seu código; é o ponto de partida para escrever uma regra de lint própria ou um codemod.`,
  ex: { lang: 'text', code: `Código:      const total = preco * 2;

Tokens:      [const] [total] [=] [preco] [*] [2] [;]

AST:         VariableDeclaration (const)
               └─ VariableDeclarator
                    ├─ id: Identifier "total"
                    └─ init: BinaryExpression "*"
                         ├─ left:  Identifier "preco"
                         └─ right: NumericLiteral 2

V8:          bytecode (Ignition) → função quente → código de máquina otimizado (TurboFan)` },
  docs: [['AST Explorer', 'https://astexplorer.net/'], ['Crafting Interpreters', 'https://craftinginterpreters.com/'], ['V8 · Blog', 'https://v8.dev/blog']],
  perguntas: [`Que ferramentas do seu projeto trabalham sobre a AST?`, `Por que uma função JavaScript que recebe tipos variados fica mais lenta?`, `Qual a diferença entre um transpilador e um compilador AOT?`] },
]
