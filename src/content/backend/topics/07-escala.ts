import type { Topic } from '../../../types'

export const escala: Topic[] = [
{ id: 'cache', stage: 'escala', level: 'essencial', title: 'Cache', short: 'Cache',
  resumo: `Guardar resultados para não recalcular nem buscar tudo de novo.`,
  porque: `É a forma mais barata de ganhar performance e aguentar mais carga. Também é fonte clássica de bugs do tipo "atualizei e o usuário ainda vê o dado antigo".`,
  como: [
    `Camadas de cache: <b>navegador</b> (headers <code>Cache-Control</code> e <code>ETag</code>), <b>CDN</b> (cópias perto do usuário), <b>aplicação</b> (Redis ou memória) e <b>banco</b> (buffers internos). Quanto mais perto do usuário, mais rápido e mais difícil de invalidar.`,
    `Padrão mais comum: <b>cache-aside</b>. Lê do cache; se não encontrar (miss), busca no banco e grava com <b>TTL</b>; quando o dado muda, apaga a chave. Problemas a conhecer: <b>invalidação</b>, <b>cache stampede</b> (milhares de requisições batendo no banco quando a chave expira) e dados de um usuário vazando num cache compartilhado.`,
  ],
  conecta: [['http', 'Cache-Control e ETag definem o cache do navegador e da CDN.'], ['nosql', 'Redis é a escolha padrão para cache de aplicação.'], ['indices', 'Uma query rápida dispensa muito cache.'], ['escala', 'Cache reduz a carga em banco e servidores.'], ['fundamentos/hash-tables', 'Um cache em memória é uma tabela hash.']],
  front: `React Query e SWR são cache no cliente com stale-while-revalidate, o mesmo conceito do header HTTP. Assets com hash no nome podem ter cache de um ano (<code>immutable</code>).`,
  ex: { lang: 'typescript', code: `async function buscarProduto(id: number) {
  const chave = "produto:" + id;
  const emCache = await redis.get(chave);
  if (emCache) return JSON.parse(emCache);                         // hit

  const produto = await db.produto.findUnique({ where: { id } });  // miss
  await redis.set(chave, JSON.stringify(produto), { EX: 300 });    // TTL de 5 min
  return produto;
}
// ao atualizar o produto: await redis.del("produto:" + id)` },
  docs: [['MDN · HTTP caching', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching'], ['Cloudflare · O que é uma CDN', 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/'], ['AWS · Visão geral de caching', 'https://aws.amazon.com/caching/']],
  perguntas: [`Como funciona o cache-aside?`, `Como evitar o cache stampede?`, `Que tipo de resposta nunca deve ficar numa CDN?`] },

{ id: 'escala', stage: 'escala', level: 'essencial', title: 'Escala horizontal e stateless', short: 'Escala',
  resumo: `Aguentar mais carga com máquinas maiores ou com mais máquinas.`,
  porque: `Todo sistema que cresce passa por isso. Manter a aplicação stateless desde cedo decide se escalar vai ser fácil ou vai exigir uma reescrita.`,
  como: [
    `<b>Vertical</b> (scale up): máquina com mais CPU e memória. É simples, mas tem limite e continua sendo um ponto único de falha. <b>Horizontal</b> (scale out): várias instâncias atrás de um load balancer. Exige uma aplicação <b>stateless</b>: sessão, uploads e cache não podem ficar na memória ou no disco de uma instância.`,
    `Sendo stateless, o <b>autoscaling</b> adiciona e remove instâncias conforme CPU, tamanho da fila ou requisições por segundo. O gargalo costuma passar para o banco, que é escalado com <b>réplicas de leitura</b>, connection pooling e, em último caso, <b>sharding</b>.`,
  ],
  conecta: [['load-balancer', 'Distribui o tráfego entre as instâncias.'], ['cache', 'Estado compartilhado sai da memória e vai para o Redis.'], ['threads', 'Primeiro se usam todos os núcleos de uma máquina.'], ['cap', 'Réplicas de banco trazem consistência eventual.'], ['docker', 'Containers tornam cada instância idêntica e descartável.']],
  front: `Se o login "cai aleatoriamente", pode ser sessão guardada em memória com várias instâncias: cada requisição cai num servidor diferente, e só um deles conhece a sessão.`,
  ex: { lang: 'yaml', code: `# Kubernetes: de 3 a 20 réplicas conforme o uso de CPU
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api-pedidos }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api-pedidos }
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }` },
  docs: [['The Twelve-Factor App · Processes', 'https://12factor.net/processes'], ['System Design Primer', 'https://github.com/donnemartin/system-design-primer'], ['Kubernetes · Horizontal Pod Autoscaling', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/']],
  perguntas: [`O que torna uma aplicação stateful?`, `Por que o banco vira o gargalo quando a API escala?`, `O que é uma réplica de leitura, e o que é replication lag?`] },

{ id: 'load-balancer', stage: 'escala', level: 'essencial', title: 'Load balancer', short: 'Load balancer',
  resumo: `Distribui requisições entre várias instâncias e tira do ar as que estão com problema.`,
  porque: `Está na frente de praticamente toda aplicação em produção. Erros 502 e 504, sticky sessions e health checks vêm daqui.`,
  como: [
    `Algoritmos: <b>round robin</b> (um para cada, em rodízio), <b>least connections</b> (para quem está menos ocupado) e <b>hash por IP ou chave</b> (o mesmo cliente sempre no mesmo servidor). <b>Health checks</b> chamam algo como <code>/health</code> e retiram instâncias que falham.`,
    `Um balanceador <b>L4</b> (transporte) distribui conexões TCP sem olhar o conteúdo, e é muito rápido. Um <b>L7</b> (aplicação) entende HTTP: roteia por caminho (<code>/api</code> para um serviço, <code>/</code> para o front), termina TLS e adiciona headers. Exemplos: Nginx, HAProxy, AWS ALB e NLB, Envoy.`,
  ],
  conecta: [['escala', 'Sem load balancer não há escala horizontal.'], ['https-tls', 'Costuma ser onde o TLS termina.'], ['redes-infra', 'Fica na subnet pública, protegendo os servidores privados.'], ['dns', 'O domínio aponta para ele.'], ['realtime', 'WebSockets exigem configuração especial.']],
  front: `Um 502 Bad Gateway vem do load balancer quando a instância de trás respondeu mal ou caiu; um 504 Gateway Timeout, quando ela demorou demais. Isso ajuda a saber se o problema está na API ou na infra.`,
  ex: { lang: 'nginx', code: `upstream api {
    least_conn;
    server 10.0.1.11:3000;
    server 10.0.1.12:3000;
    server 10.0.1.13:3000 backup;
}

server {
    listen 443 ssl;
    location /api/ {
        proxy_pass http://api;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}` },
  docs: [['NGINX · HTTP Load Balancing', 'https://nginx.org/en/docs/http/load_balancing.html'], ['Cloudflare · O que é load balancing', 'https://www.cloudflare.com/learning/performance/what-is-load-balancing/'], ['AWS · Elastic Load Balancing', 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html']],
  perguntas: [`Qual a diferença entre um load balancer L4 e um L7?`, `Para que servem os health checks?`, `Por que sticky sessions atrapalham a escala?`] },

{ id: 'filas', stage: 'escala', level: 'importante', title: 'Filas e mensageria', short: 'Filas',
  resumo: `Tirar trabalho do caminho da requisição e processá-lo depois, com segurança.`,
  porque: `Enviar e-mail, gerar PDF, processar pagamento, integrar com sistema lento: tudo isso vai para fila. É assim que sistemas absorvem picos sem cair.`,
  como: [
    `Um <b>produtor</b> publica uma mensagem, um <b>broker</b> (RabbitMQ, SQS, Kafka, Redis) a guarda, e <b>consumidores</b> (workers) a processam no seu ritmo. Se o worker falha, a mensagem volta para a fila (<b>retry</b>) e, depois de N tentativas, vai para uma <b>dead-letter queue</b> para investigação.`,
    `Numa <b>fila</b> (RabbitMQ, SQS), cada mensagem é processada por um consumidor. Num <b>log de eventos</b> (Kafka), as mensagens ficam guardadas e vários grupos leem o mesmo fluxo de forma independente. A maioria garante entrega <b>at-least-once</b>, então os consumidores precisam ser idempotentes.`,
  ],
  conecta: [['async', 'O mesmo princípio de não bloquear, entre processos.'], ['idempotencia', 'Mensagens podem chegar mais de uma vez.'], ['eventos', 'Filas são o transporte da arquitetura orientada a eventos.'], ['microsservicos', 'Desacoplam serviços que não precisam responder na hora.']],
  front: `Quando a API responde <code>202 Accepted</code> com um id de job, o trabalho foi para a fila. O front acompanha por polling, SSE ou WebSocket até terminar.`,
  ex: { lang: 'typescript', code: `// API: responde rápido e enfileira o trabalho
app.post("/relatorios", async (req, res) => {
  const job = await fila.add("gerar-relatorio", { mes: req.body.mes });
  res.status(202).json({ jobId: job.id });
});

// worker em outro processo (BullMQ + Redis)
new Worker("gerar-relatorio", async (job) => {
  const pdf = await gerarPdf(job.data.mes);
  await storage.upload(pdf);
}, { connection });` },
  docs: [['RabbitMQ · Tutoriais', 'https://www.rabbitmq.com/tutorials'], ['Apache Kafka · Introdução', 'https://kafka.apache.org/intro'], ['AWS · Amazon SQS', 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html'], ['BullMQ', 'https://docs.bullmq.io/']],
  perguntas: [`O que é uma dead-letter queue?`, `Qual a diferença entre RabbitMQ e Kafka no modelo de consumo?`, `Por que entrega at-least-once exige consumidores idempotentes?`] },

{ id: 'rate-limit', stage: 'escala', level: 'importante', title: 'Rate limiting', short: 'Rate limiting',
  resumo: `Limitar quantas requisições um cliente pode fazer num intervalo de tempo.`,
  porque: `Protege contra abuso, força bruta no login, scrapers e clientes com bug em loop, e impede que um cliente derrube o serviço para todos os outros.`,
  como: [
    `Algoritmos: <b>fixed window</b> (100 por minuto, zerando a cada minuto); <b>sliding window</b> (mais justo nas bordas); <b>token bucket</b> (tokens recarregam a uma taxa fixa e permitem pequenas rajadas). Com várias instâncias, o contador fica centralizado (Redis) ou no gateway.`,
    `Ao exceder o limite, a API responde <b>429 Too Many Requests</b> com <code>Retry-After</code>. Os limites podem ser por IP, usuário, chave de API ou rota; o login costuma ter um limite bem mais rígido.`,
  ],
  conecta: [['gateway', 'Lugar mais comum para aplicar limites.'], ['owasp', 'Defesa contra força bruta e consumo excessivo.'], ['http', 'Usa o status 429 e o header Retry-After.'], ['cache', 'Contadores distribuídos costumam viver no Redis.']],
  front: `Ao receber 429, respeite o <code>Retry-After</code> e use backoff exponencial em vez de tentar de novo imediatamente. Debounce em campos de busca evita bater no limite.`,
  ex: { lang: 'http', code: `HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 30` },
  docs: [['Stripe · Scaling your API with rate limiters', 'https://stripe.com/blog/rate-limiters'], ['Cloudflare · O que é rate limiting', 'https://www.cloudflare.com/learning/bots/what-is-rate-limiting/'], ['MDN · 429 Too Many Requests', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429']],
  perguntas: [`Como o token bucket permite rajadas?`, `Onde guardar os contadores com 10 instâncias da API?`, `O que o cliente deve fazer ao receber 429?`] },
]
