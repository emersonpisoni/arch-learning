import type { Topic } from '../../../types'

export const dados: Topic[] = [
{ id: 'sql', stage: 'dados', level: 'essencial', title: 'Bancos relacionais e SQL', short: 'SQL',
  resumo: `Guardar dados em tabelas relacionadas e consultá-los com SQL.`,
  porque: `A maioria dos sistemas guarda o dado mais importante num banco relacional (Postgres, MySQL, SQL Server, Oracle). Saber SQL permite investigar bugs direto na fonte e discutir performance de igual para igual.`,
  como: [
    `Dados ficam em <b>tabelas</b> com colunas tipadas. A <b>chave primária</b> identifica cada linha e a <b>chave estrangeira</b> referencia outra tabela. Constraints (<code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK</code>) fazem o banco garantir as regras mesmo quando o código erra.`,
    `Domine <code>SELECT</code> com <code>WHERE</code>, <code>JOIN</code> (inner e left), <code>GROUP BY</code> com agregações, subqueries e <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>. Depois, window functions e CTEs (<code>WITH</code>).`,
  ],
  conecta: [['modelagem', 'Define quais tabelas e relações existem.'], ['indices', 'Fazem as consultas escalarem.'], ['transacoes', 'Garantem que várias escritas aconteçam juntas.'], ['orm', 'Gera SQL a partir do código.']],
  front: `Muitas regras que parecem de tela ("total por categoria") são um <code>GROUP BY</code>. Saber disso ajuda a pedir o endpoint certo em vez de agregar milhares de itens no navegador.`,
  ex: { lang: 'sql', code: `SELECT c.nome,
       COUNT(p.id)  AS pedidos,
       SUM(p.total) AS faturado
  FROM clientes c
  LEFT JOIN pedidos p ON p.cliente_id = c.id
                     AND p.status = 'PAGO'
 GROUP BY c.nome
 ORDER BY faturado DESC NULLS LAST
 LIMIT 10;` },
  docs: [['SQLBolt · exercícios interativos', 'https://sqlbolt.com/'], ['PostgreSQL · Tutorial', 'https://www.postgresql.org/docs/current/tutorial.html'], ['Select Star SQL', 'https://selectstarsql.com/']],
  perguntas: [`Qual a diferença entre INNER JOIN e LEFT JOIN?`, `Por que usar constraints no banco se o código já valida?`, `Como achar os 10 clientes que mais compraram no mês?`] },

{ id: 'modelagem', stage: 'dados', level: 'essencial', title: 'Modelagem de dados', short: 'Modelagem',
  resumo: `Decidir quais tabelas existem, como se relacionam e onde cada informação mora.`,
  porque: `Uma modelagem ruim é a dívida técnica mais cara: muda devagar, contamina todas as queries e às vezes exige migrar milhões de linhas.`,
  como: [
    `Comece pelas entidades do negócio e suas relações: <b>1:1</b>; <b>1:N</b> (cliente tem pedidos, com a chave estrangeira no pedido); e <b>N:N</b> (pedido tem produtos, via tabela de junção <code>itens_pedido</code>). Diagramas ER ajudam a discutir antes de codar.`,
    `A <b>normalização</b> evita duplicação: cada fato é guardado num só lugar. <b>Desnormalizar</b> conscientemente (copiar o preço para o item do pedido, guardar totais) é comum por performance ou por regra de negócio: o preço de um pedido antigo não pode mudar quando o produto muda.`,
  ],
  conecta: [['sql', 'O modelo vira tabelas, chaves e constraints.'], ['ddd', 'Agregados e contextos guiam o desenho.'], ['nosql', 'Em NoSQL se modela a partir das consultas.'], ['indices', 'O modelo define quais índices serão necessários.']],
  front: `Formulários com campos repetidos ou listas dentro de listas costumam revelar uma relação 1:N ou N:N. Entender isso ajuda a combinar o payload certo com o backend.`,
  ex: { lang: 'sql', code: `CREATE TABLE clientes (
  id    BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE pedidos (
  id         BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id),
  status     TEXT NOT NULL CHECK (status IN ('PENDENTE','PAGO','CANCELADO')),
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE itens_pedido (              -- N:N com dados próprios
  pedido_id  BIGINT REFERENCES pedidos(id),
  produto_id BIGINT REFERENCES produtos(id),
  quantidade INT NOT NULL CHECK (quantidade > 0),
  preco_unit NUMERIC(10,2) NOT NULL,     -- desnormalizado de propósito
  PRIMARY KEY (pedido_id, produto_id)
);` },
  docs: [['Wikipedia · Normalização', 'https://en.wikipedia.org/wiki/Database_normalization'], ['PostgreSQL · Definição de dados', 'https://www.postgresql.org/docs/current/ddl.html'], ['dbdiagram.io · desenhar diagramas ER', 'https://dbdiagram.io/']],
  perguntas: [`Como modelar uma relação N:N?`, `Por que copiar o preço para o item do pedido?`, `Qual o risco de guardar uma lista de ids numa coluna de texto?`] },

{ id: 'indices', stage: 'dados', level: 'essencial', title: 'Índices e performance de queries', short: 'Índices',
  resumo: `Estruturas que deixam o banco achar linhas sem ler a tabela inteira.`,
  porque: `A causa número um de API lenta é query sem índice ou mal escrita. Uma consulta de 3 segundos pode cair para 3 milissegundos com o índice certo.`,
  como: [
    `Um índice, normalmente uma <b>B-tree</b>, funciona como o índice remissivo de um livro: guarda os valores de uma ou mais colunas ordenados e aponta para as linhas. Acelera <code>WHERE</code>, <code>JOIN</code> e <code>ORDER BY</code>, mas ocupa espaço e deixa as escritas mais lentas.`,
    `Use <code>EXPLAIN ANALYZE</code> para ver o plano de execução: <b>Seq Scan</b> em tabela grande é sinal de alerta. Em índices compostos, a ordem das colunas importa. Fique atento ao <b>problema N+1</b>: uma query para a lista e mais N queries, uma para cada item.`,
  ],
  conecta: [['sql', 'Índices aceleram as cláusulas WHERE, JOIN e ORDER BY.'], ['orm', 'ORMs geram N+1 com facilidade.'], ['cache', 'Otimize a query antes de esconder a lentidão com cache.'], ['observabilidade', 'O slow query log aponta o que otimizar.'], ['fundamentos/arvores-heaps', 'Índices são árvores B-tree.']],
  front: `Filtros e ordenações de uma tela viram <code>WHERE</code> e <code>ORDER BY</code>. Um "ordenar por qualquer coluna" numa tabela grande pode exigir índices novos, então combine isso com o backend antes.`,
  ex: { lang: 'sql', code: `EXPLAIN ANALYZE
SELECT * FROM pedidos
 WHERE cliente_id = 7 AND status = 'PAGO'
 ORDER BY criado_em DESC LIMIT 20;
-- Seq Scan on pedidos ... (actual time=0.02..812.4 ms)

CREATE INDEX idx_pedidos_cliente_status_data
    ON pedidos (cliente_id, status, criado_em DESC);
-- Index Scan using idx_pedidos_... (actual time=0.03..0.09 ms)` },
  docs: [['Use The Index, Luke!', 'https://use-the-index-luke.com/'], ['PostgreSQL · Índices', 'https://www.postgresql.org/docs/current/indexes.html'], ['PostgreSQL · Usando EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html']],
  perguntas: [`Por que não criar índice em todas as colunas?`, `Como identificar um problema N+1 nos logs?`, `Num índice (a, b), uma busca só por b usa o índice?`] },

{ id: 'transacoes', stage: 'dados', level: 'essencial', title: 'Transações e ACID', short: 'Transações',
  resumo: `Agrupar operações para que todas aconteçam ou nenhuma aconteça.`,
  porque: `Transferências, pedidos com itens e baixa de estoque precisam ser tudo ou nada. Sem transação, uma falha no meio deixa o banco inconsistente.`,
  como: [
    `<b>ACID</b>: <b>Atomicidade</b> (tudo ou nada, com <code>COMMIT</code> e <code>ROLLBACK</code>); <b>Consistência</b> (as constraints continuam válidas); <b>Isolamento</b> (transações simultâneas não se atrapalham); <b>Durabilidade</b> (depois do commit, o dado sobrevive a uma queda).`,
    `Os <b>níveis de isolamento</b> trocam segurança por desempenho: Read Committed (padrão do Postgres), Repeatable Read e Serializable. Níveis mais baixos permitem anomalias, como ler valores diferentes na mesma transação. Mantenha transações curtas e nunca chame uma API externa com uma transação aberta.`,
  ],
  conecta: [['sql', 'BEGIN, COMMIT e ROLLBACK fazem parte do SQL.'], ['race', 'O isolamento é a defesa do banco contra races.'], ['idempotencia', 'Rollback garante que repetir a operação é seguro.'], ['cap', 'Entre vários serviços, ACID deixa de valer.']],
  front: `Quando salvar um formulário com várias partes dá erro, a transação garante que nada ficou salvo pela metade. Por isso tentar de novo é seguro.`,
  ex: { lang: 'sql', code: `BEGIN;
  UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
  UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
  INSERT INTO extrato (de, para, valor) VALUES (1, 2, 100);
COMMIT;   -- se qualquer passo falhar: ROLLBACK, e nada muda` },
  docs: [['PostgreSQL · Transações', 'https://www.postgresql.org/docs/current/tutorial-transactions.html'], ['PostgreSQL · Níveis de isolamento', 'https://www.postgresql.org/docs/current/transaction-iso.html'], ['Designing Data-Intensive Applications', 'https://dataintensive.net/']],
  perguntas: [`O que acontece se o servidor cair entre os dois UPDATEs sem transação?`, `Por que não chamar o gateway de pagamento dentro de uma transação?`, `Que anomalia o Serializable evita e o Read Committed permite?`] },

{ id: 'orm', stage: 'dados', level: 'importante', title: 'ORMs e migrations', short: 'ORM',
  resumo: `Mapear tabelas para objetos do código e versionar as mudanças no schema.`,
  porque: `Quase todo backend usa um ORM (Prisma, TypeORM, Hibernate/JPA, Entity Framework, SQLAlchemy). Ele acelera o dia a dia, mas esconde consultas que podem ficar lentas.`,
  como: [
    `O <b>ORM</b> traduz algo como <code>pedidos.findMany({ include: { itens: true } })</code> em SQL. Vantagens: tipagem, menos SQL repetido e proteção contra SQL injection. Riscos: N+1 por lazy loading, consultas ineficientes e a sensação de que o banco não existe. Ative o log de SQL em desenvolvimento.`,
    `<b>Migrations</b> são arquivos versionados que alteram o schema (adicionar coluna, criar índice) e rodam em ordem em todos os ambientes, como commits fazem com o código. Em produção, cada mudança precisa ser compatível com a versão da aplicação que ainda está no ar (estratégia expand and contract).`,
  ],
  conecta: [['sql', 'No fim, tudo vira SQL.'], ['indices', 'Consultas geradas também precisam de índices.'], ['cicd', 'Migrations rodam no pipeline de deploy.'], ['camadas', 'O ORM fica escondido atrás do repository.']],
  front: `Renomear um campo parece trivial, mas no banco vira uma migration em várias etapas para não quebrar a versão do app que ainda está rodando.`,
  ex: { lang: 'typescript', code: `// Prisma: traz os itens na mesma consulta, sem N+1
const pedidos = await prisma.pedido.findMany({
  where: { clienteId: 7 },
  include: { itens: true },
  take: 20,
});

// migration gerada (SQL):
// ALTER TABLE "Pedido" ADD COLUMN "cupom" TEXT;` },
  docs: [['Prisma · Documentação', 'https://www.prisma.io/docs'], ['Martin Fowler · Evolutionary Database Design', 'https://martinfowler.com/articles/evodb.html'], ['Hibernate ORM · Documentação', 'https://hibernate.org/orm/documentation/']],
  perguntas: [`Como o lazy loading causa N+1?`, `O que é a estratégia expand and contract?`, `Por que migrations precisam ser versionadas no git?`] },

{ id: 'nosql', stage: 'dados', level: 'importante', title: 'NoSQL', short: 'NoSQL',
  resumo: `Bancos não relacionais: documentos, chave-valor, colunas, grafos e busca.`,
  porque: `Cada tipo resolve um problema específico: cache, catálogo flexível, volume gigante de escrita, relações complexas. Saber quando usar evita escolher NoSQL por moda.`,
  como: [
    `<b>Documento</b> (MongoDB, Firestore): JSON flexível, bom quando os dados são lidos juntos. <b>Chave-valor</b> (Redis, DynamoDB): acesso rapidíssimo por chave. <b>Wide-column</b> (Cassandra): escrita massiva e distribuída. <b>Grafo</b> (Neo4j): redes sociais, recomendação. <b>Busca</b> (Elasticsearch, OpenSearch): texto livre e filtros facetados.`,
    `Em NoSQL você modela a partir das <b>consultas</b>, não das entidades, e duplica dados de propósito para ler tudo de uma vez. Muitos desses bancos abrem mão de joins e de transações amplas em troca de escala horizontal.`,
  ],
  conecta: [['modelagem', 'A modelagem parte das consultas, não das entidades.'], ['cache', 'Redis é o banco chave-valor mais usado como cache.'], ['cap', 'Bancos distribuídos escolhem entre consistência e disponibilidade.'], ['sql', 'Na maioria dos sistemas, complementa o relacional, não substitui.']],
  front: `Firebase/Firestore é um exemplo conhecido de modelagem orientada a consultas. Busca com filtros laterais e autocomplete quase sempre vem de um Elasticsearch, não do banco principal.`,
  ex: { lang: 'json', code: `// MongoDB: o pedido inteiro num documento, itens embutidos
{
  "_id": "981",
  "cliente": { "id": 7, "nome": "Ana" },
  "status": "PAGO",
  "itens": [
    { "produto": "Teclado", "qtd": 1, "preco": 199.9 }
  ]
}` },
  docs: [['MongoDB · Modelagem de dados', 'https://www.mongodb.com/docs/manual/data-modeling/'], ['Redis · Documentação', 'https://redis.io/docs/latest/'], ['AWS · O que é NoSQL', 'https://aws.amazon.com/nosql/']],
  perguntas: [`Por que modelar a partir das consultas em NoSQL?`, `Quando embutir dados num documento é melhor que referenciar?`, `Qual banco você usaria para busca por texto com filtros?`] },
]
