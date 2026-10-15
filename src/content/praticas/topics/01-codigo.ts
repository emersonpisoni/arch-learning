import type { Topic } from '../../../types'

export const codigo: Topic[] = [
{ id: 'legibilidade', stage: 'codigo', level: 'essencial', title: 'Código legível', short: 'Legibilidade',
  resumo: `Nomes, funções e estrutura que deixam a intenção clara.`,
  porque: `Código é lido muito mais vezes do que escrito. Em integrações entre times, o código do outro lado é muitas vezes a única documentação disponível, e a legibilidade define quanto tempo se perde para entendê-lo.`,
  como: [
    `<b>Nomes</b> que revelam intenção e usam a linguagem do negócio (<code>pedidosPendentes</code> em vez de <code>lista2</code>); <b>funções pequenas</b> com um propósito; <b>retorno antecipado</b> em vez de ifs aninhados; constantes nomeadas no lugar de números mágicos; e consistência com o estilo do restante do código.`,
    `Comentários explicam o <b>porquê</b> (uma regra de negócio, uma limitação externa), não o quê, que o código já diz. Evite abstrações prematuras: duplicação pequena é melhor que uma abstração errada. Legibilidade é contextual; o padrão do time vale mais que a preferência individual.`,
  ],
  conecta: [['refatoracao', 'Como melhorar código existente com segurança.'], ['backend/patterns', 'Princípios de design no nível do código.'], ['code-review', 'Onde a legibilidade é discutida.'], ['leitura-codigo', 'O outro lado: ler código dos outros.']],
  front: `Componentes com nomes de domínio (<code>ResumoDoPedido</code>), hooks com um propósito (<code>useFreteEstimado</code>) e props nomeadas pelo significado deixam a árvore de componentes legível como um texto.`,
  ex: { lang: 'typescript', code: `// antes
function proc(p: any) {
  if (p) {
    if (p.s === 2) {
      if (p.t > 50000) { return p.t * 0.9; } else { return p.t; }
    }
  }
  return 0;
}

// depois
const DESCONTO_PEDIDOS_GRANDES = 0.1;
const LIMITE_PEDIDO_GRANDE_CENTS = 50_000;

function totalComDesconto(pedido?: Pedido): number {
  if (!pedido || pedido.status !== "PAGO") return 0;
  if (pedido.totalCents <= LIMITE_PEDIDO_GRANDE_CENTS) return pedido.totalCents;
  return pedido.totalCents * (1 - DESCONTO_PEDIDOS_GRANDES);
}` },
  docs: [['Google · Code review: Naming and comments', 'https://google.github.io/eng-practices/review/reviewer/looking-for.html'], ['Martin Fowler · Two Hard Things', 'https://martinfowler.com/bliki/TwoHardThings.html'], ['Sandi Metz · The Wrong Abstraction', 'https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction']],
  perguntas: [`Que nome no código do seu time só faz sentido para quem o escreveu?`, `Quando um comentário é útil e quando é ruído?`, `Por que uma abstração errada é pior que duplicação?`] },

{ id: 'refatoracao', stage: 'codigo', level: 'essencial', title: 'Refatoração', short: 'Refatoração',
  resumo: `Melhorar a estrutura do código sem mudar o comportamento, em passos pequenos.`,
  porque: `Sem refatoração contínua, todo código se degrada até ninguém querer mexer nele. Refatorar com segurança é o que permite que o sistema evolua sem reescritas completas.`,
  como: [
    `Refatoração é uma sequência de <b>passos pequenos</b>, cada um mantendo o comportamento e os testes passando: extrair função, renomear, mover, introduzir parâmetro, substituir condicional por polimorfismo. Ferramentas de IDE fazem muitos desses passos de forma automática e segura.`,
    `Pré-requisito: <b>testes</b> que deem confiança. Regra do escoteiro: deixe o código um pouco melhor do que encontrou. Separe commits de refatoração dos commits que mudam comportamento; o review fica muito mais fácil. Em código sem testes, comece com testes de caracterização, que registram o comportamento atual.`,
  ],
  conecta: [['legibilidade', 'O objetivo da maioria das refatorações.'], ['tdd', 'Refatorar é o terceiro passo do ciclo do TDD.'], ['divida-tecnica', 'Refatoração é como a dívida é paga.'], ['arquitetura/strangler', 'A mesma ideia de passos pequenos, em escala de sistema.']],
  front: `Extrair um hook de um componente gigante, ou trocar uma prop booleana por duas variantes de componente, são refatorações comuns no front. Faça num PR separado das mudanças visuais.`,
  ex: { lang: 'texto', code: `PR 1 (só refatoração, sem mudar comportamento)
  - extrair calcularFrete() de CheckoutPage
  - renomear "dados" para "resumoPedido"
  - mover formatação de moeda para utils/moeda.ts
  testes: todos passando, nenhum alterado

PR 2 (mudança de comportamento)
  - frete grátis acima de R$ 200
  testes: novo caso para o frete grátis` },
  docs: [['refactoring.com · Catálogo de refatorações', 'https://refactoring.com/catalog/'], ['Martin Fowler · Refactoring (livro)', 'https://martinfowler.com/books/refactoring.html'], ['Refactoring Guru · Refatoração', 'https://refactoring.guru/refactoring']],
  perguntas: [`Que parte do seu código você evita mexer, e o que tornaria isso seguro?`, `Por que separar refatoração de mudança de comportamento em PRs diferentes?`, `O que é um teste de caracterização?`] },

{ id: 'tratamento-erros', stage: 'codigo', level: 'essencial', title: 'Tratamento de erros', short: 'Erros',
  resumo: `Falhar de forma previsível, informativa e segura.`,
  porque: `Erros mal tratados viram telas em branco, dados inconsistentes e incidentes difíceis de investigar. A forma como cada camada lida com erros define a experiência do usuário quando algo dá errado, e algo sempre dá.`,
  como: [
    `Separe <b>erros esperados</b> (validação, recurso não encontrado, regra de negócio) de <b>falhas inesperadas</b> (bug, dependência fora do ar). Os esperados fazem parte do contrato (status HTTP, tipos de erro, ou um tipo <code>Result</code>); os inesperados sobem até um tratador central que registra e responde de forma genérica.`,
    `Regras: nunca engula exceções em silêncio; adicione contexto ao relançar (<code>cause</code>); não exponha detalhes internos ao usuário; registre uma vez, no lugar certo, com request id; e lembre que promises não aguardadas perdem erros.`,
  ],
  conecta: [['backend/rest', 'Formato de erro padronizado na API.'], ['backend/observabilidade', 'Erros precisam chegar aos logs com contexto.'], ['frontend/observabilidade-front', 'Error boundaries e monitoramento no front.'], ['debugging', 'Bons erros encurtam a investigação.']],
  front: `Mensagens de erro da interface dependem de erros bem tipados na API: "CEP inválido" no campo certo só é possível se a API devolver o campo e o motivo, não um 500 genérico.`,
  ex: { lang: 'typescript', code: `class ErroDeNegocio extends Error {
  constructor(public codigo: string, mensagem: string) { super(mensagem); }
}

async function cancelarPedido(id: number) {
  const pedido = await repo.buscar(id);
  if (!pedido) throw new ErroDeNegocio("PEDIDO_NAO_ENCONTRADO", "Pedido não encontrado");
  if (pedido.status === "ENVIADO")
    throw new ErroDeNegocio("PEDIDO_JA_ENVIADO", "Pedidos enviados não podem ser cancelados");
  try {
    await pagamentos.estornar(pedido.pagamentoId);
  } catch (err) {
    throw new Error(\`Falha ao estornar o pedido \${id}\`, { cause: err }); // contexto + causa
  }
}

// tratador central: ErroDeNegocio → 422 com o código; resto → 500 genérico + log` },
  docs: [['MDN · Error cause', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause'], ['OWASP · Error Handling Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html'], ['RFC 9457 · Problem Details', 'https://www.rfc-editor.org/rfc/rfc9457']],
  perguntas: [`Onde o seu código engole exceções sem registrar?`, `Que erro da API do seu produto chega ao front como um 500 genérico, mas deveria ser específico?`, `Por que não mostrar o stack trace ao usuário?`] },

{ id: 'divida-tecnica', stage: 'codigo', level: 'importante', title: 'Dívida técnica', short: 'Dívida técnica',
  resumo: `Atalhos de hoje que cobram juros amanhã, e como negociar o pagamento.`,
  porque: `Toda base de código tem dívida técnica. Saber identificá-la, medir o custo e explicá-la em termos de negócio é o que permite conseguir tempo para resolvê-la.`,
  como: [
    `O quadrante de Fowler separa dívida <b>deliberada</b> ("vamos lançar assim e corrigir depois") de <b>inadvertida</b> ("agora sabemos como deveria ter sido"), e <b>prudente</b> de <b>imprudente</b>. A deliberada e prudente é uma ferramenta legítima; o problema é não registrá-la nem pagá-la.`,
    `Torne a dívida visível: registre com o impacto concreto ("cada mudança no checkout leva 3 dias a mais", "2 incidentes por mês"), priorize pelo que mais atrapalha o trabalho atual e pague junto com funcionalidades que tocam aquela área, em vez de esperar um "sprint de dívida" que nunca chega.`,
  ],
  conecta: [['refatoracao', 'A forma de pagar a dívida.'], ['arquitetura/trade-offs', 'Dívida é um trade-off consciente ou não.'], ['comunicacao-tecnica', 'Explicar a dívida em termos de negócio.'], ['dora', 'Dívida aparece no lead time e na taxa de falhas.']],
  front: `Dependências desatualizadas, componentes duplicados, CSS global que ninguém tem coragem de mexer e testes desligados são dívidas típicas de front; vale listá-las com o custo de cada uma.`,
  ex: { lang: 'texto', code: `Registro de dívida técnica
──────────────────────────────────────────────────────────────────
Item:     estado do checkout duplicado entre Redux e React Query
Tipo:     inadvertida, prudente
Custo:    3 bugs de dessincronização no trimestre; +2 dias por mudança no fluxo
Proposta: migrar o estado do servidor para React Query (5 dias)
Quando:   junto com a feature "parcelamento", que mexe no mesmo fluxo` },
  docs: [['Martin Fowler · Technical Debt Quadrant', 'https://martinfowler.com/bliki/TechnicalDebtQuadrant.html'], ['Martin Fowler · Technical Debt', 'https://martinfowler.com/bliki/TechnicalDebt.html'], ['Ward Cunningham · Debt metaphor (vídeo)', 'https://www.youtube.com/watch?v=pqeJFYwnkjE']],
  perguntas: [`Qual dívida técnica mais atrasa o seu time hoje?`, `Como você explicaria o custo dela para alguém de produto?`, `Qual a diferença entre dívida deliberada e imprudente?`] },
]
