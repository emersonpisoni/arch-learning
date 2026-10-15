import type { Topic } from '../../../types'

export const estruturas: Topic[] = [
{ id: 'arrays-listas', stage: 'estruturas', level: 'essencial', title: 'Arrays, listas ligadas, pilhas e filas', short: 'Arrays e listas',
  resumo: `As estruturas lineares e o custo de acessar, inserir e remover em cada uma.`,
  porque: `Escolher a estrutura errada transforma operações baratas em caras: remover do início de um array grande, procurar numa lista ligada, usar um array como fila. Essas estruturas são a base de todas as outras.`,
  como: [
    `<b>Array</b>: elementos contíguos na memória; acesso por índice em O(1), ótimo uso de cache, mas inserir ou remover no meio (ou no início) custa O(n). <b>Arrays dinâmicos</b> (o array do JavaScript, ArrayList, Vec) dobram de capacidade quando enchem. <b>Lista ligada</b>: nós com ponteiros; inserir e remover num ponto conhecido custa O(1), mas acessar o i-ésimo elemento custa O(n) e o cache sofre.`,
    `<b>Pilha</b> (LIFO: último a entrar, primeiro a sair): desfazer/refazer, pilha de chamadas, navegação. <b>Fila</b> (FIFO): processamento em ordem, BFS, filas de tarefas. <b>Deque</b> permite as duas pontas. Em JavaScript, <code>shift()</code> num array grande é O(n); filas grandes pedem um buffer circular ou uma estrutura própria.`,
  ],
  conecta: [['big-o', 'O custo de cada operação.'], ['cpu-memoria', 'Memória contígua e cache.'], ['busca-grafos', 'Fila na BFS, pilha na DFS.'], ['backend/filas', 'Filas como infraestrutura entre serviços.']],
  front: `O histórico do navegador e o desfazer de um editor são pilhas; a lista de ações pendentes de um app offline é uma fila.`,
  ex: { lang: 'typescript', code: `// desfazer / refazer com duas pilhas
class Historico<T> {
  private desfazer: T[] = [];
  private refazer: T[] = [];

  registrar(estado: T) { this.desfazer.push(estado); this.refazer = []; }

  voltar(atual: T): T | undefined {
    const anterior = this.desfazer.pop();          // O(1)
    if (anterior !== undefined) this.refazer.push(atual);
    return anterior;
  }

  avancar(atual: T): T | undefined {
    const proximo = this.refazer.pop();
    if (proximo !== undefined) this.desfazer.push(atual);
    return proximo;
  }
}` },
  docs: [['MDN · Array', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'], ['VisuAlgo · Linked list, stack, queue', 'https://visualgo.net/en/list'], ['Open Data Structures', 'https://opendatastructures.org/']],
  perguntas: [`Onde o seu código usa um array como fila?`, `Por que listas ligadas são raras em código de aplicação?`, `Que funcionalidade do seu produto é naturalmente uma pilha?`] },

{ id: 'hash-tables', stage: 'estruturas', level: 'essencial', title: 'Tabelas hash, Map e Set', short: 'Hash',
  resumo: `Buscar, inserir e remover por chave em tempo constante, na média.`,
  porque: `É a estrutura mais usada no dia a dia: objetos, Map, Set, dicionários, caches, índices em memória, deduplicação. Entender como funciona explica por que ela é rápida, quando deixa de ser e por que a ordem e a igualdade de chaves às vezes surpreendem.`,
  como: [
    `Uma <b>função hash</b> transforma a chave num número que indica um balde num array. Chaves diferentes podem cair no mesmo balde (<b>colisão</b>), resolvida por encadeamento (uma lista por balde) ou endereçamento aberto (procurar o próximo balde livre). Quando a tabela enche demais (<b>fator de carga</b>), ela é redimensionada e tudo é redistribuído.`,
    `Busca, inserção e remoção são <b>O(1) na média</b> e O(n) no pior caso (muitas colisões). Em JavaScript, prefira <code>Map</code> e <code>Set</code> a objetos para dados dinâmicos: aceitam qualquer tipo de chave, mantêm a ordem de inserção e têm <code>size</code>. Chaves objeto são comparadas por <b>referência</b>, não por conteúdo.`,
  ],
  conecta: [['big-o', 'O(1) na média, O(n) no pior caso.'], ['backend/cache', 'Um cache é um mapa chave-valor.'], ['arquitetura/consistent-hashing', 'Hash para distribuir dados entre servidores.'], ['seguranca/criptografia', 'Hashes criptográficos são outra família.']],
  front: `Normalizar o estado como <code>Map&lt;id, entidade&gt;</code> (ou um objeto indexado por id) evita buscas em arrays e é a base de bibliotecas como Redux Toolkit com entity adapters.`,
  ex: { lang: 'typescript', code: `// deduplicar e contar em O(n) com Set e Map
const emails = ["a@x.com", "b@x.com", "a@x.com"];
const unicos = [...new Set(emails)];                       // ["a@x.com", "b@x.com"]

const porStatus = new Map<string, number>();
for (const pedido of pedidos) {
  porStatus.set(pedido.status, (porStatus.get(pedido.status) ?? 0) + 1);
}

// cuidado: objetos são comparados por referência
const s = new Set([{ id: 1 }]);
s.has({ id: 1 });   // false: é outro objeto` },
  docs: [['MDN · Map', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map'], ['VisuAlgo · Hash table', 'https://visualgo.net/en/hashtable'], ['Wikipedia · Hash table', 'https://en.wikipedia.org/wiki/Hash_table']],
  perguntas: [`Onde o seu código busca em arrays algo que poderia estar num Map?`, `O que acontece com a performance de uma tabela hash com muitas colisões?`, `Por que um Set de objetos não remove duplicatas com o mesmo conteúdo?`] },

{ id: 'arvores-heaps', stage: 'estruturas', level: 'importante', title: 'Árvores, árvores balanceadas e heaps', short: 'Árvores',
  resumo: `Estruturas hierárquicas que mantêm dados ordenados ou priorizados.`,
  porque: `Árvores estão no DOM, no sistema de arquivos, nos índices de bancos de dados (B-trees) e em filas de prioridade. Entendê-las explica por que um índice acelera consultas por intervalo e como agendadores escolhem a próxima tarefa.`,
  como: [
    `Uma <b>árvore binária de busca</b> mantém à esquerda os menores e à direita os maiores: busca, inserção e remoção em O(log n) se ela estiver <b>balanceada</b> (AVL, rubro-negra); se degenerar numa linha, vira O(n). <b>B-trees</b> têm muitos filhos por nó e poucos níveis, ideais para disco: são a estrutura dos índices de quase todo banco relacional.`,
    `Um <b>heap</b> mantém o menor (ou maior) elemento no topo: ver o topo é O(1), inserir e remover O(log n). É a base das <b>filas de prioridade</b> (agendadores, Dijkstra, "os 10 maiores"). <b>Tries</b> (árvores de prefixos) servem para autocomplete. Percursos: em profundidade (pré, em e pós-ordem) e em largura.`,
  ],
  conecta: [['recursao', 'Árvores se percorrem recursivamente.'], ['backend/indices', 'Índices B-tree no banco.'], ['busca-grafos', 'Árvores são grafos sem ciclos.'], ['dados/planejador-consultas', 'Como o banco usa os índices.']],
  front: `O DOM e a árvore de componentes são árvores; a reconciliação do React compara duas árvores. Um campo de autocomplete com milhares de termos pode usar uma trie no cliente.`,
  ex: { lang: 'typescript', code: `// os k pedidos de maior valor sem ordenar tudo: heap mínimo de tamanho k
function maiores(pedidos: Pedido[], k: number): Pedido[] {
  const heap = new HeapMinimo<Pedido>((a, b) => a.valor - b.valor);
  for (const p of pedidos) {
    heap.inserir(p);                    // O(log k)
    if (heap.tamanho > k) heap.removerTopo();   // descarta o menor
  }
  return heap.paraArray().sort((a, b) => b.valor - a.valor);
}
// O(n log k) em vez de O(n log n), e só k itens na memória` },
  docs: [['VisuAlgo · Binary search tree', 'https://visualgo.net/en/bst'], ['VisuAlgo · Binary heap', 'https://visualgo.net/en/heap'], ['PostgreSQL · B-tree indexes', 'https://www.postgresql.org/docs/current/btree.html']],
  perguntas: [`Por que bancos usam B-trees e não árvores binárias?`, `Que problema do seu produto é uma fila de prioridade?`, `O que acontece com uma árvore de busca que recebe os dados já ordenados?`] },

{ id: 'grafos', stage: 'estruturas', level: 'importante', title: 'Grafos', short: 'Grafos',
  resumo: `Vértices e arestas para representar relações: redes, dependências, rotas.`,
  porque: `Muitos problemas reais são grafos: dependências de pacotes, rotas de entrega, redes sociais, fluxos de trabalho, ordem de build, permissões herdadas. Reconhecer um grafo permite usar algoritmos prontos e conhecidos.`,
  como: [
    `Um grafo tem <b>vértices</b> e <b>arestas</b>, que podem ter <b>direção</b> (segue/é seguido) e <b>peso</b> (distância, custo). Representações: <b>lista de adjacência</b> (cada vértice com seus vizinhos; boa para grafos esparsos, que são a maioria) e <b>matriz de adjacência</b> (boa para grafos densos e consulta rápida de "existe aresta?").`,
    `Conceitos úteis: <b>ciclos</b>; <b>DAG</b> (grafo dirigido sem ciclos), que é o formato de dependências, pipelines e builds; <b>componentes conectados</b>; <b>grau</b> de um vértice. Árvores são grafos conectados sem ciclos.`,
  ],
  conecta: [['busca-grafos', 'Percorrer e encontrar caminhos.'], ['arvores-heaps', 'Árvores são um caso especial.'], ['dados/grafos', 'Bancos especializados em grafos.'], ['frontend/bundlers', 'O grafo de módulos do bundler.']],
  front: `O bundler monta um grafo de módulos a partir dos imports; ciclos de importação nesse grafo causam erros como "cannot access before initialization".`,
  ex: { lang: 'typescript', code: `// lista de adjacência: tarefas e suas dependências (um DAG)
const dependencias: Record<string, string[]> = {
  deploy: ["build", "testes"],
  testes: ["build"],
  build: ["instalar"],
  instalar: [],
};

// vizinhos de um vértice em O(1); percorrer tudo em O(V + E)
for (const [tarefa, deps] of Object.entries(dependencias)) {
  console.log(\`\${tarefa} depende de: \${deps.join(", ") || "nada"}\`);
}` },
  docs: [['VisuAlgo · Graph data structures', 'https://visualgo.net/en/graphds'], ['Khan Academy · Representing graphs', 'https://www.khanacademy.org/computing/computer-science/algorithms/graph-representation/a/representing-graphs'], ['Wikipedia · Directed acyclic graph', 'https://en.wikipedia.org/wiki/Directed_acyclic_graph']],
  perguntas: [`Que parte do seu sistema é, na verdade, um grafo?`, `Por que dependências precisam formar um DAG?`, `Quando usar lista de adjacência e quando usar matriz?`] },
]
