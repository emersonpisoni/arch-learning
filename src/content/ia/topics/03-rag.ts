import type { Topic } from '../../../types'

export const rag: Topic[] = [
{ id: 'embeddings', stage: 'rag', level: 'essencial', title: 'Embeddings', short: 'Embeddings',
  resumo: `Representar o significado de um texto como um vetor de números.`,
  porque: `Embeddings permitem buscar por significado ("como cancelo minha compra?" encontra "política de devolução"), agrupar textos parecidos e recomendar conteúdo. São a base de quase todo sistema de RAG.`,
  como: [
    `Um <b>modelo de embeddings</b> transforma um texto num vetor (centenas ou milhares de números). Textos com significado parecido ficam próximos nesse espaço. A proximidade é medida por <b>similaridade de cosseno</b> ou produto escalar.`,
    `Pontos práticos: use o <b>mesmo modelo</b> para indexar e para consultar (vetores de modelos diferentes não são comparáveis); modelos multilíngues funcionam bem em português; embeddings são baratos, mas reindexar tudo ao trocar de modelo custa tempo; e alguns modelos distinguem embeddings de "documento" e de "consulta". Provedores como Voyage, OpenAI e Cohere oferecem APIs, e há modelos abertos para rodar localmente.`,
  ],
  conecta: [['busca-vetorial', 'Onde os vetores são guardados e buscados.'], ['rag', 'Embeddings encontram o contexto relevante.'], ['dados/busca-full-text', 'A busca textual clássica, que complementa a semântica.'], ['chunking', 'O que exatamente vira um embedding.']],
  front: `"Produtos parecidos" e "artigos relacionados" no front podem vir de embeddings: o backend busca os vizinhos mais próximos do item que o usuário está vendo.`,
  ex: { lang: 'typescript', code: `// similaridade de cosseno entre dois vetores
function cosseno(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb)); // 1 = mesmo sentido, 0 = sem relação
}

// "como cancelo minha compra?"  vs  "política de devolução"  → ~0.82 (próximos)
// "como cancelo minha compra?"  vs  "horário da loja"        → ~0.21 (distantes)` },
  docs: [['Voyage AI · Embeddings', 'https://docs.voyageai.com/docs/embeddings'], ['Sentence Transformers', 'https://www.sbert.net/'], ['MTEB · Ranking de modelos de embeddings', 'https://huggingface.co/spaces/mteb/leaderboard']],
  perguntas: [`Que funcionalidade do seu produto se beneficiaria de busca por significado?`, `Por que indexar e consultar com o mesmo modelo?`, `O que acontece se você trocar o modelo de embeddings?`] },

{ id: 'busca-vetorial', stage: 'rag', level: 'importante', title: 'Bancos vetoriais e busca semântica', short: 'Busca vetorial',
  resumo: `Guardar milhões de vetores e encontrar os mais próximos em milissegundos.`,
  porque: `Comparar a consulta com cada vetor um a um não escala. Bancos e índices vetoriais tornam a busca semântica rápida, e a escolha entre um banco dedicado e uma extensão do banco que você já tem é uma decisão de arquitetura.`,
  como: [
    `Índices de <b>vizinhos aproximados</b> (ANN), como <b>HNSW</b> e IVF, trocam um pouco de precisão por muita velocidade. Opções: extensões em bancos existentes (<b>pgvector</b> no Postgres, recursos vetoriais no Elasticsearch/OpenSearch, Redis) ou bancos dedicados (Pinecone, Qdrant, Weaviate, Milvus).`,
    `Na prática, a <b>busca híbrida</b> (combinar similaridade vetorial com busca textual por palavras, como BM25) costuma dar os melhores resultados, porque códigos, nomes próprios e termos exatos se perdem nos embeddings. Filtros por metadados (tenant, idioma, data) e um passo de <b>reranking</b> melhoram a relevância.`,
  ],
  conecta: [['embeddings', 'Os vetores que são indexados.'], ['dados/elasticsearch', 'Motores de busca também fazem busca vetorial.'], ['dados/multi-tenant', 'Filtrar por tenant para não misturar dados de clientes.'], ['rag', 'A etapa de recuperação do RAG.']],
  front: `Uma busca que entende "tênis para corrida na chuva" e também acha o código exato "SKU-4821" geralmente é híbrida.`,
  ex: { lang: 'sql', code: `-- pgvector: tabela com embeddings e índice HNSW
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE trechos (
  id        BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  fonte     TEXT NOT NULL,
  conteudo  TEXT NOT NULL,
  embedding vector(1024) NOT NULL
);
CREATE INDEX ON trechos USING hnsw (embedding vector_cosine_ops);

-- 5 trechos mais parecidos com a pergunta, só do tenant atual
SELECT fonte, conteudo, 1 - (embedding <=> $1) AS similaridade
  FROM trechos
 WHERE tenant_id = $2
 ORDER BY embedding <=> $1
 LIMIT 5;` },
  docs: [['pgvector', 'https://github.com/pgvector/pgvector'], ['Pinecone · Learn: vector search', 'https://www.pinecone.io/learn/'], ['Qdrant · Documentação', 'https://qdrant.tech/documentation/']],
  perguntas: [`Faria sentido usar pgvector no banco que você já tem, ou um banco dedicado?`, `Por que a busca híbrida costuma ser melhor que só a vetorial?`, `Como garantir que a busca não traga dados de outro cliente?`] },

{ id: 'rag', stage: 'rag', level: 'essencial', title: 'RAG: geração aumentada por recuperação', short: 'RAG',
  resumo: `Buscar os trechos relevantes dos seus dados e entregá-los ao modelo junto com a pergunta.`,
  porque: `RAG é a forma mais comum de fazer um LLM responder sobre documentos internos, políticas e bases de conhecimento, com informação atualizada e citações, sem treinar modelo nenhum.`,
  como: [
    `<b>Indexação</b> (antes): carregar documentos, dividir em pedaços, gerar embeddings e guardar com metadados. <b>Consulta</b> (a cada pergunta): gerar o embedding da pergunta, recuperar os trechos mais relevantes (busca vetorial ou híbrida), montar o prompt com esses trechos e pedir uma resposta que cite as fontes.`,
    `A qualidade depende muito mais da <b>recuperação</b> do que do modelo: se o trecho certo não vier, a resposta será ruim. Técnicas: reescrever a pergunta antes de buscar, enriquecer cada trecho com contexto do documento, reranking e avaliar recuperação e resposta separadamente. Com janelas de contexto grandes, bases pequenas às vezes cabem inteiras no prompt (com cache), sem RAG.`,
  ],
  conecta: [['embeddings', 'Para encontrar trechos por significado.'], ['chunking', 'Como os documentos são divididos.'], ['limitacoes', 'Fontes no contexto reduzem alucinações.'], ['avaliacao', 'Medir recuperação e resposta.'], ['custo-latencia', 'Cache de contexto como alternativa para bases pequenas.']],
  front: `Mostrar as fontes de cada resposta (com link para o documento original) é o que faz o usuário confiar no assistente e perceber quando ele errou.`,
  ex: { lang: 'typescript', code: `async function responder(pergunta: string, tenantId: number) {
  const vetor = await gerarEmbedding(pergunta);
  const trechos = await buscarTrechos(vetor, tenantId, 5);   // busca vetorial/híbrida

  const contexto = trechos
    .map((t, i) => \`<fonte id="\${i + 1}" titulo="\${t.fonte}">\${t.conteudo}</fonte>\`)
    .join("\\n");

  return client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    system: "Responda usando apenas as fontes fornecidas e cite o id de cada fonte usada. " +
            "Se a resposta não estiver nas fontes, diga que não encontrou.",
    messages: [{ role: "user", content: \`<fontes>\\n\${contexto}\\n</fontes>\\n\\nPergunta: \${pergunta}\` }],
  });
}` },
  docs: [['Anthropic · Contextual Retrieval', 'https://www.anthropic.com/news/contextual-retrieval'], ['Claude Docs · Citations', 'https://platform.claude.com/docs/en/build-with-claude/citations'], ['Pinecone · Retrieval Augmented Generation', 'https://www.pinecone.io/learn/retrieval-augmented-generation/']],
  perguntas: [`Que base de conhecimento da sua empresa poderia virar um assistente com RAG?`, `Por que a recuperação importa mais que o modelo na qualidade final?`, `Quando colocar a base inteira no contexto é melhor que RAG?`] },

{ id: 'chunking', stage: 'rag', level: 'importante', title: 'Chunking e preparação de documentos', short: 'Chunking',
  resumo: `Dividir documentos em pedaços que façam sentido sozinhos.`,
  porque: `Pedaços grandes demais diluem o que é relevante; pequenos demais perdem o contexto. A forma de dividir e limpar os documentos é uma das decisões que mais afetam a qualidade de um RAG.`,
  como: [
    `Estratégias: tamanho fixo com <b>sobreposição</b> (simples), divisão por <b>estrutura</b> (títulos, seções, parágrafos, funções no caso de código) e divisão <b>semântica</b> (onde o assunto muda). Tamanhos típicos ficam entre algumas centenas e alguns milhares de tokens, ajustados por avaliação.`,
    `Preparação importa tanto quanto o corte: extrair texto limpo de PDFs e HTML, remover menus e rodapés repetidos, guardar <b>metadados</b> (título, seção, data, permissões, URL) e acrescentar a cada pedaço um contexto curto sobre o documento de origem ("contextual retrieval"). Planeje a <b>atualização</b>: documentos mudam e o índice precisa acompanhar.`,
  ],
  conecta: [['rag', 'Os pedaços são o que a busca recupera.'], ['embeddings', 'Cada pedaço vira um vetor.'], ['tokens-contexto', 'Tamanho medido em tokens.'], ['dados/cdc', 'Manter o índice atualizado quando os documentos mudam.']],
  front: `Ao exibir a fonte de uma resposta, os metadados do pedaço (título, seção, link com âncora) permitem levar o usuário exatamente ao trecho certo do documento.`,
  ex: { lang: 'typescript', code: `// divisão por seções de markdown, com contexto do documento em cada pedaço
function dividirPorSecoes(doc: { titulo: string; url: string; markdown: string }) {
  return doc.markdown
    .split(/\\n(?=## )/)                       // cada seção "## " vira um pedaço
    .map((secao) => {
      const tituloSecao = secao.match(/^## (.+)/)?.[1] ?? "Introdução";
      return {
        conteudo: \`Documento: \${doc.titulo}\\nSeção: \${tituloSecao}\\n\\n\${secao.trim()}\`,
        metadados: { fonte: doc.titulo, secao: tituloSecao, url: doc.url },
      };
    })
    .filter((p) => p.conteudo.length > 200);  // descarta pedaços vazios demais
}` },
  docs: [['Anthropic · Contextual Retrieval', 'https://www.anthropic.com/news/contextual-retrieval'], ['Pinecone · Chunking strategies', 'https://www.pinecone.io/learn/chunking-strategies/'], ['LangChain · Text splitters', 'https://python.langchain.com/docs/concepts/text_splitters/']],
  perguntas: [`Como os documentos da sua empresa estão estruturados, e qual divisão faria sentido?`, `Que metadados você guardaria em cada pedaço?`, `Como manter o índice atualizado quando um documento muda?`] },
]
