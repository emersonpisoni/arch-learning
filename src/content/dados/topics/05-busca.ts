import type { Topic } from '../../../types'

export const busca: Topic[] = [
{ id: 'busca-full-text', stage: 'busca', level: 'essencial', title: 'Busca textual: como funciona', short: 'Busca textual',
  resumo: `Índice invertido, análise de texto e relevância: por que LIKE '%termo%' não basta.`,
  porque: `Busca é uma das funcionalidades mais usadas de qualquer produto e uma das que mais frustram. Entender como motores de busca funcionam ajuda a desenhar a experiência e a conversar com quem implementa.`,
  como: [
    `O <b>índice invertido</b> mapeia cada termo para os documentos que o contêm, como o índice remissivo de um livro. Antes de indexar, o texto passa por <b>análise</b>: separar em termos (tokenização), minúsculas, remover acentos e palavras vazias, e reduzir à raiz (<i>stemming</i>: "pedidos" e "pedido" viram o mesmo termo).`,
    `A <b>relevância</b> ordena os resultados, tradicionalmente com <b>BM25</b> (termos raros e frequentes no documento pesam mais), ajustada por campos (título vale mais que descrição), popularidade e recência. Recursos esperados: tolerância a erros de digitação (fuzzy), sinônimos, autocomplete e filtros facetados. O Postgres tem busca textual embutida, suficiente para muitos casos.`,
  ],
  conecta: [['elasticsearch', 'O motor de busca mais usado.'], ['backend/indices', 'LIKE com % no começo não usa índice B-tree.'], ['ia/embeddings', 'Busca semântica por significado complementa a textual.'], ['backend/nosql', 'Motores de busca são um tipo de banco especializado.']],
  front: `Debounce no campo de busca, destaque dos termos encontrados, sugestões de autocomplete e uma boa tela de "nenhum resultado" são metade da experiência de busca.`,
  ex: { lang: 'sql', code: `-- Postgres: busca textual em português, com índice
ALTER TABLE produtos ADD COLUMN busca tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(nome, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(descricao, '')), 'B')
  ) STORED;
CREATE INDEX idx_produtos_busca ON produtos USING GIN (busca);

SELECT nome, ts_rank(busca, q) AS relevancia
  FROM produtos, websearch_to_tsquery('portuguese', 'teclados mecânicos') q
 WHERE busca @@ q
 ORDER BY relevancia DESC LIMIT 20;` },
  docs: [['PostgreSQL · Full text search', 'https://www.postgresql.org/docs/current/textsearch.html'], ['Elastic · Índice invertido e análise', 'https://www.elastic.co/docs/manage-data/data-store/text-analysis'], ['Wikipedia · Okapi BM25', 'https://en.wikipedia.org/wiki/Okapi_BM25']],
  perguntas: [`Por que LIKE '%termo%' fica lento em tabelas grandes?`, `O que stemming faz com "pedidos" e "pedido"?`, `Como a busca do seu produto lida com erros de digitação?`] },

{ id: 'elasticsearch', stage: 'busca', level: 'importante', title: 'Elasticsearch e OpenSearch', short: 'Elasticsearch',
  resumo: `Motores de busca distribuídos para texto, filtros facetados e logs.`,
  porque: `Catálogos, buscas internas e plataformas de logs costumam usar Elasticsearch ou OpenSearch. Eles funcionam como um modelo de leitura separado do banco principal, com regras próprias de sincronização e operação.`,
  como: [
    `Documentos JSON são guardados em <b>índices</b>, divididos em <b>shards</b> replicados entre nós. O <b>mapping</b> define o tipo e o analisador de cada campo (<code>text</code> analisado para busca, <code>keyword</code> exato para filtros e agregações). Consultas combinam busca textual, filtros e <b>agregações</b> (contagens por categoria para filtros facetados).`,
    `O banco principal continua sendo a fonte da verdade; o índice é atualizado por eventos, CDC ou reindexação, o que traz consistência eventual. Mudar um mapping normalmente exige reindexar (use <b>aliases</b> para trocar sem downtime). OpenSearch é o fork aberto mantido pela AWS e outros.`,
  ],
  conecta: [['busca-full-text', 'Os conceitos de busca que ele implementa.'], ['arquitetura/cqrs', 'O índice é um modelo de leitura.'], ['cdc', 'Uma forma de manter o índice sincronizado.'], ['backend/observabilidade', 'Também muito usado para logs.']],
  front: `Os filtros laterais com contagem ("Marca: Logitech (42)") vêm das agregações. Pedir esses números ao banco relacional a cada busca costuma ser lento.`,
  ex: { lang: 'json', code: `// busca com tolerância a erros, filtro e facetas
POST /produtos/_search
{
  "query": {
    "bool": {
      "must":   { "multi_match": { "query": "teclado mecanico", "fields": ["nome^3", "descricao"], "fuzziness": "AUTO" } },
      "filter": [{ "term": { "categoria": "perifericos" } }, { "range": { "preco": { "lte": 500 } } }]
    }
  },
  "aggs": { "marcas": { "terms": { "field": "marca" } } }
}` },
  docs: [['Elasticsearch · Documentação', 'https://www.elastic.co/docs/solutions/search'], ['OpenSearch · Documentação', 'https://docs.opensearch.org/docs/latest/'], ['Elastic · Aliases', 'https://www.elastic.co/docs/manage-data/data-store/aliases']],
  perguntas: [`Como o índice de busca do seu produto fica sincronizado com o banco?`, `Qual a diferença entre um campo text e um keyword?`, `Como mudar o mapping de um índice sem tirar a busca do ar?`] },

{ id: 'redis-estruturas', stage: 'busca', level: 'importante', title: 'Redis além do cache', short: 'Redis',
  resumo: `Estruturas de dados em memória para contadores, rankings, filas, locks e sessões.`,
  porque: `Muita gente conhece o Redis só como cache de chave-valor, mas suas estruturas resolvem de forma simples problemas que seriam complexos num banco relacional, como rankings em tempo real e rate limiting.`,
  como: [
    `Estruturas: <b>strings</b> com operações atômicas (<code>INCR</code> para contadores), <b>hashes</b> (objetos), <b>listas</b> (filas simples), <b>sets</b> (únicos), <b>sorted sets</b> (rankings ordenados por pontuação), <b>streams</b> (log de eventos com grupos de consumidores) e <b>pub/sub</b>. Todas com <b>TTL</b> por chave.`,
    `Usos típicos: sessões, rate limiting, rankings, locks distribuídos, filas de jobs (BullMQ, Sidekiq), deduplicação e pub/sub entre réplicas de WebSocket. Cuidados: tudo fica em memória (defina política de remoção e limites), persistência é configurável e não substitui o banco principal, e comandos que varrem todas as chaves (<code>KEYS *</code>) travam o servidor.`,
  ],
  conecta: [['backend/cache', 'O uso mais conhecido.'], ['backend/rate-limit', 'Contadores atômicos com expiração.'], ['backend/filas', 'Filas de jobs sobre Redis.'], ['arquitetura/cache-distribuido', 'Redis em escala.'], ['backend/realtime', 'Pub/sub entre réplicas.']],
  front: `Rankings ao vivo, contadores de "visualizações" e limites de tentativas que você vê no produto frequentemente são sorted sets e contadores no Redis.`,
  ex: { lang: 'bash', code: `# contador atômico com expiração (rate limit simples)
INCR login:203.0.113.45
EXPIRE login:203.0.113.45 60

# ranking: sorted set ordenado por pontos
ZINCRBY ranking:semana 30 "user:7"
ZREVRANGE ranking:semana 0 9 WITHSCORES      # top 10

# lock distribuído com expiração
SET lock:pedido:981 "api-3" NX PX 5000` },
  docs: [['Redis · Data types', 'https://redis.io/docs/latest/develop/data-types/'], ['Redis · Distributed locks', 'https://redis.io/docs/latest/develop/use/patterns/distributed-locks/'], ['BullMQ', 'https://docs.bullmq.io/']],
  perguntas: [`Que funcionalidade do seu produto poderia usar um sorted set?`, `Por que KEYS * é perigoso em produção?`, `O que acontece com os dados do Redis se o servidor reiniciar?`] },
]
