import type { Topic } from '../../../types'

export const avancado: Topic[] = [
{ id: 'consenso', stage: 'avancado', level: 'aprofundar', title: 'Consenso distribuído: Raft e Paxos', short: 'Consenso',
  resumo: `Como várias máquinas concordam sobre um valor mesmo quando algumas falham.`,
  porque: `Eleger um líder, manter a configuração de um cluster e garantir que um lock só tenha um dono exigem consenso. É o que está por trás do etcd (Kubernetes), do Consul, do ZooKeeper e de bancos distribuídos.`,
  como: [
    `No <b>Raft</b>, os nós elegem um <b>líder</b>; toda escrita vai para ele, que a replica num log para os seguidores e só a considera confirmada quando a <b>maioria</b> (quórum) aceita. Se o líder some, os outros percebem pela falta de heartbeats e elegem outro. Com 5 nós, o sistema tolera 2 falhas; com 3, apenas 1.`,
    `Consenso tem custo: cada escrita espera a maioria responder (latência), e sem maioria o sistema para de aceitar escritas (escolhe consistência, no CAP). Por isso é usado para dados pequenos e críticos (configuração, coordenação, metadados), não para todo o tráfego da aplicação.`,
  ],
  conecta: [['backend/cap', 'Consenso escolhe consistência durante partições.'], ['replicacao', 'Replicação com líder e quórum.'], ['devops/kubernetes', 'O etcd do Kubernetes usa Raft.'], ['backend/race', 'Locks distribuídos confiáveis dependem de consenso.']],
  front: `Não aparece diretamente na interface, mas explica por que um sistema pode recusar escritas durante uma falha de rede em vez de aceitar dados inconsistentes.`,
  ex: { lang: 'texto', code: `Cluster Raft com 5 nós (tolera 2 falhas)
  [Líder A] ── log: x=1, y=2, z=3 ──> [B] [C] [D] [E]
  escrita "z=3" confirmada quando 3 de 5 (maioria) gravaram

  A cai → B, C, D, E param de receber heartbeat
        → C pede votos, recebe 3 → C é o novo líder (termo 2)
  rede dividida em {A,B} e {C,D,E}: só o lado com maioria aceita escritas` },
  docs: [['Raft · Visualização interativa', 'https://raft.github.io/'], ['The Secret Lives of Data · Raft', 'https://thesecretlivesofdata.com/raft/'], ['Martin Fowler · Patterns of Distributed Systems', 'https://martinfowler.com/articles/patterns-of-distributed-systems/']],
  perguntas: [`Por que um cluster de consenso costuma ter número ímpar de nós?`, `O que acontece com as escritas quando não há maioria?`, `Por que não usar consenso para todo o tráfego da aplicação?`] },

{ id: 'relogios', stage: 'avancado', level: 'aprofundar', title: 'Tempo e relógios em sistemas distribuídos', short: 'Relógios',
  resumo: `Por que "o que aconteceu primeiro" é uma pergunta difícil entre máquinas diferentes.`,
  porque: `Ordenar eventos por timestamp parece óbvio até os relógios das máquinas discordarem. Bugs de ordenação, expiração de tokens, locks e "último a escrever vence" dependem de entender os limites do tempo em sistemas distribuídos.`,
  como: [
    `Relógios físicos <b>derivam</b>; o NTP corrige, mas sempre sobra uma diferença de milissegundos (ou mais), e o relógio pode até voltar no tempo. Por isso, timestamps de máquinas diferentes não garantem ordem. Para medir durações dentro de uma máquina, use um relógio <b>monotônico</b>.`,
    `<b>Relógios lógicos</b> (Lamport) ordenam eventos por causalidade; <b>relógios vetoriais</b> detectam eventos concorrentes; <b>relógios híbridos</b> (HLC) combinam tempo físico e lógico e são usados em bancos distribuídos. Na prática: deixe o banco ou um único serviço atribuir a ordem (sequências, versões), use ids ordenáveis e desconfie de "last write wins" por timestamp.`,
  ],
  conecta: [['consenso', 'Consenso ordena eventos sem depender de relógios.'], ['backend/eventos', 'Eventos fora de ordem.'], ['crdt', 'CRDTs lidam com concorrência sem relógio global.'], ['dados/tipos-dados', 'Datas, fusos e ids ordenáveis.']],
  front: `O relógio do dispositivo do usuário pode estar errado; nunca confie nele para regras de negócio (expiração, ordem de mensagens). Use o horário do servidor.`,
  ex: { lang: 'typescript', code: `// medir duração: relógio monotônico, não Date.now()
const inicio = performance.now();
await processar();
const ms = performance.now() - inicio;    // não é afetado por ajustes do relógio do sistema

// ordem entre máquinas: versão atribuída pelo banco, não timestamp
// UPDATE documentos SET conteudo = $1, versao = versao + 1 WHERE id = $2 AND versao = $3
// relógio de Lamport: max(local, recebido) + 1 a cada evento
let lamport = 0;
function aoReceber(tsRemoto: number) { lamport = Math.max(lamport, tsRemoto) + 1; }` },
  docs: [['Martin Kleppmann · Distributed Systems (aulas)', 'https://www.cl.cam.ac.uk/teaching/2122/ConcDisSys/dist-sys-notes.pdf'], ['Leslie Lamport · Time, Clocks, and the Ordering of Events', 'https://lamport.azurewebsites.net/pubs/time-clocks.pdf'], ['Wikipedia · Vector clock', 'https://en.wikipedia.org/wiki/Vector_clock']],
  perguntas: [`Por que timestamps de máquinas diferentes não garantem a ordem dos eventos?`, `Quando usar um relógio monotônico?`, `Que risco tem a estratégia "último a escrever vence" por timestamp?`] },

{ id: 'crdt', stage: 'avancado', level: 'aprofundar', title: 'CRDTs e colaboração em tempo real', short: 'CRDT',
  resumo: `Estruturas de dados que várias pessoas editam ao mesmo tempo e sempre convergem.`,
  porque: `Editores colaborativos, apps offline-first e quadros compartilhados precisam juntar edições concorrentes sem conflitos manuais. CRDTs são a base de bibliotecas como Yjs e Automerge e de muitos produtos local-first.`,
  como: [
    `Um <b>CRDT</b> (Conflict-free Replicated Data Type) é desenhado para que réplicas que recebem as mesmas operações, em qualquer ordem, cheguem ao <b>mesmo estado</b>, sem coordenação central. Exemplos: contadores, conjuntos, mapas e sequências de texto em que cada caractere tem um id único e posição relativa.`,
    `A alternativa clássica é a <b>transformação operacional</b> (OT), usada historicamente pelo Google Docs, que depende de um servidor central. CRDTs funcionam peer-to-peer e offline, ao custo de metadados extras. Na prática, usa-se uma biblioteca e um servidor de sincronização (WebSocket) que repassa e persiste as atualizações.`,
  ],
  conecta: [['relogios', 'Ordem sem relógio global.'], ['frontend/local-first', 'A base de apps local-first.'], ['case-editor-colaborativo', 'Aplicação clássica.'], ['backend/realtime', 'Sincronização por WebSocket.']],
  front: `Com Yjs, o estado compartilhado vira um objeto que você observa no front; bindings prontos existem para editores como ProseMirror, Tiptap, CodeMirror e Monaco.`,
  ex: { lang: 'typescript', code: `import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const doc = new Y.Doc();
new WebsocketProvider("wss://colab.loja.com", "doc-981", doc); // sincroniza com outras pessoas

const texto = doc.getText("descricao");
texto.observe(() => render(texto.toString()));   // atualiza a tela em qualquer mudança

texto.insert(0, "Teclado mecânico ");             // edição local, mesclada sem conflito` },
  docs: [['crdt.tech', 'https://crdt.tech/'], ['Yjs', 'https://docs.yjs.dev/'], ['Automerge', 'https://automerge.org/docs/hello/']],
  perguntas: [`Que funcionalidade do seu produto se beneficiaria de edição colaborativa?`, `Qual a diferença entre CRDT e transformação operacional?`, `Que custo os CRDTs trazem em troca de funcionar offline?`] },

{ id: 'cell-based', stage: 'avancado', level: 'aprofundar', title: 'Arquitetura baseada em células', short: 'Células',
  resumo: `Dividir o sistema em cópias isoladas para limitar o alcance de qualquer falha.`,
  porque: `Em sistemas muito grandes, uma falha (deploy ruim, cliente abusivo, bug de dados) que atinge todo mundo é inaceitável. Células limitam o "raio de explosão": um problema afeta só uma fração dos clientes.`,
  como: [
    `Uma <b>célula</b> é uma cópia completa e independente da pilha (serviços, bancos, filas) que atende um subconjunto de clientes. Uma <b>camada de roteamento</b> fina e muito confiável envia cada cliente para sua célula (por id do cliente ou do tenant). Células têm tamanho máximo: para crescer, criam-se novas.`,
    `Benefícios: falhas e deploys afetam uma célula por vez (deploy célula a célula), testes de carga com tamanho conhecido e isolamento de clientes grandes. Custos: mais infraestrutura, operação de muitas cópias, migração de clientes entre células e consultas que cruzam células.`,
  ],
  conecta: [['particionamento', 'Células particionam por cliente.'], ['devops/estrategias-deploy', 'Deploy progressivo célula a célula.'], ['dados/multi-tenant', 'Tenants grandes podem ganhar células próprias.'], ['resiliencia', 'Limitar o raio de explosão.']],
  front: `Para o front, células costumam ser invisíveis; às vezes aparecem como um subdomínio ou região por cliente (ex.: empresa.us1.app.com).`,
  ex: { lang: 'texto', code: `                 [ roteador de células ] (fino, sem lógica de negócio)
                  tenant 1-5000 → célula A
                  tenant 5001-10000 → célula B
                        │                       │
   ┌──── célula A ──────┴──────┐   ┌──── célula B ─────┴───────┐
   │ API · workers · fila · DB │   │ API · workers · fila · DB │
   └───────────────────────────┘   └───────────────────────────┘
   deploy ruim na célula A → só os tenants 1-5000 são afetados` },
  docs: [['AWS · Reducing the scope of impact with cell-based architecture', 'https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html'], ['Slack · Cellular architecture', 'https://slack.engineering/slacks-migration-to-a-cellular-architecture/'], ['AWS Builders\' Library · Shuffle sharding', 'https://aws.amazon.com/builders-library/workload-isolation-using-shuffle-sharding/']],
  perguntas: [`Qual seria o raio de explosão de um deploy ruim no seu sistema hoje?`, `Por que o roteador de células precisa ser simples?`, `Que custo operacional as células acrescentam?`] },

{ id: 'multi-regiao', stage: 'avancado', level: 'aprofundar', title: 'Arquiteturas multi-região', short: 'Multi-região',
  resumo: `Rodar em várias regiões ao mesmo tempo: ativo-passivo, ativo-ativo e o problema dos dados.`,
  porque: `Sobreviver à queda de uma região inteira ou atender usuários no mundo todo com baixa latência exige várias regiões. A parte difícil não é subir servidores, é decidir onde os dados vivem e como se mantêm consistentes.`,
  como: [
    `<b>Ativo-passivo</b>: uma região atende e outra fica pronta com dados replicados; em desastre, promove-se a passiva (RTO de minutos, pode perder dados recentes). <b>Ativo-ativo</b>: várias regiões atendem ao mesmo tempo; exige decidir como lidar com escritas concorrentes em regiões diferentes.`,
    `Estratégias de dados: <b>particionar por região</b> (cada usuário tem uma região "dona" dos seus dados; simples e compatível com leis de residência), <b>bancos globais</b> com consenso (Spanner, CockroachDB; escrita mais lenta) ou replicação assíncrona com resolução de conflitos. Teste o failover regularmente: failover nunca testado não funciona.`,
  ],
  conecta: [['devops/regioes-az', 'O básico de regiões e zonas.'], ['devops/trafego-global', 'Roteamento de usuários entre regiões.'], ['replicacao', 'Replicação a grandes distâncias.'], ['backend/cap', 'O trade-off entre consistência e disponibilidade.'], ['dados/newsql', 'Bancos globais com consenso.']],
  front: `Usuários de regiões diferentes podem ver dados com pequenos atrasos entre si; a interface deve tolerar isso (ex.: um comentário que aparece alguns segundos depois para outra pessoa).`,
  ex: { lang: 'texto', code: `Estratégia                 RTO        Perda de dados   Complexidade
───────────────────────── ───────── ──────────────── ────────────
backup em outra região    horas      horas            baixa
ativo-passivo (réplica)   minutos    segundos         média
ativo-ativo particionado  segundos   ~0 (por usuário) alta
ativo-ativo global (Spanner/CockroachDB) segundos ~0  alta, escrita mais lenta` },
  docs: [['AWS · Multi-region fundamentals', 'https://docs.aws.amazon.com/prescriptive-guidance/latest/aws-multi-region-fundamentals/introduction.html'], ['Google · Spanner overview', 'https://cloud.google.com/spanner/docs/overview'], ['Designing Data-Intensive Applications', 'https://dataintensive.net/']],
  perguntas: [`O seu produto precisa realmente de várias regiões, ou de backups em outra região?`, `Como particionar os dados de usuários por região?`, `Quando foi o último teste real de failover?`] },

{ id: 'case-video', stage: 'avancado', level: 'importante', title: 'Caso: plataforma de vídeo', short: 'Vídeo',
  resumo: `Upload, processamento e entrega de vídeo para milhões de espectadores.`,
  porque: `Combina uploads grandes, processamento pesado e assíncrono, armazenamento em escala e entrega por CDN com qualidade adaptativa. É um ótimo exercício de separar o caminho de escrita (raro e pesado) do de leitura (frequente e sensível a latência).`,
  como: [
    `<b>Upload</b>: direto do navegador para o object storage, em partes (multipart, retomável), por URL pré-assinada. <b>Processamento</b>: um evento dispara uma fila de jobs que transcodifica o vídeo em várias resoluções e taxas de bits, gera miniaturas e legendas; o vídeo passa por estados (enviado, processando, pronto).`,
    `<b>Entrega</b>: o vídeo é dividido em segmentos curtos com manifestos (<b>HLS</b> ou <b>DASH</b>) servidos pela <b>CDN</b>; o player escolhe a qualidade conforme a banda (<b>streaming adaptativo</b>). Contagem de visualizações vai para um pipeline assíncrono. Transmissões ao vivo exigem latência baixa e outro desenho de ingestão.`,
  ],
  conecta: [['devops/storage', 'Uploads grandes e armazenamento de objetos.'], ['backend/filas', 'Transcodificação assíncrona.'], ['devops/cdn-edge', 'Entrega dos segmentos.'], ['estimativas', 'Banda e armazenamento crescem rápido.']],
  front: `O player (hls.js, players nativos), o upload retomável com barra de progresso e os estados "processando" do vídeo são a parte do sistema que o usuário enxerga.`,
  ex: { lang: 'texto', code: `[Navegador] ──multipart (URL pré-assinada)──> [Object storage: originais]
                                                    │ evento "upload concluído"
                                                    ▼
                                    [fila] ──> [workers de transcodificação]
                                    1080p · 720p · 480p · 360p + miniaturas
                                                    │
                                     [storage: segmentos HLS + manifesto]
                                                    │
[Player] <──── master.m3u8 + segmentos de 4s ──── [CDN]   (troca de qualidade conforme a banda)` },
  docs: [['Apple · HTTP Live Streaming', 'https://developer.apple.com/streaming/'], ['hls.js', 'https://github.com/video-dev/hls.js'], ['Netflix TechBlog · Video encoding', 'https://netflixtechblog.com/tagged/encoding']],
  perguntas: [`Por que enviar o vídeo direto para o storage em vez de passar pela API?`, `O que é streaming adaptativo?`, `Que estados de um vídeo a interface precisa mostrar?`] },

{ id: 'case-editor-colaborativo', stage: 'avancado', level: 'aprofundar', title: 'Caso: editor colaborativo', short: 'Editor colaborativo',
  resumo: `Várias pessoas editando o mesmo documento ao mesmo tempo, com presença e histórico.`,
  porque: `É o caso que junta tempo real, consistência sem conflitos, offline e escala de conexões. Ferramentas como Google Docs, Figma e Notion resolvem variações desse problema.`,
  como: [
    `Cada documento tem um estado compartilhado (CRDT ou OT). Clientes conectam por <b>WebSocket</b> a um servidor de sincronização que repassa atualizações para quem está no mesmo documento e as persiste. Todas as conexões de um documento devem ir para o mesmo servidor (roteamento por id do documento) ou passar por um pub/sub.`,
    `Recursos: <b>presença</b> (cursores e seleções de outras pessoas, dados efêmeros que não vão para o banco), <b>histórico</b> e versões (snapshots periódicos + atualizações), <b>offline</b> (edições locais sincronizadas ao voltar), permissões por documento e compactação do histórico para não crescer para sempre.`,
  ],
  conecta: [['crdt', 'A estrutura de dados que torna a mesclagem possível.'], ['backend/realtime', 'WebSocket e pub/sub.'], ['case-chat', 'Desafios parecidos de conexões persistentes.'], ['frontend/local-first', 'Edição offline.']],
  front: `A maior parte da complexidade percebida está no front: renderizar cursores remotos, aplicar atualizações sem perder a posição do cursor local e mostrar o estado de sincronização.`,
  ex: { lang: 'texto', code: `[Ana] ──ws──┐                    ┌──ws── [Bruno]
            ▼                    ▼
     [servidor de sincronização do doc-981]   (roteado por id do documento)
       · repassa atualizações CRDT a todos do documento
       · presença: cursores e seleções (efêmero, só em memória)
       · persiste: snapshot a cada N minutos + log de atualizações
            │
       [banco/storage] ← histórico e versões
Ana offline: edita localmente → ao reconectar, envia as atualizações e recebe as de Bruno` },
  docs: [['Figma · How Figma\'s multiplayer technology works', 'https://www.figma.com/blog/how-figmas-multiplayer-technology-works/'], ['Yjs · Documentação', 'https://docs.yjs.dev/'], ['Liveblocks · Blog', 'https://liveblocks.io/blog']],
  perguntas: [`Por que dados de presença não devem ir para o banco?`, `Como garantir que todos de um documento recebam as atualizações?`, `O que acontece com as edições feitas offline?`] },
]
