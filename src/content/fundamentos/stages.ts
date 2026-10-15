import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'complexidade', title: 'Complexidade e recursão', desc: 'Prever como o código se comporta quando os dados crescem.',
    pratica: 'Pegue três funções do seu projeto que percorrem listas, estime a complexidade de cada uma e meça o tempo com 1 mil, 100 mil e 1 milhão de itens. A curva bateu com a estimativa?' },
  { id: 'estruturas', title: 'Estruturas de dados', desc: 'As formas de organizar dados na memória e o custo de cada operação.',
    pratica: 'Implemente do zero uma tabela hash com encadeamento e redimensionamento, e um heap mínimo. Compare a velocidade com Map e com uma lista ordenada a cada inserção.' },
  { id: 'algoritmos', title: 'Algoritmos', desc: 'Ordenar, buscar, percorrer grafos e evitar refazer trabalho.',
    pratica: 'Modele as estações de metrô da sua cidade como um grafo e encontre o caminho com menos baldeações (BFS) e o mais rápido (Dijkstra).' },
  { id: 'maquina', title: 'Como a máquina executa', desc: 'CPU, caches, memória e a representação dos dados em bits.',
    pratica: 'Some os elementos de uma matriz grande percorrendo por linhas e por colunas e compare os tempos. Depois explique o resultado com cache e localidade.' },
  { id: 'linguagens', title: 'Linguagens e tipos', desc: 'Paradigmas, sistemas de tipos e o caminho do código-fonte até a execução.',
    pratica: 'Reescreva um trecho imperativo do seu projeto em estilo funcional (map, filter, reduce, sem mutação) e tipe um objeto de estado com uma união discriminada no TypeScript.' },
  { id: 'sistema', title: 'Sistema operacional e concorrência', desc: 'Processos, memória virtual, chamadas de sistema e modelos de concorrência.',
    pratica: 'Rode um programa com strace (Linux) ou dtruss (macOS) e identifique as chamadas de sistema de abrir arquivo, ler e escrever na rede. Depois resolva um produtor-consumidor com uma fila e dois workers.' },
]
