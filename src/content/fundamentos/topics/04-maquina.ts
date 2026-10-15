import type { Topic } from '../../../types'

export const maquina: Topic[] = [
{ id: 'cpu-memoria', stage: 'maquina', level: 'importante', title: 'CPU, caches e hierarquia de memória', short: 'CPU e cache',
  resumo: `Como o processador executa instruções e por que o acesso à memória domina a performance.`,
  porque: `Dois algoritmos com a mesma complexidade podem ter diferença de 10× na prática por causa do cache. Entender a hierarquia de memória explica latências, por que arrays são rápidos e por que "ler do disco" e "ir à rede" são ordens de grandeza mais lentos.`,
  como: [
    `A CPU busca, decodifica e executa instruções, com vários núcleos, <b>pipelines</b> e <b>previsão de desvios</b>. A memória é uma hierarquia: registradores, caches <b>L1/L2/L3</b> (nanossegundos), RAM (~100 ns), SSD (~100 µs) e rede (milissegundos entre data centers). Os dados vêm da RAM em blocos (<b>linhas de cache</b>, normalmente 64 bytes).`,
    `<b>Localidade</b> é a chave: <b>espacial</b> (usar dados próximos, como percorrer um array em ordem) e <b>temporal</b> (reusar o que acabou de ser lido). Estruturas com ponteiros espalhados (listas ligadas, objetos aninhados) causam mais cache misses. A tabela "Latency numbers every programmer should know" resume as ordens de grandeza.`,
  ],
  conecta: [['arrays-listas', 'Por que arrays contíguos são rápidos.'], ['memoria-gc', 'Pilha, heap e alocação.'], ['backend/cache', 'A mesma ideia em outra escala.'], ['devops/processos-recursos', 'CPU, memória e I/O num servidor.']],
  front: `O mesmo raciocínio vale para o navegador: ler <code>offsetHeight</code> depois de mudar estilos força o layout síncrono; agrupar leituras e escritas é otimizar a "localidade" do trabalho.`,
  ex: { lang: 'text', code: `Ordens de grandeza (aproximadas)
Referência ao cache L1 ............... 1 ns
Referência ao cache L2 ............... 4 ns
Acesso à memória principal ......... 100 ns
Leitura aleatória em SSD ........ 100 000 ns   (100 µs)
Ida e volta no mesmo data center  500 000 ns   (0,5 ms)
Ida e volta São Paulo ↔ EUA ...  120 000 000 ns (120 ms)

Se 1 ns fosse 1 segundo: L1 = 1 s, RAM = 1 min 40 s,
SSD = 1 dia, rede intercontinental = quase 4 anos.` },
  docs: [['Latency numbers every programmer should know', 'https://gist.github.com/jboner/2841832'], ['What every programmer should know about memory (Drepper)', 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf'], ['Computer Systems: A Programmer’s Perspective', 'https://csapp.cs.cmu.edu/']],
  perguntas: [`Por que percorrer uma matriz por linhas pode ser muito mais rápido do que por colunas?`, `Quantas idas à rede uma tela do seu produto faz, comparadas a acessos à memória?`, `O que é um cache miss e como reduzi-los?`] },

{ id: 'memoria-gc', stage: 'maquina', level: 'essencial', title: 'Memória: pilha, heap e coleta de lixo', short: 'Memória e GC',
  resumo: `Onde os valores vivem, como a memória é liberada e por que vazamentos acontecem mesmo com GC.`,
  porque: `Vazamentos de memória derrubam servidores e deixam abas e apps lentos. Mesmo em linguagens com coleta de lixo, referências esquecidas mantêm objetos vivos para sempre. E pausas do GC aparecem como picos de latência.`,
  como: [
    `A <b>pilha</b> guarda quadros de chamadas de função e valores locais, liberados automaticamente ao retornar. O <b>heap</b> guarda objetos de vida mais longa. Formas de liberar o heap: <b>manual</b> (C: malloc/free), <b>contagem de referências</b> (Swift, Python em parte), <b>coleta de lixo por rastreamento</b> (JavaScript, Java, Go, C#) e <b>posse</b> verificada pelo compilador (Rust).`,
    `Um GC libera o que não é mais <b>alcançável</b> a partir das raízes (variáveis globais, pilha). GCs <b>geracionais</b> partem da ideia de que a maioria dos objetos morre cedo. Vazamentos em linguagens com GC: listeners não removidos, timers esquecidos, caches sem limite, closures que seguram objetos grandes, referências em estruturas globais.`,
  ],
  conecta: [['cpu-memoria', 'Hierarquia de memória.'], ['recursao', 'Cada chamada ocupa a pilha.'], ['backend/profiling', 'Encontrar vazamentos e pausas no servidor.'], ['frontend/perf-runtime', 'Memória e performance no navegador.']],
  front: `Um <code>useEffect</code> que adiciona um listener ou inicia um <code>setInterval</code> sem devolver a função de limpeza é a causa mais comum de vazamento em apps React.`,
  ex: { lang: 'typescript', code: `// vazamento: cache global sem limite cresce para sempre
const cache = new Map<string, Resultado>();

// melhor: limite de itens (LRU simples com a ordem de inserção do Map)
function guardar(chave: string, valor: Resultado, limite = 500) {
  cache.delete(chave);
  cache.set(chave, valor);
  if (cache.size > limite) cache.delete(cache.keys().next().value!);
}

// ou WeakMap: a entrada some quando a chave deixa de ser usada
const metadados = new WeakMap<object, Info>();

// React: sempre devolva a limpeza
useEffect(() => {
  const id = setInterval(atualizar, 5000);
  return () => clearInterval(id);
}, []);` },
  docs: [['MDN · Memory management', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management'], ['V8 · Trash talk: the Orinoco garbage collector', 'https://v8.dev/blog/trash-talk'], ['Chrome DevTools · Fix memory problems', 'https://developer.chrome.com/docs/devtools/memory-problems']],
  perguntas: [`Que estrutura global do seu código pode crescer sem limite?`, `Como encontrar um vazamento com snapshots de heap?`, `Por que a maioria dos objetos "morre jovem", e como o GC aproveita isso?`] },

{ id: 'representacao-dados', stage: 'maquina', level: 'essencial', title: 'Representação de dados: bits, números e texto', short: 'Bits e texto',
  resumo: `Inteiros, ponto flutuante, Unicode e codificações: de onde vêm bugs clássicos.`,
  porque: `0,1 + 0,2 ≠ 0,3, emojis que "quebram" o limite de caracteres, nomes com acentos corrompidos, ids grandes arredondados no JavaScript: todos vêm de como números e textos são representados em bits.`,
  como: [
    `<b>Inteiros</b> têm tamanho fixo (32, 64 bits) e podem estourar (overflow). <b>Ponto flutuante</b> (IEEE 754) representa números em binário com precisão limitada: 0,1 não tem representação exata. O <code>number</code> do JavaScript é um float de 64 bits: inteiros só são exatos até 2⁵³ − 1 (<code>Number.MAX_SAFE_INTEGER</code>), por isso ids de 64 bits devem trafegar como string ou <code>BigInt</code>. Dinheiro se guarda em centavos (inteiro) ou decimal.`,
    `<b>Texto</b>: o <b>Unicode</b> dá um número (code point) a cada caractere; <b>UTF-8</b> codifica cada um em 1 a 4 bytes e é o padrão da web. Strings em JavaScript usam UTF-16, então <code>"😀".length</code> é 2; e um "caractere visível" (grafema) pode ter vários code points (emoji com tom de pele, letras com acento combinado). Use <code>Intl.Segmenter</code> para contar o que o usuário vê e normalize (NFC) antes de comparar.`,
  ],
  conecta: [['dados/tipos-dados', 'Dinheiro, datas e identificadores no banco.'], ['seguranca/criptografia', 'Bytes, codificações e hashes.'], ['backend/http', 'Charset e content-type.'], ['frontend/i18n', 'Texto em vários idiomas.']],
  front: `Um contador de caracteres que usa <code>.length</code> erra com emojis; e um id numérico de 64 bits vindo da API em JSON chega arredondado. Peça ao backend ids como string.`,
  ex: { lang: 'typescript', code: `0.1 + 0.2;                         // 0.30000000000000004
Number.MAX_SAFE_INTEGER;           // 9007199254740991
JSON.parse('{"id": 9007199254740993}').id;   // 9007199254740992 (arredondado!)

// dinheiro em centavos
const total = 1990 + 1990;        // R$ 39,80, sem erro de arredondamento

// contar o que o usuário vê
"👍🏽".length;                                            // 4
[...new Intl.Segmenter("pt-BR").segment("👍🏽")].length; // 1

// "é" pode ser 1 ou 2 code points: normalize antes de comparar
"é" === "e\\u0301";                                   // false
"é".normalize("NFC") === "e\\u0301".normalize("NFC"); // true` },
  docs: [['What every computer scientist should know about floating-point', 'https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html'], ['MDN · Number.MAX_SAFE_INTEGER', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER'], ['The absolute minimum every developer must know about Unicode', 'https://tonsky.me/blog/unicode/']],
  perguntas: [`Onde o seu sistema guarda dinheiro como float?`, `Algum id da sua API passa de 2⁵³?`, `Como o seu produto conta caracteres num campo com limite?`] },
]
