import type { Topic } from '../../../types'

export const escalaDados: Topic[] = [
{ id: 'estimativas', stage: 'escala-dados', level: 'essencial', title: 'Estimativas de capacidade', short: 'Estimativas',
  resumo: `Contas rápidas e aproximadas para saber se uma solução aguenta antes de construí-la.`,
  porque: `"Um banco só aguenta?" é uma pergunta que se responde em cinco minutos com números redondos. É a primeira etapa de qualquer entrevista de system design e evita tanto subdimensionar quanto superengenharia.`,
  como: [
    `Parta dos usuários: <b>usuários ativos por dia</b> × ações por usuário ÷ 86.400 segundos = <b>requisições por segundo</b> médias; multiplique por 2 a 5 para o pico. Para armazenamento: itens por dia × tamanho médio × dias de retenção. Para banda: requisições por segundo × tamanho da resposta.`,
    `Tenha alguns números de referência na cabeça: um dia tem cerca de 100 mil segundos; ler da memória leva ~100 ns, de SSD ~100 µs, ida e volta na mesma região ~1 ms e entre continentes ~100 ms. Um servidor web típico atende de centenas a alguns milhares de req/s; um Postgres bem indexado, milhares de queries simples por segundo.`,
  ],
  conecta: [['requisitos-nao-funcionais', 'Estimativas tornam os RNFs concretos.'], ['particionamento', 'Quando os números passam do que um banco aguenta.'], ['devops/capacidade', 'Testes de carga validam as estimativas.'], ['case-encurtador', 'Todo estudo de caso começa por aqui.']],
  front: `A mesma conta vale para o front: 1 milhão de visitas por dia com 2 MB por página são 2 TB de transferência diária. Isso justifica otimizar imagens e cachear na CDN.`,
  ex: { lang: 'texto', code: `App de fotos: 10 milhões de usuários ativos/dia
  uploads: 10M × 0,2 foto/dia = 2M fotos/dia
           2M ÷ 100.000 s ≈ 20 uploads/s (pico ~100/s)
  leituras: 10M × 30 fotos vistas = 300M/dia ≈ 3.000 req/s (pico ~15.000)
  armazenamento: 2M × 2 MB = 4 TB/dia ≈ 1,5 PB/ano
  conclusão: leitura >> escrita → CDN e cache são essenciais;
             armazenamento vai para object storage, não para o banco` },
  docs: [['Latency numbers every programmer should know', 'https://gist.github.com/jboner/2841832'], ['System Design Primer · Back-of-the-envelope', 'https://github.com/donnemartin/system-design-primer#back-of-the-envelope-calculations'], ['ByteByteGo · Back-of-the-envelope estimation', 'https://bytebytego.com/courses/system-design-interview/back-of-the-envelope-estimation']],
  perguntas: [`Quantas requisições por segundo o seu sistema recebe no pico?`, `Quanto armazenamento ele gera por ano?`, `Que conclusão de arquitetura sai quando a leitura é 100 vezes maior que a escrita?`] },

{ id: 'replicacao', stage: 'escala-dados', level: 'essencial', title: 'Replicação de dados', short: 'Replicação',
  resumo: `Manter cópias dos dados em várias máquinas para ler mais e sobreviver a falhas.`,
  porque: `Réplicas são a primeira ferramenta para escalar leitura e para alta disponibilidade. Elas também são a origem de bugs do tipo "salvei e não apareceu", por causa do atraso de replicação.`,
  como: [
    `<b>Líder-seguidor</b> (primário-réplica): escritas vão para o líder, que repassa as mudanças às réplicas; leituras podem ir para as réplicas. A replicação pode ser <b>síncrona</b> (o líder espera a réplica confirmar: mais segura, mais lenta) ou <b>assíncrona</b> (mais rápida, mas a réplica fica alguns instantes atrás, o <i>replication lag</i>).`,
    `<b>Multi-líder</b> e <b>sem líder</b> (estilo Dynamo/Cassandra, com quóruns de leitura e escrita) aceitam escritas em vários nós, o que exige resolver conflitos. Em falhas, ocorre <b>failover</b>: uma réplica é promovida a líder, e os riscos são perder escritas recentes ou ter dois líderes (split brain).`,
  ],
  conecta: [['backend/escala', 'Réplicas de leitura aliviam o banco principal.'], ['backend/cap', 'Replicação é onde o CAP aparece na prática.'], ['particionamento', 'Escala escrita, enquanto replicação escala leitura.'], ['devops/regioes-az', 'Réplicas em outras zonas e regiões.']],
  front: `Depois de um POST, use os dados devolvidos pela própria resposta em vez de buscar a lista de novo logo em seguida; uma réplica atrasada pode ainda não ter o registro novo.`,
  ex: { lang: 'texto', code: `           escritas
[API] ───────────────> [Líder]
  │                      │ replicação assíncrona (lag de ~50 ms)
  │ leituras          ┌──┴──────────┐
  └──────────────> [Réplica 1]  [Réplica 2]

Leitura logo após escrever pode vir de uma réplica atrasada:
  POST /pedidos → 201  |  GET /pedidos (réplica) → ainda sem o pedido novo` },
  docs: [['Designing Data-Intensive Applications · cap. 5', 'https://dataintensive.net/'], ['PostgreSQL · Alta disponibilidade e replicação', 'https://www.postgresql.org/docs/current/high-availability.html'], ['AWS · Réplicas de leitura do RDS', 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html']],
  perguntas: [`Que tela do seu produto sofreria com replication lag?`, `Qual a diferença de garantia entre replicação síncrona e assíncrona?`, `O que é split brain e por que é perigoso?`] },

{ id: 'particionamento', stage: 'escala-dados', level: 'importante', title: 'Particionamento e sharding', short: 'Sharding',
  resumo: `Dividir os dados entre várias máquinas quando um único banco não aguenta.`,
  porque: `Réplicas escalam leitura, mas toda escrita ainda vai para um lugar só. Quando o volume de escrita ou de dados passa do que uma máquina suporta, a saída é dividir, e isso muda profundamente como a aplicação consulta os dados.`,
  como: [
    `Cada <b>shard</b> guarda uma parte dos dados, escolhida por uma <b>chave de partição</b>. Por <b>intervalo</b> (pedidos de janeiro num shard, de fevereiro em outro) facilita consultas por faixa, mas gera pontos quentes. Por <b>hash</b> (hash do id do cliente) distribui bem, mas consultas por faixa precisam ir a todos os shards.`,
    `A escolha da chave é a decisão mais importante: consultas que usam a chave vão a um shard só; as outras viram <b>scatter-gather</b> em todos. Joins e transações entre shards ficam caros, e <b>rebalancear</b> é trabalhoso. Antes de fazer sharding, esgote índices, cache, réplicas e máquinas maiores; ou use bancos que particionam sozinhos.`,
  ],
  conecta: [['replicacao', 'Cada shard costuma ter suas próprias réplicas.'], ['consistent-hashing', 'Técnica para distribuir chaves e rebalancear menos.'], ['backend/nosql', 'Muitos bancos NoSQL particionam automaticamente.'], ['dados/multi-tenant', 'Particionar por cliente é uma estratégia comum.']],
  front: `Telas que filtram por qualquer campo funcionam bem num banco só; com sharding, filtros fora da chave de partição podem ficar lentos ou exigir um índice de busca separado.`,
  ex: { lang: 'texto', code: `Chave de partição: cliente_id
  shard = hash(cliente_id) % 4

  GET /clientes/7/pedidos   → só o shard 3                 (rápido)
  GET /pedidos?status=PAGO  → os 4 shards + juntar         (scatter-gather)
  relatório de todos os clientes → melhor num data warehouse` },
  docs: [['Designing Data-Intensive Applications · cap. 6', 'https://dataintensive.net/'], ['MongoDB · Sharding', 'https://www.mongodb.com/docs/manual/sharding/'], ['Microsoft · Padrão Sharding', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding']],
  perguntas: [`Qual seria a chave de partição natural do seu sistema?`, `Que consulta importante ficaria cara depois do sharding?`, `O que tentar antes de partir para sharding?`] },

{ id: 'consistent-hashing', stage: 'escala-dados', level: 'aprofundar', title: 'Consistent hashing', short: 'Consistent hashing',
  resumo: `Distribuir chaves entre servidores de forma que adicionar ou remover um mova poucas chaves.`,
  porque: `Com <code>hash(chave) % N</code>, mudar N de 4 para 5 servidores muda o destino de quase todas as chaves: num cache, isso esvazia tudo de uma vez. Consistent hashing resolve isso e aparece em caches distribuídos, CDNs e bancos como Cassandra e DynamoDB.`,
  como: [
    `Servidores e chaves são posicionados num <b>anel</b> de valores de hash. Cada chave pertence ao primeiro servidor encontrado no sentido horário. Ao adicionar um servidor, ele só "rouba" as chaves do trecho entre ele e o vizinho anterior, cerca de 1/N das chaves.`,
    `Para equilibrar a carga, cada servidor físico ocupa vários pontos do anel (<b>nós virtuais</b>). Variações como rendezvous hashing resolvem o mesmo problema com outra técnica.`,
  ],
  conecta: [['particionamento', 'Uma forma de escolher o shard de cada chave.'], ['cache-distribuido', 'Caches distribuídos dependem disso.'], ['backend/load-balancer', 'Balanceamento por hash usa a mesma ideia.']],
  front: `Não aparece diretamente no front, mas explica por que adicionar nós a um cache distribuído não derruba a taxa de acerto.`,
  ex: { lang: 'texto', code: `hash % N:  4 → 5 servidores  ⇒ ~80% das chaves mudam de lugar
anel:      4 → 5 servidores  ⇒ ~20% das chaves mudam de lugar

          0
     S1 ●   ● chave "user:7" → vai para S2 (próximo no sentido horário)
    ●          ● S2
  S4 ●        ●
       ● S3 ●` },
  docs: [['Wikipedia · Consistent hashing', 'https://en.wikipedia.org/wiki/Consistent_hashing'], ['Amazon Dynamo paper', 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'], ['Tom White · Consistent Hashing', 'https://tom-e-white.com/2007/11/consistent-hashing.html']],
  perguntas: [`Por que hash(chave) % N é ruim quando o número de servidores muda?`, `Para que servem os nós virtuais?`, `Onde mais o consistent hashing aparece?`] },

{ id: 'cache-distribuido', stage: 'escala-dados', level: 'importante', title: 'Estratégias de cache em escala', short: 'Cache em escala',
  resumo: `Padrões de leitura e escrita com cache e os problemas que surgem em sistemas grandes.`,
  porque: `Em sistemas com muita leitura, o cache segura a maior parte da carga. Quando ele falha ou esvazia, o banco recebe tudo de uma vez. Projetar cache é projetar para esse dia.`,
  como: [
    `Padrões: <b>cache-aside</b> (a aplicação lê do cache e preenche no miss), <b>read-through</b> (o cache busca sozinho na origem), <b>write-through</b> (escreve no cache e no banco juntos) e <b>write-behind</b> (escreve no cache e grava no banco depois, mais rápido e mais arriscado).`,
    `Problemas em escala: <b>chaves quentes</b> (um item viral sobrecarrega um nó), <b>stampede</b> quando chaves populares expiram, <b>cache frio</b> após um deploy ou reinício, e <b>invalidação</b> entre várias camadas (CDN, aplicação, cliente). Soluções: TTL com variação aleatória, recálculo com lock, cache local + distribuído, e pré-aquecimento.`,
  ],
  conecta: [['backend/cache', 'Os fundamentos de cache.'], ['consistent-hashing', 'Distribui chaves entre os nós do cache.'], ['devops/cdn-edge', 'A camada de cache mais próxima do usuário.'], ['dados/redis-estruturas', 'Redis além do cache simples.']],
  front: `O React Query tem as mesmas ideias: staleTime (quanto tempo o dado é considerado fresco), invalidação após mutations e deduplicação de requisições iguais, que evita stampede no próprio navegador.`,
  ex: { lang: 'texto', code: `Camadas de cache de uma página de produto
[Navegador]  Cache-Control: max-age=60
     ▼
[CDN]        s-maxage=300, stale-while-revalidate=600
     ▼
[API]        cache local em memória (5 s) para chaves quentes
     ▼
[Redis]      TTL 10 min ± 10% de variação aleatória
     ▼
[Postgres]   só recebe misses` },
  docs: [['AWS · Estratégias de cache', 'https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html'], ['Microsoft · Padrão Cache-Aside', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside'], ['Meta · Scaling Memcache at Facebook', 'https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf']],
  perguntas: [`O que acontece com o seu banco se o cache inteiro esvaziar?`, `Como lidar com um item que fica viral de repente?`, `Qual a diferença entre write-through e write-behind?`] },
]
