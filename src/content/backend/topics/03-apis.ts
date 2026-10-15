import type { Topic } from '../../../types'

export const apis: Topic[] = [
{ id: 'rest', stage: 'apis', level: 'essencial', title: 'APIs REST', short: 'REST',
  resumo: `Um estilo de API baseado em recursos, URLs e verbos HTTP.`,
  porque: `É o formato de API mais comum entre front e back. Um bom design REST reduz idas e vindas entre times, evita endpoints duplicados e deixa os erros previsíveis.`,
  como: [
    `Pense em <b>recursos</b> (substantivos) e use os métodos HTTP como verbos: <code>GET /pedidos</code>, <code>POST /pedidos</code>, <code>GET /pedidos/981</code>, <code>PATCH /pedidos/981</code>. Sub-recursos expressam relação: <code>GET /clientes/7/pedidos</code>.`,
    `Decisões que todo time precisa padronizar: <b>paginação</b> (offset ou cursor), <b>filtros e ordenação</b> na query string, <b>formato de erro</b> (ex.: Problem Details, RFC 9457), <b>versionamento</b> (<code>/v1</code> ou header), camelCase ou snake_case e uso correto de status codes.`,
    `O REST definido por Roy Fielding também prevê hipermídia (HATEOAS), que quase ninguém usa. Na prática, "API REST" quer dizer JSON sobre HTTP com recursos bem modelados.`,
  ],
  conecta: [['http', 'REST usa métodos, status e headers do HTTP como vocabulário.'], ['contratos', 'OpenAPI documenta e tipa uma API REST.'], ['graphql', 'Alternativa quando as telas precisam de dados muito variados.'], ['mvc', 'Os controllers expõem os endpoints.'], ['gateway', 'O gateway centraliza o acesso às APIs.']],
  front: `Paginação por cursor combina com scroll infinito. Um formato de erro padronizado permite ter um único tratador de erros no front que mostra a mensagem certa em cada campo do formulário.`,
  ex: { lang: 'http', code: `GET /v1/pedidos?status=PAGO&limit=20&cursor=eyJpZCI6OTgxfQ

200 OK
{
  "data": [{ "id": 981, "status": "PAGO", "total": 199.9 }],
  "nextCursor": "eyJpZCI6OTYxfQ"
}

422 Unprocessable Content
{
  "type": "https://api.loja.com/erros/validacao",
  "title": "Dados inválidos",
  "errors": [{ "field": "quantidade", "message": "deve ser maior que 0" }]
}` },
  docs: [['Microsoft · Boas práticas de design de API', 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design'], ['Google · API Improvement Proposals', 'https://google.aip.dev/'], ['RFC 9457 · Problem Details', 'https://www.rfc-editor.org/rfc/rfc9457'], ['Fielding · A tese original do REST', 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm']],
  perguntas: [`Paginação por offset ou por cursor: qual se perde quando itens são inseridos durante a navegação?`, `Como você modelaria a ação "cancelar pedido" em REST?`, `Quando faz sentido criar uma v2 da API?`] },

{ id: 'contratos', stage: 'apis', level: 'importante', title: 'OpenAPI e contratos', short: 'OpenAPI',
  resumo: `Descrever a API num arquivo que vira documentação, mocks e tipos.`,
  porque: `É o acordo formal entre front e back. Com um contrato, os times trabalham em paralelo, geram clientes tipados e descobrem quebras antes do deploy.`,
  como: [
    `A <b>especificação OpenAPI</b> (antigo Swagger) descreve em YAML ou JSON cada endpoint, parâmetros, schemas de request e response e formas de autenticação. A partir dela, ferramentas geram documentação interativa (Swagger UI, Redoc), servidores de mock e SDKs.`,
    `Há dois fluxos: <b>design-first</b>, em que o contrato é escrito e revisado antes do código, e <b>code-first</b>, em que o framework gera o contrato a partir de anotações. <b>Testes de contrato</b> (ex.: Pact) verificam que o provedor continua cumprindo o que os consumidores esperam.`,
  ],
  conecta: [['rest', 'OpenAPI é o formato padrão para descrever APIs REST.'], ['testes', 'Testes de contrato garantem que front e back não divergem.'], ['grpc', 'No gRPC o contrato é o arquivo .proto.'], ['graphql', 'No GraphQL o próprio schema é o contrato.']],
  front: `Gere os tipos TypeScript do cliente a partir do OpenAPI (openapi-typescript, Orval). Se o contrato mudar, o build do front acusa o erro antes de chegar em produção.`,
  ex: { lang: 'yaml', code: `paths:
  /pedidos/{id}:
    get:
      summary: Busca um pedido
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: Pedido encontrado
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Pedido" }
        "404":
          description: Pedido não encontrado` },
  docs: [['OpenAPI Initiative · Learn', 'https://learn.openapis.org/'], ['Especificação OpenAPI', 'https://spec.openapis.org/oas/latest.html'], ['Pact · Testes de contrato', 'https://docs.pact.io/'], ['openapi-typescript', 'https://openapi-ts.dev/']],
  perguntas: [`Quais as vantagens do design-first para o time de front?`, `O que conta como breaking change em um contrato?`, `Em que um teste de contrato difere de um teste end-to-end?`] },

{ id: 'graphql', stage: 'apis', level: 'importante', title: 'GraphQL', short: 'GraphQL',
  resumo: `Uma linguagem de consulta em que o cliente pede exatamente os campos de que precisa.`,
  porque: `Resolve excesso de dados e múltiplas idas ao servidor em telas que juntam muitas informações. Também traz problemas próprios (N+1, cache, custo de queries) que o backend precisa tratar.`,
  como: [
    `O servidor publica um <b>schema</b> tipado com <b>queries</b> (leitura), <b>mutations</b> (escrita) e <b>subscriptions</b> (tempo real). Tudo passa por um único endpoint, normalmente <code>POST /graphql</code>, e cada campo é resolvido por uma função <b>resolver</b>.`,
    `Cuidados no backend: o problema <b>N+1</b> (buscar o autor de cada post separadamente) é resolvido com <b>DataLoader</b>, que agrupa as buscas; queries muito profundas precisam de limite de complexidade; e o cache HTTP é mais difícil porque tudo é POST no mesmo endpoint.`,
  ],
  conecta: [['rest', 'A principal alternativa; cada uma tem seu cenário.'], ['contratos', 'O schema tipado funciona como contrato.'], ['orm', 'Resolvers ingênuos geram consultas N+1 no banco.'], ['gateway', 'Federation junta schemas de vários serviços numa API só.']],
  front: `Apollo Client e urql mantêm um cache normalizado por id. Declarar fragments junto do componente que usa os dados (colocation) é o padrão recomendado.`,
  ex: { lang: 'graphql', code: `query PedidoDetalhe($id: ID!) {
  pedido(id: $id) {
    id
    status
    cliente { nome }
    itens { produto { nome } quantidade }
  }
}` },
  docs: [['graphql.org · Learn', 'https://graphql.org/learn/'], ['Apollo · Documentação', 'https://www.apollographql.com/docs/'], ['DataLoader', 'https://github.com/graphql/dataloader']],
  perguntas: [`Que problema o DataLoader resolve?`, `Por que cachear GraphQL é mais difícil do que REST?`, `Em que tipo de tela o GraphQL compensa?`] },

{ id: 'grpc', stage: 'apis', level: 'aprofundar', title: 'gRPC e Protocol Buffers', short: 'gRPC',
  resumo: `Chamadas entre serviços rápidas e tipadas, com mensagens binárias sobre HTTP/2.`,
  porque: `É muito usado na comunicação interna entre microsserviços, onde performance e contratos rígidos importam mais que a facilidade de depurar pelo navegador.`,
  como: [
    `Você define serviços e mensagens num arquivo <code>.proto</code>, e o compilador gera cliente e servidor em várias linguagens. As mensagens são serializadas em binário (protobuf), menores e mais rápidas que JSON, e trafegam sobre HTTP/2, com streaming nos dois sentidos.`,
    `No navegador, gRPC puro não funciona diretamente. Usa-se gRPC-Web, Connect ou um gateway que expõe REST/JSON para o front e fala gRPC por trás.`,
  ],
  conecta: [['contratos', 'O .proto é um contrato forte, com geração de código.'], ['microsservicos', 'Uso mais comum: chamadas entre serviços internos.'], ['http', 'Depende de recursos do HTTP/2, como multiplexação.'], ['gateway', 'Traduz gRPC interno para REST ou JSON para o front.']],
  front: `O navegador normalmente não chama gRPC direto: o BFF ou o gateway traduz. Se o time adotar Connect, dá para gerar clientes TypeScript do mesmo <code>.proto</code>.`,
  ex: { lang: 'protobuf', code: `syntax = "proto3";

service Estoque {
  rpc Reservar (ReservaRequest) returns (ReservaResponse);
}

message ReservaRequest {
  int64 produto_id = 1;   // o número identifica o campo no binário
  int32 quantidade = 2;
}

message ReservaResponse {
  bool reservado = 1;
}` },
  docs: [['gRPC · Introdução', 'https://grpc.io/docs/what-is-grpc/introduction/'], ['Protocol Buffers', 'https://protobuf.dev/'], ['Connect RPC', 'https://connectrpc.com/docs/introduction']],
  perguntas: [`Por que gRPC é mais comum entre serviços do que entre navegador e servidor?`, `O que acontece se você mudar o número de um campo no .proto?`, `Que vantagem o HTTP/2 traz para o gRPC?`] },

{ id: 'realtime', stage: 'apis', level: 'importante', title: 'WebSockets e SSE', short: 'Tempo real',
  resumo: `Manter uma conexão aberta para o servidor enviar dados sem o cliente pedir.`,
  porque: `Chat, notificações, dashboards ao vivo e edição colaborativa dependem disso. No backend, conexões longas mudam a forma de escalar e de balancear carga.`,
  como: [
    `<b>Polling</b>: o cliente pergunta a cada N segundos (simples, mas desperdiça requisições). <b>SSE</b> (Server-Sent Events): o servidor envia eventos por uma resposta HTTP que fica aberta, num só sentido, com reconexão automática. <b>WebSocket</b>: canal bidirecional sobre uma conexão TCP, iniciado com um upgrade de HTTP.`,
    `Desafios no servidor: cada cliente ocupa uma conexão aberta; com várias réplicas, uma mensagem publicada na réplica A precisa chegar a usuários conectados na B (resolvido com pub/sub, ex.: Redis); e load balancers precisam aceitar conexões longas com timeouts maiores.`,
  ],
  conecta: [['http', 'SSE é HTTP comum; WebSocket começa com um upgrade HTTP.'], ['escala', 'Conexões longas tornam o servidor stateful.'], ['load-balancer', 'Precisa suportar conexões longas e upgrade.'], ['filas', 'Pub/sub distribui mensagens entre as réplicas.']],
  front: `<code>EventSource</code> (SSE) e <code>WebSocket</code> são APIs nativas do navegador. Para notificações só do servidor para o cliente, SSE costuma ser mais simples e passa melhor por proxies.`,
  ex: { lang: 'typescript', code: `// servidor (Express) enviando SSE
app.get("/eventos", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  const timer = setInterval(() => {
    res.write("data: " + JSON.stringify({ hora: Date.now() }) + "\\n\\n");
  }, 1000);
  req.on("close", () => clearInterval(timer));
});

// front
new EventSource("/eventos").onmessage = (e) => console.log(e.data);` },
  docs: [['MDN · WebSockets API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'], ['MDN · Server-sent events', 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events'], ['RFC 6455 · The WebSocket Protocol', 'https://www.rfc-editor.org/rfc/rfc6455']],
  perguntas: [`Quando SSE é suficiente e quando você precisa de WebSocket?`, `Como entregar uma mensagem a um usuário conectado em outra réplica?`, `Por que um load balancer pode derrubar conexões WebSocket ociosas?`] },
]
