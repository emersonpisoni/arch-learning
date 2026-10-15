import type { Topic } from '../../../types'

export const avancado: Topic[] = [
{ id: 'planejador-consultas', stage: 'avancado', level: 'importante', title: 'O planejador de consultas por dentro', short: 'Planejador',
  resumo: `Como o banco decide executar uma consulta, e por que às vezes decide mal.`,
  porque: `A mesma consulta pode levar 5 ms ou 5 minutos dependendo do plano escolhido. Ler planos de execução e entender o que o planejador considera é a habilidade que resolve a maioria dos problemas de performance de banco.`,
  como: [
    `O planejador gera planos possíveis e escolhe o de menor <b>custo estimado</b>, usando <b>estatísticas</b> das tabelas (número de linhas, distribuição de valores). Decisões: como ler cada tabela (<b>seq scan</b>, <b>index scan</b>, <b>index-only scan</b>, bitmap), como juntar (<b>nested loop</b> para poucos registros, <b>hash join</b> e <b>merge join</b> para muitos) e em que ordem.`,
    `Planos ruins costumam vir de estimativas erradas: estatísticas desatualizadas, colunas correlacionadas, funções aplicadas à coluna no WHERE (que impedem o uso do índice) ou parâmetros com distribuições muito diferentes. No <code>EXPLAIN ANALYZE</code>, compare linhas <b>estimadas</b> e <b>reais</b>: grandes diferenças apontam o problema. Índices de cobertura, índices parciais e de expressão, e estatísticas estendidas são as ferramentas.`,
  ],
  conecta: [['backend/indices', 'Os índices que o planejador pode usar.'], ['manutencao-banco', 'ANALYZE mantém as estatísticas.'], ['backend/sql', 'Como a forma de escrever SQL afeta o plano.'], ['oltp-olap', 'Motores analíticos planejam de outro jeito.'], ['fundamentos/big-o', 'Custo de varreduras, índices e junções.']],
  front: `Um filtro novo na tela, como "buscar por e-mail sem diferenciar maiúsculas", pode exigir um índice de expressão; sem ele, a consulta passa a ler a tabela inteira.`,
  ex: { lang: 'sql', code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM clientes WHERE lower(email) = 'ana@empresa.com';
-- Seq Scan on clientes (rows=1) (actual rows=1)  ... 840 ms
-- o índice em (email) não serve: a função lower() muda a expressão

CREATE INDEX idx_clientes_email_lower ON clientes (lower(email));
-- Index Scan using idx_clientes_email_lower ... 0.05 ms

-- índice de cobertura: a consulta é respondida só pelo índice
CREATE INDEX idx_pedidos_cliente_cobre ON pedidos (cliente_id) INCLUDE (status, total_cents);` },
  docs: [['PostgreSQL · Using EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html'], ['PostgreSQL · Planner statistics', 'https://www.postgresql.org/docs/current/planner-stats.html'], ['explain.dalibo.com · visualizador de planos', 'https://explain.dalibo.com/']],
  perguntas: [`Como você descobriria se o planejador está estimando errado o número de linhas?`, `Por que lower(email) no WHERE impede o uso do índice comum?`, `Quando um nested loop é uma boa escolha e quando é um desastre?`] },

{ id: 'newsql', stage: 'avancado', level: 'aprofundar', title: 'Bancos SQL distribuídos (NewSQL)', short: 'NewSQL',
  resumo: `SQL e transações ACID com escala horizontal automática.`,
  porque: `Quando um Postgres não aguenta e sharding manual é complexo demais, bancos SQL distribuídos oferecem escala e alta disponibilidade sem abrir mão de SQL e transações. Entender seus trade-offs evita adotá-los sem necessidade.`,
  como: [
    `Bancos como <b>Google Spanner</b>, <b>CockroachDB</b>, <b>YugabyteDB</b> e <b>TiDB</b> particionam os dados automaticamente em faixas, replicam cada faixa com <b>consenso</b> (Raft/Paxos) e coordenam transações entre faixas. O resultado é um banco que escala adicionando nós e sobrevive à perda de máquinas, zonas ou regiões.`,
    `Trade-offs: cada escrita espera o consenso (latência maior que um Postgres local, principalmente entre regiões), transações que tocam muitas partições ficam caras, o modelo de dados precisa considerar a distribuição (chaves sequenciais concentram escrita num ponto) e o custo é maior. Para a maioria dos sistemas, um Postgres bem cuidado com réplicas é suficiente por muito tempo.`,
  ],
  conecta: [['arquitetura/consenso', 'A base da replicação.'], ['arquitetura/particionamento', 'Particionamento automático.'], ['arquitetura/multi-regiao', 'Bancos globais em várias regiões.'], ['backend/transacoes', 'ACID num sistema distribuído.']],
  front: `Em bancos distribuídos entre regiões, a latência de escrita fica mais alta; operações otimistas na interface ajudam a esconder isso do usuário.`,
  ex: { lang: 'sql', code: `-- CockroachDB: SQL compatível com Postgres, distribuído automaticamente
CREATE TABLE pedidos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- evite chaves sequenciais
  cliente_id  UUID NOT NULL,
  regiao      STRING NOT NULL,
  total_cents INT NOT NULL
);

-- dados de cada cliente ficam na região dele (multi-região)
ALTER DATABASE loja SET PRIMARY REGION "sa-east1";
ALTER DATABASE loja ADD REGION "us-east1";
ALTER TABLE pedidos SET LOCALITY REGIONAL BY ROW;` },
  docs: [['CockroachDB · Architecture overview', 'https://www.cockroachlabs.com/docs/stable/architecture/overview'], ['Google · Spanner overview', 'https://cloud.google.com/spanner/docs/overview'], ['YugabyteDB · Architecture', 'https://docs.yugabyte.com/preview/architecture/']],
  perguntas: [`O que um banco SQL distribuído resolve que réplicas de leitura não resolvem?`, `Por que chaves sequenciais são um problema em bancos distribuídos?`, `Quando um Postgres comum ainda é a melhor escolha?`] },

{ id: 'grafos', stage: 'avancado', level: 'aprofundar', title: 'Bancos e consultas de grafos', short: 'Grafos',
  resumo: `Modelar e consultar dados em que as relações são o principal.`,
  porque: `Redes sociais, recomendações, detecção de fraude (contas ligadas por dispositivo ou cartão), permissões baseadas em relações e grafos de conhecimento são naturais como grafos e ficam complicados como tabelas.`,
  como: [
    `Um grafo tem <b>nós</b> (pessoas, produtos) e <b>arestas</b> (segue, comprou, usa o mesmo cartão) com propriedades. Bancos como <b>Neo4j</b> (linguagem Cypher), Amazon Neptune e Memgraph percorrem relações de vários níveis com eficiência ("amigos de amigos que compraram X"), o que em SQL exigiria muitos joins ou consultas recursivas.`,
    `Também é possível consultar grafos em bancos relacionais com <b>CTEs recursivas</b> (<code>WITH RECURSIVE</code>), suficiente para hierarquias e relações moderadas. Algoritmos de grafos (caminho mais curto, centralidade, detecção de comunidades) apoiam recomendação e antifraude.`,
  ],
  conecta: [['backend/nosql', 'Grafos são uma família de NoSQL.'], ['seguranca/fraude-abuso', 'Redes de contas ligadas revelam fraude.'], ['backend/autorizacao', 'Permissões baseadas em relações (ReBAC).'], ['backend/modelagem', 'Hierarquias e relações complexas.']],
  front: `Árvores de comentários, organogramas e categorias aninhadas na interface costumam vir de consultas recursivas sobre relações pai e filho.`,
  ex: { lang: 'sql', code: `-- Cypher (Neo4j): contas ligadas ao mesmo cartão ou dispositivo de uma conta suspeita
-- MATCH (c:Conta {id: 'u-7'})-[:USA]->(x)<-[:USA]-(outra:Conta)
-- RETURN outra.id, labels(x) AS ligacao

-- SQL: hierarquia de categorias com CTE recursiva
WITH RECURSIVE arvore AS (
  SELECT id, nome, pai_id, 1 AS nivel FROM categorias WHERE pai_id IS NULL
  UNION ALL
  SELECT c.id, c.nome, c.pai_id, a.nivel + 1
    FROM categorias c JOIN arvore a ON c.pai_id = a.id
)
SELECT * FROM arvore ORDER BY nivel;` },
  docs: [['Neo4j · Graph database concepts', 'https://neo4j.com/docs/getting-started/graph-database/'], ['PostgreSQL · WITH RECURSIVE', 'https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-RECURSIVE'], ['Neo4j · Cypher manual', 'https://neo4j.com/docs/cypher-manual/current/introduction/']],
  perguntas: [`Que dado do seu produto é, na verdade, um grafo?`, `Quando uma CTE recursiva no Postgres basta?`, `Como um grafo ajuda a detectar fraude?`] },

{ id: 'olap-tempo-real', stage: 'avancado', level: 'aprofundar', title: 'Analytics em tempo real', short: 'OLAP tempo real',
  resumo: `Dashboards e métricas que refletem os dados em segundos, não no dia seguinte.`,
  porque: `Painéis operacionais, métricas mostradas ao próprio cliente (analytics dentro do produto) e detecção de anomalias exigem agregações sobre grandes volumes com dados recentes, algo que nem o banco transacional nem o warehouse batch fazem bem.`,
  como: [
    `Bancos colunares de baixa latência (<b>ClickHouse</b>, Apache Pinot, Apache Druid, Tinybird) ingerem eventos continuamente (de Kafka ou CDC) e respondem agregações sobre bilhões de linhas em milissegundos. <b>Visões materializadas</b> pré-agregam os dados conforme chegam.`,
    `Desenho típico: eventos → stream → banco analítico em tempo real → API com consultas parametrizadas → painel. Cuidados: dados duplicados ou fora de ordem, atualizações e exclusões (que bancos colunares tratam mal), isolamento por cliente e custos de consultas abertas.`,
  ],
  conecta: [['oltp-olap', 'Uma terceira categoria entre transacional e warehouse.'], ['batch-streaming', 'Ingestão por streaming.'], ['cdc', 'Mudanças do banco alimentam o analítico.'], ['series-temporais', 'Muitos dados de eventos são temporais.']],
  front: `Analytics dentro do produto ("seus pedidos nas últimas 24 horas, por hora") costuma vir de um banco analítico em tempo real exposto por uma API, nunca de consultas pesadas no banco principal.`,
  ex: { lang: 'sql', code: `-- ClickHouse: tabela de eventos + visão materializada agregada por minuto
CREATE TABLE eventos (
  ts DateTime, tenant_id UInt64, tipo LowCardinality(String), valor_cents Int64
) ENGINE = MergeTree ORDER BY (tenant_id, ts);

CREATE MATERIALIZED VIEW vendas_por_minuto
ENGINE = SummingMergeTree ORDER BY (tenant_id, minuto) AS
SELECT tenant_id, toStartOfMinute(ts) AS minuto, count() AS pedidos, sum(valor_cents) AS receita
FROM eventos WHERE tipo = 'pedido_pago' GROUP BY tenant_id, minuto;` },
  docs: [['ClickHouse · Documentação', 'https://clickhouse.com/docs'], ['Apache Pinot', 'https://docs.pinot.apache.org/'], ['Tinybird · Real-time analytics', 'https://www.tinybird.co/docs']],
  perguntas: [`Que métrica do seu produto os clientes gostariam de ver em tempo real?`, `Por que não calcular essas métricas no banco transacional?`, `Como lidar com eventos duplicados num banco analítico?`] },

{ id: 'feature-store', stage: 'avancado', level: 'aprofundar', title: 'Dados para machine learning e IA', short: 'Dados para ML',
  resumo: `Preparar, versionar e servir dados para treinar e usar modelos.`,
  porque: `Modelos de recomendação, previsão e IA generativa dependem mais de dados bons do que de algoritmos. Times de produto cada vez mais consomem e produzem dados para ML, e os problemas de qualidade se tornam problemas de modelo.`,
  como: [
    `<b>Features</b> são os sinais usados pelo modelo (compras nos últimos 30 dias, categoria favorita). Uma <b>feature store</b> (Feast, Tecton, recursos das plataformas de nuvem) calcula, versiona e serve features de forma consistente para treinamento (histórico) e para inferência (online, com baixa latência), evitando o <b>training-serving skew</b>.`,
    `Outros cuidados: dados de treino sem vazamento do futuro (<b>point-in-time correctness</b>), rótulos de qualidade, conjuntos de dados versionados, monitoramento de <b>drift</b> (os dados de produção mudam com o tempo) e, para IA generativa, curadoria de documentos para RAG e de exemplos para avaliação.`,
  ],
  conecta: [['ia/fine-tuning', 'Dados para ajustar modelos.'], ['ia/rag', 'Documentos curados para RAG.'], ['qualidade-dados', 'Qualidade de dados vira qualidade de modelo.'], ['data-warehouse', 'Fonte das features históricas.']],
  front: `Eventos de interação (cliques, buscas, itens vistos) coletados pelo front são a matéria-prima de modelos de recomendação; consistência e qualidade desses eventos importam muito.`,
  ex: { lang: 'python', code: `# Feast: a mesma definição de feature serve treino e produção
from feast import Entity, FeatureView, Field
from feast.types import Float32, Int64

cliente = Entity(name="cliente", join_keys=["cliente_id"])

compras_cliente = FeatureView(
    name="compras_cliente",
    entities=[cliente],
    schema=[Field(name="pedidos_30d", dtype=Int64), Field(name="ticket_medio_30d", dtype=Float32)],
    source=fonte_pedidos,        # tabela do warehouse
    ttl=timedelta(days=1),
)
# treino: get_historical_features (no momento certo, sem olhar o futuro)
# produção: get_online_features (baixa latência)` },
  docs: [['Feast · Introduction', 'https://docs.feast.dev/'], ['Google · Rules of Machine Learning', 'https://developers.google.com/machine-learning/guides/rules-of-ml'], ['Chip Huyen · Designing ML Systems (livro)', 'https://huyenchip.com/books/']],
  perguntas: [`Que dados do seu produto alimentariam um modelo de recomendação?`, `O que é training-serving skew?`, `Por que dados de treino não podem conter informação do futuro?`] },

{ id: 'migracao-bancos', stage: 'avancado', level: 'importante', title: 'Migrar entre bancos sem downtime', short: 'Migração de banco',
  resumo: `Trocar de banco, de versão ou de provedor com a aplicação no ar.`,
  porque: `Upgrades de versão, mudança para um banco gerenciado, separar um banco de um serviço ou trocar de tecnologia são projetos comuns e arriscados. Feitos com "janela de manutenção de 8 horas", viram incidentes; feitos com método, ninguém percebe.`,
  como: [
    `Estratégia padrão: <b>carga inicial</b> (cópia completa) seguida de <b>replicação contínua</b> das mudanças (replicação lógica do Postgres, CDC com Debezium, AWS DMS) até o destino alcançar a origem; <b>verificação</b> (contagens, checksums, leituras comparadas); e <b>troca</b> rápida da aplicação para o destino, com plano de volta.`,
    `Variações: <b>escrita dupla</b> controlada por feature flag (a aplicação escreve nos dois e lê de um), <b>leituras sombra</b> (consultar os dois e comparar sem afetar o usuário) e migração por partes (tabela por tabela, cliente por cliente). Sequências, extensões, permissões e dados escritos durante a troca são os detalhes que mais causam problemas.`,
  ],
  conecta: [['migracoes-zero-downtime', 'Mudanças de schema sem parar.'], ['cdc', 'Replicação contínua de mudanças.'], ['backend/feature-flags', 'Controlar a escrita dupla e a troca.'], ['arquitetura/strangler', 'Migração incremental.']],
  front: `Durante a troca, alguns segundos de escrita bloqueada podem acontecer; a interface deve lidar bem com erros temporários e repetir operações idempotentes.`,
  ex: { lang: 'sql', code: `-- Postgres: replicação lógica da origem para o novo banco
-- na origem
CREATE PUBLICATION migracao FOR ALL TABLES;

-- no destino (schema já criado)
CREATE SUBSCRIPTION migracao
  CONNECTION 'host=origem.interno dbname=loja user=replicador'
  PUBLICATION migracao;            -- copia tudo e segue replicando as mudanças

-- verificação antes da troca
SELECT count(*), sum(total_cents) FROM pedidos;   -- comparar nos dois lados
-- troca: pausar escritas, esperar o atraso zerar, ajustar sequências, apontar a aplicação` },
  docs: [['PostgreSQL · Logical replication', 'https://www.postgresql.org/docs/current/logical-replication.html'], ['AWS · Database Migration Service', 'https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html'], ['Stripe · Online migrations at scale', 'https://stripe.com/blog/online-migrations']],
  perguntas: [`Que migração de banco está no horizonte da sua empresa?`, `Como verificar que o banco novo tem exatamente os mesmos dados?`, `Qual seria o plano de volta se a troca der errado?`] },
]
