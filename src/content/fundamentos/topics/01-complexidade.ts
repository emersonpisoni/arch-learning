import type { Topic } from '../../../types'

export const complexidade: Topic[] = [
{ id: 'big-o', stage: 'complexidade', level: 'essencial', title: 'Complexidade e notação Big-O', short: 'Big-O',
  resumo: `Como o tempo e a memória de um algoritmo crescem quando a entrada cresce.`,
  porque: `Código que funciona com 100 itens pode travar com 100 mil. Big-O dá um vocabulário para prever esse comportamento antes de ir para produção, comparar soluções e entender por que um índice no banco ou um Map no lugar de um array muda tudo.`,
  como: [
    `Big-O descreve o crescimento no <b>pior caso</b>, ignorando constantes: <b>O(1)</b> constante (acessar um índice, buscar num hash), <b>O(log n)</b> logarítmico (busca binária, árvores balanceadas), <b>O(n)</b> linear (percorrer uma lista), <b>O(n log n)</b> (boas ordenações), <b>O(n²)</b> quadrático (laços aninhados sobre a mesma entrada) e <b>O(2ⁿ)</b> exponencial (testar todas as combinações).`,
    `Analise também a <b>memória</b> (complexidade de espaço) e o <b>custo amortizado</b> (um push em array dinâmico é O(1) na média, mesmo com redimensionamentos ocasionais). Na prática, constantes e cache importam para entradas pequenas, mas, quando n cresce, a classe de complexidade domina. Cuidado com O(n) escondido: um <code>includes</code> ou <code>find</code> dentro de um laço vira O(n²).`,
  ],
  conecta: [['hash-tables', 'O(1) na média para buscar por chave.'], ['ordenacao-busca', 'Ordenações O(n log n) e busca binária.'], ['backend/indices', 'Índices trocam O(n) por O(log n) no banco.'], ['arquitetura/estimativas', 'Estimar capacidade em escala.']],
  front: `Um <code>array.find</code> dentro de um <code>map</code> numa lista de mil itens faz um milhão de comparações a cada renderização; trocar por um <code>Map</code> indexado por id resolve.`,
  ex: { lang: 'typescript', code: `// O(n²): para cada pedido, percorre todos os clientes
const comNome = pedidos.map((p) => ({
  ...p,
  cliente: clientes.find((c) => c.id === p.clienteId),   // O(n) dentro de O(n)
}));

// O(n): monta um índice uma vez, consulta em O(1)
const porId = new Map(clientes.map((c) => [c.id, c]));
const comNome2 = pedidos.map((p) => ({ ...p, cliente: porId.get(p.clienteId) }));

// 10 mil pedidos × 10 mil clientes: ~100 milhões de comparações contra ~20 mil operações` },
  docs: [['Big-O Cheat Sheet', 'https://www.bigocheatsheet.com/'], ['MIT 6.006 · Introduction to Algorithms', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'], ['Khan Academy · Asymptotic notation', 'https://www.khanacademy.org/computing/computer-science/algorithms/asymptotic-notation/a/asymptotic-notation']],
  perguntas: [`Que trecho do seu código tem um laço escondido dentro de outro?`, `Por que Big-O ignora constantes, e quando elas importam?`, `O que significa um custo O(1) amortizado?`] },

{ id: 'recursao', stage: 'complexidade', level: 'essencial', title: 'Recursão e divisão e conquista', short: 'Recursão',
  resumo: `Resolver um problema a partir de versões menores dele mesmo.`,
  porque: `Estruturas recursivas estão por toda parte: árvores de componentes, o DOM, JSON aninhado, pastas, menus com submenus, comentários com respostas. Recursão é a forma natural de percorrê-las, e divisão e conquista está por trás de muitos algoritmos eficientes.`,
  como: [
    `Uma função recursiva tem um <b>caso base</b> (que responde sem recursão) e um <b>passo recursivo</b> (que reduz o problema). Cada chamada ocupa um quadro na <b>pilha de chamadas</b>; recursão profunda demais causa <b>stack overflow</b>, e nesses casos uma versão iterativa com pilha explícita resolve.`,
    `<b>Divisão e conquista</b>: dividir o problema em partes, resolver cada uma e combinar (merge sort, quicksort, busca binária). Quando os mesmos subproblemas se repetem, guardar resultados (<b>memoização</b>) evita trabalho exponencial, o que leva à programação dinâmica.`,
  ],
  conecta: [['arvores-heaps', 'Árvores são definidas de forma recursiva.'], ['programacao-dinamica', 'Recursão com memória.'], ['ordenacao-busca', 'Merge sort e quicksort.'], ['memoria-gc', 'A pilha de chamadas.']],
  front: `Renderizar um menu com submenus, uma árvore de pastas ou comentários aninhados é recursão: o componente renderiza a si mesmo para os filhos.`,
  ex: { lang: 'tsx', code: `type Comentario = { id: string; texto: string; respostas: Comentario[] };

// recursão: o componente renderiza as próprias respostas
function Thread({ c }: { c: Comentario }) {
  return (
    <li>
      {c.texto}
      {c.respostas.length > 0 && (                 // caso base: sem respostas
        <ul>{c.respostas.map((r) => <Thread key={r.id} c={r} />)}</ul>
      )}
    </li>
  );
}

// contar todos os comentários da árvore
const total = (c: Comentario): number => 1 + c.respostas.reduce((s, r) => s + total(r), 0);` },
  docs: [['MDN · Recursion', 'https://developer.mozilla.org/en-US/docs/Glossary/Recursion'], ['Khan Academy · Recursive algorithms', 'https://www.khanacademy.org/computing/computer-science/algorithms/recursive-algorithms/a/recursion'], ['Khan Academy · Divide and conquer', 'https://www.khanacademy.org/computing/computer-science/algorithms/merge-sort/a/divide-and-conquer-algorithms']],
  perguntas: [`Que estrutura do seu produto é naturalmente recursiva?`, `O que causa um stack overflow, e como evitá-lo?`, `Como transformar uma recursão numa iteração com pilha explícita?`] },
]
