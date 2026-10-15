import type { Topic } from '../../../types'

export const qualidade: Topic[] = [
{ id: 'tdd', stage: 'qualidade', level: 'importante', title: 'TDD', short: 'TDD',
  resumo: `Escrever o teste antes do código, em ciclos curtos: vermelho, verde, refatorar.`,
  porque: `TDD é uma técnica de design tanto quanto de teste: obriga a pensar na interface e no comportamento antes da implementação e produz código testável por construção. Mesmo quem não usa sempre se beneficia de usar em lógica complexa.`,
  como: [
    `O ciclo: <b>vermelho</b> (escreva um teste pequeno que falha), <b>verde</b> (escreva o mínimo de código para passar) e <b>refatorar</b> (melhore o código com os testes como rede de segurança). Repita em passos pequenos, de minutos.`,
    `Funciona especialmente bem para regras de negócio, cálculos, parsers e correção de bugs (primeiro um teste que reproduz o bug). É menos natural para interfaces visuais e código exploratório. A variação "outside-in" começa por um teste de aceitação e desce até as unidades.`,
  ],
  conecta: [['backend/testes', 'Os tipos de teste e a pirâmide.'], ['refatoracao', 'O terceiro passo do ciclo.'], ['dubles-teste', 'Isolar dependências durante o TDD.'], ['frontend/testes-front', 'Testes de componente pelo comportamento.']],
  front: `Hooks com lógica (cálculo de parcelas, validação de CPF, formatação) são ótimos candidatos a TDD: rápidos de testar e cheios de casos de borda.`,
  ex: { lang: 'typescript', code: `// 1. vermelho: o teste descreve o comportamento desejado
test("frete é grátis acima de R$ 200", () => {
  expect(calcularFrete({ totalCents: 20_000, cep: "01001000" })).toBe(0);
});
test("frete padrão de R$ 15 abaixo de R$ 200", () => {
  expect(calcularFrete({ totalCents: 19_990, cep: "01001000" })).toBe(1_500);
});

// 2. verde: o mínimo para passar
export function calcularFrete({ totalCents }: { totalCents: number; cep: string }) {
  return totalCents >= 20_000 ? 0 : 1_500;
}

// 3. refatorar: extrair constantes, nomes melhores, com os testes passando` },
  docs: [['Martin Fowler · Test Driven Development', 'https://martinfowler.com/bliki/TestDrivenDevelopment.html'], ['Kent Beck · Canon TDD', 'https://tidyfirst.substack.com/p/canon-tdd'], ['Vitest · Getting started', 'https://vitest.dev/guide/']],
  perguntas: [`Que parte do seu código atual seria mais fácil de escrever com TDD?`, `Por que escrever um teste que reproduz um bug antes de corrigi-lo?`, `Onde o TDD é menos natural?`] },

{ id: 'dubles-teste', stage: 'qualidade', level: 'importante', title: 'Dublês de teste: mocks, stubs e fakes', short: 'Mocks',
  resumo: `Substitutos de dependências reais em testes, e quando eles atrapalham mais que ajudam.`,
  porque: `Mocks em excesso produzem testes que passam com o sistema quebrado e quebram a cada refatoração. Saber qual dublê usar, e quando usar a dependência real, é o que faz a suíte de testes ser confiável.`,
  como: [
    `<b>Stub</b>: devolve respostas prontas. <b>Mock</b>: verifica se foi chamado de certa forma. <b>Spy</b>: registra chamadas da implementação real. <b>Fake</b>: implementação simplificada que funciona de verdade (repositório em memória, banco em container). <b>Dummy</b>: só preenche um parâmetro.`,
    `Diretrizes: dubles nas <b>fronteiras</b> do sistema (rede, tempo, aleatoriedade, serviços externos), não entre classes internas; prefira fakes e dependências reais (Testcontainers, MSW) a mocks que verificam cada chamada; e verifique resultados e estado, não detalhes de implementação.`,
  ],
  conecta: [['backend/testes', 'Testes de integração usam dependências reais.'], ['backend/camadas', 'Injeção de dependência permite trocar implementações.'], ['frontend/testes-front', 'MSW é um dublê de rede.'], ['tdd', 'Dublês aparecem no ciclo do TDD.']],
  front: `Mockar o módulo de fetch em cada teste acopla o teste à implementação; interceptar a rede com MSW testa o componente como ele roda de verdade.`,
  ex: { lang: 'typescript', code: `// fake: repositório em memória que funciona de verdade
class PedidosEmMemoria implements PedidosRepository {
  private dados = new Map<number, Pedido>();
  async buscar(id: number) { return this.dados.get(id) ?? null; }
  async salvar(p: Pedido) { this.dados.set(p.id, p); }
}

// stub de tempo: teste determinístico
vi.useFakeTimers().setSystemTime(new Date("2026-10-15T12:00:00Z"));

// evite: mock verificando detalhe interno
// expect(repo.salvar).toHaveBeenCalledWith(expect.objectContaining({ status: "PAGO" }));
// prefira: verificar o resultado
expect((await repo.buscar(981))?.status).toBe("PAGO");` },
  docs: [['Martin Fowler · Mocks Aren\'t Stubs', 'https://martinfowler.com/articles/mocksArentStubs.html'], ['Martin Fowler · Test Double', 'https://martinfowler.com/bliki/TestDouble.html'], ['Vitest · Mocking', 'https://vitest.dev/guide/mocking.html']],
  perguntas: [`Quais testes do seu time quebram toda vez que alguém refatora?`, `Qual a diferença entre um mock e um fake?`, `Onde ficam as fronteiras que merecem dublês no seu sistema?`] },

{ id: 'lint-format', stage: 'qualidade', level: 'essencial', title: 'Linters, formatadores e hooks', short: 'Lint e format',
  resumo: `Automatizar estilo e regras simples para o review cuidar do que importa.`,
  porque: `Discussões sobre ponto e vírgula e indentação desperdiçam o tempo de todos. Ferramentas automáticas resolvem estilo de forma consistente e pegam erros comuns antes mesmo do commit.`,
  como: [
    `<b>Formatadores</b> (Prettier, Biome, gofmt, black) aplicam estilo sem discussão. <b>Linters</b> (ESLint, oxlint, Biome, Ruff) apontam bugs prováveis, más práticas e regras do time (hooks do React, acessibilidade, imports proibidos). <b>Type checkers</b> (TypeScript) pegam uma classe inteira de erros.`,
    `Rode tudo em três lugares: no <b>editor</b> (feedback imediato), em <b>pre-commit hooks</b> só nos arquivos alterados (husky + lint-staged, lefthook) e no <b>CI</b>, que é a garantia final. Comece com poucas regras e aumente; regras que ninguém respeita viram ruído.`,
  ],
  conecta: [['code-review', 'Libera o review para design e corretude.'], ['devops/pipelines', 'O CI é a verificação final.'], ['frontend/a11y-testes', 'Regras de lint de acessibilidade.'], ['arquitetura/fitness-functions', 'Regras de arquitetura também podem ser lint.']],
  front: `ESLint e Prettier são o padrão no front; o mesmo raciocínio vale para backend, infraestrutura (tflint, hadolint) e até SQL (sqlfluff).`,
  ex: { lang: 'json', code: `// package.json: formatação e lint só nos arquivos alterados, antes do commit
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
// .husky/pre-commit → npx lint-staged` },
  docs: [['ESLint · Getting started', 'https://eslint.org/docs/latest/use/getting-started'], ['Prettier · Why Prettier', 'https://prettier.io/docs/why-prettier'], ['lint-staged', 'https://github.com/lint-staged/lint-staged'], ['Biome', 'https://biomejs.dev/']],
  perguntas: [`Que discussão recorrente nos reviews do seu time poderia ser automatizada?`, `Por que rodar o lint no CI mesmo tendo pre-commit hooks?`, `Que regra de lint pegaria um bug que já aconteceu no seu projeto?`] },

{ id: 'cobertura-mutacao', stage: 'qualidade', level: 'aprofundar', title: 'Cobertura e mutation testing', short: 'Cobertura',
  resumo: `Medir o que os testes exercitam, e se eles realmente detectariam um erro.`,
  porque: `Cobertura alta não garante testes bons: é possível executar todas as linhas sem verificar nada. Entender o que as métricas dizem (e o que não dizem) evita metas que geram testes inúteis.`,
  como: [
    `<b>Cobertura de código</b> mede quais linhas e ramos foram executados pelos testes. É útil para encontrar áreas sem teste, mas transformá-la em meta rígida ("100%") incentiva testes sem asserções relevantes.`,
    `<b>Mutation testing</b> (Stryker, PIT) altera o código de propósito (troca <code>&gt;</code> por <code>&gt;=</code>, remove uma linha) e verifica se algum teste falha. Mutantes que sobrevivem mostram comportamentos que os testes não verificam de fato. É caro, então use em código crítico, como regras financeiras.`,
  ],
  conecta: [['tdd', 'TDD tende a gerar boa cobertura com asserções reais.'], ['backend/testes', 'Onde cada tipo de teste se encaixa.'], ['devops/pipelines', 'Relatórios de cobertura no CI.']],
  front: `Componentes de interface com 100% de cobertura podem ainda ter bugs visuais e de acessibilidade; cobertura mede execução, não qualidade.`,
  ex: { lang: 'texto', code: `Código:  return total >= 20000 ? 0 : 1500;
Teste:   expect(calcularFrete({ total: 30000 })).toBe(0)
Cobertura: 100% das linhas executadas ✔

Mutante: return total > 20000 ? 0 : 1500;    // troca >= por >
Resultado do teste: continua passando  ✘ mutante sobreviveu
→ falta o caso de borda: total exatamente 20000` },
  docs: [['Martin Fowler · Test Coverage', 'https://martinfowler.com/bliki/TestCoverage.html'], ['Stryker Mutator', 'https://stryker-mutator.io/docs/'], ['Vitest · Coverage', 'https://vitest.dev/guide/coverage.html']],
  perguntas: [`Que parte crítica do seu código tem baixa cobertura?`, `Por que uma meta de 100% de cobertura pode piorar os testes?`, `O que significa um mutante sobreviver?`] },
]
