import type { Topic } from '../../../types'

export const sistema: Topic[] = [
{ id: 'sistema-operacional', stage: 'sistema', level: 'importante', title: 'Sistema operacional: processos, memória virtual e chamadas de sistema', short: 'Sistema operacional',
  resumo: `O que o sistema operacional faz entre o seu programa e o hardware.`,
  porque: `Todo programa depende do sistema operacional para ler arquivos, abrir conexões, criar processos e usar memória. Containers, limites de memória, "too many open files" e processos zumbis só fazem sentido com esses conceitos.`,
  como: [
    `O <b>kernel</b> controla o hardware; programas rodam em <b>modo usuário</b> e pedem serviços por <b>chamadas de sistema</b> (open, read, write, socket, fork, exec). Cada <b>processo</b> tem espaço de memória próprio e <b>descritores de arquivo</b> (arquivos, sockets e pipes são todos descritores). O <b>escalonador</b> divide o tempo de CPU entre processos e threads.`,
    `<b>Memória virtual</b>: cada processo enxerga um espaço de endereços próprio, mapeado em páginas para a RAM física; páginas podem ir para o disco (swap) e ser compartilhadas. Containers usam recursos do kernel: <b>namespaces</b> (o que o processo enxerga) e <b>cgroups</b> (quanto ele pode usar). Sem memória, o kernel aciona o <b>OOM killer</b>.`,
  ],
  conecta: [['backend/linux', 'O terminal e os comandos do dia a dia.'], ['devops/processos-recursos', 'Medir CPU, memória e I/O.'], ['backend/docker', 'Containers são processos isolados pelo kernel.'], ['concorrencia-modelos', 'Processos e threads.'], ['devops/ebpf', 'Observar o kernel por dentro.']],
  front: `O navegador é um sistema operacional em miniatura: processos separados por site, um escalonador de tarefas e limites de memória que descartam abas.`,
  ex: { lang: 'bash', code: `# chamadas de sistema que um processo faz (Linux)
strace -f -e trace=openat,read,write,connect node servidor.js

# descritores de arquivo abertos por um processo
ls -l /proc/$(pgrep -f servidor.js)/fd | wc -l
ulimit -n            # limite de descritores ("too many open files")

# container: limite de memória via cgroups
docker run --memory=256m minha-api
dmesg | grep -i "killed process"     # o OOM killer matou alguém?` },
  docs: [['Operating Systems: Three Easy Pieces', 'https://pages.cs.wisc.edu/~remzi/OSTEP/'], ['man7 · syscalls(2)', 'https://man7.org/linux/man-pages/man2/syscalls.2.html'], ['man7 · cgroups(7)', 'https://man7.org/linux/man-pages/man7/cgroups.7.html']],
  perguntas: [`O que acontece quando o seu container passa do limite de memória?`, `Por que um socket aberto conta como arquivo aberto?`, `Qual a diferença entre memória virtual e memória física usada por um processo?`] },

{ id: 'concorrencia-modelos', stage: 'sistema', level: 'importante', title: 'Concorrência e paralelismo: modelos', short: 'Concorrência',
  resumo: `Threads, event loop, atores e canais: formas de fazer várias coisas ao mesmo tempo.`,
  porque: `Servidores atendem milhares de requisições simultâneas, interfaces precisam continuar responsivas e máquinas têm muitos núcleos. Cada linguagem escolhe um modelo de concorrência, e conhecer as opções ajuda a escolher, depurar e evitar bugs difíceis.`,
  como: [
    `<b>Concorrência</b> é lidar com várias tarefas em andamento; <b>paralelismo</b> é executá-las literalmente ao mesmo tempo em núcleos diferentes. Modelos: <b>threads com memória compartilhada</b> e locks (Java, C#, C++); <b>event loop</b> com I/O não bloqueante (Node.js, navegador); <b>corrotinas/green threads</b> leves (goroutines, corrotinas Kotlin, virtual threads do Java).`,
    `<b>Passagem de mensagens</b> evita compartilhar memória: <b>CSP</b> com canais (Go) e <b>atores</b> (Erlang/Elixir, Akka), em que cada ator tem estado próprio e recebe mensagens. Problemas clássicos: <b>condição de corrida</b>, <b>deadlock</b>, <b>starvation</b>. Primitivas: mutex, semáforo, operações atômicas, filas thread-safe.`,
  ],
  conecta: [['sistema-operacional', 'Processos, threads e escalonador.'], ['backend/race', 'Condições de corrida na prática.'], ['backend/async', 'Event loop e async no servidor.'], ['frontend/web-workers-wasm', 'Paralelismo no navegador.']],
  front: `O JavaScript é concorrente (event loop) mas não paralelo na thread principal; para usar outros núcleos, o navegador oferece Web Workers, que se comunicam por mensagens, como atores.`,
  ex: { lang: 'go', code: `// Go: produtor-consumidor com canais (CSP), sem locks explícitos
func main() {
    pedidos := make(chan Pedido, 100)
    var wg sync.WaitGroup

    for i := 0; i < 4; i++ {                 // 4 workers em paralelo
        wg.Add(1)
        go func() {
            defer wg.Done()
            for p := range pedidos {          // recebe até o canal fechar
                processar(p)
            }
        }()
    }

    for _, p := range carregarPedidos() {
        pedidos <- p                          // envia
    }
    close(pedidos)
    wg.Wait()
}` },
  docs: [['Go · Concurrency is not parallelism', 'https://go.dev/blog/waza-talk'], ['Java · Virtual threads', 'https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html'], ['Elixir · Processes', 'https://hexdocs.pm/elixir/processes.html']],
  perguntas: [`Qual a diferença entre concorrência e paralelismo no seu runtime?`, `Por que passagem de mensagens evita uma classe de bugs?`, `Como um deadlock acontece, e como preveni-lo?`] },
]
