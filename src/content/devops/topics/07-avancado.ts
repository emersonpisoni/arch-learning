import type { Topic } from '../../../types'

export const avancado: Topic[] = [
{ id: 'platform-engineering', stage: 'avancado', level: 'importante', title: 'Platform engineering e portais internos', short: 'Plataforma',
  resumo: `Um produto interno que dá aos times caminhos prontos para criar, publicar e operar serviços.`,
  porque: `Quando cada time precisa entender Kubernetes, Terraform, pipelines e observabilidade, a carga cognitiva trava a entrega. Times de plataforma criam "caminhos pavimentados" que tornam o jeito certo também o jeito fácil.`,
  como: [
    `Uma <b>plataforma interna</b> oferece capacidades de autoatendimento: criar um serviço novo a partir de um template (com pipeline, observabilidade e segurança já configurados), provisionar banco ou fila, ver dono, documentação e saúde de cada serviço. <b>Portais</b> como o Backstage reúnem catálogo de serviços, templates, documentação técnica e plugins.`,
    `A plataforma é tratada como <b>produto</b>: os times de desenvolvimento são os clientes, há roadmap, métricas de adoção e satisfação, e o caminho pavimentado é recomendado, não obrigatório. O erro clássico é construir uma plataforma que ninguém pediu ou que esconde tanto que fica impossível depurar.`,
  ],
  conecta: [['arquitetura/conway', 'Times de plataforma em Team Topologies.'], ['iac', 'A plataforma é construída com IaC.'], ['pipelines', 'Templates já trazem o pipeline.'], ['praticas/produtividade-dev', 'O objetivo é a produtividade dos times.']],
  front: `Templates de projetos de front (com lint, testes, deploy de preview e monitoramento prontos) são um caminho pavimentado que um time de plataforma pode oferecer.`,
  ex: { lang: 'yaml', code: `# Backstage: template de "novo serviço" (resumido)
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata: { name: servico-node, title: Novo serviço Node.js }
spec:
  parameters:
    - properties:
        nome: { type: string }
        time: { type: string }
  steps:
    - id: codigo
      action: fetch:template          # repositório com Dockerfile, CI, OTel, Helm
      input: { url: ./skeleton, values: { nome: "\${{ parameters.nome }}" } }
    - id: publicar
      action: publish:github
    - id: registrar
      action: catalog:register        # aparece no catálogo com dono e docs` },
  docs: [['platformengineering.org', 'https://platformengineering.org/blog/what-is-platform-engineering'], ['Backstage', 'https://backstage.io/docs/overview/what-is-backstage'], ['CNCF · Platforms white paper', 'https://tag-app-delivery.cncf.io/whitepapers/platforms/']],
  perguntas: [`Quanto tempo leva para criar um serviço novo do zero na sua empresa?`, `O que faria um caminho pavimentado ser adotado sem ser imposto?`, `Por que tratar a plataforma como produto?`] },

{ id: 'k8s-operators', stage: 'avancado', level: 'aprofundar', title: 'Operators e CRDs no Kubernetes', short: 'Operators',
  resumo: `Ensinar o Kubernetes a gerenciar sistemas complexos com recursos e controladores próprios.`,
  porque: `Bancos de dados, filas e certificados no Kubernetes costumam ser gerenciados por operators. Entender o padrão explica como essas ferramentas funcionam e quando vale criar o seu.`,
  como: [
    `Uma <b>CRD</b> (Custom Resource Definition) cria um tipo novo de recurso, como <code>PostgresCluster</code>. Um <b>operator</b> é um controlador que observa esses recursos e executa o <b>loop de reconciliação</b>: compara o estado desejado com o real e age (criar réplicas, fazer backup, failover, upgrade), codificando conhecimento operacional que antes era manual.`,
    `Exemplos populares: CloudNativePG e Crunchy (Postgres), Strimzi (Kafka), cert-manager (certificados), Prometheus Operator. Criar um operator próprio (Kubebuilder, Operator SDK) faz sentido para operações complexas e repetidas; para configurações simples, Helm basta.`,
  ],
  conecta: [['kubernetes', 'Estende a API do Kubernetes.'], ['helm', 'Alternativa mais simples para empacotar.'], ['gitops', 'Recursos customizados também vivem no Git.'], ['dados/backup-banco', 'Operators de banco automatizam backup e failover.']],
  front: `O mesmo padrão de reconciliação está no React: você declara o estado desejado e o framework calcula e aplica as mudanças.`,
  ex: { lang: 'yaml', code: `# um recurso customizado: o operator cria e mantém o cluster de Postgres
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata: { name: pedidos-db }
spec:
  instances: 3                         # 1 primário + 2 réplicas, com failover
  storage: { size: 100Gi }
  backup:
    barmanObjectStore:
      destinationPath: s3://loja-backups/pedidos-db
    retentionPolicy: "30d"` },
  docs: [['Kubernetes · Operator pattern', 'https://kubernetes.io/docs/concepts/extend-kubernetes/operator/'], ['Kubebuilder Book', 'https://book.kubebuilder.io/'], ['CloudNativePG', 'https://cloudnative-pg.io/documentation/current/']],
  perguntas: [`Que tarefa operacional repetida poderia ser codificada num operator?`, `O que é o loop de reconciliação?`, `Quando Helm basta e quando um operator compensa?`] },

{ id: 'policy-as-code', stage: 'avancado', level: 'importante', title: 'Policy as code', short: 'Policy as code',
  resumo: `Regras de segurança, custo e conformidade escritas como código e verificadas automaticamente.`,
  porque: `"Todo bucket precisa ser privado", "todo pod precisa de limites de memória", "nenhum recurso sem tag de time": regras assim não escalam em documentos e revisões manuais. Como código, são verificadas em cada PR e em cada deploy.`,
  como: [
    `Ferramentas: <b>OPA</b> com a linguagem Rego (genérica: Kubernetes, Terraform, APIs), <b>Kyverno</b> (políticas do Kubernetes em YAML), <b>Checkov</b>, <b>tfsec</b> e <b>Conftest</b> (IaC), e as políticas nativas das nuvens (SCPs, Azure Policy). Pontos de aplicação: no PR (shift left), na admissão do cluster e continuamente na conta.`,
    `Boas práticas: começar em modo de auditoria (avisa sem bloquear), mensagens de erro que explicam como corrigir, exceções explícitas e registradas, e políticas versionadas e testadas como qualquer outro código.`,
  ],
  conecta: [['iac', 'Políticas verificam o código de infraestrutura.'], ['seguranca/cloud-misconfig', 'Prevenir configuração insegura.'], ['seguranca/hardening', 'Exigir pods endurecidos.'], ['finops', 'Exigir tags de custo.'], ['arquitetura/fitness-functions', 'Políticas são fitness functions de infra.']],
  front: `É o equivalente de infraestrutura às regras de lint que barram um PR: o desenvolvedor vê o problema e a correção antes do merge.`,
  ex: { lang: 'yaml', code: `# Kyverno: todo container precisa declarar limite de memória
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata: { name: exigir-limite-memoria }
spec:
  validationFailureAction: Audit        # começar avisando; depois Enforce
  rules:
    - name: limite-memoria
      match: { any: [{ resources: { kinds: [Pod] } }] }
      validate:
        message: "Defina resources.limits.memory em todos os containers."
        pattern:
          spec:
            containers:
              - resources: { limits: { memory: "?*" } }` },
  docs: [['Open Policy Agent', 'https://www.openpolicyagent.org/docs/latest/'], ['Kyverno', 'https://kyverno.io/docs/introduction/'], ['Conftest', 'https://www.conftest.dev/']],
  perguntas: [`Que regra da sua empresa hoje depende de alguém lembrar de verificar?`, `Por que começar políticas em modo de auditoria?`, `Em que pontos uma política pode ser aplicada?`] },

{ id: 'trafego-global', stage: 'avancado', level: 'aprofundar', title: 'Tráfego global: anycast, GSLB e edge', short: 'Tráfego global',
  resumo: `Encaminhar usuários do mundo inteiro para a região mais próxima e saudável.`,
  porque: `Produtos com usuários em vários continentes ou que exigem alta disponibilidade entre regiões precisam decidir, a cada requisição, para onde mandar o usuário, e mudar isso rapidamente quando uma região falha.`,
  como: [
    `<b>DNS com roteamento</b> (GeoDNS, por latência, com health checks e failover) devolve IPs diferentes conforme a origem e a saúde das regiões, limitado pelo TTL dos caches. <b>Anycast</b>: o mesmo IP anunciado em vários lugares, e a rede leva o usuário ao ponto mais próximo; é como CDNs e alguns load balancers globais funcionam, com failover quase instantâneo.`,
    `<b>Balanceadores globais</b> (Cloud Load Balancing, AWS Global Accelerator, Cloudflare) terminam a conexão na borda e encaminham pela rede privada do provedor. Desafios: dados por região (residência legal, replicação), sessões e caches regionais, e testar o failover de verdade.`,
  ],
  conecta: [['backend/dns', 'O DNS como primeira camada de roteamento.'], ['cdn-edge', 'CDNs usam anycast.'], ['regioes-az', 'Várias regiões ativas.'], ['arquitetura/multi-regiao', 'O lado de dados e consistência.']],
  front: `A latência que o usuário em outro continente sente depende de onde a conexão termina; terminar TLS na borda reduz idas e voltas mesmo quando a aplicação está longe.`,
  ex: { lang: 'texto', code: `Usuário em Lisboa                 Usuário em São Paulo
      │                                   │
  anycast 203.0.113.1 (mesmo IP para todos)
      │                                   │
 [borda Lisboa]                     [borda São Paulo]
      │ rede privada do provedor          │
      ▼                                   ▼
 [região eu-west] ← saudável?      [região sa-east] ← saudável?
 se sa-east falhar: borda de SP encaminha para eu-west em segundos` },
  docs: [['Cloudflare · O que é anycast', 'https://www.cloudflare.com/learning/cdn/glossary/anycast-network/'], ['AWS · Global Accelerator', 'https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html'], ['AWS · Route 53 routing policies', 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html']],
  perguntas: [`Por que o failover por DNS não é instantâneo?`, `O que é anycast e por que CDNs usam?`, `Que dados do seu produto teriam restrição de região?`] },

{ id: 'ebpf', stage: 'avancado', level: 'aprofundar', title: 'eBPF e observabilidade no kernel', short: 'eBPF',
  resumo: `Programas seguros que rodam dentro do kernel Linux para observar e controlar rede e processos.`,
  porque: `eBPF está por trás de uma nova geração de ferramentas de rede, segurança e observabilidade (Cilium, Falco, Pixie, profilers contínuos). Ele permite ver o que acontece no sistema sem alterar o código das aplicações.`,
  como: [
    `<b>eBPF</b> permite carregar pequenos programas verificados no kernel, ligados a eventos (chamadas de sistema, pacotes de rede, funções). Eles coletam dados ou tomam decisões com custo muito baixo. Aplicações: <b>rede</b> de containers e load balancing (Cilium), <b>segurança</b> em tempo de execução (Falco, Tetragon detectam um shell aberto num container), <b>observabilidade</b> sem instrumentação (latência de cada requisição HTTP, profiling contínuo).`,
    `Você raramente escreve eBPF diretamente; usa ferramentas construídas sobre ele. Requer kernels Linux recentes e permissões elevadas para carregar os programas.`,
  ],
  conecta: [['processos-recursos', 'Observa CPU, memória e I/O do Linux.'], ['k8s-rede', 'Cilium implementa a rede do cluster com eBPF.'], ['backend/profiling', 'Profiling contínuo com eBPF.'], ['seguranca/logs-seguranca', 'Detecção em tempo de execução.']],
  front: `Não aparece no dia a dia do front, mas explica como ferramentas conseguem medir a latência de cada requisição da sua API sem nenhuma linha de instrumentação.`,
  ex: { lang: 'bash', code: `# bpftrace: contar chamadas de sistema por processo (10 s)
sudo bpftrace -e 'tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }' -c 'sleep 10'

# Falco: alerta quando alguém abre um shell num container (regra padrão)
# - rule: Terminal shell in container
#   condition: spawned_process and container and shell_procs and proc.tty != 0` },
  docs: [['ebpf.io', 'https://ebpf.io/what-is-ebpf/'], ['Cilium', 'https://docs.cilium.io/en/stable/overview/intro/'], ['Falco', 'https://falco.org/docs/']],
  perguntas: [`O que torna o eBPF útil para observabilidade sem alterar a aplicação?`, `Que ferramenta de segurança usa eBPF para detectar comportamento suspeito?`, `Por que é raro escrever eBPF diretamente?`] },

{ id: 'otel-collector', stage: 'avancado', level: 'importante', title: 'Pipelines de telemetria com OpenTelemetry Collector', short: 'OTel Collector',
  resumo: `Receber, processar e encaminhar logs, métricas e traces de forma independente de fornecedor.`,
  porque: `Observabilidade em escala gera um volume enorme e caro de dados. Um pipeline de telemetria permite filtrar, amostrar, enriquecer e mandar para qualquer ferramenta, sem reinstrumentar as aplicações a cada troca de fornecedor.`,
  como: [
    `As aplicações enviam dados (OTLP) para o <b>OpenTelemetry Collector</b>, que tem <b>receivers</b> (entradas), <b>processors</b> (filtros, amostragem, remoção de dados sensíveis, atributos de ambiente) e <b>exporters</b> (Prometheus, Tempo, Jaeger, Datadog, ferramentas na nuvem). Pode rodar como agente em cada nó e como gateway central.`,
    `Técnicas de custo: <b>amostragem</b> de traces (por cabeça, ou por cauda: guardar todos os traces com erro ou lentos e só uma fração dos normais), descarte de logs de debug, redução de cardinalidade de métricas e retenção diferente por tipo de dado.`,
  ],
  conecta: [['backend/observabilidade', 'Os três sinais que passam pelo pipeline.'], ['finops', 'Telemetria é parte relevante da conta.'], ['seguranca/lgpd', 'Remover dados pessoais antes de exportar.'], ['frontend/observabilidade-front', 'Traces do navegador também podem passar por ele.']],
  front: `Traces iniciados no navegador podem ser enviados ao collector, que os junta aos do backend; atenção a não exportar dados pessoais das URLs e formulários.`,
  ex: { lang: 'yaml', code: `# otel-collector.yaml
receivers:
  otlp: { protocols: { grpc: {}, http: {} } }
processors:
  attributes/remover-pii:
    actions: [{ key: user.email, action: delete }]
  tail_sampling:
    policies:
      - { name: erros, type: status_code, status_code: { status_codes: [ERROR] } }
      - { name: lentos, type: latency, latency: { threshold_ms: 1000 } }
      - { name: amostra, type: probabilistic, probabilistic: { sampling_percentage: 5 } }
exporters:
  otlphttp/tempo: { endpoint: https://tempo.interno:4318 }
service:
  pipelines:
    traces: { receivers: [otlp], processors: [attributes/remover-pii, tail_sampling], exporters: [otlphttp/tempo] }` },
  docs: [['OpenTelemetry · Collector', 'https://opentelemetry.io/docs/collector/'], ['OpenTelemetry · Sampling', 'https://opentelemetry.io/docs/concepts/sampling/'], ['Grafana Tempo', 'https://grafana.com/docs/tempo/latest/']],
  perguntas: [`Quanto custa a observabilidade do seu sistema, e quanto disso é ruído?`, `Qual a vantagem da amostragem por cauda sobre a por cabeça?`, `Por que um pipeline de telemetria evita dependência de fornecedor?`] },

{ id: 'dev-environments', stage: 'avancado', level: 'importante', title: 'Ambientes de desenvolvimento reproduzíveis', short: 'Dev environments',
  resumo: `"Funciona na minha máquina" para todo mundo: devcontainers, Nix e ambientes na nuvem.`,
  porque: `Horas perdidas configurando a máquina de cada pessoa nova, versões diferentes de ferramentas e bugs que só aparecem num ambiente são custos reais. Ambientes reproduzíveis os eliminam e também servem para agentes de IA.`,
  como: [
    `<b>Dev containers</b> descrevem em um arquivo o container de desenvolvimento (imagem, ferramentas, extensões do editor, serviços como banco), usados pelo VS Code, JetBrains e GitHub Codespaces. <b>Nix</b> e devbox fixam versões exatas de ferramentas de forma declarativa. Gerenciadores de versão (mise, asdf, Volta) cobrem o caso mais simples.`,
    `Complementos: <b>Docker Compose</b> para as dependências locais, scripts de bootstrap com dados de exemplo, ambientes na nuvem (Codespaces, Gitpod, Coder) para começar em minutos e o mesmo ambiente usado no CI para reduzir diferenças.`,
  ],
  conecta: [['ambientes', 'Paridade entre desenvolvimento e produção.'], ['backend/docker', 'Containers como base.'], ['praticas/onboarding', 'Pessoas novas produtivas em horas.'], ['ia/sandbox-permissoes', 'Agentes também precisam de ambientes isolados.']],
  front: `Fixar a versão do Node e do gerenciador de pacotes (engines, packageManager, .nvmrc) já evita a maioria dos "aqui funciona" em projetos de front.`,
  ex: { lang: 'json', code: `// .devcontainer/devcontainer.json
{
  "name": "loja",
  "dockerComposeFile": "docker-compose.dev.yml",   // app + postgres + redis
  "service": "app",
  "features": {
    "ghcr.io/devcontainers/features/node:1": { "version": "22" },
    "ghcr.io/devcontainers/features/aws-cli:1": {}
  },
  "postCreateCommand": "npm ci && npm run db:seed",
  "customizations": { "vscode": { "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"] } }
}` },
  docs: [['Development Containers', 'https://containers.dev/'], ['GitHub Codespaces', 'https://docs.github.com/en/codespaces'], ['Nix · Zero to Nix', 'https://zero-to-nix.com/']],
  perguntas: [`Quanto tempo uma pessoa nova leva para rodar o seu projeto?`, `Que diferenças entre máquinas já causaram bugs no seu time?`, `Que vantagem tem usar o mesmo ambiente no desenvolvimento e no CI?`] },
]
