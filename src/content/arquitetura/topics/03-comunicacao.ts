import type { Topic } from '../../../types'

export const comunicacao: Topic[] = [
{ id: 'sincrono-assincrono', stage: 'comunicacao', level: 'essencial', title: 'Comunicação síncrona e assíncrona', short: 'Sync × async',
  resumo: `Esperar a resposta agora ou publicar algo para ser tratado depois.`,
  porque: `É uma das escolhas que mais influenciam a resiliência de um sistema. Chamadas síncronas em cadeia fazem a falha de um serviço derrubar todos; comunicação assíncrona isola falhas, mas complica consistência e depuração.`,
  como: [
    `<b>Síncrona</b> (HTTP, gRPC): quem chama espera a resposta. É simples e dá resposta imediata, mas cria <b>acoplamento temporal</b>, e a latência e a disponibilidade da cadeia se multiplicam: cinco serviços com 99,9% cada resultam em cerca de 99,5% no total.`,
    `<b>Assíncrona</b> (filas, eventos): quem publica não espera. Absorve picos, isola falhas e permite novos consumidores sem mudar o produtor, mas exige lidar com consistência eventual, mensagens duplicadas e fora de ordem, e tracing entre etapas. Regra prática: síncrono quando o usuário precisa da resposta agora; assíncrono para o que pode acontecer depois.`,
  ],
  conecta: [['backend/filas', 'O transporte da comunicação assíncrona.'], ['backend/eventos', 'Eventos como forma de integração.'], ['resiliencia', 'Padrões para tornar chamadas síncronas seguras.'], ['acoplamento-coesao', 'Assíncrono reduz o acoplamento temporal.']],
  front: `Um checkout que confirma o pedido na hora (síncrono) e envia o e-mail e a nota fiscal depois (assíncrono) é exatamente essa divisão. Na tela, isso aparece como "pedido recebido, você receberá a confirmação por e-mail".`,
  ex: { lang: 'texto', code: `Síncrono em cadeia (disponibilidades se multiplicam)
[Front] → [Pedidos] → [Estoque] → [Pagamento] → [Fraude]
 99,9% × 99,9% × 99,9% × 99,9% ≈ 99,6%    latência = soma de todas

Misto
[Front] → [Pedidos] → [Pagamento]          (precisa da resposta agora)
              └─ evento PedidoPago → fila → [Estoque] [E-mail] [Nota fiscal]` },
  docs: [['microservices.io · Messaging', 'https://microservices.io/patterns/communication-style/messaging.html'], ['Microsoft · Comunicação entre serviços', 'https://learn.microsoft.com/en-us/azure/architecture/microservices/design/interservice-communication'], ['Enterprise Integration Patterns', 'https://www.enterpriseintegrationpatterns.com/']],
  perguntas: [`Que chamada síncrona do seu sistema poderia virar assíncrona?`, `Por que a disponibilidade de uma cadeia síncrona é menor que a de cada serviço?`, `Como mostrar ao usuário que algo está sendo processado em segundo plano?`] },

{ id: 'evolucao-apis', stage: 'comunicacao', level: 'essencial', title: 'Evolução e versionamento de APIs', short: 'Evolução de APIs',
  resumo: `Mudar uma API sem quebrar quem já a usa.`,
  porque: `APIs vivem mais que o código que as implementa. Front, apps móveis antigos e parceiros externos dependem delas. Saber evoluir sem quebrar é o que permite que times façam deploy de forma independente.`,
  como: [
    `Mudanças <b>compatíveis</b>: adicionar campos opcionais, novos endpoints, novos valores tratados com tolerância. <b>Incompatíveis</b>: remover ou renomear campos, mudar tipos ou significado, tornar algo obrigatório. Clientes devem seguir o princípio da <b>robustez</b>: ignorar campos desconhecidos.`,
    `Para mudanças incompatíveis: <b>nova versão</b> (na URL, no header ou por media type), período de convivência, <b>depreciação</b> comunicada (header <code>Deprecation</code>/<code>Sunset</code>) e métricas de uso da versão antiga antes de desligar. Apps móveis exigem janelas longas, porque versões antigas continuam instaladas.`,
  ],
  conecta: [['backend/rest', 'Onde o versionamento costuma aparecer.'], ['backend/contratos', 'Contratos detectam quebras automaticamente.'], ['strangler', 'Migrações dependem de manter contratos.'], ['praticas/versionamento-semantico', 'SemVer comunica o tipo de mudança.'], ['mobile/ota-versoes', 'Apps antigos continuam chamando a API por meses.']],
  front: `Se o front e a API são publicados em momentos diferentes, durante alguns minutos a versão nova de um conversa com a versão antiga do outro. Mudanças compatíveis evitam quebras nessa janela.`,
  ex: { lang: 'http', code: `# compatível: campo novo e opcional
{ "id": 981, "status": "PAGO", "pagoEm": "2026-10-15T14:03:22Z" }

# incompatível: renomear status → situacao (quebra clientes)
# alternativa: manter os dois durante a transição e avisar
HTTP/1.1 200 OK
Deprecation: @1767225600
Sunset: Thu, 01 Jan 2027 00:00:00 GMT
Link: <https://api.loja.com/docs/migracao-v2>; rel="deprecation"` },
  docs: [['Google AIP-180 · Compatibilidade', 'https://google.aip.dev/180'], ['RFC 8594 · Header Sunset', 'https://www.rfc-editor.org/rfc/rfc8594'], ['Stripe · Versionamento de APIs', 'https://stripe.com/blog/api-versioning']],
  perguntas: [`Que mudança recente na API quebrou o front do seu time?`, `Como saber se alguém ainda usa um campo antes de removê-lo?`, `Por que apps móveis exigem janelas de depreciação maiores?`] },

{ id: 'resiliencia', stage: 'comunicacao', level: 'essencial', title: 'Padrões de resiliência', short: 'Resiliência',
  resumo: `Timeout, retry, circuit breaker, bulkhead e fallback para conviver com falhas.`,
  porque: `Em sistemas distribuídos, falhas parciais são normais. Sem esses padrões, um serviço lento consome todas as threads de quem o chama e a falha se espalha em cascata pelo sistema inteiro.`,
  como: [
    `<b>Timeout</b> em toda chamada de rede, sempre. <b>Retry</b> só para erros transitórios, com backoff exponencial e jitter, e só em operações idempotentes. <b>Circuit breaker</b>: após muitas falhas, para de chamar por um tempo e falha rápido, depois testa de novo (estados fechado, aberto e meio-aberto).`,
    `<b>Bulkhead</b>: isolar recursos (pools de conexão separados por dependência) para que um problema não esgote tudo. <b>Fallback</b> e <b>degradação graciosa</b>: responder com cache, um valor padrão ou sem a parte opcional (a página do produto abre sem as recomendações). <b>Load shedding</b>: recusar parte das requisições para atender bem as outras.`,
  ],
  conecta: [['backend/idempotencia', 'Retries seguros exigem idempotência.'], ['sincrono-assincrono', 'Chamadas síncronas são onde esses padrões mais importam.'], ['devops/service-mesh', 'O mesh pode aplicar retries e circuit breaking.'], ['devops/chaos', 'Experimentos de caos verificam se os padrões funcionam.']],
  front: `O front também precisa disso: timeout no fetch com <code>AbortController</code>, retry com backoff no React Query e fallback de interface quando uma parte da página falha (error boundaries).`,
  ex: { lang: 'typescript', code: `// timeout + retry com backoff e jitter, só para erros transitórios
async function chamar(url: string, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return res;                 // 4xx não adianta repetir
    } catch { /* timeout ou erro de rede */ }
    const espera = 2 ** i * 200 + Math.random() * 100;  // 200, 400, 800 ms + jitter
    await new Promise((r) => setTimeout(r, espera));
  }
  return fallback();   // ex.: recomendações em cache ou seção oculta
}` },
  docs: [['Microsoft · Circuit Breaker', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker'], ['Microsoft · Bulkhead', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead'], ['AWS Builders\' Library · Timeouts, retries e backoff', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/'], ['Resilience4j', 'https://resilience4j.readme.io/docs/getting-started']],
  perguntas: [`Que chamada do seu sistema não tem timeout configurado?`, `O que a página principal do produto deveria mostrar se uma dependência opcional falhar?`, `Por que retries sem limite podem derrubar um serviço?`] },

{ id: 'service-discovery', stage: 'comunicacao', level: 'importante', title: 'Descoberta de serviços e configuração', short: 'Service discovery',
  resumo: `Como serviços encontram uns aos outros quando instâncias aparecem e somem o tempo todo.`,
  porque: `Com autoscaling e containers, IPs mudam constantemente. Algo precisa responder "onde está o serviço de pagamentos agora?", e configurações precisam mudar sem novo deploy.`,
  como: [
    `<b>Descoberta no servidor</b>: o cliente chama um nome estável (load balancer ou Service do Kubernetes) e a infraestrutura escolhe a instância. <b>Descoberta no cliente</b>: o cliente consulta um registro (Consul, Eureka) e escolhe. Em Kubernetes, DNS interno e Services resolvem a maior parte dos casos.`,
    `<b>Configuração centralizada</b> (Consul KV, AWS AppConfig, ConfigMaps) e <b>feature flags</b> permitem mudar comportamento sem redeploy. Cuidado: configuração também é código; mudanças erradas causam incidentes e devem ser versionadas e auditadas.`,
  ],
  conecta: [['devops/k8s-rede', 'Services e DNS interno do Kubernetes.'], ['backend/load-balancer', 'Descoberta no servidor via load balancer.'], ['backend/dns', 'O DNS é a forma mais simples de descoberta.'], ['devops/service-mesh', 'O mesh também resolve descoberta e roteamento.']],
  front: `As variáveis de ambiente com a URL da API e o serviço de feature flags que o front consulta são as versões mais simples de descoberta e configuração.`,
  ex: { lang: 'texto', code: `Descoberta no servidor (mais comum hoje)
  [api-pedidos] ──http://pagamentos──> [Service/LB] ──> instância 10.1.4.7
                                                    └─> instância 10.1.9.2

Descoberta no cliente
  [api-pedidos] ──"onde está pagamentos?"──> [Consul]
                <──[10.1.4.7, 10.1.9.2]─────
  [api-pedidos] ──escolhe uma──> 10.1.9.2` },
  docs: [['microservices.io · Service discovery', 'https://microservices.io/patterns/server-side-discovery.html'], ['HashiCorp Consul', 'https://developer.hashicorp.com/consul/docs/intro'], ['Martin Fowler · Feature Toggles', 'https://martinfowler.com/articles/feature-toggles.html']],
  perguntas: [`Como os serviços do seu sistema descobrem uns aos outros?`, `Qual a diferença entre descoberta no cliente e no servidor?`, `Por que mudanças de configuração também podem causar incidentes?`] },
]
