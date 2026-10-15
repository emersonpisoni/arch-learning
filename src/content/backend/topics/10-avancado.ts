import type { Topic } from '../../../types'

export const avancado: Topic[] = [
{ id: 'graceful-shutdown', stage: 'avancado', level: 'importante', title: 'Ciclo de vida do processo e graceful shutdown', short: 'Shutdown',
  resumo: `Iniciar, ficar pronto e encerrar sem derrubar requisições em andamento.`,
  porque: `Em ambientes com deploy contínuo e autoscaling, instâncias sobem e descem o tempo todo. Se o processo não encerra com cuidado, cada deploy derruba requisições, perde mensagens de fila e deixa transações pela metade.`,
  como: [
    `Na <b>subida</b>: carregar configuração, conectar a dependências, aquecer caches e só então sinalizar "pronto" (readiness). No <b>encerramento</b>, ao receber <code>SIGTERM</code>: parar de aceitar novas requisições (marcar como não pronto), esperar as em andamento terminarem com um prazo, parar de consumir filas e devolver mensagens não processadas, fechar conexões com banco e só então sair.`,
    `O orquestrador dá um prazo (no Kubernetes, <code>terminationGracePeriodSeconds</code>, padrão de 30 s) antes de forçar com <code>SIGKILL</code>. Conexões longas (WebSocket, SSE) precisam ser avisadas para reconectar em outra instância. Testar o encerramento sob carga é a única forma de saber que funciona.`,
  ],
  conecta: [['linux', 'Sinais SIGTERM e SIGKILL.'], ['devops/k8s-config', 'Probes e prazos de encerramento.'], ['devops/estrategias-deploy', 'Deploy sem downtime depende disso.'], ['filas', 'Mensagens em processamento não podem se perder.'], ['realtime', 'Conexões longas precisam migrar.']],
  front: `Se cada deploy gera um pico de erros 502 por alguns segundos no front, o backend provavelmente não está encerrando com cuidado.`,
  ex: { lang: 'typescript', code: `const server = app.listen(3000);
let encerrando = false;

app.get("/health/ready", (_req, res) => res.sendStatus(encerrando ? 503 : 200));

process.on("SIGTERM", async () => {
  encerrando = true;                         // load balancer para de mandar tráfego
  await esperar(5_000);                      // tempo para o LB perceber
  server.close(async () => {                 // espera as requisições em andamento
    await worker.close();                    // para de consumir a fila
    await pool.end();                        // fecha conexões com o banco
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 25_000).unref(); // prazo de segurança
});` },
  docs: [['Kubernetes · Pod termination', 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination'], ['Node.js · process signals', 'https://nodejs.org/api/process.html#signal-events'], ['The Twelve-Factor App · Disposability', 'https://12factor.net/disposability']],
  perguntas: [`O que acontece com as requisições em andamento quando a sua API recebe SIGTERM?`, `Por que marcar a instância como não pronta antes de fechar o servidor?`, `Como tratar conexões WebSocket abertas durante um deploy?`] },

{ id: 'backpressure', stage: 'avancado', level: 'importante', title: 'Backpressure e controle de fluxo', short: 'Backpressure',
  resumo: `Impedir que um produtor rápido afogue um consumidor lento.`,
  porque: `Quando dados chegam mais rápido do que podem ser processados, algo cresce sem limite: memória, filas, conexões. Sem backpressure, o sistema não fica só lento: ele cai, e geralmente leva outros junto.`,
  como: [
    `<b>Backpressure</b> é o consumidor sinalizar ao produtor que deve desacelerar. Exemplos: streams do Node (<code>write()</code> retorna <code>false</code> e é preciso esperar o evento <code>drain</code>), pools de conexão com espera limitada, filas com tamanho máximo, limites de concorrência e controle de fluxo do TCP e do HTTP/2.`,
    `Estratégias quando o limite é atingido: <b>esperar</b> (bloquear o produtor), <b>descartar</b> (load shedding, com 503 ou descarte de mensagens menos importantes), <b>amostrar</b> (métricas e logs) ou <b>escalar</b> o consumidor. Toda fila, buffer e pool deve ter um tamanho máximo explícito; uma fila "ilimitada" é apenas um vazamento de memória adiado.`,
  ],
  conecta: [['async', 'Promise.all sem limite é falta de backpressure.'], ['filas', 'Filas absorvem picos, mas precisam de limites.'], ['arquitetura/resiliencia', 'Load shedding é uma forma de backpressure.'], ['dados/pool-conexoes', 'Pools limitam a pressão sobre o banco.']],
  front: `Enviar milhares de eventos de analytics sem lote nem limite, ou disparar uma requisição a cada tecla, é falta de backpressure no cliente; debounce, throttle e lotes resolvem.`,
  ex: { lang: 'typescript', code: `import { pipeline } from "node:stream/promises";
import { createReadStream } from "node:fs";
import { createGzip } from "node:zlib";

// pipeline respeita backpressure: lê só o que o destino consegue receber
await pipeline(createReadStream("export-pedidos.csv"), createGzip(), res);

// limite de concorrência em vez de Promise.all com 10 mil itens
import pLimit from "p-limit";
const limite = pLimit(10);
await Promise.all(pedidos.map((p) => limite(() => enviarNotaFiscal(p))));` },
  docs: [['Node.js · Backpressuring in streams', 'https://nodejs.org/en/learn/modules/backpressuring-in-streams'], ['Reactive Streams', 'https://www.reactive-streams.org/'], ['AWS Builders\' Library · Using load shedding', 'https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/']],
  perguntas: [`Que fila ou buffer do seu sistema não tem tamanho máximo?`, `O que acontece quando um consumidor de fila fica mais lento que o produtor?`, `Quando descartar é melhor do que esperar?`] },

{ id: 'webhooks', stage: 'avancado', level: 'importante', title: 'Webhooks: enviar e receber', short: 'Webhooks',
  resumo: `Avisar outros sistemas sobre eventos por HTTP, e receber avisos com segurança.`,
  porque: `Pagamentos, integrações com parceiros, GitHub e serviços SaaS se comunicam por webhooks. Recebê-los mal gera cobranças duplicadas e brechas de segurança; enviá-los mal gera reclamações de parceiros.`,
  como: [
    `<b>Receber</b>: verifique a <b>assinatura</b> (HMAC com segredo compartilhado) e o timestamp para evitar replay; responda <b>2xx rápido</b> e processe de forma assíncrona; seja <b>idempotente</b> (o mesmo evento pode chegar várias vezes) e não dependa da ordem; e, para dados críticos, confirme consultando a API do emissor.`,
    `<b>Enviar</b>: assine cada evento, faça <b>retries</b> com backoff por horas ou dias, permita que o cliente veja o histórico de entregas e reenvie, use um id único por evento, limite a taxa por destino e proteja contra SSRF (destinos configurados pelo cliente podem apontar para a rede interna).`,
  ],
  conecta: [['idempotencia', 'Eventos repetidos não podem duplicar efeitos.'], ['seguranca/criptografia', 'Assinaturas HMAC.'], ['seguranca/ssrf', 'URLs de destino configuráveis são um risco.'], ['filas', 'Processar e enviar de forma assíncrona.'], ['arquitetura/case-checkout', 'Webhooks de pagamento.']],
  front: `Telas de configuração de webhooks (URL, eventos, segredo, histórico de entregas com botão "reenviar") são comuns em produtos B2B e dependem desse desenho no backend.`,
  ex: { lang: 'typescript', code: `app.post("/webhooks/pagamentos", express.raw({ type: "application/json" }), async (req, res) => {
  const assinatura = req.header("X-Assinatura") ?? "";
  const timestamp = Number(req.header("X-Timestamp"));
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return res.sendStatus(400); // anti-replay
  if (!assinaturaValida(\`\${timestamp}.\${req.body}\`, assinatura, SEGREDO)) return res.sendStatus(401);

  const evento = JSON.parse(req.body.toString());
  const novo = await eventosRecebidos.registrarSeNovo(evento.id);   // idempotência
  if (novo) await fila.add("processar-pagamento", evento);         // processa depois
  res.sendStatus(200);                                              // responde rápido
});` },
  docs: [['Standard Webhooks', 'https://www.standardwebhooks.com/'], ['Stripe · Webhooks', 'https://docs.stripe.com/webhooks'], ['GitHub · Validating webhook deliveries', 'https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries']],
  perguntas: [`Como o seu sistema garante que um webhook recebido veio mesmo do emissor?`, `Por que responder rápido e processar depois?`, `Que risco existe em deixar o cliente configurar a URL de destino?`] },

{ id: 'jobs-agendados', stage: 'avancado', level: 'importante', title: 'Jobs agendados e cron distribuído', short: 'Jobs agendados',
  resumo: `Tarefas periódicas que rodam uma vez só, mesmo com várias instâncias.`,
  porque: `Fechamento diário, limpeza de dados, envio de lembretes e sincronizações são tarefas agendadas. Com várias instâncias, o cron ingênuo roda a mesma tarefa várias vezes; se a instância cair, a tarefa simplesmente não roda.`,
  como: [
    `Opções: um <b>agendador central</b> (CronJob do Kubernetes, EventBridge Scheduler, Cloud Scheduler) que dispara uma execução; filas com <b>jobs repetidos</b> (BullMQ, Sidekiq) que garantem uma execução por período; ou um <b>lock distribuído</b> para que só uma instância execute.`,
    `Boas práticas: jobs <b>idempotentes</b> e com <b>janela de processamento</b> explícita (processar "os pedidos de ontem", não "os últimos 24h a partir de agora"), retomáveis após falha, com timeout e alerta quando não rodam ou falham, e cuidado com fusos horários e horário de verão nos agendamentos.`,
  ],
  conecta: [['filas', 'Jobs repetidos sobre filas.'], ['idempotencia', 'Rodar duas vezes não pode duplicar efeitos.'], ['race', 'Locks distribuídos evitam execução duplicada.'], ['devops/alertas', 'Alertar quando um job não roda.'], ['dados/orquestracao', 'Pipelines de dados agendados.']],
  front: `Funcionalidades como "relatório enviado toda segunda às 9h" ou "lembrete 1 dia antes" dependem de jobs agendados; o fuso do usuário precisa ser considerado.`,
  ex: { lang: 'yaml', code: `# Kubernetes CronJob: uma execução por dia, sem sobreposição
apiVersion: batch/v1
kind: CronJob
metadata: { name: fechamento-diario }
spec:
  schedule: "0 3 * * *"
  timeZone: "America/Sao_Paulo"
  concurrencyPolicy: Forbid          # não começa outra se a anterior ainda roda
  startingDeadlineSeconds: 3600
  jobTemplate:
    spec:
      backoffLimit: 3
      activeDeadlineSeconds: 1800
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: job
              image: ghcr.io/loja/jobs:3f9a2c1
              args: ["fechamento", "--dia", "ontem"]` },
  docs: [['Kubernetes · CronJob', 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/'], ['BullMQ · Repeatable jobs', 'https://docs.bullmq.io/guide/job-schedulers'], ['AWS · EventBridge Scheduler', 'https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html']],
  perguntas: [`Como garantir que um job diário rode exatamente uma vez com três instâncias?`, `Por que processar uma janela explícita em vez de "as últimas 24 horas"?`, `Como você saberia que um job deixou de rodar?`] },

{ id: 'workflows-duraveis', stage: 'avancado', level: 'aprofundar', title: 'Workflows duráveis (Temporal e afins)', short: 'Workflows duráveis',
  resumo: `Processos de negócio longos que sobrevivem a falhas sem perder o estado.`,
  porque: `Fluxos como onboarding de cliente, aprovação de crédito ou um pedido com várias etapas duram horas ou dias e envolvem vários serviços. Implementar isso com filas, cron e tabelas de estado à mão é frágil; motores de workflow durável tornam esse código simples e confiável.`,
  como: [
    `Num motor como <b>Temporal</b> (ou AWS Step Functions, Restate, Inngest), você escreve o workflow como código comum, com esperas, laços e chamadas a <b>atividades</b> (passos com efeito externo). O motor registra cada passo; se o processo cair, o workflow é retomado exatamente de onde parou. Esperar dias por um evento ("aguardar pagamento por até 3 dias") vira uma linha de código.`,
    `Regras: o código do workflow precisa ser <b>determinístico</b> (efeitos e aleatoriedade vão para as atividades), atividades devem ser idempotentes, e mudanças no código exigem versionamento para workflows em andamento. É a forma moderna de implementar <b>sagas</b>.`,
  ],
  conecta: [['eventos', 'Sagas implementadas como workflows.'], ['idempotencia', 'Atividades podem ser repetidas.'], ['jobs-agendados', 'Workflows substituem muitos crons e tabelas de estado.'], ['arquitetura/case-checkout', 'O checkout como workflow durável.']],
  front: `Telas de "acompanhe o status do seu pedido" ou "seu cadastro está em análise" refletem o estado de um workflow longo; o backend pode expor esse estado diretamente.`,
  ex: { lang: 'typescript', code: `// Temporal: workflow como código comum, retomado após qualquer falha
export async function pedidoWorkflow(pedidoId: string) {
  await reservarEstoque(pedidoId);                         // atividade (com retries)

  const pago = await condition(() => pagamentoConfirmado, "3 days"); // espera durável
  if (!pago) {
    await liberarEstoque(pedidoId);                        // compensação da saga
    return "cancelado";
  }
  await emitirNotaFiscal(pedidoId);
  await sleep("1 day");
  await enviarPesquisaSatisfacao(pedidoId);
  return "concluido";
}` },
  docs: [['Temporal · Documentação', 'https://docs.temporal.io/'], ['AWS Step Functions', 'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html'], ['Restate · Durable execution', 'https://docs.restate.dev/']],
  perguntas: [`Que processo da sua empresa dura dias e passa por vários sistemas?`, `Por que o código do workflow precisa ser determinístico?`, `Como um workflow durável implementa uma saga?`] },

{ id: 'feature-flags', stage: 'avancado', level: 'importante', title: 'Feature flags na prática', short: 'Feature flags',
  resumo: `Ligar e desligar funcionalidades em produção sem deploy, com segurança.`,
  porque: `Feature flags permitem integrar código cedo, lançar gradualmente, testar com um grupo e desligar rápido em caso de problema. Também viram dívida técnica se não forem removidas, e uma flag mal configurada já causou incidentes enormes.`,
  como: [
    `Tipos: <b>release</b> (esconder algo incompleto; vida curta), <b>experimento</b> (A/B), <b>operacional</b> (kill switch para desligar algo caro em emergência) e <b>permissão</b> (liberar para planos ou clientes). Avaliação por usuário, tenant, porcentagem ou atributos, com o valor padrão seguro caso o serviço de flags falhe.`,
    `Boas práticas: ferramenta central (LaunchDarkly, Unleash, Flagsmith, OpenFeature como padrão), dono e data de remoção para cada flag de release, mudanças de flag auditadas como deploys, testes das duas variantes e limpeza contínua do código das flags antigas.`,
  ],
  conecta: [['cicd', 'Separar deploy de lançamento.'], ['devops/estrategias-deploy', 'Lançamento gradual.'], ['arquitetura/service-discovery', 'Configuração dinâmica.'], ['praticas/divida-tecnica', 'Flags esquecidas viram dívida.']],
  front: `A mesma flag precisa ser avaliada de forma consistente no front e no back; um SDK que entrega as flags no carregamento evita a tela "piscar" entre a versão antiga e a nova.`,
  ex: { lang: 'typescript', code: `import { OpenFeature } from "@openfeature/server-sdk";

const flags = OpenFeature.getClient();

app.get("/api/checkout/opcoes", async (req, res) => {
  const contexto = { targetingKey: req.user.id, plano: req.user.plano, pais: req.user.pais };
  const pixParcelado = await flags.getBooleanValue("pix-parcelado", false, contexto); // padrão seguro
  res.json({ pix: true, pixParcelado });
});` },
  docs: [['Martin Fowler · Feature Toggles', 'https://martinfowler.com/articles/feature-toggles.html'], ['OpenFeature', 'https://openfeature.dev/docs/reference/intro'], ['Unleash · Documentação', 'https://docs.getunleash.io/']],
  perguntas: [`Quantas flags antigas existem hoje no código do seu produto?`, `Qual deve ser o valor de uma flag se o serviço de flags cair?`, `Como evitar que a interface "pisque" ao avaliar uma flag?`] },

{ id: 'profiling', stage: 'avancado', level: 'aprofundar', title: 'Profiling e otimização no servidor', short: 'Profiling',
  resumo: `Descobrir com dados onde o tempo e a memória estão sendo gastos.`,
  porque: `Otimizar no chute desperdiça tempo e muitas vezes não melhora nada. Profilers mostram exatamente qual função consome CPU, onde a memória vaza e por que uma rota é lenta.`,
  como: [
    `<b>CPU profiling</b> registra onde o tempo é gasto; o resultado costuma ser visto como <b>flame graph</b> (largura = tempo). <b>Heap snapshots</b> mostram o que ocupa memória e, comparando dois momentos, revelam vazamentos. <b>Profiling contínuo</b> (Pyroscope, Datadog, Parca) roda em produção com baixo custo.`,
    `Processo: medir a rota lenta (tracing mostra se o tempo está no código, no banco ou numa chamada externa), reproduzir com carga, coletar o perfil, otimizar o gargalo principal e medir de novo. Na maioria dos backends web, o gargalo está em I/O (consultas, N+1, chamadas em série), não em CPU.`,
  ],
  conecta: [['observabilidade', 'Traces mostram onde está o tempo.'], ['indices', 'Muitos gargalos são consultas.'], ['async', 'Chamadas em série que poderiam ser paralelas.'], ['frontend/perf-runtime', 'O mesmo método no navegador.'], ['fundamentos/memoria-gc', 'Pilha, heap e coleta de lixo.']],
  front: `É o mesmo raciocínio da aba Performance do DevTools: o flame graph do servidor é lido do mesmo jeito que o do navegador.`,
  ex: { lang: 'bash', code: `# Node: gerar um perfil de CPU e abrir no Chrome DevTools
node --cpu-prof dist/server.js            # gera CPU.*.cpuprofile ao encerrar

# carga enquanto perfila
npx autocannon -c 50 -d 30 http://localhost:3000/api/relatorio

# flame graph interativo
npx 0x dist/server.js

# heap snapshot sob demanda (envie SIGUSR2 com --heapsnapshot-signal)
node --heapsnapshot-signal=SIGUSR2 dist/server.js` },
  docs: [['Node.js · Profiling', 'https://nodejs.org/en/learn/getting-started/profiling'], ['Brendan Gregg · Flame Graphs', 'https://www.brendangregg.com/flamegraphs.html'], ['Grafana Pyroscope', 'https://grafana.com/docs/pyroscope/latest/']],
  perguntas: [`Qual é a rota mais lenta da sua API, e onde ela gasta o tempo?`, `Como ler um flame graph?`, `Por que o gargalo de backends web costuma ser I/O e não CPU?`] },

{ id: 'apis-avancadas', stage: 'avancado', level: 'aprofundar', title: 'APIs avançadas: concorrência, lotes e operações longas', short: 'APIs avançadas',
  resumo: `ETags, operações em lote, operações assíncronas longas e paginação em grandes volumes.`,
  porque: `APIs reais vão além do CRUD: dois usuários editam o mesmo registro, o cliente precisa enviar mil itens, um relatório leva cinco minutos. Esses padrões evitam perda de dados e timeouts.`,
  como: [
    `<b>Concorrência otimista</b> em HTTP: a resposta traz um <code>ETag</code> (versão do recurso); a escrita envia <code>If-Match</code> e o servidor responde <b>412 Precondition Failed</b> se o recurso mudou, evitando que uma edição sobrescreva outra. <b>Operações em lote</b>: um endpoint que aceita vários itens e devolve o resultado de cada um (sucesso parcial é comum).`,
    `<b>Operações longas</b>: responder <b>202 Accepted</b> com um recurso de operação (<code>/operacoes/123</code>) que o cliente consulta ou que avisa por webhook ou SSE ao terminar. Para exportações enormes, gerar o arquivo e devolver uma URL de download. Paginação por cursor estável em listas que mudam muito.`,
  ],
  conecta: [['rest', 'Extensões do desenho REST.'], ['race', 'ETag é lock otimista em HTTP.'], ['filas', 'Operações longas rodam em background.'], ['webhooks', 'Avisar quando uma operação termina.'], ['arquitetura/evolucao-apis', 'Novos padrões sem quebrar clientes.']],
  front: `Ao salvar um formulário editado por duas pessoas, um 412 permite mostrar "este registro foi alterado por outra pessoa; recarregue para ver as mudanças" em vez de sobrescrever silenciosamente.`,
  ex: { lang: 'http', code: `GET /pedidos/981
200 OK
ETag: "v7"

PATCH /pedidos/981
If-Match: "v7"
{ "observacao": "entregar na portaria" }

412 Precondition Failed          ← alguém alterou o pedido antes (agora é v8)

POST /relatorios/vendas?mes=2026-10
202 Accepted
Location: /operacoes/op_81f2
{ "status": "processando" }

GET /operacoes/op_81f2
200 OK
{ "status": "concluida", "resultado": "https://arquivos.loja.com/relatorios/out-2026.csv" }` },
  docs: [['MDN · ETag', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag'], ['Google AIP-151 · Long-running operations', 'https://google.aip.dev/151'], ['Google AIP-233 · Batch methods', 'https://google.aip.dev/233']],
  perguntas: [`O que acontece hoje no seu produto quando duas pessoas editam o mesmo registro?`, `Como você desenharia a exportação de um relatório que leva 5 minutos?`, `Como responder a um lote em que parte dos itens falhou?`] },
]
