import type { Topic } from '../../../types'

export const producao: Topic[] = [
{ id: 'pool-conexoes', stage: 'producao', level: 'essencial', title: 'Pool de conexões', short: 'Pool',
  resumo: `Reaproveitar conexões com o banco em vez de abrir uma por requisição.`,
  porque: `Abrir conexão com o banco é caro, e bancos aceitam um número limitado delas. Com várias instâncias da API, funções serverless e workers, é fácil esgotar o limite e derrubar tudo com o erro "too many connections".`,
  como: [
    `Um <b>pool</b> mantém algumas conexões abertas e as empresta a cada consulta. Tamanho maior não é melhor: o banco tem poucos núcleos, e centenas de conexões ativas competem entre si. A conta que importa é <b>instâncias × tamanho do pool</b>, que deve caber no limite do banco com folga.`,
    `Em escala, usa-se um <b>pooler externo</b> (PgBouncer, RDS Proxy, Supavisor) entre a aplicação e o banco, principalmente com serverless. Em modo <i>transaction</i>, uma conexão do banco é compartilhada entre muitos clientes, o que limita recursos ligados à sessão. Configure timeouts de espera do pool e de consulta para que uma lentidão não trave todas as requisições.`,
  ],
  conecta: [['backend/sql', 'Toda consulta passa por uma conexão.'], ['devops/serverless', 'Funções multiplicam as conexões.'], ['backend/escala', 'Mais instâncias significam mais conexões.'], ['locks-deadlocks', 'Conexões presas em locks esgotam o pool.']],
  front: `Um erro intermitente de "timeout acquiring connection" na API costuma aparecer para o front como lentidão generalizada ou 500 em rotas que não têm nada a ver umas com as outras.`,
  ex: { lang: 'typescript', code: `import { Pool } from "pg";

// 10 instâncias × 10 conexões = 100, dentro do limite do banco (ex.: 200)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,      // falha rápido em vez de esperar para sempre
  statement_timeout: 5_000,            // nenhuma query passa de 5 s
});

const { rows } = await pool.query("SELECT id, status FROM pedidos WHERE cliente_id = $1", [7]);` },
  docs: [['PgBouncer', 'https://www.pgbouncer.org/features.html'], ['HikariCP · About pool sizing', 'https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing'], ['AWS · RDS Proxy', 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html']],
  perguntas: [`Quantas conexões o seu sistema abre no pico, somando todas as instâncias?`, `Por que um pool maior pode deixar o banco mais lento?`, `Que problema o modo transaction do PgBouncer resolve e qual cria?`] },

{ id: 'migracoes-zero-downtime', stage: 'producao', level: 'essencial', title: 'Migrations sem downtime', short: 'Migrations',
  resumo: `Mudar o schema de tabelas grandes sem travar a aplicação.`,
  porque: `Um <code>ALTER TABLE</code> inocente numa tabela com milhões de linhas pode bloquear escritas por minutos. Como o deploy roda versões antigas e novas ao mesmo tempo, cada mudança precisa ser compatível com as duas.`,
  como: [
    `Operações perigosas no Postgres: criar índice sem <code>CONCURRENTLY</code>, adicionar coluna <code>NOT NULL</code> com default em versões antigas, mudar tipo de coluna, adicionar constraint validando tudo de uma vez. Alternativas: <code>CREATE INDEX CONCURRENTLY</code>, constraint <code>NOT VALID</code> seguida de <code>VALIDATE</code>, e <code>lock_timeout</code> curto para desistir em vez de enfileirar todo o tráfego atrás do lock.`,
    `O padrão <b>expand and contract</b>: (1) adicionar o novo (coluna, tabela) sem remover o antigo; (2) a aplicação escreve nos dois; (3) migrar os dados antigos em lotes; (4) passar a ler do novo; (5) parar de escrever no antigo; (6) remover o antigo num deploy posterior.`,
  ],
  conecta: [['backend/orm', 'Migrations versionadas.'], ['devops/estrategias-deploy', 'Versões antigas e novas convivem durante o deploy.'], ['locks-deadlocks', 'O risco principal de uma migration é o lock.'], ['backend/indices', 'Criar índices em tabelas grandes exige cuidado.']],
  front: `Renomear um campo da API segue a mesma lógica: enviar os dois nomes por um tempo, migrar o front para o novo e só depois remover o antigo.`,
  ex: { lang: 'sql', code: `-- desiste rápido em vez de travar todo o tráfego esperando o lock
SET lock_timeout = '3s';

-- índice sem bloquear escritas
CREATE INDEX CONCURRENTLY idx_pedidos_cupom ON pedidos (cupom);

-- constraint em duas etapas
ALTER TABLE pedidos ADD CONSTRAINT total_positivo CHECK (total >= 0) NOT VALID;
ALTER TABLE pedidos VALIDATE CONSTRAINT total_positivo;   -- não bloqueia escritas

-- renomear coluna com expand and contract
ALTER TABLE clientes ADD COLUMN nome_completo TEXT;       -- 1. expandir
-- 2. app escreve em nome e nome_completo · 3. backfill em lotes
-- 4. app lê nome_completo · 5. app para de escrever em nome
ALTER TABLE clientes DROP COLUMN nome;                    -- 6. contrair (deploy posterior)` },
  docs: [['PostgreSQL · ALTER TABLE (notas sobre locks)', 'https://www.postgresql.org/docs/current/sql-altertable.html'], ['PostgreSQL · CREATE INDEX CONCURRENTLY', 'https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY'], ['Martin Fowler · Parallel Change', 'https://martinfowler.com/bliki/ParallelChange.html'], ['Strong Migrations', 'https://github.com/ankane/strong_migrations']],
  perguntas: [`Qual migration já travou produção no seu time?`, `Por que lock_timeout curto protege o tráfego?`, `Em quantos deploys você dividiria a troca de nome de uma coluna?`] },

{ id: 'backup-banco', stage: 'producao', level: 'essencial', title: 'Backup e point-in-time recovery', short: 'Backup do banco',
  resumo: `Voltar o banco para qualquer instante antes de um erro ou desastre.`,
  porque: `Um <code>DELETE</code> sem <code>WHERE</code>, uma migration errada ou um ransomware podem destruir dados em segundos. O que define o estrago é se dá para voltar ao minuto anterior.`,
  como: [
    `<b>Backup lógico</b> (<code>pg_dump</code>): exporta o conteúdo como SQL; portátil, mas lento em bancos grandes. <b>Backup físico</b> + <b>WAL</b> (o log de todas as alterações): permite <b>point-in-time recovery</b> (PITR), restaurando até um instante exato. Bancos gerenciados oferecem PITR com poucos cliques.`,
    `Boas práticas: backups em outra conta e região, criptografados e imutáveis; retenção definida; e <b>testes de restauração</b> regulares, medindo quanto tempo leva. Restaurar costuma ser feito num banco novo, de onde se copiam os dados perdidos, sem sobrescrever a produção.`,
  ],
  conecta: [['devops/backup-dr', 'RPO, RTO e a estratégia geral de recuperação.'], ['arquitetura/replicacao', 'Réplicas não são backup: replicam o erro também.'], ['retencao-anonimizacao', 'Backups também têm prazo de retenção.']],
  front: `Funcionalidades de "desfazer" e lixeira no produto (soft delete) resolvem muitos casos de exclusão acidental sem precisar restaurar backup.`,
  ex: { lang: 'bash', code: `# backup lógico
pg_dump -Fc -d loja -f loja-2026-10-15.dump

# restaurar num banco novo, para comparar e recuperar dados
createdb loja_restaurada
pg_restore -d loja_restaurada loja-2026-10-15.dump

# PITR num banco gerenciado (AWS RDS): novo banco no estado das 14:01
aws rds restore-db-instance-to-point-in-time \\
  --source-db-instance-identifier loja-prod \\
  --target-db-instance-identifier loja-pitr-1401 \\
  --restore-time 2026-10-15T14:01:00Z` },
  docs: [['PostgreSQL · Backup and Restore', 'https://www.postgresql.org/docs/current/backup.html'], ['PostgreSQL · Continuous archiving e PITR', 'https://www.postgresql.org/docs/current/continuous-archiving.html'], ['AWS · RDS point-in-time recovery', 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html']],
  perguntas: [`Até qual minuto do passado o banco do seu sistema consegue voltar?`, `Por que uma réplica não substitui um backup?`, `Quanto tempo leva uma restauração completa hoje?`] },

{ id: 'locks-deadlocks', stage: 'producao', level: 'importante', title: 'Locks, deadlocks e consultas lentas', short: 'Locks',
  resumo: `Por que consultas esperam umas pelas outras e como encontrar o culpado.`,
  porque: `"O banco travou" quase sempre é uma transação longa segurando locks enquanto outras esperam em fila. Saber investigar isso transforma um incidente de horas num de minutos.`,
  como: [
    `Escritas travam as linhas que alteram até o fim da transação. Uma transação esquecida aberta (por exemplo, esperando uma chamada externa) bloqueia todas as outras que tocam as mesmas linhas. <b>Deadlock</b> acontece quando duas transações esperam uma pela outra; o banco detecta e cancela uma delas.`,
    `Para evitar: transações curtas, ordem consistente ao travar várias linhas, índices nas colunas de filtro de UPDATE e DELETE, e timeouts (<code>statement_timeout</code>, <code>idle_in_transaction_session_timeout</code>). Para investigar: <code>pg_stat_activity</code> (o que está rodando e esperando), <code>pg_locks</code> e o log de consultas lentas.`,
  ],
  conecta: [['backend/transacoes', 'Locks existem por causa do isolamento.'], ['backend/race', 'Locks resolvem races, mas têm custo.'], ['pool-conexoes', 'Conexões presas esgotam o pool.'], ['migracoes-zero-downtime', 'DDL também pede locks.']],
  front: `Um botão que fica girando para sempre em operações específicas, enquanto o resto do sistema funciona, pode ser uma transação esperando um lock.`,
  ex: { lang: 'sql', code: `-- quem está bloqueando quem
SELECT bloqueada.pid  AS pid_esperando,
       bloqueadora.pid AS pid_bloqueando,
       bloqueadora.query AS query_bloqueando,
       now() - bloqueadora.xact_start AS transacao_aberta_ha
  FROM pg_stat_activity bloqueada
  JOIN pg_stat_activity bloqueadora
    ON bloqueadora.pid = ANY (pg_blocking_pids(bloqueada.pid));

-- proteções
ALTER DATABASE loja SET idle_in_transaction_session_timeout = '30s';
ALTER DATABASE loja SET statement_timeout = '10s';` },
  docs: [['PostgreSQL · Explicit locking', 'https://www.postgresql.org/docs/current/explicit-locking.html'], ['PostgreSQL · pg_stat_activity', 'https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW'], ['PostgreSQL · Lock Monitoring (wiki)', 'https://wiki.postgresql.org/wiki/Lock_Monitoring']],
  perguntas: [`Como você descobriria qual consulta está travando as outras agora?`, `Por que chamar uma API externa dentro de uma transação causa problemas de lock?`, `Como evitar deadlocks ao atualizar várias linhas?`] },

{ id: 'manutencao-banco', stage: 'producao', level: 'aprofundar', title: 'Manutenção: vacuum, estatísticas e bloat', short: 'Manutenção',
  resumo: `O trabalho de fundo que mantém o banco rápido ao longo do tempo.`,
  porque: `Um banco que era rápido pode ir ficando lento sem nenhuma mudança de código: tabelas e índices incham, estatísticas ficam desatualizadas e o planejador passa a escolher planos ruins.`,
  como: [
    `No Postgres, UPDATE e DELETE deixam versões antigas das linhas (<b>MVCC</b>). O <b>autovacuum</b> recupera esse espaço e atualiza as estatísticas usadas pelo planejador (<code>ANALYZE</code>). Tabelas com muitas escritas podem exigir ajustes de autovacuum, e transações muito longas impedem a limpeza.`,
    `Sinais de alerta: <b>bloat</b> (tabelas e índices muito maiores que os dados), planos de execução que mudam de repente, crescimento do disco sem crescimento de dados e avisos de <i>transaction ID wraparound</i>. Monitore com <code>pg_stat_user_tables</code> e extensões como <code>pg_stat_statements</code>.`,
  ],
  conecta: [['backend/indices', 'Índices inchados ficam lentos.'], ['locks-deadlocks', 'Transações longas impedem o vacuum.'], ['backend/observabilidade', 'Métricas do banco no monitoramento.']],
  front: `Não aparece diretamente no front, mas explica por que uma tela que sempre foi rápida pode ficar lenta "do nada".`,
  ex: { lang: 'sql', code: `-- tabelas com mais linhas mortas e último autovacuum
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_autoanalyze
  FROM pg_stat_user_tables
 ORDER BY n_dead_tup DESC LIMIT 10;

-- consultas que mais consomem tempo no total
SELECT query, calls, round(total_exec_time) AS ms_total, round(mean_exec_time) AS ms_media
  FROM pg_stat_statements
 ORDER BY total_exec_time DESC LIMIT 10;` },
  docs: [['PostgreSQL · Routine vacuuming', 'https://www.postgresql.org/docs/current/routine-vacuuming.html'], ['PostgreSQL · pg_stat_statements', 'https://www.postgresql.org/docs/current/pgstatstatements.html'], ['PostgreSQL · MVCC', 'https://www.postgresql.org/docs/current/mvcc-intro.html']],
  perguntas: [`O que acontece com uma linha antiga depois de um UPDATE no Postgres?`, `Por que uma transação aberta por horas atrapalha o banco inteiro?`, `Qual consulta consome mais tempo total no seu banco?`] },
]
