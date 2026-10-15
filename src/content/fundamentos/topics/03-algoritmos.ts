import type { Topic } from '../../../types'

export const algoritmos: Topic[] = [
{ id: 'ordenacao-busca', stage: 'algoritmos', level: 'essencial', title: 'Ordenação e busca binária', short: 'Ordenação',
  resumo: `Como ordenar com eficiência e por que dados ordenados se buscam em O(log n).`,
  porque: `Ordenar e buscar estão em todo lugar: listagens, rankings, paginação, merges de dados. Saber o custo e as propriedades de cada abordagem evita bugs sutis (ordenação de números como texto, instabilidade) e permite buscas muito mais rápidas.`,
  como: [
    `Ordenações por comparação eficientes são <b>O(n log n)</b>: <b>merge sort</b> (estável, usa memória extra), <b>quicksort</b> (rápido na prática, pior caso O(n²)) e <b>Timsort</b>, híbrido usado no <code>Array.prototype.sort</code> do V8, no Python e no Java, ótimo para dados parcialmente ordenados. Uma ordenação <b>estável</b> mantém a ordem original de elementos iguais, o que permite ordenar por vários critérios em sequência.`,
    `A <b>busca binária</b> encontra um elemento num array ordenado em O(log n), dividindo o intervalo pela metade a cada passo: um milhão de itens em cerca de 20 comparações. A mesma ideia serve para achar "o primeiro dia em que o bug apareceu" (como o <code>git bisect</code>) ou o maior valor que ainda cabe num limite.`,
  ],
  conecta: [['big-o', 'O(n log n) e O(log n).'], ['recursao', 'Merge sort e quicksort são divisão e conquista.'], ['praticas/debugging', 'git bisect é busca binária no histórico.'], ['backend/indices', 'Índices ordenados permitem busca rápida.']],
  front: `Sem comparador, <code>[10, 9, 1].sort()</code> devolve <code>[1, 10, 9]</code>, porque compara como texto. Para textos em português, use <code>localeCompare</code> ou <code>Intl.Collator</code> para acentos ficarem no lugar certo.`,
  ex: { lang: 'typescript', code: `// sort sem comparador ordena como texto
[10, 9, 1].sort();                       // [1, 10, 9]
[10, 9, 1].sort((a, b) => a - b);        // [1, 9, 10]

// nomes em português, com acentos no lugar certo
const collator = new Intl.Collator("pt-BR");
nomes.sort(collator.compare);

// busca binária: primeiro índice com valor >= alvo
function limiteInferior(ordenado: number[], alvo: number): number {
  let baixo = 0, alto = ordenado.length;
  while (baixo < alto) {
    const meio = (baixo + alto) >>> 1;
    if (ordenado[meio] < alvo) baixo = meio + 1;
    else alto = meio;
  }
  return baixo;
}` },
  docs: [['VisuAlgo · Sorting', 'https://visualgo.net/en/sorting'], ['MDN · Array.prototype.sort', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort'], ['Khan Academy · Binary search', 'https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search']],
  perguntas: [`Por que uma ordenação estável importa ao ordenar por vários critérios?`, `Que problema do seu dia a dia poderia ser resolvido com busca binária?`, `Por que ordenar números sem comparador dá resultado errado em JavaScript?`] },

{ id: 'busca-grafos', stage: 'algoritmos', level: 'importante', title: 'Percorrer grafos: BFS, DFS, caminhos e ordenação topológica', short: 'BFS e DFS',
  resumo: `Algoritmos clássicos para explorar grafos e encontrar caminhos.`,
  porque: `Resolvem problemas práticos: menor número de conexões entre duas pessoas, rota mais curta, ordem certa de executar tarefas dependentes, detectar dependências circulares, encontrar tudo que é afetado por uma mudança.`,
  como: [
    `<b>BFS</b> (busca em largura) explora por camadas usando uma fila; encontra o caminho com <b>menos arestas</b>. <b>DFS</b> (busca em profundidade) vai fundo antes de voltar, usando pilha ou recursão; serve para detectar ciclos e explorar componentes. Ambas são O(V + E); é preciso marcar vértices visitados para não entrar em ciclos.`,
    `<b>Dijkstra</b> encontra o caminho mais curto com pesos positivos, usando uma fila de prioridade; <b>A*</b> acrescenta uma estimativa da distância restante. A <b>ordenação topológica</b> de um DAG dá uma ordem em que cada tarefa vem depois das suas dependências: é o que gerenciadores de pacotes, orquestradores e ferramentas de build fazem.`,
  ],
  conecta: [['grafos', 'A estrutura que esses algoritmos percorrem.'], ['arvores-heaps', 'Dijkstra usa um heap.'], ['dados/orquestracao', 'Pipelines como DAGs.'], ['frontend/monorepo', 'Ferramentas de monorepo ordenam builds pelo grafo.']],
  front: `Ferramentas como Turborepo e Nx usam o grafo de dependências entre pacotes e uma ordenação topológica para saber o que construir primeiro e o que pode rodar em paralelo.`,
  ex: { lang: 'typescript', code: `// ordenação topológica (Kahn): ordem de execução de tarefas dependentes
function ordem(deps: Record<string, string[]>): string[] {
  const grauEntrada = new Map(Object.keys(deps).map((t) => [t, deps[t].length]));
  const dependentes = new Map<string, string[]>();
  for (const [t, ds] of Object.entries(deps))
    for (const d of ds) dependentes.set(d, [...(dependentes.get(d) ?? []), t]);

  const fila = [...grauEntrada].filter(([, g]) => g === 0).map(([t]) => t);
  const resultado: string[] = [];
  while (fila.length) {
    const t = fila.shift()!;
    resultado.push(t);
    for (const d of dependentes.get(t) ?? []) {
      grauEntrada.set(d, grauEntrada.get(d)! - 1);
      if (grauEntrada.get(d) === 0) fila.push(d);
    }
  }
  if (resultado.length < grauEntrada.size) throw new Error("dependência circular");
  return resultado;   // ["instalar", "build", "testes", "deploy"]
}` },
  docs: [['VisuAlgo · Graph traversal', 'https://visualgo.net/en/dfsbfs'], ['Red Blob Games · Introduction to A*', 'https://www.redblobgames.com/pathfinding/a-star/introduction.html'], ['Wikipedia · Topological sorting', 'https://en.wikipedia.org/wiki/Topological_sorting']],
  perguntas: [`Por que a BFS encontra o caminho com menos arestas e a DFS não?`, `Como detectar uma dependência circular?`, `Que processo do seu trabalho segue uma ordenação topológica?`] },

{ id: 'programacao-dinamica', stage: 'algoritmos', level: 'aprofundar', title: 'Programação dinâmica e algoritmos gulosos', short: 'Prog. dinâmica',
  resumo: `Evitar recalcular subproblemas repetidos, e quando a escolha local resolve o todo.`,
  porque: `Muitos problemas aparentemente exponenciais ficam rápidos guardando resultados intermediários: diferenças entre textos (diff), correção ortográfica, rotas, combinações de preço. E algoritmos gulosos resolvem bem uma classe de problemas de otimização.`,
  como: [
    `<b>Programação dinâmica</b> serve quando o problema tem <b>subproblemas sobrepostos</b> e <b>subestrutura ótima</b>. Duas formas: <b>de cima para baixo</b> (recursão com memoização) e <b>de baixo para cima</b> (preencher uma tabela). Exemplos clássicos: Fibonacci, mochila, maior subsequência comum (a base do <code>diff</code>) e distância de edição (Levenshtein, usada em "você quis dizer?").`,
    `<b>Algoritmos gulosos</b> fazem a melhor escolha local a cada passo, sem voltar atrás: funcionam em problemas como troco com moedas comuns, agendamento de intervalos e árvore geradora mínima, mas falham em outros (troco com moedas incomuns). Provar ou testar que a escolha gulosa é correta é a parte difícil.`,
  ],
  conecta: [['recursao', 'Recursão com memória.'], ['big-o', 'De exponencial para polinomial.'], ['praticas/git-interno', 'O diff do Git usa esse tipo de algoritmo.'], ['dados/busca-full-text', 'Tolerância a erros de digitação.']],
  front: `Um campo de busca que sugere "você quis dizer..." pode usar distância de edição para encontrar o termo mais próximo; e o <code>useMemo</code> é memoização no nível do componente.`,
  ex: { lang: 'typescript', code: `// distância de edição (Levenshtein) de baixo para cima: O(n × m)
function distancia(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,                                     // remover
        dp[i][j - 1] + 1,                                     // inserir
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),   // trocar
      );
  return dp[a.length][b.length];
}

distancia("pesquiza", "pesquisa");   // 1` },
  docs: [['MIT 6.006 · Dynamic programming', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-15-dynamic-programming-part-1-srtbot-fib-dags-bowling/'], ['Wikipedia · Levenshtein distance', 'https://en.wikipedia.org/wiki/Levenshtein_distance'], ['Wikipedia · Greedy algorithm', 'https://en.wikipedia.org/wiki/Greedy_algorithm']],
  perguntas: [`Como reconhecer que um problema tem subproblemas sobrepostos?`, `Dê um exemplo em que a escolha gulosa dá a resposta errada.`, `Onde o seu código recalcula algo que poderia ser memoizado?`] },
]
