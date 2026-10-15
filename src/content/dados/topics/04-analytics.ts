import type { Topic } from '../../../types'

export const analytics: Topic[] = [
{ id: 'oltp-olap', stage: 'analytics', level: 'essencial', title: 'OLTP e OLAP', short: 'OLTP × OLAP',
  resumo: `Bancos para operar o negócio e bancos para analisá-lo, e por que separá-los.`,
  porque: `Rodar um relatório pesado no banco de produção pode deixar o checkout lento. Entender a diferença explica por que existem "o banco" e "o data warehouse", e por que os números de um nem sempre batem com o outro na hora.`,
  como: [
    `<b>OLTP</b> (processamento transacional): muitas operações pequenas, lendo e escrevendo poucas linhas por id, com transações e baixa latência. Bancos orientados a <b>linhas</b>: Postgres, MySQL. <b>OLAP</b> (processamento analítico): poucas consultas grandes, que varrem milhões de linhas e agregam poucas colunas. Bancos <b>colunares</b>: BigQuery, Snowflake, Redshift, ClickHouse, DuckDB.`,
    `Bancos colunares guardam cada coluna separada e comprimida, então uma soma de receita lê só a coluna de valores. Separar os dois mundos protege a produção e permite modelar os dados para análise, ao custo de um atraso (o pipeline) entre o que aconteceu e o que o relatório mostra.`,
  ],
  conecta: [['data-warehouse', 'Onde o OLAP acontece.'], ['etl-elt', 'Como os dados vão de um para o outro.'], ['backend/sql', 'O mesmo SQL, motores muito diferentes.'], ['series-temporais', 'Eventos em volume vão para bancos colunares.']],
  front: `Uma tela administrativa com filtros livres sobre todo o histórico costuma ficar lenta no banco de produção; muitas vezes ela pertence a uma ferramenta de BI sobre o warehouse.`,
  ex: { lang: 'texto', code: `                 OLTP (Postgres)              OLAP (BigQuery, ClickHouse)
Consulta típica  SELECT * FROM pedidos        SELECT regiao, sum(total)
                 WHERE id = 981               FROM pedidos GROUP BY regiao
Linhas tocadas   poucas                       milhões
Armazenamento    por linha                    por coluna, comprimido
Escrita          muitas, pequenas, com ACID   cargas em lote
Usuários         a aplicação                  analistas, dashboards` },
  docs: [['AWS · OLTP vs OLAP', 'https://aws.amazon.com/compare/the-difference-between-olap-and-oltp/'], ['ClickHouse · O que é um banco colunar', 'https://clickhouse.com/docs/intro'], ['DuckDB', 'https://duckdb.org/docs/']],
  perguntas: [`Que relatório pesado roda hoje no banco de produção da sua empresa?`, `Por que bancos colunares agregam tão rápido?`, `Por que o número do dashboard pode diferir do número da tela do sistema?`] },

{ id: 'data-warehouse', stage: 'analytics', level: 'essencial', title: 'Data warehouse e lakehouse', short: 'Warehouse',
  resumo: `O lugar central onde os dados da empresa são reunidos para análise.`,
  porque: `Perguntas como "quanto cada campanha gerou de receita" cruzam dados de vários sistemas (pedidos, marketing, CRM). O warehouse é onde isso se junta, e é a base de BI, ciência de dados e IA.`,
  como: [
    `<b>Data warehouse</b> (BigQuery, Snowflake, Redshift): banco colunar gerenciado, com SQL, separação entre armazenamento e processamento e cobrança por uso. <b>Data lake</b>: arquivos brutos em object storage (Parquet, JSON), baratos e flexíveis, mas difíceis de governar.`,
    `<b>Lakehouse</b> junta os dois: arquivos em object storage com formatos de tabela abertos (<b>Apache Iceberg</b>, Delta Lake) que trazem transações, schema e versionamento, consultáveis por vários motores (Spark, Trino, Snowflake, DuckDB). O custo de warehouses na nuvem depende muito de como as consultas são escritas: particionamento e seleção de colunas importam.`,
  ],
  conecta: [['oltp-olap', 'O warehouse é OLAP.'], ['etl-elt', 'Pipelines alimentam o warehouse.'], ['modelagem-dimensional', 'Como os dados são organizados dentro dele.'], ['devops/storage', 'Lakes e lakehouses vivem em object storage.']],
  front: `Dados de comportamento do front (eventos de analytics) normalmente terminam no warehouse, ao lado dos dados de pedidos, para responder perguntas de produto.`,
  ex: { lang: 'sql', code: `-- BigQuery: selecionar colunas e filtrar a partição reduz custo e tempo
SELECT
  DATE(criado_em) AS dia,
  canal,
  SUM(total) AS receita
FROM \`loja.analytics.pedidos\`
WHERE DATE(criado_em) BETWEEN '2026-10-01' AND '2026-10-15'   -- partição
GROUP BY dia, canal
ORDER BY dia;
-- SELECT * numa tabela colunar lê (e cobra) todas as colunas` },
  docs: [['Google · BigQuery overview', 'https://cloud.google.com/bigquery/docs/introduction'], ['Apache Iceberg', 'https://iceberg.apache.org/docs/latest/'], ['Snowflake · Key concepts', 'https://docs.snowflake.com/en/user-guide/intro-key-concepts']],
  perguntas: [`Que pergunta de negócio exige cruzar dados de dois sistemas diferentes?`, `Qual a diferença entre um data lake e um lakehouse?`, `Por que SELECT * é caro num warehouse colunar?`] },

{ id: 'modelagem-dimensional', stage: 'analytics', level: 'importante', title: 'Modelagem dimensional', short: 'Fatos e dimensões',
  resumo: `Organizar dados analíticos em fatos (o que aconteceu) e dimensões (o contexto).`,
  porque: `Modelos transacionais normalizados são ótimos para operar e ruins para analisar. A modelagem dimensional deixa as perguntas de negócio fáceis de responder e é a linguagem comum entre engenheiros e analistas de dados.`,
  como: [
    `<b>Tabela fato</b>: eventos mensuráveis numa granularidade definida (uma linha por item de pedido), com chaves para as dimensões e métricas numéricas (quantidade, valor). <b>Dimensões</b>: o contexto descritivo (cliente, produto, data, loja), desnormalizado para facilitar filtros. O formato resultante é o <b>esquema estrela</b>.`,
    `Decisões importantes: definir a <b>granularidade</b> antes de tudo; tratar mudanças nas dimensões ao longo do tempo (<b>SCD tipo 2</b> guarda o histórico, por exemplo o endereço do cliente na época da compra); e ter uma dimensão de data com feriados, semanas e trimestres.`,
  ],
  conecta: [['data-warehouse', 'Onde o modelo dimensional vive.'], ['backend/modelagem', 'O contraponto normalizado do mundo transacional.'], ['metricas-bi', 'Métricas são calculadas sobre os fatos.']],
  front: `Os filtros de um dashboard (período, região, categoria) são, quase sempre, as dimensões do modelo; os números são as métricas das tabelas fato.`,
  ex: { lang: 'texto', code: `                 dim_cliente
                 (id, nome, cidade, segmento)
                        │
dim_produto ──── fato_itens_pedido ──── dim_data
(id, nome,        (data_id, cliente_id,   (id, dia, mês, trimestre,
 categoria)        produto_id, qtd,        dia_util, feriado)
                   valor_cents)
                        │
                 dim_canal (id, nome: site, app, loja)

Granularidade: uma linha por item de pedido` },
  docs: [['Kimball Group · Dimensional modeling techniques', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/'], ['dbt · Building a star schema', 'https://docs.getdbt.com/blog/kimball-dimensional-model'], ['Wikipedia · Star schema', 'https://en.wikipedia.org/wiki/Star_schema']],
  perguntas: [`Qual seria a granularidade da tabela fato de vendas do seu produto?`, `Por que dimensões são desnormalizadas?`, `Quando é preciso guardar o histórico de uma dimensão (SCD tipo 2)?`] },

{ id: 'eventos-analytics', stage: 'analytics', level: 'essencial', title: 'Eventos de produto e tracking', short: 'Tracking',
  resumo: `Registrar o que os usuários fazem na interface para entender o uso do produto.`,
  porque: `Funis de conversão, testes A/B e métricas de engajamento dependem de eventos disparados pelo front. É uma das maiores fontes de dados da empresa, e uma das mais propensas a erro.`,
  como: [
    `Um <b>plano de tracking</b> define cada evento (nome padronizado, como <code>checkout_iniciado</code>), suas propriedades e tipos, quando dispara e quem é o dono. Ferramentas: Segment, RudderStack, Amplitude, Mixpanel, PostHog, GA4. Eventos importantes para o negócio (pedido concluído) devem vir do <b>servidor</b>, que é confiável; eventos de interação vêm do cliente.`,
    `Problemas comuns: nomes inconsistentes, eventos duplicados em re-renders, perda por bloqueadores e abandono da página (use <code>sendBeacon</code>), e dados pessoais enviados sem necessidade. Respeite o consentimento do usuário antes de enviar eventos não essenciais.`,
  ],
  conecta: [['qualidade-dados', 'Eventos quebram silenciosamente.'], ['seguranca/lgpd', 'Consentimento e dados pessoais em analytics.'], ['series-temporais', 'Eventos são dados de série temporal.'], ['frontend/observabilidade-front', 'Mesmos cuidados de coleta no navegador.']],
  front: `Um <code>useEffect</code> que dispara um evento de visualização sem controle pode enviá-lo duas vezes no modo estrito do React ou a cada re-render; centralize o tracking num módulo tipado.`,
  ex: { lang: 'typescript', code: `// plano de tracking tipado: o compilador impede eventos inválidos
type Eventos = {
  checkout_iniciado: { itens: number; valor_cents: number };
  cupom_aplicado: { codigo: string; desconto_cents: number };
  busca_realizada: { termo_tamanho: number; resultados: number }; // sem o texto digitado
};

export function track<E extends keyof Eventos>(evento: E, props: Eventos[E]) {
  if (!consentimento.analytics) return;
  navigator.sendBeacon("/eventos", JSON.stringify({ evento, props, ts: Date.now() }));
}

track("checkout_iniciado", { itens: 3, valor_cents: 45990 });` },
  docs: [['Segment · Tracking plan', 'https://segment.com/docs/protocols/tracking-plan/create/'], ['PostHog · Documentação', 'https://posthog.com/docs'], ['MDN · navigator.sendBeacon', 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon']],
  perguntas: [`Existe um plano de tracking documentado no seu produto?`, `Que eventos deveriam vir do servidor e não do front?`, `Que dado pessoal pode estar indo para a ferramenta de analytics sem necessidade?`] },

{ id: 'metricas-bi', stage: 'analytics', level: 'importante', title: 'Métricas, BI e camada semântica', short: 'Métricas',
  resumo: `Definir cada métrica uma única vez para que todos falem do mesmo número.`,
  porque: `"Receita" significa coisas diferentes para financeiro, marketing e produto (com ou sem frete, devoluções, impostos?). Sem definições centrais, cada dashboard mostra um número diferente e a confiança nos dados acaba.`,
  como: [
    `Ferramentas de <b>BI</b> (Looker, Metabase, Power BI, Superset, Tableau) consultam o warehouse e montam dashboards. Uma <b>camada semântica</b> (LookML, dbt Semantic Layer, Cube) define métricas, dimensões e regras uma vez, e todas as ferramentas usam a mesma definição.`,
    `Boas práticas: cada métrica com dono, definição escrita e fórmula; diferenciar métricas de resultado (receita) e de diagnóstico (taxa de conversão por etapa); cuidado com médias que escondem distribuições; e indicar o horário da última atualização em todo dashboard.`,
  ],
  conecta: [['modelagem-dimensional', 'Métricas são calculadas sobre fatos e dimensões.'], ['qualidade-dados', 'Métrica confiável depende de dados testados.'], ['governanca', 'Dono e definição de cada métrica.'], ['backend/observabilidade', 'Métricas técnicas seguem a mesma lógica.']],
  front: `Quando o produto pede um "número de usuários ativos" na interface, confirme qual é a definição oficial; implementar uma contagem própria cria mais uma versão do número.`,
  ex: { lang: 'yaml', code: `# dbt Semantic Layer: uma definição de receita para todas as ferramentas
metrics:
  - name: receita_liquida
    description: "Valor pago pelos clientes, sem frete, após devoluções e cancelamentos."
    type: simple
    type_params:
      measure: valor_itens_liquido
    filter: "{{ Dimension('pedido__status') }} = 'PAGO'"
    meta:
      dono: "time de finanças"` },
  docs: [['dbt · Semantic Layer', 'https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl'], ['Metabase · Documentação', 'https://www.metabase.com/docs/latest/'], ['Cube · Semantic layer', 'https://cube.dev/docs/product/introduction']],
  perguntas: [`Quantas definições diferentes de "receita" existem na sua empresa?`, `Quem é o dono da métrica mais importante do seu produto?`, `Que informação todo dashboard deveria mostrar além dos números?`] },
]
