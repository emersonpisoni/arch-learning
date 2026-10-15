import type { Topic } from '../../../types'

export const casos: Topic[] = [
{ id: 'case-encurtador', stage: 'casos', level: 'essencial', title: 'Caso: encurtador de URL', short: 'Encurtador',
  resumo: `O "hello world" do system design: gerar códigos curtos e redirecionar muito rápido.`,
  porque: `Parece simples, mas exercita estimativas, geração de ids únicos, leitura muito maior que escrita, cache e escolha de banco. É o caso mais usado para aprender o roteiro de uma entrevista de system design.`,
  como: [
    `<b>Requisitos</b>: criar link curto, redirecionar, expiração opcional, métricas de clique. <b>Números</b>: 100 milhões de links novos por mês (~40/s) e 100 vezes mais redirecionamentos (~4.000/s, picos bem maiores). Leitura domina, e a latência do redirecionamento precisa ser mínima.`,
    `<b>Geração do código</b>: base62 de um id sequencial (curto, mas previsível; use um gerador distribuído ou blocos de ids por servidor) ou hash aleatório com verificação de colisão. <b>Armazenamento</b>: chave-valor (código → URL) cabe bem em DynamoDB, Cassandra ou Postgres. <b>Leitura</b>: cache (Redis) e até CDN para os links mais acessados. Cliques vão para uma fila e são agregados de forma assíncrona. Redirecionamento <code>301</code> é cacheado pelo navegador (menos carga, menos métricas); <code>302</code> sempre passa pelo servidor.`,
  ],
  conecta: [['estimativas', 'O primeiro passo do caso.'], ['cache-distribuido', 'A leitura vive no cache.'], ['backend/nosql', 'Um problema chave-valor clássico.'], ['backend/filas', 'Métricas de clique processadas de forma assíncrona.']],
  front: `O tipo de redirecionamento afeta o que você mede: com 301, o navegador nem volta ao servidor em cliques repetidos, e ferramentas de analytics perdem esses eventos.`,
  ex: { lang: 'texto', code: `POST /links {url}      → gera código "aZ3k9Q" → grava (código → url)
GET  /aZ3k9Q           → cache? → banco → 302 Location: url
                          └─ publica "clique" na fila → agregador → painel

base62: 62^7 ≈ 3,5 trilhões de códigos de 7 caracteres
id 125 → "21"   (base62 de um contador distribuído)` },
  docs: [['System Design Primer · Pastebin / encurtador', 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md'], ['ByteByteGo · Design a URL shortener', 'https://bytebytego.com/courses/system-design-interview/design-a-url-shortener'], ['Twitter · Snowflake (ids distribuídos)', 'https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake']],
  perguntas: [`Por que a escolha entre 301 e 302 importa para o produto?`, `Como gerar códigos únicos com vários servidores sem colisão?`, `Onde fica o gargalo se um link viralizar?`] },

{ id: 'case-chat', stage: 'casos', level: 'importante', title: 'Caso: chat em tempo real', short: 'Chat',
  resumo: `Mensagens entregues em tempo real, com histórico, presença e entrega confiável.`,
  porque: `Combina conexões persistentes, roteamento entre servidores, ordenação de mensagens e armazenamento de alto volume de escrita. É um ótimo exercício de tudo que a etapa de comunicação ensina.`,
  como: [
    `Clientes mantêm uma conexão <b>WebSocket</b> com um servidor de chat. Como usuários de uma conversa estão em servidores diferentes, as mensagens passam por um <b>pub/sub</b> (Redis, Kafka) que entrega ao servidor de cada destinatário. Um <b>serviço de presença</b> registra quem está online com heartbeats e TTL.`,
    `<b>Ordenação</b>: ids crescentes por conversa (ou timestamps do servidor) e o cliente reordena. <b>Entrega confiável</b>: a mensagem é gravada antes de ser confirmada, o cliente envia um id próprio para evitar duplicatas e, ao reconectar, pede tudo depois do último id recebido. Usuários offline recebem push. Histórico vai para um banco com muita escrita, particionado por conversa (Cassandra, ScyllaDB, DynamoDB).`,
  ],
  conecta: [['backend/realtime', 'WebSocket e SSE.'], ['sincrono-assincrono', 'Pub/sub entre servidores.'], ['particionamento', 'Histórico particionado por conversa.'], ['backend/idempotencia', 'Ids de cliente evitam mensagens duplicadas.'], ['case-notificacoes', 'Push para quem está offline.']],
  front: `No cliente: atualização otimista (a mensagem aparece na hora, marcada como "enviando"), reconexão com backoff, pedir as mensagens perdidas após reconectar e deduplicar por id.`,
  ex: { lang: 'texto', code: `[Ana]──ws──>[Chat 1]                [Chat 2]<──ws──[Bruno]
               │ 1. grava (conversa 42, msg 1001)     ▲
               │ 2. publica em "conversa:42"          │ 3. entrega
               └──────────────> [Pub/Sub] ────────────┘
Bruno offline? → serviço de notificações → push no celular
Ao reconectar: GET /conversas/42/mensagens?depois=1000` },
  docs: [['ByteByteGo · Design a chat system', 'https://bytebytego.com/courses/system-design-interview/design-a-chat-system'], ['Discord · How Discord stores trillions of messages', 'https://discord.com/blog/how-discord-stores-trillions-of-messages'], ['Slack · Real-time messaging', 'https://slack.engineering/real-time-messaging/']],
  perguntas: [`Como entregar uma mensagem quando remetente e destinatário estão em servidores diferentes?`, `O que o cliente deve fazer ao reconectar?`, `Como evitar mensagens duplicadas quando o envio é repetido?`] },

{ id: 'case-feed', stage: 'casos', level: 'importante', title: 'Caso: feed de notícias', short: 'Feed',
  resumo: `Montar a linha do tempo de cada usuário a partir de quem ele segue.`,
  porque: `É o exemplo clássico do trade-off entre trabalho na escrita e trabalho na leitura, e do problema das celebridades com milhões de seguidores.`,
  como: [
    `<b>Fan-out na leitura</b> (pull): ao abrir o feed, busca os posts recentes de todos que o usuário segue e ordena. Simples, mas lento para quem segue muita gente. <b>Fan-out na escrita</b> (push): ao publicar, o post é inserido na "caixa" de feed de cada seguidor (em cache). A leitura fica instantânea, mas uma celebridade com 50 milhões de seguidores gera 50 milhões de escritas.`,
    `A solução comum é <b>híbrida</b>: push para usuários comuns e pull para celebridades, mesclados na leitura. Ranking (relevância em vez de ordem cronológica), paginação por cursor e mídia na CDN completam o desenho.`,
  ],
  conecta: [['cache-distribuido', 'Feeds pré-calculados vivem em cache.'], ['backend/filas', 'O fan-out na escrita roda em workers.'], ['estimativas', 'O número de seguidores define a estratégia.'], ['backend/rest', 'Paginação por cursor.']],
  front: `Scroll infinito com paginação por cursor, prefetch da próxima página e posts novos aparecendo num aviso "ver 5 novos" (em vez de empurrar o conteúdo enquanto a pessoa lê).`,
  ex: { lang: 'texto', code: `Push (fan-out na escrita)
  Ana publica → worker → insere post em feed:bruno, feed:carla, ... (cache)
  Bruno abre o feed → lê feed:bruno pronto            (rápido)

Pull (fan-out na leitura)
  Bruno abre o feed → busca posts de quem ele segue → ordena  (lento se seguir muitos)

Híbrido
  feed:bruno (push dos comuns) + posts recentes das celebridades (pull) → mescla` },
  docs: [['ByteByteGo · Design a news feed system', 'https://bytebytego.com/courses/system-design-interview/design-a-news-feed-system'], ['System Design Primer · Twitter timeline', 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/twitter/README.md'], ['Meta Engineering · Recomendações do Instagram Explore', 'https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/']],
  perguntas: [`Qual a diferença de custo entre fan-out na escrita e na leitura?`, `Por que celebridades exigem um tratamento especial?`, `Como mostrar posts novos sem atrapalhar a leitura?`] },

{ id: 'case-checkout', stage: 'casos', level: 'essencial', title: 'Caso: checkout de e-commerce', short: 'Checkout',
  resumo: `Fechar um pedido envolvendo estoque, pagamento e notificações sem perder dinheiro nem vender o que não tem.`,
  porque: `Junta quase tudo das trilhas: transações, idempotência, race conditions, integração com gateway externo, sagas e consistência eventual. Erros aqui custam dinheiro de verdade.`,
  como: [
    `Fluxo típico: <b>reservar estoque</b> (com prazo de expiração), <b>autorizar pagamento</b> no gateway com <b>idempotency key</b>, <b>confirmar o pedido</b> e só então disparar de forma assíncrona e-mail, nota fiscal e logística. Se o pagamento falha, a reserva é liberada (compensação de uma <b>saga</b>).`,
    `Cuidados: o gateway pode responder com timeout mesmo tendo cobrado, então consulte o status antes de tentar de novo; webhooks do gateway chegam fora de ordem e repetidos; a baixa de estoque precisa ser atômica; e o preço deve ser recalculado no servidor, nunca confiado ao valor enviado pelo navegador.`,
  ],
  conecta: [['backend/idempotencia', 'Cobrança nunca pode duplicar.'], ['backend/race', 'Dois clientes disputando o último item.'], ['backend/eventos', 'Saga e eventos pós-pagamento.'], ['resiliencia', 'Gateway externo lento ou fora do ar.'], ['backend/transacoes', 'Reserva e pedido consistentes.']],
  front: `O front gera a idempotency key ao iniciar o pagamento, desabilita o botão durante o envio, trata "pagamento em análise" como um estado real e nunca envia o preço como fonte da verdade.`,
  ex: { lang: 'texto', code: `[Front] POST /checkout (Idempotency-Key: k-81f2)
   │
   ▼
1. reservar estoque (expira em 15 min)     ── falhou → "produto esgotado"
2. autorizar pagamento (gateway, mesma key) ── recusou → liberar reserva
                                            ── timeout → consultar status antes de repetir
3. confirmar pedido + gravar evento PedidoPago (outbox)
4. assíncrono: e-mail · nota fiscal · separação no estoque
Webhook do gateway: idempotente, aceita repetidos e fora de ordem` },
  docs: [['Stripe · Idempotent requests', 'https://docs.stripe.com/api/idempotent_requests'], ['Stripe · Webhooks: boas práticas', 'https://docs.stripe.com/webhooks#best-practices'], ['microservices.io · Saga', 'https://microservices.io/patterns/data/saga.html']],
  perguntas: [`O que fazer quando o gateway responde com timeout?`, `Por que o preço precisa ser recalculado no servidor?`, `Como liberar o estoque reservado se o usuário abandonar o pagamento?`] },

{ id: 'case-notificacoes', stage: 'casos', level: 'importante', title: 'Caso: sistema de notificações', short: 'Notificações',
  resumo: `Enviar e-mail, push, SMS e avisos no app para milhões de usuários, respeitando preferências.`,
  porque: `Quase todo produto tem notificações, e elas costumam começar como um "envia um e-mail aqui" espalhado pelo código. Um desenho centralizado evita spam, duplicatas e falhas silenciosas.`,
  como: [
    `Serviços publicam eventos ("pedido enviado"); um <b>serviço de notificações</b> decide quem notificar, por quais canais (consultando <b>preferências</b> e horários de silêncio), monta o conteúdo a partir de <b>templates</b> e coloca mensagens em <b>filas por canal</b>. Workers entregam via provedores (SES, FCM/APNs, Twilio).`,
    `Requisitos não óbvios: <b>deduplicação</b> (o mesmo evento não gera dois pushes), <b>rate limit</b> por usuário, retry com dead-letter queue, prioridade (código de login antes de marketing), rastreamento de entrega e abertura, e descadastro obrigatório por lei para e-mails de marketing.`,
  ],
  conecta: [['backend/filas', 'Uma fila por canal isola falhas de provedores.'], ['backend/eventos', 'Eventos de negócio disparam notificações.'], ['backend/rate-limit', 'Evitar bombardear o usuário.'], ['case-chat', 'Push para quem está offline.'], ['mobile/push', 'A entrega no aparelho via APNs e FCM.']],
  front: `A central de notificações no app (com "lidas" e "não lidas"), o pedido de permissão de push no momento certo e a tela de preferências fazem parte desse sistema.`,
  ex: { lang: 'texto', code: `[Pedidos] ─evento PedidoEnviado─┐
[Contas]  ─evento LoginNovo─────┤
                                ▼
                    [Serviço de notificações]
                     preferências · templates · dedupe · rate limit
                       │            │             │
                 [fila e-mail] [fila push]   [fila in-app]
                       ▼            ▼             ▼
                     SES        FCM/APNs     banco + SSE` },
  docs: [['ByteByteGo · Design a notification system', 'https://bytebytego.com/courses/system-design-interview/design-a-notification-system'], ['Firebase Cloud Messaging', 'https://firebase.google.com/docs/cloud-messaging'], ['MDN · Push API', 'https://developer.mozilla.org/en-US/docs/Web/API/Push_API']],
  perguntas: [`Por que separar uma fila por canal?`, `Como evitar que o mesmo evento gere duas notificações?`, `Quando pedir permissão de push ao usuário?`] },
]
