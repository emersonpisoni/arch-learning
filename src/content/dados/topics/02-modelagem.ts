import type { Topic } from '../../../types'

export const modelagem: Topic[] = [
{ id: 'tipos-dados', stage: 'modelagem', level: 'essencial', title: 'Dinheiro, datas, fusos e identificadores', short: 'Tipos de dados',
  resumo: `As escolhas de tipo que mais causam bugs silenciosos.`,
  porque: `Centavos que somem, pedidos que mudam de dia por causa do fuso, ids previsíveis e textos com acento quebrado são bugs que atravessam front, back e banco. Quase todos vêm de escolher o tipo errado.`,
  como: [
    `<b>Dinheiro</b>: nunca em ponto flutuante (<code>0.1 + 0.2 ≠ 0.3</code>); use <code>NUMERIC</code>/<code>DECIMAL</code> ou inteiros em centavos, sempre com a moeda. <b>Datas e horas</b>: guarde instantes em UTC com <code>TIMESTAMPTZ</code> e converta para o fuso do usuário só na exibição; datas sem hora (aniversário, vencimento) são <code>DATE</code>, sem fuso.`,
    `<b>Identificadores</b>: inteiros sequenciais são compactos, mas previsíveis e expõem volume; <b>UUIDv7</b> ou ULID são únicos, gerados em qualquer lugar e ordenáveis no tempo, o que mantém índices eficientes. <b>Texto</b>: UTF-8, com cuidado em comparações e ordenação com acentos (collation).`,
  ],
  conecta: [['backend/modelagem', 'Os fundamentos da modelagem relacional.'], ['backend/sql', 'Os tipos do SQL.'], ['multi-tenant', 'Fusos e moedas por cliente.'], ['arquitetura/case-encurtador', 'Geração de ids em sistemas distribuídos.'], ['fundamentos/representacao-dados', 'Como números e textos viram bits.']],
  front: `No JavaScript, <code>Number</code> é ponto flutuante: some centavos como inteiros e formate com <code>Intl.NumberFormat</code>. Para datas, receba ISO 8601 em UTC da API e formate com <code>Intl.DateTimeFormat</code> no fuso do usuário.`,
  ex: { lang: 'sql', code: `CREATE TABLE pedidos (
  id          UUID PRIMARY KEY,                 -- UUIDv7 gerado pela aplicação
  total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
  moeda       CHAR(3) NOT NULL DEFAULT 'BRL',
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),  -- instante, guardado em UTC
  entrega_em  DATE                                 -- dia de calendário, sem fuso
);

-- JS: 0.1 + 0.2 === 0.30000000000000004
-- formatar na tela:
-- new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(19990 / 100)` },
  docs: [['PostgreSQL · Date/Time types', 'https://www.postgresql.org/docs/current/datatype-datetime.html'], ['PostgreSQL · Numeric types', 'https://www.postgresql.org/docs/current/datatype-numeric.html'], ['RFC 9562 · UUIDs (inclui UUIDv7)', 'https://www.rfc-editor.org/rfc/rfc9562'], ['MDN · Intl', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl']],
  perguntas: [`Como valores em dinheiro trafegam entre o banco, a API e o front do seu produto?`, `Um pedido feito às 23h em Manaus aparece em qual dia no relatório?`, `Que problema um id sequencial exposto na URL pode causar?`] },

{ id: 'json-relacional', stage: 'modelagem', level: 'importante', title: 'JSON dentro do banco relacional', short: 'JSONB',
  resumo: `Quando usar colunas JSON num banco relacional, e quando é uma armadilha.`,
  porque: `Colunas JSONB dão flexibilidade sem sair do Postgres, mas viram depósito de dados sem validação, difíceis de consultar e de migrar. Saber o limite evita os dois extremos.`,
  como: [
    `Bom uso: atributos que variam por tipo (especificações de produtos diferentes), configurações, payloads de integrações guardados como recebidos e metadados raramente filtrados. O Postgres tem operadores para consultar JSONB (<code>-&gt;</code>, <code>-&gt;&gt;</code>, <code>@&gt;</code>) e índices <b>GIN</b> para buscas dentro dele.`,
    `Mau uso: guardar em JSON dados com relações (que pedem chaves estrangeiras), campos usados em filtros, ordenação e joins frequentes, ou tudo "para não ter que fazer migration". O banco não valida a estrutura por padrão; use constraints, colunas geradas ou valide na aplicação.`,
  ],
  conecta: [['backend/modelagem', 'Normalização versus flexibilidade.'], ['backend/nosql', 'Bancos de documentos levam isso ao extremo.'], ['backend/indices', 'Índices GIN para buscar dentro do JSON.'], ['tipos-dados', 'Tipos fortes valem também dentro do JSON.']],
  front: `Formulários dinâmicos, em que os campos variam por tipo de produto, são um caso clássico em que o backend guarda os valores em JSONB.`,
  ex: { lang: 'sql', code: `CREATE TABLE produtos (
  id     BIGSERIAL PRIMARY KEY,
  nome   TEXT NOT NULL,
  preco_cents BIGINT NOT NULL,           -- usado em filtro e ordenação: coluna própria
  specs  JSONB NOT NULL DEFAULT '{}'      -- varia por tipo de produto
);
CREATE INDEX idx_produtos_specs ON produtos USING GIN (specs);

-- teclados com switch azul
SELECT nome FROM produtos WHERE specs @> '{"switch": "azul"}';

-- campo do JSON que virou filtro frequente: coluna gerada e indexada
ALTER TABLE produtos ADD COLUMN marca TEXT GENERATED ALWAYS AS (specs->>'marca') STORED;` },
  docs: [['PostgreSQL · JSON types', 'https://www.postgresql.org/docs/current/datatype-json.html'], ['PostgreSQL · GIN indexes', 'https://www.postgresql.org/docs/current/gin.html'], ['PostgreSQL · Generated columns', 'https://www.postgresql.org/docs/current/ddl-generated-columns.html']],
  perguntas: [`Que coluna JSON do seu sistema deveria ser várias colunas?`, `Como validar a estrutura de um JSONB?`, `Quando um campo deve sair do JSON e virar coluna?`] },

{ id: 'soft-delete-auditoria', stage: 'modelagem', level: 'importante', title: 'Soft delete, histórico e auditoria', short: 'Histórico',
  resumo: `Guardar quem mudou o quê e quando, e permitir desfazer exclusões.`,
  porque: `"Quem alterou este pedido?" e "dá para recuperar o que foi apagado?" são perguntas que todo sistema recebe. Cada solução tem custo em complexidade, desempenho e privacidade.`,
  como: [
    `<b>Soft delete</b>: marcar com <code>deleted_at</code> em vez de apagar. Simples, mas toda consulta precisa filtrar (views ou escopos do ORM ajudam), constraints únicas precisam de índice parcial e a LGPD pode exigir exclusão de verdade.`,
    `<b>Histórico</b>: uma <b>tabela de auditoria</b> com quem, quando, ação e valores antes e depois (via aplicação ou triggers), <b>tabelas temporais</b> com períodos de validade, ou <b>CDC</b> enviando as mudanças para outro armazenamento. Para histórico completo e central ao domínio, existe o event sourcing.`,
  ],
  conecta: [['arquitetura/event-sourcing', 'O extremo: o histórico é a fonte da verdade.'], ['cdc', 'Capturar mudanças sem tocar na aplicação.'], ['retencao-anonimizacao', 'Histórico também tem prazo e exclusão.'], ['seguranca/logs-seguranca', 'Auditoria de ações sensíveis.']],
  front: `Telas de "histórico de alterações" e botões de "desfazer" e "lixeira" dependem do modelo escolhido no banco; vale combinar com o backend antes de desenhar a interface.`,
  ex: { lang: 'sql', code: `-- soft delete com unicidade só entre registros ativos
ALTER TABLE clientes ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE UNIQUE INDEX clientes_email_ativo ON clientes (email) WHERE deleted_at IS NULL;

-- auditoria
CREATE TABLE auditoria (
  id         BIGSERIAL PRIMARY KEY,
  tabela     TEXT NOT NULL,
  registro   TEXT NOT NULL,
  acao       TEXT NOT NULL,          -- INSERT, UPDATE, DELETE
  antes      JSONB,
  depois     JSONB,
  usuario_id BIGINT,
  em         TIMESTAMPTZ NOT NULL DEFAULT now()
);` },
  docs: [['PostgreSQL · Partial indexes', 'https://www.postgresql.org/docs/current/indexes-partial.html'], ['PostgreSQL · Triggers', 'https://www.postgresql.org/docs/current/plpgsql-trigger.html'], ['Martin Fowler · Temporal patterns', 'https://martinfowler.com/eaaDev/timeNarrative.html']],
  perguntas: [`Como o seu sistema responde "quem alterou este registro"?`, `Que problema o soft delete cria em constraints únicas?`, `Como conciliar soft delete com o direito de exclusão da LGPD?`] },

{ id: 'multi-tenant', stage: 'modelagem', level: 'importante', title: 'Multi-tenancy', short: 'Multi-tenant',
  resumo: `Atender muitos clientes (empresas) no mesmo sistema, mantendo os dados de cada um separados.`,
  porque: `Produtos SaaS B2B atendem centenas de empresas na mesma infraestrutura. A estratégia de isolamento define segurança, custo, desempenho e o que acontece quando um cliente grande cresce demais.`,
  como: [
    `Três modelos: <b>banco por cliente</b> (isolamento máximo, operação cara), <b>schema por cliente</b> (meio-termo) e <b>tabelas compartilhadas com coluna tenant_id</b> (mais barato e simples de operar, exige disciplina absoluta para nunca esquecer o filtro).`,
    `No modelo compartilhado, <b>Row Level Security</b> no Postgres faz o banco aplicar o filtro de tenant automaticamente, como uma camada extra. Outros cuidados: índices começando por <code>tenant_id</code>, cotas e rate limit por cliente (o "vizinho barulhento"), backups e exportação por cliente, e a possibilidade de mover clientes grandes para infraestrutura dedicada.`,
  ],
  conecta: [['arquitetura/particionamento', 'tenant_id é uma chave de partição natural.'], ['backend/autorizacao', 'Vazamento entre clientes é falha de autorização.'], ['backend/rate-limit', 'Limites por cliente evitam o vizinho barulhento.'], ['seguranca/defesa-profundidade', 'RLS como camada extra de isolamento.']],
  front: `O tenant costuma aparecer na URL (<code>empresa.app.com</code> ou <code>/org/123</code>) e no token do usuário. O front nunca deve ser a única barreira para impedir que um usuário veja dados de outra empresa.`,
  ex: { lang: 'sql', code: `-- Row Level Security: o banco filtra pelo tenant da sessão
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY isolamento_tenant ON pedidos
  USING (tenant_id = current_setting('app.tenant_id')::bigint);

-- a aplicação define o tenant no início de cada transação
SET LOCAL app.tenant_id = '42';
SELECT * FROM pedidos;               -- só pedidos do tenant 42

CREATE INDEX idx_pedidos_tenant_data ON pedidos (tenant_id, criado_em DESC);` },
  docs: [['PostgreSQL · Row Security Policies', 'https://www.postgresql.org/docs/current/ddl-rowsecurity.html'], ['AWS · SaaS tenant isolation strategies', 'https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html'], ['Microsoft · Multitenant SaaS patterns', 'https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns']],
  perguntas: [`Que modelo de multi-tenancy o seu produto usa?`, `O que acontece se uma consulta esquecer o filtro de tenant?`, `Como lidar com um cliente que cresce muito mais que os outros?`] },

{ id: 'series-temporais', stage: 'modelagem', level: 'aprofundar', title: 'Séries temporais e dados de eventos', short: 'Séries temporais',
  resumo: `Dados que chegam continuamente com um carimbo de tempo: métricas, eventos, leituras.`,
  porque: `Logs de acesso, métricas, cliques e leituras de sensores crescem sem parar e são consultados por intervalos de tempo. Tratar isso como uma tabela comum leva a tabelas gigantes e consultas lentas.`,
  como: [
    `Características: escrita contínua e em volume, quase sem atualizações, consultas por janela de tempo e agregações (por minuto, hora, dia). Técnicas: <b>particionamento por tempo</b> (uma partição por dia ou mês, fácil de apagar inteira), <b>agregações pré-calculadas</b> (rollups), compressão e retenção diferente por granularidade.`,
    `Ferramentas especializadas: TimescaleDB (extensão do Postgres), InfluxDB, Prometheus (métricas) e bancos colunares como ClickHouse para eventos em grande volume.`,
  ],
  conecta: [['arquitetura/particionamento', 'Particionar por tempo.'], ['oltp-olap', 'Eventos costumam ir para bancos analíticos.'], ['backend/observabilidade', 'Métricas são séries temporais.'], ['eventos-analytics', 'Eventos de produto são dados de série temporal.']],
  front: `Gráficos de "últimos 30 dias" que demoram costumam estar agregando dados brutos a cada abertura; rollups pré-calculados resolvem.`,
  ex: { lang: 'sql', code: `-- particionamento por mês no Postgres
CREATE TABLE eventos (
  ocorrido_em TIMESTAMPTZ NOT NULL,
  tipo        TEXT NOT NULL,
  usuario_id  BIGINT,
  dados       JSONB
) PARTITION BY RANGE (ocorrido_em);

CREATE TABLE eventos_2026_10 PARTITION OF eventos
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

-- retenção: apagar um mês inteiro é instantâneo
DROP TABLE eventos_2025_10;` },
  docs: [['PostgreSQL · Table partitioning', 'https://www.postgresql.org/docs/current/ddl-partitioning.html'], ['TimescaleDB', 'https://docs.timescale.com/'], ['ClickHouse', 'https://clickhouse.com/docs']],
  perguntas: [`Que tabela do seu sistema cresce sem parar com dados de evento?`, `Por que apagar uma partição é melhor que um DELETE com WHERE de data?`, `Que gráfico do seu produto poderia usar rollups?`] },
]
