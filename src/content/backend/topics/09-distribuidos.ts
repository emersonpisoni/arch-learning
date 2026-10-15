import type { Topic } from '../../../types'

export const distribuidos: Topic[] = [
{ id: 'microsservicos', stage: 'distribuidos', level: 'importante', title: 'Monolito e microsserviços', short: 'Microsserviços',
  resumo: `Uma aplicação única ou vários serviços independentes, e os trade-offs de cada um.`,
  porque: `É uma das decisões de arquitetura mais discutidas e com mais impacto na organização dos times. Também define quantas APIs o front precisa consumir.`,
  como: [
    `<b>Monolito</b>: um deploy, uma base de código, chamadas em memória e transações simples. Funciona bem até certo tamanho de time. O <b>monolito modular</b>, com módulos de fronteiras claras, é um meio-termo muito usado.`,
    `<b>Microsserviços</b>: cada serviço tem banco próprio, deploy independente e um time dono. Ganha-se autonomia e escala por partes, mas paga-se com rede (latência e falhas parciais), consistência eventual, observabilidade distribuída e complexidade operacional. A recomendação comum é começar pelo monolito e extrair serviços quando a dor aparecer (Monolith First).`,
  ],
  conecta: [['ddd', 'Bounded contexts indicam onde cortar os serviços.'], ['gateway', 'Dá ao front uma porta de entrada única.'], ['eventos', 'Serviços se comunicam por eventos para reduzir acoplamento.'], ['observabilidade', 'Tracing distribuído vira obrigatório.'], ['grpc', 'Protocolo comum entre serviços internos.']],
  front: `Microfrontends são a mesma ideia aplicada ao front, com os mesmos trade-offs: autonomia dos times contra complexidade de integração.`,
  ex: { lang: 'diagrama', code: `MONOLITO                     MICROSSERVIÇOS
+------------------+         [Pedidos]--db     [Pagamentos]--db
| pedidos          |              \\               /
| pagamentos       |              [ fila / eventos ]
| catálogo         |              /               \\
+--------+---------+         [Catálogo]--db    [Notificações]
         |
       [db]` },
  docs: [['Martin Fowler · Microservices', 'https://martinfowler.com/articles/microservices.html'], ['Martin Fowler · Monolith First', 'https://martinfowler.com/bliki/MonolithFirst.html'], ['microservices.io · Padrões', 'https://microservices.io/patterns/']],
  perguntas: [`Por que cada microsserviço deve ter o próprio banco?`, `Que problemas aparecem quando uma chamada em memória vira chamada de rede?`, `O que é um monolito modular?`] },

{ id: 'gateway', stage: 'distribuidos', level: 'importante', title: 'API Gateway e BFF', short: 'Gateway e BFF',
  resumo: `Uma porta de entrada única para as APIs e um backend sob medida para cada frontend.`,
  porque: `É o ponto de contato direto do front com a arquitetura de backend. Muitas vezes é o próprio time que constrói a interface que mantém o BFF.`,
  como: [
    `O <b>API Gateway</b> (Kong, AWS API Gateway, Apigee, Envoy) fica na frente dos serviços e centraliza autenticação, rate limiting, roteamento, logs e versionamento, para que cada serviço não precise reimplementar isso.`,
    `O <b>BFF</b> (Backend for Frontend) é um backend feito para uma interface específica: o BFF web junta três serviços numa resposta pronta para a tela, e o BFF mobile manda payloads menores. Ele também pode guardar tokens numa sessão segura, sem expô-los ao navegador. Route Handlers e Server Actions do Next.js muitas vezes já fazem esse papel.`,
  ],
  conecta: [['microsservicos', 'Esconde a quantidade de serviços do front.'], ['autenticacao', 'Valida tokens uma vez, na entrada.'], ['rate-limit', 'Aplica limites de forma central.'], ['rest', 'Expõe APIs REST mesmo quando os serviços usam outro protocolo.'], ['cors', 'Um BFF na mesma origem do front elimina o CORS.'], ['mobile/rede-mobile', 'Clientes mobile se beneficiam de um BFF.']],
  front: `Se um front faz cinco chamadas e junta os dados no navegador, um BFF pode transformar isso numa chamada só, com menos latência e menos orquestração no cliente.`,
  ex: { lang: 'typescript', code: `// BFF: uma rota pronta para a tela "Meu pedido"
app.get("/bff/tela-pedido/:id", async (req, res) => {
  const pedido = await pedidosApi.get(req.params.id);
  const [cliente, rastreio] = await Promise.all([
    clientesApi.get(pedido.clienteId),
    entregasApi.rastreio(pedido.id),
  ]);
  res.json({ pedido, cliente: { nome: cliente.nome }, rastreio });
});` },
  docs: [['microservices.io · API Gateway / BFF', 'https://microservices.io/patterns/apigateway.html'], ['Sam Newman · Backends For Frontends', 'https://samnewman.io/patterns/architectural/bff/'], ['Cloudflare · O que é um API gateway', 'https://www.cloudflare.com/learning/security/api/what-is-an-api-gateway/']],
  perguntas: [`Que responsabilidades saem dos serviços e vão para o gateway?`, `Quando faz sentido ter um BFF por plataforma?`, `Como um BFF ajuda a não guardar tokens no navegador?`] },

{ id: 'eventos', stage: 'distribuidos', level: 'aprofundar', title: 'Arquitetura orientada a eventos', short: 'Eventos',
  resumo: `Serviços que reagem a fatos publicados ("PedidoPago") em vez de chamar uns aos outros.`,
  porque: `Reduz o acoplamento entre serviços e é a base de sistemas grandes. Também traz consistência eventual, o que muda como o front mostra estados ("processando...").`,
  como: [
    `Em vez de o serviço de Pedidos chamar Estoque, E-mail e Fiscal, ele publica o evento <code>PedidoPago</code> e cada interessado reage. Adicionar um novo consumidor não exige mudar o produtor.`,
    `Padrões relacionados: <b>outbox</b> (grava o evento na mesma transação do dado e publica depois, para não perder eventos); <b>saga</b> (uma transação longa entre serviços, com ações de compensação, como estornar o pagamento se o estoque falhar); <b>event sourcing</b> (o estado é a soma dos eventos); e <b>CQRS</b> (modelos separados para escrita e leitura).`,
  ],
  conecta: [['filas', 'Brokers transportam os eventos.'], ['microsservicos', 'Forma de integrar serviços sem chamadas diretas.'], ['idempotencia', 'Eventos podem chegar repetidos ou fora de ordem.'], ['cap', 'O resultado é consistência eventual.'], ['ddd', 'Domain events nascem da modelagem do negócio.']],
  front: `Consistência eventual significa que logo após pagar, outra tela pode ainda mostrar "pendente". Atualização otimista na interface e notificações em tempo real ajudam nessa experiência.`,
  ex: { lang: 'json', code: `{
  "type": "PedidoPago",
  "id": "evt_01JAB3",
  "occurredAt": "2026-10-15T14:03:22Z",
  "data": { "pedidoId": 981, "clienteId": 7, "total": 199.9 }
}
// consumidores: Estoque (dá baixa), Fiscal (emite nota), Notificações (envia e-mail)` },
  docs: [['Martin Fowler · What do you mean by "Event-Driven"?', 'https://martinfowler.com/articles/201701-event-driven.html'], ['microservices.io · Transactional Outbox', 'https://microservices.io/patterns/data/transactional-outbox.html'], ['microservices.io · Saga', 'https://microservices.io/patterns/data/saga.html']],
  perguntas: [`Que problema o padrão outbox resolve?`, `Como uma saga desfaz algo que já aconteceu em outro serviço?`, `Como mostrar consistência eventual para o usuário sem confundi-lo?`] },

{ id: 'idempotencia', stage: 'distribuidos', level: 'importante', title: 'Idempotência e retries', short: 'Idempotência',
  resumo: `Garantir que repetir a mesma operação não cause efeitos duplicados.`,
  porque: `Redes falham e clientes tentam de novo. Sem idempotência, um timeout vira cobrança em dobro ou pedido duplicado.`,
  como: [
    `Uma operação é <b>idempotente</b> quando executá-la uma ou dez vezes deixa o sistema no mesmo estado. GET, PUT e DELETE são por definição; POST não. Para tornar um POST seguro, o cliente envia uma <b>Idempotency-Key</b> única, e o servidor guarda o resultado da primeira execução e o devolve nas repetições.`,
    `Retries devem usar <b>backoff exponencial com jitter</b> (esperas crescentes e aleatórias) para não sincronizar milhares de clientes, e só em erros transitórios (timeout, 503), nunca em 400. <b>Timeouts</b> em toda chamada externa e <b>circuit breaker</b> (parar de chamar um serviço que está falhando) completam o conjunto.`,
  ],
  conecta: [['http', 'A semântica dos métodos define quais são idempotentes.'], ['filas', 'Entrega at-least-once exige consumidores idempotentes.'], ['race', 'Duas tentativas simultâneas são uma race condition.'], ['eventos', 'Eventos duplicados precisam ser ignorados.'], ['transacoes', 'Guardar a chave e o resultado na mesma transação.']],
  front: `Gere a Idempotency-Key no front quando o usuário inicia o checkout e reutilize-a nas tentativas. Assim, duplo clique ou retry automático não cobram duas vezes.`,
  ex: { lang: 'typescript', code: `app.post("/pagamentos", async (req, res) => {
  const chave = req.header("Idempotency-Key");
  const anterior = await idem.buscar(chave);
  if (anterior) return res.status(anterior.status).json(anterior.body);

  const resultado = await cobrar(req.body);
  await idem.salvar(chave, { status: 201, body: resultado }, { ttlHoras: 24 });
  res.status(201).json(resultado);
});` },
  docs: [['Stripe · Designing robust APIs with idempotency', 'https://stripe.com/blog/idempotency'], ['Stripe · Idempotent requests', 'https://docs.stripe.com/api/idempotent_requests'], ['AWS Builders\' Library · Timeouts, retries e backoff', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/']],
  perguntas: [`Por que retry sem backoff pode derrubar um serviço que está se recuperando?`, `Como funciona uma Idempotency-Key?`, `Em quais status codes faz sentido tentar de novo?`] },

{ id: 'cap', stage: 'distribuidos', level: 'aprofundar', title: 'Consistência e teorema CAP', short: 'CAP',
  resumo: `Os limites de sistemas distribuídos: consistência, disponibilidade e falhas de rede.`,
  porque: `Explica por que sistemas grandes às vezes mostram dados desatualizados e por que não existe banco distribuído perfeito. É a base para entender as escolhas de bancos e arquiteturas.`,
  como: [
    `O <b>teorema CAP</b> diz que, quando a rede se divide (<b>P</b>artição), um sistema distribuído precisa escolher entre <b>C</b>onsistência (todos veem o mesmo dado, ou recebem erro) e <b>D</b>isponibilidade (sempre responde, talvez com dado antigo). Como partições acontecem, a escolha real é entre C e A durante a falha.`,
    `O <b>PACELC</b> completa: mesmo sem partição, há uma troca entre <b>latência</b> e <b>consistência</b>. <b>Consistência eventual</b> (as réplicas convergem depois) é comum em caches, réplicas de leitura e eventos. Para aprofundar: replicação líder-seguidor, quorum, consenso (Raft) e relógios.`,
  ],
  conecta: [['escala', 'Réplicas trazem os problemas de consistência.'], ['nosql', 'Cada banco distribuído faz sua escolha no CAP.'], ['eventos', 'Sistemas com eventos são eventualmente consistentes.'], ['transacoes', 'ACID num só banco; outro mundo entre vários.']],
  front: `"Salvei e a lista não mostra" pode ser leitura numa réplica atrasada. Uma solução comum é read-your-writes: depois de escrever, o front usa a resposta do POST, ou a API lê do banco primário.`,
  ex: { lang: 'diagrama', code: `          partição de rede
  [Réplica A] ----X---- [Réplica B]
   saldo = 100           saldo = 100
   cliente 1 grava       cliente 2 lê em B
   saldo = 50

  Escolha CP: B recusa a leitura (erro) até a rede voltar
  Escolha AP: B responde saldo = 100 (antigo) e converge depois` },
  docs: [['Designing Data-Intensive Applications', 'https://dataintensive.net/'], ['Martin Fowler · Patterns of Distributed Systems', 'https://martinfowler.com/articles/patterns-of-distributed-systems/'], ['Raft · visualização do consenso', 'https://raft.github.io/']],
  perguntas: [`Por que, na prática, a escolha é entre C e A durante uma partição?`, `O que é consistência eventual?`, `Como garantir que o usuário veja o que acabou de salvar?`] },
]
