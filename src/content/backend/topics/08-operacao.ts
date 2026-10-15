import type { Topic } from '../../../types'

export const operacao: Topic[] = [
{ id: 'testes', stage: 'operacao', level: 'essencial', title: 'Testes automatizados', short: 'Testes',
  resumo: `Unitários, de integração, de contrato e end-to-end: o que testar em cada nível.`,
  porque: `Testes permitem mudar código com confiança e fazer deploy várias vezes por dia. No backend, os de integração costumam pegar os bugs mais caros.`,
  como: [
    `<b>Unitário</b>: uma função ou classe isolada, rápido, com dependências falsas. <b>Integração</b>: o código com banco, fila ou API reais (o Testcontainers sobe um Postgres em Docker só para o teste). <b>Contrato</b>: garante que produtor e consumidor concordam. <b>E2E</b>: o sistema inteiro, lento e frágil, então use poucos.`,
    `A <b>pirâmide de testes</b> sugere muitos unitários e poucos E2E. Muitos times de backend preferem o formato de "troféu", com mais testes de integração da API, porque mocks demais escondem problemas reais.`,
  ],
  conecta: [['contratos', 'Testes de contrato protegem a integração com o front.'], ['cicd', 'O pipeline roda todos os testes a cada push.'], ['camadas', 'Injeção de dependência facilita trocar dependências por falsas.'], ['docker', 'Testcontainers usa Docker para subir bancos reais.']],
  front: `Jest, Vitest e Testing Library usam os mesmos conceitos. O MSW simula a API no front, e um teste de contrato garante que essa simulação continua igual à API real.`,
  ex: { lang: 'typescript', code: `// teste de integração da API com supertest
it("cria pedido e retorna 201", async () => {
  const res = await request(app)
    .post("/pedidos")
    .send({ produtoId: 42, quantidade: 2 })
    .expect(201);

  expect(res.body).toMatchObject({ status: "PENDENTE" });
  expect(await db.pedido.count()).toBe(1);
});` },
  docs: [['Martin Fowler · The Practical Test Pyramid', 'https://martinfowler.com/articles/practical-test-pyramid.html'], ['Testcontainers', 'https://testcontainers.com/'], ['Kent C. Dodds · The Testing Trophy', 'https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications']],
  perguntas: [`Que tipo de bug um teste unitário com mocks não pega?`, `Por que ter poucos testes E2E?`, `Que problema o Testcontainers resolve?`] },

{ id: 'docker', stage: 'operacao', level: 'essencial', title: 'Containers e Docker', short: 'Docker',
  resumo: `Empacotar a aplicação com tudo de que ela precisa para rodar igual em qualquer lugar.`,
  porque: `É o formato padrão de entrega de backend. Também permite subir banco, Redis e fila na sua máquina com um comando, o que é ótimo para estudar.`,
  como: [
    `Uma <b>imagem</b> é um pacote imutável (sistema base, runtime, dependências e código) descrito por um <b>Dockerfile</b>. Um <b>container</b> é a imagem em execução: um processo isolado que compartilha o kernel do host, por isso é bem mais leve que uma máquina virtual.`,
    `O <b>Docker Compose</b> sobe vários containers juntos (API + Postgres + Redis), com uma rede entre eles. Em produção, um orquestrador como <b>Kubernetes</b> ou ECS decide onde cada container roda, reinicia o que cai e escala réplicas. As imagens ficam num registry (Docker Hub, ECR, GHCR).`,
  ],
  conecta: [['linux', 'Containers usam recursos do kernel Linux para isolar processos.'], ['cicd', 'O pipeline constrói e publica a imagem.'], ['escala', 'Orquestradores escalam réplicas de containers.'], ['redes-infra', 'Containers se comunicam por redes virtuais.']],
  front: `O build de um front pode virar uma imagem Nginx servindo os arquivos estáticos. Multi-stage builds deixam a imagem final pequena.`,
  ex: { lang: 'yaml', code: `# docker-compose.yml: um ambiente de estudo completo
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:app@db:5432/loja
      REDIS_URL: redis://cache:6379
    depends_on: [db, cache]
  db:
    image: postgres:16
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: loja }
  cache:
    image: redis:7` },
  docs: [['Docker · Get started', 'https://docs.docker.com/get-started/'], ['Docker · Compose', 'https://docs.docker.com/compose/'], ['Kubernetes · Visão geral', 'https://kubernetes.io/docs/concepts/overview/']],
  perguntas: [`Qual a diferença entre imagem e container?`, `Por que um container é mais leve que uma máquina virtual?`, `No compose, por que a API acessa o banco por "db" e não por "localhost"?`] },

{ id: 'cicd', stage: 'operacao', level: 'importante', title: 'CI/CD', short: 'CI/CD',
  resumo: `Automatizar build, testes e deploy a cada mudança no código.`,
  porque: `É o caminho entre o seu merge e a produção. Entender o pipeline ajuda a diagnosticar builds quebrados e a discutir estratégias de deploy sem downtime.`,
  como: [
    `<b>CI</b> (integração contínua): a cada push, o pipeline instala dependências e roda lint, testes e build. <b>CD</b> (entrega ou deploy contínuo): o artefato aprovado, como uma imagem Docker, vai para staging e depois para produção, com as migrations rodando no caminho.`,
    `Estratégias de deploy: <b>rolling</b> (troca as instâncias aos poucos), <b>blue-green</b> (duas versões completas no ar, e o tráfego muda de uma vez) e <b>canary</b> (5% dos usuários recebem a versão nova primeiro). <b>Feature flags</b> separam deploy de lançamento: o código vai para produção desligado.`,
  ],
  conecta: [['testes', 'O pipeline barra o merge se os testes falharem.'], ['docker', 'O artefato publicado costuma ser uma imagem.'], ['orm', 'Migrations rodam durante o deploy.'], ['observabilidade', 'Métricas dizem se a versão nova está saudável.']],
  front: `Preview deploys por PR (Vercel, Netlify) são CD aplicado ao front. As mesmas ideias de canary e feature flag servem para lançar telas novas.`,
  ex: { lang: 'yaml', code: `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm test` },
  docs: [['GitHub Actions · Documentação', 'https://docs.github.com/en/actions'], ['Martin Fowler · Continuous Integration', 'https://martinfowler.com/articles/continuousIntegration.html'], ['Martin Fowler · Canary Release', 'https://martinfowler.com/bliki/CanaryRelease.html'], ['Martin Fowler · Feature Toggles', 'https://martinfowler.com/articles/feature-toggles.html']],
  perguntas: [`Qual a diferença entre blue-green e canary?`, `Por que separar deploy de lançamento com feature flags?`, `Em que etapa do pipeline as migrations rodam, e por quê?`] },

{ id: 'observabilidade', stage: 'operacao', level: 'essencial', title: 'Observabilidade', short: 'Observabilidade',
  resumo: `Logs, métricas e traces para entender o que o sistema faz em produção.`,
  porque: `Em produção não existe debugger. Quando algo quebra às 3 da manhã, é a observabilidade que diz onde, quando e por quê.`,
  como: [
    `<b>Logs</b>: eventos com contexto, de preferência estruturados em JSON e com um <b>request id</b>. <b>Métricas</b>: números agregados no tempo (requisições por segundo, taxa de erro, latência p95 e p99, uso de CPU), coletados pelo Prometheus e vistos no Grafana. <b>Traces</b>: o caminho de uma requisição por vários serviços, com o tempo de cada etapa.`,
    `O <b>OpenTelemetry</b> é o padrão aberto para instrumentar os três. Os times definem <b>SLOs</b> (ex.: 99,9% das requisições abaixo de 300 ms) e alertam por sintomas que o usuário sente, não por CPU alta. Os "golden signals" são latência, tráfego, erros e saturação.`,
  ],
  conecta: [['linux', 'Logs saem em stdout e são coletados pela infra.'], ['microsservicos', 'Sem tracing distribuído, depurar serviços é adivinhação.'], ['cicd', 'Métricas validam se um deploy deu certo.'], ['indices', 'Slow queries aparecem em logs e métricas.']],
  front: `Propagar o header <code>traceparent</code> a partir do front permite ver numa só tela o clique do usuário até a query no banco. Ferramentas como Sentry e Datadog RUM fazem o mesmo do lado do navegador.`,
  ex: { lang: 'json', code: `{
  "level": "error",
  "time": "2026-10-15T14:03:22.481Z",
  "requestId": "req_8f2a",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "route": "POST /pedidos",
  "status": 502,
  "durationMs": 3012,
  "msg": "timeout ao chamar o serviço de pagamento"
}` },
  docs: [['OpenTelemetry · Observability primer', 'https://opentelemetry.io/docs/concepts/observability-primer/'], ['Prometheus · Visão geral', 'https://prometheus.io/docs/introduction/overview/'], ['Google SRE Book · Monitoring', 'https://sre.google/sre-book/monitoring-distributed-systems/']],
  perguntas: [`Por que a latência p99 importa mais que a média?`, `Qual a diferença entre log, métrica e trace?`, `O que é um SLO, e como ele é diferente de um SLA?`] },

{ id: 'redes-infra', stage: 'operacao', level: 'importante', title: 'Proxy reverso, firewall e VPC', short: 'Firewall e VPC',
  resumo: `Como a infraestrutura isola, protege e encaminha o tráfego até a aplicação.`,
  porque: `São termos de DevOps que aparecem em toda integração: "libera a porta no security group", "o banco está em subnet privada", "passa pelo WAF". Entender o desenho evita horas de "funciona local, mas não no ambiente".`,
  como: [
    `Um <b>proxy reverso</b> (Nginx, Traefik, Envoy) recebe requisições em nome dos servidores: termina TLS, comprime, faz cache e roteia. Um <b>firewall</b> filtra tráfego por IP, porta e protocolo; na nuvem aparece como <b>security groups</b> e network ACLs. Um <b>WAF</b> filtra no nível HTTP, bloqueando SQL injection e bots.`,
    `Uma <b>VPC</b> é sua rede privada na nuvem, dividida em <b>subnets públicas</b> (load balancer, saída para a internet) e <b>privadas</b> (API e banco, sem IP público). Um <b>NAT gateway</b> deixa as máquinas privadas acessarem a internet sem ficarem acessíveis por ela. O acesso administrativo passa por VPN ou bastion.`,
  ],
  conecta: [['load-balancer', 'Fica na borda pública da VPC.'], ['internet', 'Firewalls trabalham com IP, porta e protocolo.'], ['https-tls', 'O proxy reverso costuma cuidar dos certificados.'], ['docker', 'Containers ganham redes virtuais com regras parecidas.']],
  front: `Quando a API funciona na VPN e não fora dela, ou o ambiente de homologação só aceita IPs da empresa, é firewall ou allowlist em ação.`,
  ex: { lang: 'diagrama', code: `Internet
   |
[ WAF / CDN ]
   |
+------------------- VPC 10.0.0.0/16 --------------------+
|  subnet pública 10.0.1.0/24                            |
|    [Load Balancer]  SG: libera 443 de 0.0.0.0/0        |
|          |                                             |
|  subnet privada 10.0.2.0/24                            |
|    [API x3]         SG: libera 3000 só do SG do LB     |
|          |                                             |
|  subnet privada 10.0.3.0/24                            |
|    [Postgres]       SG: libera 5432 só do SG da API    |
+--------------------------------------------------------+` },
  docs: [['Cloudflare · O que é um firewall', 'https://www.cloudflare.com/learning/security/what-is-a-firewall/'], ['Cloudflare · O que é um proxy reverso', 'https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/'], ['AWS · O que é Amazon VPC', 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html']],
  perguntas: [`Por que o banco fica numa subnet privada?`, `Qual a diferença entre um firewall de rede e um WAF?`, `Que tarefas um proxy reverso tira da aplicação?`] },
]
