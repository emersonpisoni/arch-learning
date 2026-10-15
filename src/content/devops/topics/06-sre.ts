import type { Topic } from '../../../types'

export const sre: Topic[] = [
{ id: 'slo', stage: 'sre', level: 'essencial', title: 'SLI, SLO e error budget', short: 'SLO',
  resumo: `Definir quão confiável o sistema precisa ser, e usar isso para decidir prioridades.`,
  porque: `"Nunca pode cair" não é uma meta possível. SLOs tornam confiabilidade mensurável e dão um critério objetivo para escolher entre lançar funcionalidades ou investir em estabilidade.`,
  como: [
    `<b>SLI</b> é a medida: proporção de requisições com sucesso, ou abaixo de 300 ms. <b>SLO</b> é a meta para o SLI num período: 99,9% em 30 dias. <b>SLA</b> é o contrato com o cliente, normalmente mais frouxo que o SLO e com penalidade.`,
    `O <b>error budget</b> é o quanto se pode falhar: 99,9% em 30 dias permite cerca de 43 minutos de indisponibilidade. Com orçamento sobrando, o time arrisca mais; com o orçamento estourado, prioriza estabilidade. Bons SLIs medem a experiência do usuário, não o servidor.`,
  ],
  conecta: [['backend/observabilidade', 'Métricas são a matéria-prima dos SLIs.'], ['alertas', 'Alertas de burn rate protegem o error budget.'], ['estrategias-deploy', 'Canary usa SLIs para decidir se avança.'], ['incidentes', 'Incidentes consomem o error budget.']],
  front: `Core Web Vitals são SLIs do lado do usuário: "75% das visitas com LCP abaixo de 2,5 s" é, na prática, um SLO de front.`,
  ex: { lang: 'texto', code: `SLI:  requisições com status < 500 e latência < 300 ms
      ─────────────────────────────────────────────────
                    total de requisições

SLO:  99,9% em janela móvel de 30 dias
Error budget: 0,1% → 30 dias × 24 h × 60 min × 0,001 ≈ 43 min

Disponibilidade   Indisponível por mês
99%               ~7 h 18 min
99,9%             ~43 min
99,99%            ~4 min` },
  docs: [['Google SRE Book · Service Level Objectives', 'https://sre.google/sre-book/service-level-objectives/'], ['Google SRE Workbook · Implementing SLOs', 'https://sre.google/workbook/implementing-slos/'], ['Google SRE Workbook · Error budget policy', 'https://sre.google/workbook/error-budget-policy/']],
  perguntas: [`Qual SLI representaria bem a experiência do usuário no seu produto?`, `Por que 100% de disponibilidade é uma meta ruim?`, `O que o time deveria fazer quando o error budget acaba?`] },

{ id: 'alertas', stage: 'sre', level: 'essencial', title: 'Alertas e on-call', short: 'Alertas',
  resumo: `Avisar as pessoas certas quando algo precisa de ação, e só nesses casos.`,
  porque: `Alerta demais vira ruído e o time passa a ignorar; alerta de menos e o cliente descobre o problema antes. Plantão sustentável depende de alertas bem desenhados.`,
  como: [
    `Todo alerta que acorda alguém deve ser <b>acionável</b>, urgente e baseado em <b>sintomas</b> que o usuário sente (taxa de erro, latência), não em causas (CPU alta). Alertas de <b>burn rate</b> avisam quando o error budget está sendo gasto rápido demais.`,
    `Cada alerta deve apontar para um <b>runbook</b> com os primeiros passos. On-call precisa de escala justa, escalonamento definido (PagerDuty, Opsgenie) e revisão periódica dos alertas que dispararam sem necessidade.`,
  ],
  conecta: [['slo', 'Alertas protegem os SLOs.'], ['backend/observabilidade', 'Alertas são consultas sobre métricas e logs.'], ['incidentes', 'Um alerta costuma abrir um incidente.'], ['processos-recursos', 'Saturação vira alerta de aviso, não de página.']],
  front: `Ferramentas como Sentry alertam sobre erros de JavaScript. As mesmas regras valem: um erro novo e frequente merece aviso; cada erro isolado não.`,
  ex: { lang: 'yaml', code: `# Prometheus: alerta por sintoma, com duração mínima
groups:
  - name: api
    rules:
      - alert: TaxaDeErroAlta
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
            / sum(rate(http_requests_total[5m])) > 0.02
        for: 10m
        labels: { severity: page }
        annotations:
          summary: "Mais de 2% de erros 5xx na API"
          runbook: "https://wiki.loja.com/runbooks/api-erros-5xx"` },
  docs: [['Google SRE Book · Monitoring', 'https://sre.google/sre-book/monitoring-distributed-systems/'], ['Google SRE Workbook · Alerting on SLOs', 'https://sre.google/workbook/alerting-on-slos/'], ['Prometheus · Alerting rules', 'https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/']],
  perguntas: [`Que alerta do seu time dispara com frequência sem exigir ação?`, `Por que alertar por sintoma e não por causa?`, `O que um bom runbook deve conter?`] },

{ id: 'incidentes', stage: 'sre', level: 'essencial', title: 'Gestão de incidentes e postmortem', short: 'Incidentes',
  resumo: `Coordenar a resposta quando algo quebra e aprender para não repetir.`,
  porque: `Incidentes acontecem em qualquer sistema. A diferença entre times maduros e os outros está em quão rápido restauram o serviço e no que aprendem depois. Front costuma ser o primeiro a perceber e reportar.`,
  como: [
    `Durante o incidente, papéis claros ajudam: <b>incident commander</b> coordena, alguém investiga, alguém comunica. A prioridade é <b>mitigar</b> (rollback, desligar a feature flag, escalar), não achar a causa raiz. Severidades padronizadas definem quem é acionado.`,
    `Depois, um <b>postmortem sem culpados</b> (blameless) registra linha do tempo, impacto, causas contribuintes e ações. O foco é no sistema, que permitiu o erro, e não na pessoa. Métricas úteis: tempo para detectar e tempo para restaurar.`,
  ],
  conecta: [['alertas', 'Alertas disparam o processo.'], ['estrategias-deploy', 'Rollback é a mitigação mais comum.'], ['slo', 'O impacto é medido no error budget.'], ['seguranca/resposta-incidentes', 'Incidentes de segurança têm um fluxo próprio.'], ['praticas/dora', 'O tempo para restaurar é uma métrica DORA.']],
  front: `Ao reportar um problema, ajuda muito informar horário, URL, request id, versão do front e o que mudou recentemente. Isso encurta o tempo de diagnóstico.`,
  ex: { lang: 'markdown', code: `## Postmortem: erros no checkout (15/10, 14:02–14:41)
Impacto: 18% dos pagamentos falharam por 39 min.
Detecção: alerta de taxa de erro às 14:07 (5 min após o início).
Mitigação: rollback da api-pagamentos às 14:38.

Linha do tempo
14:02 deploy v2.31 com novo client do gateway
14:07 alerta TaxaDeErroAlta
14:20 correlação com o deploy identificada
14:38 rollback concluído

Causas contribuintes
- timeout do novo client padrão em 1 s (antes 10 s)
- canary desativado neste serviço

Ações
- [ ] reativar canary em api-pagamentos (responsável: time pagamentos)
- [ ] teste de contrato para timeouts do client` },
  docs: [['Google SRE Book · Managing incidents', 'https://sre.google/sre-book/managing-incidents/'], ['Google SRE Book · Postmortem culture', 'https://sre.google/sre-book/postmortem-culture/'], ['Atlassian · Incident management handbook', 'https://www.atlassian.com/incident-management/handbook']],
  perguntas: [`Por que mitigar vem antes de achar a causa raiz?`, `O que torna um postmortem "sem culpados"?`, `Que informação você incluiria ao reportar um problema visto no front?`] },

{ id: 'capacidade', stage: 'sre', level: 'importante', title: 'Capacidade e autoscaling', short: 'Capacidade',
  resumo: `Ter recursos suficientes para a demanda, sem pagar por sobra.`,
  porque: `Black Friday, campanha na TV e lançamentos derrubam sistemas mal dimensionados. Autoscaling resolve parte disso, mas tem limites e atrasos que precisam ser entendidos.`,
  como: [
    `<b>Planejamento de capacidade</b>: medir quanto cada instância aguenta (teste de carga), projetar a demanda e manter folga. <b>Autoscaling horizontal</b> (HPA no Kubernetes, Auto Scaling Groups) adiciona instâncias por CPU, memória ou métricas de negócio, como tamanho da fila. O <b>cluster autoscaler</b> ou Karpenter adiciona nós quando faltam recursos.`,
    `Autoscaling leva minutos: para picos previsíveis, faça <b>pré-escala</b> agendada. Banco, limites de API e cotas do provedor não escalam sozinhos. Testes de carga (k6, Gatling, Locust) revelam o primeiro gargalo antes do usuário.`,
  ],
  conecta: [['backend/escala', 'A base: escala horizontal e stateless.'], ['kubernetes', 'HPA e autoscaling de nós.'], ['processos-recursos', 'O que satura primeiro em cada instância.'], ['finops', 'Sobra de capacidade é custo.']],
  front: `Um front estático na CDN aguenta picos quase de graça; o gargalo costuma ser a API que ele chama. Avise o backend antes de campanhas que vão gerar tráfego.`,
  ex: { lang: 'javascript', code: `// k6: subir até 500 usuários virtuais e verificar o SLO
import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },
    { duration: "5m", target: 500 },
    { duration: "2m", target: 0 },
  ],
  thresholds: { http_req_duration: ["p(95)<300"], http_req_failed: ["rate<0.01"] },
};

export default function () {
  const res = http.get("https://staging.loja.com/api/produtos");
  check(res, { "status 200": (r) => r.status === 200 });
}` },
  docs: [['k6 · Documentação', 'https://grafana.com/docs/k6/latest/'], ['Kubernetes · Horizontal Pod Autoscaling', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'], ['Karpenter', 'https://karpenter.sh/docs/']],
  perguntas: [`Quanto tempo o autoscaling do seu sistema leva para reagir?`, `Que componente não escala automaticamente na sua arquitetura?`, `Como você prepararia o sistema para um pico previsto?`] },

{ id: 'backup-dr', stage: 'sre', level: 'importante', title: 'Backup e recuperação de desastres', short: 'Backup e DR',
  resumo: `Garantir que dá para voltar depois do pior cenário.`,
  porque: `Backups que nunca foram restaurados são uma aposta. Ransomware, exclusão acidental e queda de região acontecem, e a pergunta é quanto se perde e quanto tempo se fica fora do ar.`,
  como: [
    `Duas métricas guiam tudo: <b>RPO</b> (quanto de dado se aceita perder, ex.: 5 minutos) e <b>RTO</b> (em quanto tempo o serviço volta, ex.: 1 hora). Elas definem a estratégia: backup diário, point-in-time recovery, réplica em outra região ou ativo-ativo.`,
    `Regra <b>3-2-1</b>: três cópias, em dois tipos de mídia, uma fora do local (outra região ou conta). Backups devem ser <b>imutáveis</b> ou isolados, para resistir a ransomware. E o mais importante: <b>teste a restauração</b> regularmente.`,
  ],
  conecta: [['regioes-az', 'DR multi-região protege contra a queda de uma região.'], ['storage', 'Backups ficam em object storage, com versionamento.'], ['dados/backup-banco', 'Backups específicos de banco e point-in-time recovery.'], ['iac', 'IaC recria a infraestrutura; backups recuperam os dados.']],
  front: `Rascunhos salvos só no navegador não têm backup; dados importantes do usuário precisam chegar ao servidor.`,
  ex: { lang: 'texto', code: `Estratégia              RPO          RTO        Custo
──────────────────────  ───────────  ─────────  ─────
Backup diário           até 24 h     horas      $
Point-in-time (PITR)    minutos      ~1 h       $$
Réplica em outra região segundos     minutos    $$$
Ativo-ativo multi-região ~0          ~0         $$$$` },
  docs: [['AWS · Estratégias de disaster recovery', 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html'], ['Google Cloud · Planejamento de DR', 'https://cloud.google.com/architecture/dr-scenarios-planning-guide'], ['CISA · Backups e ransomware', 'https://www.cisa.gov/stopransomware']],
  perguntas: [`Qual é o RPO e o RTO aceitável para o sistema principal da sua empresa?`, `Quando foi a última vez que alguém testou uma restauração?`, `Por que backups precisam ser imutáveis?`] },

{ id: 'finops', stage: 'sre', level: 'importante', title: 'Custos de nuvem (FinOps)', short: 'FinOps',
  resumo: `Entender e controlar quanto a infraestrutura custa.`,
  porque: `Na nuvem, toda decisão técnica tem preço por hora. Logs verbosos, ambientes esquecidos e tráfego entre regiões geram contas surpresa, e otimizar custo virou parte do trabalho de engenharia.`,
  como: [
    `Primeiro, <b>visibilidade</b>: tags por time, produto e ambiente para saber quem gasta o quê. Depois, otimização: <b>rightsizing</b> (máquinas do tamanho certo), desligar ambientes fora do horário, <b>instâncias reservadas</b> ou savings plans para carga estável e <b>spot</b> para cargas tolerantes a interrupção.`,
    `Custos escondidos comuns: <b>transferência de dados</b> (saída para a internet e entre zonas e regiões), NAT gateway, logs e métricas com retenção longa e alta cardinalidade, discos e snapshots órfãos. Alertas de orçamento evitam surpresas no fim do mês.`,
  ],
  conecta: [['cloud-modelos', 'Cada modelo cobra de um jeito.'], ['capacidade', 'Folga demais é custo.'], ['storage', 'Classes de armazenamento e ciclo de vida.'], ['backend/observabilidade', 'Logs e métricas podem ser grande parte da conta.']],
  front: `Servir imagens otimizadas e com cache longo na CDN reduz transferência de dados, que costuma ser um dos itens mais caros da conta.`,
  ex: { lang: 'texto', code: `Checklist mensal de custos
[ ] recursos sem tag de time/ambiente
[ ] ambientes de preview com mais de 7 dias
[ ] discos e snapshots sem instância associada
[ ] instâncias com CPU média < 10% (rightsizing)
[ ] retenção de logs maior que o necessário
[ ] tráfego entre zonas ou regiões inesperado
[ ] alerta de orçamento configurado por conta` },
  docs: [['FinOps Foundation · O que é FinOps', 'https://www.finops.org/introduction/what-is-finops/'], ['AWS Well-Architected · Otimização de custos', 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html'], ['Google Cloud · Boas práticas de custo', 'https://cloud.google.com/architecture/framework/cost-optimization']],
  perguntas: [`Você sabe quanto custa por mês o sistema em que trabalha?`, `Por que transferência de dados costuma surpreender na conta?`, `Que cargas poderiam rodar em instâncias spot?`] },

{ id: 'chaos', stage: 'sre', level: 'aprofundar', title: 'Engenharia do caos e game days', short: 'Caos',
  resumo: `Provocar falhas de propósito para descobrir fraquezas antes dos usuários.`,
  porque: `Você só sabe se o failover funciona quando ele acontece. Experimentos controlados trocam surpresas de madrugada por aprendizado em horário comercial.`,
  como: [
    `Um experimento tem <b>hipótese</b> ("se uma AZ cair, a latência p95 continua abaixo de 300 ms"), <b>escopo limitado</b> (blast radius pequeno), métricas observadas e um botão para parar. Ferramentas: Chaos Mesh, Litmus, AWS Fault Injection Service, ou simplesmente matar um pod.`,
    `<b>Game days</b> são ensaios em grupo: simular uma falha e praticar detecção, comunicação e recuperação. Comece em staging, com falhas simples (derrubar uma instância, aumentar latência de uma dependência) antes de ir para produção.`,
  ],
  conecta: [['incidentes', 'Treina a resposta antes do incidente real.'], ['backup-dr', 'Valida que a recuperação funciona.'], ['arquitetura/resiliencia', 'Testa timeouts, retries e circuit breakers.']],
  front: `O modo offline e o "slow 3G" do DevTools são caos em pequena escala: mostram como a interface se comporta quando a rede falha.`,
  ex: { lang: 'yaml', code: `# Chaos Mesh: 200 ms de latência extra na API por 5 minutos
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata: { name: latencia-api, namespace: loja }
spec:
  action: delay
  mode: one
  selector: { labelSelectors: { app: api-pedidos } }
  delay: { latency: 200ms }
  duration: 5m
# hipótese: o front mostra skeleton e nenhum fluxo quebra` },
  docs: [['Principles of Chaos Engineering', 'https://principlesofchaos.org/'], ['Chaos Mesh', 'https://chaos-mesh.org/docs/'], ['AWS · Fault Injection Service', 'https://docs.aws.amazon.com/fis/latest/userguide/what-is.html']],
  perguntas: [`Qual falha você gostaria de provocar primeiro no seu sistema?`, `O que é blast radius e como limitá-lo?`, `Como a interface que você mantém se comporta quando uma API fica lenta?`] },
]
