import type { Topic } from '../../../types'

export const pipelines: Topic[] = [
{ id: 'etl-elt', stage: 'pipelines', level: 'essencial', title: 'ETL e ELT', short: 'ETL e ELT',
  resumo: `Extrair dados de onde nascem, transformar e carregar onde serão analisados.`,
  porque: `Relatórios, dashboards e modelos de machine learning dependem de dados copiados dos sistemas de produção. Entender esses pipelines explica de onde vêm os números que produto e diretoria olham.`,
  como: [
    `<b>ETL</b> (extract, transform, load): transforma antes de carregar no destino; era o padrão quando armazenamento e processamento no data warehouse eram caros. <b>ELT</b>: carrega os dados brutos primeiro e transforma dentro do warehouse com SQL, padrão moderno com BigQuery, Snowflake e Redshift.`,
    `Peças comuns: ferramentas de ingestão (Fivetran, Airbyte, conectores próprios), transformação versionada em SQL (<b>dbt</b>), orquestração (Airflow, Dagster) e camadas de dados (bruto, limpo, pronto para consumo). Pipelines devem ser <b>idempotentes</b>: rodar de novo o mesmo período não pode duplicar dados.`,
  ],
  conecta: [['data-warehouse', 'O destino mais comum.'], ['cdc', 'Uma forma de extrair mudanças continuamente.'], ['orquestracao', 'Agenda e encadeia os passos.'], ['backend/idempotencia', 'Reprocessar não pode duplicar.']],
  front: `Quando o dashboard mostra "dados atualizados até ontem", há um pipeline batch por trás. Isso define o que a interface pode prometer sobre atualidade.`,
  ex: { lang: 'sql', code: `-- dbt: modelo versionado que transforma dados brutos em tabela pronta
-- models/marts/pedidos_diarios.sql
SELECT
  date_trunc('day', p.criado_em) AS dia,
  c.regiao,
  count(*)                       AS pedidos,
  sum(p.total_cents) / 100.0     AS receita
FROM {{ ref('stg_pedidos') }} p
JOIN {{ ref('stg_clientes') }} c ON c.id = p.cliente_id
WHERE p.status = 'PAGO'
GROUP BY 1, 2` },
  docs: [['dbt · O que é dbt', 'https://docs.getdbt.com/docs/introduction'], ['Airbyte · ETL vs ELT', 'https://airbyte.com/data-engineering-resources/etl-vs-elt'], ['Fundamentals of Data Engineering (livro)', 'https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/']],
  perguntas: [`De onde vêm os números do dashboard mais usado na sua empresa?`, `Por que o ELT se tornou o padrão moderno?`, `O que acontece se um pipeline não idempotente rodar duas vezes?`] },

{ id: 'batch-streaming', stage: 'pipelines', level: 'importante', title: 'Batch e streaming', short: 'Batch e streaming',
  resumo: `Processar dados em lotes periódicos ou continuamente, conforme chegam.`,
  porque: `"Precisamos disso em tempo real?" é uma das perguntas mais caras em dados. Streaming entrega atualidade, mas custa bem mais em complexidade e operação do que batch.`,
  como: [
    `<b>Batch</b>: processa um conjunto fechado de dados de tempos em tempos (de hora em hora, diariamente). Simples de raciocinar, reprocessar e testar. <b>Streaming</b>: processa cada evento conforme chega (Kafka Streams, Flink, Spark Structured Streaming), com latência de segundos.`,
    `Streaming traz conceitos próprios: <b>janelas</b> de tempo (agregar por minuto), <b>tempo do evento</b> versus tempo de processamento, eventos <b>atrasados ou fora de ordem</b>, estado e garantias de entrega (<i>exactly-once</i> é difícil e caro). Muitos casos de "tempo real" são atendidos por micro-batch de poucos minutos.`,
  ],
  conecta: [['backend/filas', 'Kafka e afins transportam os eventos.'], ['etl-elt', 'Pipelines batch são o caso mais comum.'], ['cdc', 'CDC alimenta pipelines de streaming.'], ['arquitetura/trade-offs', 'Atualidade × custo e complexidade.']],
  front: `Um contador de "pessoas vendo este produto agora" precisa de streaming; um relatório de vendas do mês, não. Perguntar a latência real necessária evita pedir infraestrutura cara sem necessidade.`,
  ex: { lang: 'texto', code: `                  Batch                     Streaming
Latência          minutos a horas           segundos
Complexidade      baixa                     alta (janelas, estado, atraso)
Reprocessar       rodar o lote de novo      replay do log de eventos
Exemplos          relatório diário,         detecção de fraude,
                  faturamento mensal        estoque ao vivo, alertas
Ferramentas       dbt, Spark, SQL agendado  Kafka Streams, Flink` },
  docs: [['Apache Flink · Conceitos', 'https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/overview/'], ['Kafka Streams', 'https://kafka.apache.org/documentation/streams/'], ['Tyler Akidau · Streaming 101', 'https://www.oreilly.com/radar/the-world-beyond-batch-streaming-101/']],
  perguntas: [`Que pedido de "tempo real" na sua empresa poderia ser atendido com batch de 5 minutos?`, `O que é um evento atrasado e por que complica o streaming?`, `Como reprocessar um mês inteiro num sistema de streaming?`] },

{ id: 'cdc', stage: 'pipelines', level: 'importante', title: 'Change Data Capture', short: 'CDC',
  resumo: `Capturar cada mudança do banco a partir do seu log, sem consultar as tabelas o tempo todo.`,
  porque: `Copiar dados com consultas periódicas pesa no banco de produção, perde exclusões e tem atraso. CDC entrega todas as mudanças, quase em tempo real, para warehouses, caches e índices de busca.`,
  como: [
    `O banco registra toda alteração num log (o <b>WAL</b> no Postgres, o <b>binlog</b> no MySQL). Ferramentas como <b>Debezium</b> leem esse log e publicam cada INSERT, UPDATE e DELETE como evento, normalmente num tópico Kafka, com os valores antes e depois.`,
    `Usos: alimentar o data warehouse, manter um índice de busca ou cache sincronizado, gerar eventos para outros serviços e implementar o padrão outbox. Cuidados: mudanças de schema chegam aos consumidores, os eventos refletem a estrutura das tabelas (não eventos de negócio) e o slot de replicação precisa ser monitorado para não encher o disco do banco.`,
  ],
  conecta: [['backend/eventos', 'CDC é uma forma de publicar eventos, inclusive com outbox.'], ['etl-elt', 'Extração contínua para o warehouse.'], ['elasticsearch', 'Manter o índice de busca sincronizado.'], ['soft-delete-auditoria', 'Histórico de mudanças sem tocar na aplicação.']],
  front: `É por CDC que uma busca no catálogo costuma refletir uma mudança de preço segundos depois de o produto ser salvo, mesmo sendo outro sistema.`,
  ex: { lang: 'json', code: `// evento do Debezium para um UPDATE na tabela pedidos
{
  "op": "u",
  "source": { "table": "pedidos", "lsn": 24023128 },
  "before": { "id": 981, "status": "PENDENTE", "total_cents": 19990 },
  "after":  { "id": 981, "status": "PAGO",     "total_cents": 19990 },
  "ts_ms": 1760537002481
}` },
  docs: [['Debezium · Documentação', 'https://debezium.io/documentation/reference/stable/'], ['PostgreSQL · Logical decoding', 'https://www.postgresql.org/docs/current/logicaldecoding.html'], ['Confluent · O que é CDC', 'https://www.confluent.io/learn/change-data-capture/']],
  perguntas: [`Que sistema da sua empresa precisa ficar sincronizado com o banco principal?`, `Que vantagem o CDC tem sobre consultas periódicas?`, `Por que eventos de CDC não são o mesmo que eventos de negócio?`] },

{ id: 'orquestracao', stage: 'pipelines', level: 'importante', title: 'Orquestração de pipelines', short: 'Orquestração',
  resumo: `Agendar, encadear, repetir e monitorar os passos de um pipeline.`,
  porque: `Pipelines reais têm dezenas de passos que dependem uns dos outros. Sem um orquestrador, ninguém sabe o que falhou, o que precisa rodar de novo e por que o dashboard está desatualizado.`,
  como: [
    `Orquestradores como <b>Airflow</b>, <b>Dagster</b> e <b>Prefect</b> descrevem pipelines como grafos de tarefas (DAGs) em código, com dependências, agendamento, retries, alertas e histórico de execuções. O <b>backfill</b> reprocessa períodos passados, o que só funciona bem com tarefas idempotentes e parametrizadas por data.`,
    `Boas práticas: tarefas pequenas e idempotentes, dados particionados por data de processamento, alertas de atraso (dados que deveriam ter chegado e não chegaram) e separação entre orquestração (o quê e quando) e processamento pesado (feito no warehouse ou num cluster).`,
  ],
  conecta: [['etl-elt', 'Orquestra os passos de extração e transformação.'], ['qualidade-dados', 'Testes de dados como passos do DAG.'], ['backend/idempotencia', 'Retries e backfills exigem idempotência.'], ['devops/alertas', 'Falhas e atrasos viram alertas.']],
  front: `Se um dashboard às vezes amanhece desatualizado, o histórico de execuções do orquestrador mostra qual passo falhou e quando.`,
  ex: { lang: 'python', code: `# Airflow: pipeline diário com dependências e retries
from airflow.decorators import dag, task
from datetime import datetime, timedelta

@dag(schedule="0 3 * * *", start_date=datetime(2026, 1, 1), catchup=False,
     default_args={"retries": 2, "retry_delay": timedelta(minutes=10)})
def pedidos_diarios():
    @task
    def extrair(ds=None): ...          # ds = data do processamento (idempotente)
    @task
    def transformar(ds=None): ...
    @task
    def testar_qualidade(ds=None): ...
    extrair() >> transformar() >> testar_qualidade()

pedidos_diarios()` },
  docs: [['Apache Airflow · Conceitos', 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html'], ['Dagster · Documentação', 'https://docs.dagster.io/'], ['Prefect · Documentação', 'https://docs.prefect.io/']],
  perguntas: [`Como você descobriria por que um dashboard não atualizou hoje?`, `O que é backfill e por que exige tarefas idempotentes?`, `Que alerta avisaria que os dados de ontem não chegaram?`] },

{ id: 'qualidade-dados', stage: 'pipelines', level: 'importante', title: 'Qualidade de dados', short: 'Qualidade',
  resumo: `Testar dados como se testa código, para que números errados não cheguem às decisões.`,
  porque: `Um dashboard com número errado é pior que nenhum: as pessoas tomam decisões com ele. Dados quebram silenciosamente quando um sistema de origem muda um campo, duplica eventos ou para de enviar.`,
  como: [
    `Dimensões de qualidade: <b>completude</b> (sem nulos onde não deveria), <b>unicidade</b>, <b>validade</b> (valores no domínio esperado), <b>consistência</b> entre fontes, <b>pontualidade</b> (chegou no prazo) e <b>integridade referencial</b>. Testes no dbt, Great Expectations e Soda verificam isso a cada execução.`,
    `<b>Contratos de dados</b> formalizam o que um produtor promete (schema, semântica, prazos) para quem consome, como contratos de API. <b>Observabilidade de dados</b> monitora volume e distribuição e alerta sobre anomalias, como metade dos eventos sumindo depois de um deploy.`,
  ],
  conecta: [['backend/contratos', 'Contratos de dados são como contratos de API.'], ['orquestracao', 'Testes rodam como passos do pipeline.'], ['eventos-analytics', 'Eventos de produto quebram com frequência.'], ['backend/testes', 'Testar dados como se testa código.']],
  front: `Mudar o nome de um evento de analytics no front sem avisar pode zerar um gráfico importante. Eventos são um contrato com o time de dados.`,
  ex: { lang: 'yaml', code: `# dbt: testes de qualidade declarados junto do modelo
models:
  - name: pedidos_diarios
    columns:
      - name: dia
        tests: [not_null]
      - name: receita
        tests:
          - not_null
          - dbt_utils.accepted_range: { min_value: 0 }
  - name: stg_pedidos
    columns:
      - name: id
        tests: [unique, not_null]
      - name: cliente_id
        tests:
          - relationships: { to: ref('stg_clientes'), field: id }` },
  docs: [['dbt · Data tests', 'https://docs.getdbt.com/docs/build/data-tests'], ['Great Expectations', 'https://docs.greatexpectations.io/docs/home/'], ['Data Contract Specification', 'https://datacontract.com/']],
  perguntas: [`Que número de um dashboard da sua empresa você não confia, e por quê?`, `Que teste pegaria eventos duplicados?`, `O que um contrato de dados promete ao consumidor?`] },
]
