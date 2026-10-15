import type { Topic } from '../../../types'

export const containers: Topic[] = [
{ id: 'dockerfile', stage: 'containers', level: 'essencial', title: 'Dockerfile e imagens enxutas', short: 'Dockerfile',
  resumo: `Escrever imagens pequenas, rápidas de construir e seguras.`,
  porque: `Imagens grandes deixam o deploy lento e trazem centenas de pacotes com vulnerabilidades. Um Dockerfile mal ordenado reconstrói tudo a cada mudança de uma linha.`,
  como: [
    `Cada instrução cria uma <b>camada</b>, e o Docker reaproveita camadas que não mudaram. Por isso a ordem importa: copie primeiro os arquivos de dependência (<code>package.json</code>, lockfile), instale, e só depois copie o código. Assim, mudar o código não reinstala as dependências.`,
    `Use <b>multi-stage build</b>: um estágio com ferramentas de build e um final só com o necessário para rodar. Prefira imagens base pequenas (<code>-slim</code>, <code>distroless</code>, Alpine com cuidado), rode como usuário não root, use <code>.dockerignore</code> e fixe versões da imagem base.`,
  ],
  conecta: [['backend/docker', 'Os conceitos de imagem e container.'], ['artefatos', 'A imagem é o artefato que vai para produção.'], ['seguranca/hardening', 'Imagens mínimas reduzem a superfície de ataque.'], ['pipelines', 'Cache de camadas acelera o build no CI.']],
  front: `Um front pode virar uma imagem de poucos MB: build com Node num estágio, e Nginx servindo a pasta <code>dist</code> no estágio final.`,
  ex: { lang: 'dockerfile', code: `# estágio 1: build
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# estágio 2: só o necessário para rodar
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]` },
  docs: [['Docker · Boas práticas de build', 'https://docs.docker.com/build/building/best-practices/'], ['Docker · Multi-stage builds', 'https://docs.docker.com/build/building/multi-stage/'], ['Google · Distroless images', 'https://github.com/GoogleContainerTools/distroless']],
  perguntas: [`Por que copiar o package.json antes do resto do código?`, `O que fica de fora da imagem final num multi-stage build?`, `Por que rodar o container como usuário não root?`] },

{ id: 'kubernetes', stage: 'containers', level: 'essencial', title: 'Kubernetes: conceitos', short: 'Kubernetes',
  resumo: `O orquestrador que mantém containers rodando no estado que você declarou.`,
  porque: `Kubernetes virou o padrão de plataforma em muitas empresas. Mesmo sem operá-lo, você vai ouvir sobre pods, deployments e namespaces e precisar ler logs e status deles.`,
  como: [
    `Você declara o <b>estado desejado</b> em YAML e o Kubernetes trabalha continuamente para chegar nele (<i>reconciliação</i>). Um <b>Pod</b> é a menor unidade: um ou mais containers juntos. Um <b>Deployment</b> mantém N réplicas de um pod e faz rolling updates. <b>Namespaces</b> separam ambientes ou times.`,
    `O cluster tem um <b>control plane</b> (API server, scheduler, controladores, etcd) e <b>nós</b> que rodam os pods. Tudo passa pela API: <code>kubectl get pods</code>, <code>kubectl logs</code>, <code>kubectl describe</code> e <code>kubectl rollout</code> são os comandos do dia a dia. Na nuvem, use um cluster gerenciado (EKS, GKE, AKS).`,
  ],
  conecta: [['backend/docker', 'Kubernetes orquestra containers.'], ['k8s-rede', 'Services e Ingress expõem os pods.'], ['k8s-config', 'Configuração e saúde dos pods.'], ['capacidade', 'Autoscaling de pods e de nós.'], ['backend/escala', 'Réplicas são a escala horizontal na prática.']],
  front: `Quando o backend diz "o pod está em CrashLoopBackOff", significa que o container inicia, cai e é reiniciado em loop, quase sempre por erro na inicialização ou configuração faltando.`,
  ex: { lang: 'yaml', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-pedidos
  namespace: loja
spec:
  replicas: 3
  selector:
    matchLabels: { app: api-pedidos }
  template:
    metadata:
      labels: { app: api-pedidos }
    spec:
      containers:
        - name: api
          image: ghcr.io/loja/api-pedidos:3f9a2c1
          ports: [{ containerPort: 3000 }]

# kubectl get pods -n loja
# kubectl logs -n loja deploy/api-pedidos -f
# kubectl rollout undo -n loja deploy/api-pedidos` },
  docs: [['Kubernetes · Conceitos', 'https://kubernetes.io/docs/concepts/'], ['Kubernetes · Deployments', 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'], ['Kubernetes · kubectl quick reference', 'https://kubernetes.io/docs/reference/kubectl/quick-reference/']],
  perguntas: [`O que significa dizer que o Kubernetes é declarativo?`, `Qual a diferença entre um Pod e um Deployment?`, `O que você investigaria num pod em CrashLoopBackOff?`] },

{ id: 'k8s-rede', stage: 'containers', level: 'importante', title: 'Services, Ingress e rede no Kubernetes', short: 'K8s rede',
  resumo: `Como pods encontram uns aos outros e como o tráfego externo chega até eles.`,
  porque: `Pods nascem e morrem com IPs diferentes. Sem entender Services e Ingress, fica difícil saber por que uma rota não responde ou por que um serviço não acha o outro.`,
  como: [
    `Um <b>Service</b> dá um nome e um IP estável a um grupo de pods (selecionados por labels) e balanceia entre eles. Dentro do cluster, outro pod chama <code>http://api-pedidos.loja.svc.cluster.local</code> ou só <code>http://api-pedidos</code>, resolvido pelo DNS interno. Tipos: <code>ClusterIP</code> (interno), <code>NodePort</code> e <code>LoadBalancer</code> (cria um LB na nuvem).`,
    `O <b>Ingress</b> (ou a mais nova <b>Gateway API</b>) define regras HTTP de entrada: domínio, caminho, TLS. Um <b>ingress controller</b> (Nginx, Traefik, o LB da nuvem) aplica essas regras. <b>NetworkPolicies</b> funcionam como firewall entre pods.`,
  ],
  conecta: [['kubernetes', 'Services apontam para os pods de um Deployment.'], ['backend/load-balancer', 'Ingress é um load balancer L7.'], ['backend/dns', 'O cluster tem seu próprio DNS interno.'], ['service-mesh', 'Adiciona mTLS, retries e métricas entre serviços.']],
  front: `Rotas como <code>loja.com/</code> para o front e <code>loja.com/api</code> para o backend, servidas pelo mesmo domínio, normalmente são regras de Ingress.`,
  ex: { lang: 'yaml', code: `apiVersion: v1
kind: Service
metadata: { name: api-pedidos, namespace: loja }
spec:
  selector: { app: api-pedidos }
  ports: [{ port: 80, targetPort: 3000 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: loja, namespace: loja }
spec:
  tls: [{ hosts: [loja.com], secretName: loja-tls }]
  rules:
    - host: loja.com
      http:
        paths:
          - { path: /api, pathType: Prefix, backend: { service: { name: api-pedidos, port: { number: 80 } } } }
          - { path: /, pathType: Prefix, backend: { service: { name: front, port: { number: 80 } } } }` },
  docs: [['Kubernetes · Service', 'https://kubernetes.io/docs/concepts/services-networking/service/'], ['Kubernetes · Ingress', 'https://kubernetes.io/docs/concepts/services-networking/ingress/'], ['Kubernetes · Gateway API', 'https://kubernetes.io/docs/concepts/services-networking/gateway/']],
  perguntas: [`Por que não chamar um pod diretamente pelo IP dele?`, `Qual a diferença entre um Service do tipo ClusterIP e um do tipo LoadBalancer?`, `O que é preciso além do recurso Ingress para ele funcionar?`] },

{ id: 'k8s-config', stage: 'containers', level: 'importante', title: 'ConfigMaps, Secrets, probes e recursos', short: 'K8s config',
  resumo: `Configurar pods, verificar a saúde deles e reservar CPU e memória.`,
  porque: `A maioria dos problemas de pods em produção vem daqui: configuração errada, probe mal definida que reinicia o pod sem parar, ou limite de memória baixo que mata o container.`,
  como: [
    `<b>ConfigMaps</b> guardam configuração e <b>Secrets</b> guardam credenciais; ambos viram variáveis de ambiente ou arquivos no pod. Secrets são só codificados em base64, então use criptografia no etcd ou integração com cofres (External Secrets).`,
    `<b>Probes</b>: a <i>readiness</i> diz se o pod pode receber tráfego; a <i>liveness</i> diz se precisa ser reiniciado; a <i>startup</i> dá tempo para apps lentos iniciarem. <b>Requests</b> reservam CPU e memória para o agendamento; <b>limits</b> definem o teto, e passar do limite de memória mata o container (OOMKilled).`,
  ],
  conecta: [['kubernetes', 'Configuram os pods de um Deployment.'], ['backend/segredos', 'Secrets do cluster e cofres de segredos.'], ['processos-recursos', 'Requests e limits são CPU e memória da máquina.'], ['estrategias-deploy', 'Readiness evita mandar tráfego para pods que não estão prontos.']],
  front: `O endpoint <code>/health</code> que o backend expõe é o que a readiness probe consulta. Se ele depende do banco, uma lentidão no banco pode tirar todos os pods do ar de uma vez.`,
  ex: { lang: 'yaml', code: `containers:
  - name: api
    image: ghcr.io/loja/api-pedidos:3f9a2c1
    envFrom:
      - configMapRef: { name: api-config }
      - secretRef: { name: api-secrets }
    resources:
      requests: { cpu: 250m, memory: 256Mi }
      limits: { memory: 512Mi }
    readinessProbe:
      httpGet: { path: /health/ready, port: 3000 }
      periodSeconds: 5
    livenessProbe:
      httpGet: { path: /health/live, port: 3000 }
      initialDelaySeconds: 10` },
  docs: [['Kubernetes · Probes', 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/'], ['Kubernetes · Gerenciar recursos de containers', 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/'], ['Kubernetes · Secrets', 'https://kubernetes.io/docs/concepts/configuration/secret/']],
  perguntas: [`Qual a diferença entre readiness e liveness?`, `Por que uma liveness probe que verifica o banco pode piorar um incidente?`, `O que acontece quando um container passa do limit de memória?`] },

{ id: 'helm', stage: 'containers', level: 'importante', title: 'Helm e empacotamento', short: 'Helm',
  resumo: `Pacotes reutilizáveis de manifestos Kubernetes com valores por ambiente.`,
  porque: `Uma aplicação real tem Deployment, Service, Ingress, ConfigMap e mais, repetidos por ambiente. Helm é a forma mais comum de empacotar e instalar isso, incluindo ferramentas de terceiros.`,
  como: [
    `Um <b>chart</b> é um conjunto de templates YAML com variáveis. Os valores ficam em <code>values.yaml</code> e podem ser sobrescritos por ambiente (<code>values-prod.yaml</code>). <code>helm install</code> e <code>helm upgrade</code> criam uma <b>release</b> versionada, e <code>helm rollback</code> volta para uma versão anterior.`,
    `Charts públicos instalam ferramentas prontas (ingress-nginx, Prometheus, cert-manager). Alternativa sem templates: o <b>Kustomize</b>, que aplica "patches" sobre uma base, já embutido no kubectl.`,
  ],
  conecta: [['kubernetes', 'Helm gera e instala manifestos Kubernetes.'], ['gitops', 'Ferramentas de GitOps aplicam charts a partir do Git.'], ['ambientes', 'Valores diferentes para cada ambiente.']],
  front: `É como um pacote do npm com configurações: você instala o chart e passa opções em vez de copiar dezenas de arquivos YAML.`,
  ex: { lang: 'yaml', code: `# values.yaml (padrão)
replicaCount: 2
image: { repository: ghcr.io/loja/api-pedidos, tag: latest }
ingress: { host: staging.loja.com }

# values-prod.yaml (sobrescreve)
replicaCount: 6
ingress: { host: loja.com }

# helm upgrade --install api ./chart -f values-prod.yaml --set image.tag=3f9a2c1
# helm rollback api 41` },
  docs: [['Helm · Documentação', 'https://helm.sh/docs/'], ['Helm · Chart template guide', 'https://helm.sh/docs/chart_template_guide/'], ['Kustomize', 'https://kubectl.docs.kubernetes.io/references/kustomize/']],
  perguntas: [`Que problema o Helm resolve em relação a manifestos YAML soltos?`, `Quando o Kustomize pode ser mais simples que o Helm?`, `Como você faria rollback de uma release que quebrou?`] },

{ id: 'service-mesh', stage: 'containers', level: 'aprofundar', title: 'Service mesh', short: 'Service mesh',
  resumo: `Uma camada de rede entre serviços com mTLS, retries e métricas sem mudar o código.`,
  porque: `Com dezenas de serviços, implementar mTLS, timeouts, retries e métricas em cada um é repetitivo. Um service mesh tira isso do código, mas acrescenta complexidade operacional considerável.`,
  como: [
    `Em malhas como <b>Istio</b> e <b>Linkerd</b>, cada pod ganha um <b>proxy sidecar</b> (geralmente Envoy) que intercepta o tráfego, ou o proxy roda por nó (modo ambient). Um control plane distribui as regras para os proxies.`,
    `Recursos típicos: <b>mTLS automático</b> entre serviços, retries e timeouts configuráveis, <b>traffic splitting</b> para canary, circuit breaking e métricas e traces padronizados. Avalie se o tamanho do sistema justifica o custo; muitas empresas vivem bem sem mesh.`,
  ],
  conecta: [['k8s-rede', 'O mesh opera sobre a rede do cluster.'], ['backend/https-tls', 'mTLS entre serviços.'], ['backend/idempotencia', 'Retries automáticos exigem operações idempotentes.'], ['estrategias-deploy', 'Divisão de tráfego para canary.']],
  front: `É parecido com interceptors do axios aplicados a todas as chamadas entre serviços, só que configurado na infraestrutura e não no código.`,
  ex: { lang: 'yaml', code: `# Istio: 90% do tráfego na v1 e 10% na v2 (canary)
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata: { name: api-pedidos }
spec:
  hosts: [api-pedidos]
  http:
    - route:
        - destination: { host: api-pedidos, subset: v1 }
          weight: 90
        - destination: { host: api-pedidos, subset: v2 }
          weight: 10
      retries: { attempts: 2, perTryTimeout: 2s }` },
  docs: [['Istio · O que é um service mesh', 'https://istio.io/latest/about/service-mesh/'], ['Linkerd · Documentação', 'https://linkerd.io/2/overview/'], ['Envoy proxy', 'https://www.envoyproxy.io/docs/envoy/latest/intro/what_is_envoy']],
  perguntas: [`Que responsabilidades um service mesh tira do código?`, `Que custo operacional ele acrescenta?`, `Por que retries automáticos no mesh exigem cuidado com idempotência?`] },
]
