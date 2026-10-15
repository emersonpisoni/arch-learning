import type { Topic } from '../../../types'

export const runtime: Topic[] = [
{ id: 'linguagem', stage: 'runtime', level: 'essencial', title: 'Linguagem e runtime', short: 'Linguagem',
  resumo: `Escolher uma linguagem de backend e entender o modelo de execução dela.`,
  porque: `Cada stack lida de um jeito com concorrência, memória e tipos. Entender o modelo da sua (ou da que o time usa) explica por que uma API trava sob carga ou consome memória demais.`,
  como: [
    `<b>Node.js/TypeScript</b>: event loop em uma thread, ótimo para I/O e familiar para quem já usa JavaScript no navegador. <b>Java/Kotlin</b> (Spring): JVM madura, threads reais e, desde o Java 21, virtual threads. <b>Go</b>: goroutines leves e binário único, muito usado em infraestrutura. <b>C#</b> (.NET): async/await robusto e forte no ambiente corporativo. <b>Python</b>: produtividade, dados e IA, com o GIL limitando threads em tarefas de CPU.`,
    `Seja qual for a linguagem, aprenda: gerenciamento de dependências, como o runtime trata memória (garbage collector), tratamento de erros, tipagem e como subir um servidor HTTP mínimo. Os conceitos das próximas etapas se transferem entre linguagens.`,
  ],
  conecta: [['threads', 'Cada runtime tem seu modelo de threads.'], ['async', 'Node e Python dependem de event loop; Java e Go usam threads leves.'], ['mvc', 'Os frameworks de cada linguagem implementam MVC.'], ['testes', 'Cada ecossistema tem suas ferramentas de teste.']],
  front: `Com Node/TypeScript nos dois lados, dá para reaproveitar tipos, validação (ex.: Zod) e até código entre front e back. Monorepos facilitam compartilhar contratos.`,
  ex: { lang: 'typescript', code: `import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(3000, () => console.log("API em http://localhost:3000"));` },
  docs: [['roadmap.sh · Backend', 'https://roadmap.sh/backend'], ['Node.js · Learn', 'https://nodejs.org/en/learn'], ['A Tour of Go', 'https://go.dev/tour/'], ['Spring · Guias', 'https://spring.io/guides']],
  perguntas: [`Que tipo de carga, I/O ou CPU, favorece o modelo do Node?`, `O que é garbage collector e por que ele pode causar pausas?`, `Qual linguagem o backend do seu time usa, e qual modelo de concorrência ela tem?`] },

{ id: 'threads', stage: 'runtime', level: 'essencial', title: 'Processos e threads', short: 'Threads',
  resumo: `Como um servidor executa várias tarefas ao mesmo tempo.`,
  porque: `Toda API atende muitos usuários simultâneos. O jeito que ela divide trabalho entre processos e threads define quantas requisições aguenta, quanta memória usa e que tipo de bug pode aparecer.`,
  como: [
    `Um <b>processo</b> é um programa em execução, com memória própria e isolada. Uma <b>thread</b> é uma linha de execução dentro do processo, e várias threads <b>compartilham a mesma memória</b>: é rápido, mas abre espaço para conflitos. O sistema operacional alterna as threads entre os núcleos da CPU (context switch).`,
    `Modelos de servidor: <b>uma thread por requisição</b> com um pool limitado (Tomcat/Spring clássico); <b>event loop</b> com poucas threads (Node, Nginx); <b>threads leves</b> gerenciadas pelo runtime (goroutines do Go, virtual threads do Java 21). Para usar todos os núcleos em Node, rodam-se vários processos (cluster, PM2 ou várias réplicas do container).`,
    `<b>Concorrência</b> é lidar com várias coisas intercaladas; <b>paralelismo</b> é executar ao mesmo tempo em núcleos diferentes. Um pool de threads tem tamanho fixo: se todas ficam presas esperando um banco lento, as novas requisições entram na fila.`,
  ],
  conecta: [['async', 'A alternativa ao modelo de uma thread por requisição.'], ['race', 'Memória compartilhada entre threads gera race conditions.'], ['escala', 'Mais processos ou réplicas usam mais núcleos e máquinas.'], ['linux', 'O kernel cria, agenda e encerra processos e threads.']],
  front: `Web Workers são threads no navegador: rodam em paralelo e conversam por mensagens, justamente para não compartilhar memória. É a mesma ideia dos <code>worker_threads</code> do Node.`,
  ex: { lang: 'java', code: `// Java 21: uma virtual thread por tarefa, milhares sem custo alto
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        int pedido = i;
        executor.submit(() -> processarPedido(pedido));
    }
} // o bloco só termina quando todas as tarefas acabam` },
  docs: [['Oracle · Java Concurrency', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/'], ['JEP 444 · Virtual Threads', 'https://openjdk.org/jeps/444'], ['A Tour of Go · Concorrência', 'https://go.dev/tour/concurrency/1'], ['OSTEP · livro gratuito de sistemas operacionais', 'https://pages.cs.wisc.edu/~remzi/OSTEP/']],
  perguntas: [`O que duas threads compartilham que dois processos não compartilham?`, `Por que um pool de 200 threads pode travar quando o banco fica lento?`, `Qual a diferença entre concorrência e paralelismo?`] },

{ id: 'async', stage: 'runtime', level: 'essencial', title: 'Event loop e async', short: 'Async',
  resumo: `Atender outras requisições enquanto espera banco, rede ou disco responder.`,
  porque: `A maior parte do tempo de uma API é espera de I/O. Programação assíncrona atende milhares de conexões com poucas threads, mas um único trecho pesado de CPU pode travar todo mundo.`,
  como: [
    `No <b>event loop</b> (Node, Python asyncio), uma thread principal executa callbacks. Quando o código pede I/O (query, chamada HTTP), a operação é entregue ao sistema operacional e a thread segue atendendo outras tarefas. Quando a resposta chega, a continuação do <code>await</code> entra na fila para rodar.`,
    `O perigo é <b>bloquear o loop</b>: um <code>JSON.parse</code> de 50 MB, criptografia síncrona ou um laço pesado param todas as requisições ao mesmo tempo. Trabalho de CPU vai para worker threads, outro processo ou uma fila.`,
    `Promises e async/await no backend funcionam como no front. A diferença é a escala: um <code>Promise.all</code> com 10 mil queries derruba o banco, então use limites de concorrência.`,
  ],
  conecta: [['threads', 'Outro modelo para o mesmo problema.'], ['filas', 'Tiram trabalho pesado do caminho da requisição.'], ['race', 'Mesmo com uma thread, operações intercaladas por await geram races.'], ['linguagem', 'Node e Python asyncio são baseados em event loop.'], ['fundamentos/concorrencia-modelos', 'Event loop comparado a threads, atores e canais.']],
  front: `O event loop do navegador funciona do mesmo jeito (microtasks, macrotasks, um laço pesado congela a interface). O Node usa esse modelo, só que ali o "congelar" afeta todos os usuários da API de uma vez.`,
  ex: { lang: 'typescript', code: `// sequencial: o tempo total é a soma das duas chamadas
const user = await getUser(id);
const orders = await getOrders(id);

// independentes rodam juntas
const [user2, orders2] = await Promise.all([getUser(id), getOrders(id)]);

// CPU pesada não deve rodar no event loop
import { Worker } from "node:worker_threads";
new Worker("./gerar-relatorio.js", { workerData: { mes: 10 } });` },
  docs: [['Node.js · O event loop', 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick'], ['Node.js · Não bloqueie o event loop', 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop'], ['Python · asyncio', 'https://docs.python.org/3/library/asyncio.html']],
  perguntas: [`Por que uma operação síncrona pesada afeta todos os usuários em Node?`, `Quando usar Promise.all e quando limitar a concorrência?`, `Onde colocar um processamento de imagem que leva 5 segundos?`] },

{ id: 'race', stage: 'runtime', level: 'importante', title: 'Race conditions e locks', short: 'Race conditions',
  resumo: `Bugs que aparecem quando duas operações mexem no mesmo dado ao mesmo tempo.`,
  porque: `O clássico: dois usuários compram o último item do estoque e os dois conseguem. Esses bugs não aparecem em teste local e explodem em produção, sob carga.`,
  como: [
    `Uma <b>race condition</b> acontece quando o resultado depende da ordem de execução. O padrão perigoso é <b>ler, decidir, escrever</b>: duas requisições leem estoque = 1, as duas decidem que podem vender e as duas gravam estoque = 0.`,
    `Soluções: operações <b>atômicas</b> no banco (<code>UPDATE ... SET estoque = estoque - 1 WHERE estoque > 0</code>); <b>lock pessimista</b> (<code>SELECT ... FOR UPDATE</code> trava a linha); <b>lock otimista</b> (uma coluna <code>version</code> faz o update falhar se alguém alterou antes); constraints únicas; e, entre vários servidores, locks distribuídos (ex.: Redis). Dentro de um processo existem mutex, semáforos e estruturas thread-safe.`,
  ],
  conecta: [['transacoes', 'O isolamento das transações define o que cada uma enxerga.'], ['threads', 'Threads compartilhando memória são a origem clássica do problema.'], ['idempotencia', 'Repetições e duplos cliques são races vindas do cliente.'], ['escala', 'Com várias réplicas, um lock em memória deixa de funcionar.'], ['fundamentos/concorrencia-modelos', 'Modelos de concorrência e suas primitivas.']],
  front: `Duplo clique no botão de pagar é uma race condition que começa no front. Desabilitar o botão ajuda, mas a proteção real precisa estar no backend.`,
  ex: { lang: 'sql', code: `-- atômico: só decrementa se ainda houver estoque
UPDATE produtos
   SET estoque = estoque - 1
 WHERE id = 42 AND estoque > 0;
-- 0 linhas afetadas = esgotado

-- lock otimista: falha se outra pessoa alterou antes
UPDATE pedidos SET status = 'PAGO', version = version + 1
 WHERE id = 981 AND version = 3;` },
  docs: [['PostgreSQL · Locks explícitos', 'https://www.postgresql.org/docs/current/explicit-locking.html'], ['Oracle · Synchronization', 'https://docs.oracle.com/javase/tutorial/essential/concurrency/sync.html'], ['Kleppmann · Distributed locking', 'https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html']],
  perguntas: [`Por que um mutex em memória não resolve com 3 réplicas da API?`, `Qual a diferença entre lock otimista e pessimista?`, `Mostre um trecho de código do seu time que segue o padrão ler-decidir-escrever.`] },
]
