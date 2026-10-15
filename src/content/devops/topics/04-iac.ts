import type { Topic } from '../../../types'

export const iac: Topic[] = [
{ id: 'iac', stage: 'iac', level: 'essencial', title: 'Infraestrutura como código', short: 'IaC',
  resumo: `Descrever servidores, redes e serviços em arquivos versionados em vez de cliques num painel.`,
  porque: `Infra criada à mão no console não tem histórico, não é revisada e não pode ser recriada com confiança. IaC traz para a infraestrutura as mesmas práticas que você já usa no código: Git, code review e automação.`,
  como: [
    `No estilo <b>declarativo</b> (Terraform, CloudFormation, Pulumi), você descreve o resultado desejado e a ferramenta calcula o que criar, mudar ou apagar. No <b>imperativo</b> (scripts, SDKs), você descreve os passos. Para infra, o declarativo é o padrão porque lida melhor com o que já existe.`,
    `Benefícios: ambientes reproduzíveis, revisão por pull request, histórico de quem mudou o quê e recuperação rápida após desastres. O inimigo é o <b>drift</b>: alguém altera algo à mão no console e o código deixa de refletir a realidade.`,
  ],
  conecta: [['terraform', 'A ferramenta de IaC mais usada.'], ['gitops', 'Leva a ideia do Git como fonte da verdade até o deploy.'], ['ambientes', 'IaC cria ambientes idênticos.'], ['praticas/code-review', 'Mudanças de infra passam por review como código.']],
  front: `É a mesma lógica de declarar a UI em JSX em vez de manipular o DOM passo a passo: você descreve o estado final e a ferramenta descobre as operações.`,
  ex: { lang: 'texto', code: `Sem IaC                         Com IaC
─────────────────────────────   ─────────────────────────────
clica no console                 abre PR com o arquivo .tf
ninguém revisa                   colega revisa o plan
"quem mudou isso?"               git blame
recriar ambiente: dias           terraform apply: minutos
staging ≠ produção               mesmo código, variáveis diferentes` },
  docs: [['HashiCorp · O que é IaC', 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code'], ['Martin Fowler · Infrastructure as Code', 'https://martinfowler.com/bliki/InfrastructureAsCode.html'], ['Pulumi · IaC em linguagens de programação', 'https://www.pulumi.com/docs/iac/concepts/']],
  perguntas: [`Que parte da infra do seu time ainda é criada à mão?`, `O que é drift e como ele aparece?`, `Por que o estilo declarativo domina em infraestrutura?`] },

{ id: 'terraform', stage: 'iac', level: 'essencial', title: 'Terraform', short: 'Terraform',
  resumo: `Declarar recursos de nuvem em HCL, revisar o plano e aplicar.`,
  porque: `Terraform (e o fork aberto OpenTofu) é a ferramenta de IaC mais usada e funciona com quase todos os provedores. Ler um <code>terraform plan</code> é uma habilidade útil até para quem só revisa PRs de infra.`,
  como: [
    `Você escreve <b>resources</b> em HCL usando <b>providers</b> (AWS, GCP, Cloudflare, GitHub...). O fluxo é <code>init</code> → <code>plan</code> (mostra o que vai mudar) → <code>apply</code>. O Terraform guarda um <b>state</b> que liga o código aos recursos reais; ele deve ficar num backend remoto com lock (S3, GCS, Terraform Cloud), nunca no Git.`,
    `<b>Variáveis</b> e <b>outputs</b> parametrizam o código; <b>módulos</b> empacotam conjuntos reutilizáveis (uma VPC padrão, um serviço completo). Leia o plan com atenção: "destroy" ou "replace" num banco é o tipo de linha que evita desastres.`,
  ],
  conecta: [['iac', 'Terraform é IaC declarativa.'], ['cloud-modelos', 'Cria recursos em qualquer provedor.'], ['pipelines', 'Plan no PR e apply após o merge.'], ['iam', 'O Terraform precisa de permissões, e também as cria.']],
  front: `O state é parecido com o virtual DOM: uma representação do que existe, comparada ao estado desejado para calcular a diferença mínima.`,
  ex: { lang: 'hcl', code: `terraform {
  backend "s3" {
    bucket = "loja-terraform-state"
    key    = "prod/app.tfstate"
    region = "sa-east-1"
  }
}

resource "aws_s3_bucket" "uploads" {
  bucket = "loja-uploads-\${var.ambiente}"
}

resource "aws_sqs_queue" "pedidos" {
  name                      = "pedidos-\${var.ambiente}"
  message_retention_seconds = 345600
}

output "fila_url" { value = aws_sqs_queue.pedidos.url }

# terraform plan  →  + 2 to add, 0 to change, 0 to destroy` },
  docs: [['Terraform · Documentação', 'https://developer.hashicorp.com/terraform/docs'], ['Terraform · State', 'https://developer.hashicorp.com/terraform/language/state'], ['OpenTofu', 'https://opentofu.org/docs/']],
  perguntas: [`Por que o state do Terraform não deve ficar no Git?`, `O que você procuraria primeiro ao revisar um terraform plan?`, `Quando faz sentido criar um módulo?`] },

{ id: 'gitops', stage: 'iac', level: 'importante', title: 'GitOps e Argo CD', short: 'GitOps',
  resumo: `O Git como fonte da verdade do que está rodando, com sincronização automática.`,
  porque: `Em vez de o pipeline "empurrar" deploys para o cluster, um agente dentro do cluster "puxa" o estado desejado do Git. Rollback vira um revert, e o histórico do Git vira o histórico de deploys.`,
  como: [
    `Um repositório guarda os manifestos (YAML, Helm, Kustomize) de cada ambiente. Um operador como <b>Argo CD</b> ou <b>Flux</b> compara continuamente o cluster com o Git e aplica as diferenças. Mudanças manuais no cluster são detectadas como <b>drift</b> e revertidas.`,
    `O pipeline de CI só constrói a imagem e abre um commit (ou PR) atualizando a tag no repositório de configuração. O deploy acontece quando esse commit entra. Vantagens: auditoria, revisão, rollback simples e menos credenciais de cluster espalhadas no CI.`,
  ],
  conecta: [['iac', 'GitOps aplica IaC de forma contínua.'], ['helm', 'Argo CD e Flux aplicam charts Helm.'], ['pipelines', 'O CI atualiza o repositório de configuração.'], ['estrategias-deploy', 'Ferramentas como Argo Rollouts fazem canary.']],
  front: `Plataformas como a Vercel, em que um merge na main publica o site, seguem uma lógica parecida: o estado do Git define o que está no ar.`,
  ex: { lang: 'yaml', code: `# Argo CD: mantém o namespace "loja" igual à pasta do Git
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata: { name: loja-prod, namespace: argocd }
spec:
  source:
    repoURL: https://github.com/loja/infra-config
    path: apps/loja/prod
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: loja
  syncPolicy:
    automated: { prune: true, selfHeal: true }` },
  docs: [['OpenGitOps · Princípios', 'https://opengitops.dev/'], ['Argo CD · Documentação', 'https://argo-cd.readthedocs.io/en/stable/'], ['Flux · Documentação', 'https://fluxcd.io/flux/']],
  perguntas: [`Qual a diferença entre deploy por "push" e por "pull"?`, `Como fica o rollback num fluxo GitOps?`, `O que acontece se alguém alterar o cluster à mão?`] },

{ id: 'ambientes', stage: 'iac', level: 'essencial', title: 'Ambientes: dev, staging e produção', short: 'Ambientes',
  resumo: `Separar onde se desenvolve, onde se valida e onde o usuário usa.`,
  porque: `"Funcionou em staging e quebrou em produção" quase sempre vem de diferenças entre ambientes. Saber como os ambientes são montados ajuda a testar no lugar certo e a não mexer em dados reais por engano.`,
  como: [
    `Ambientes típicos: <b>local</b>, <b>dev</b> (integração contínua), <b>staging/homologação</b> (o mais parecido possível com produção) e <b>produção</b>. O mesmo <b>artefato</b> (imagem) deve passar por todos; só a <b>configuração</b> muda. Recompilar por ambiente é receita para "funciona aqui, não lá".`,
    `<b>Ambientes efêmeros</b> (preview por pull request) são criados e destruídos automaticamente. Isolamento entre ambientes deve ir até contas de nuvem e bancos separados, e dados de produção não devem ir para ambientes inferiores sem anonimização.`,
  ],
  conecta: [['iac', 'O mesmo código cria cada ambiente.'], ['artefatos', 'O mesmo artefato é promovido entre ambientes.'], ['backend/segredos', 'Cada ambiente tem suas próprias credenciais.'], ['seguranca/lgpd', 'Dados reais em staging são risco de privacidade.']],
  front: `Os arquivos <code>.env.development</code> e <code>.env.production</code> do front são a versão local disso. Previews por PR na Vercel ou Netlify são ambientes efêmeros.`,
  ex: { lang: 'texto', code: `commit 3f9a2c1
   │  CI: testa e gera a imagem api:3f9a2c1  (uma vez só)
   ▼
 dev      ← deploy automático       config: DB_URL=dev-db
   ▼
 staging  ← deploy automático       config: DB_URL=staging-db
   ▼
 produção ← aprovação manual        config: DB_URL=prod-db
            mesma imagem api:3f9a2c1 em todos` },
  docs: [['The Twelve-Factor App · Dev/prod parity', 'https://12factor.net/dev-prod-parity'], ['The Twelve-Factor App · Build, release, run', 'https://12factor.net/build-release-run'], ['AWS · Organização de contas por ambiente', 'https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html']],
  perguntas: [`Por que promover o mesmo artefato em vez de recompilar para cada ambiente?`, `Quais diferenças entre staging e produção já causaram bugs no seu time?`, `Que cuidados tomar antes de copiar dados de produção para staging?`] },

{ id: 'config-management', stage: 'iac', level: 'aprofundar', title: 'Gerência de configuração (Ansible)', short: 'Ansible',
  resumo: `Configurar o software dentro de muitas máquinas de forma repetível.`,
  porque: `Terraform cria as máquinas; algo precisa instalar pacotes, criar usuários e ajustar arquivos dentro delas. Em ambientes com VMs ou servidores físicos, Ansible ainda é muito usado.`,
  como: [
    `O <b>Ansible</b> se conecta por SSH (sem agente instalado) e executa <b>playbooks</b> em YAML com <b>tarefas idempotentes</b>: "garanta que o pacote nginx está instalado" só faz algo se ainda não estiver. Um <b>inventário</b> lista as máquinas e grupos.`,
    `Com containers e imagens imutáveis (você troca a máquina inteira em vez de alterá-la), a gerência de configuração perde espaço, mas continua útil para preparar imagens de VM (com Packer) e para infraestrutura legada.`,
  ],
  conecta: [['shell-scripting', 'Substitui scripts frágeis por tarefas declarativas.'], ['ssh', 'O Ansible opera via SSH.'], ['iac', 'Complementa ferramentas que criam a infraestrutura.']],
  front: `Idempotência aqui é como um <code>useEffect</code> bem escrito: rodar de novo não deve causar efeito duplicado.`,
  ex: { lang: 'yaml', code: `# playbook.yml
- hosts: web
  become: true
  tasks:
    - name: Nginx instalado
      ansible.builtin.apt: { name: nginx, state: present, update_cache: true }
    - name: Configuração do site
      ansible.builtin.template: { src: site.conf.j2, dest: /etc/nginx/sites-enabled/site.conf }
      notify: recarregar nginx
  handlers:
    - name: recarregar nginx
      ansible.builtin.service: { name: nginx, state: reloaded }` },
  docs: [['Ansible · Documentação', 'https://docs.ansible.com/'], ['Ansible · Getting started', 'https://docs.ansible.com/ansible/latest/getting_started/index.html'], ['Packer', 'https://developer.hashicorp.com/packer/docs']],
  perguntas: [`Qual a diferença de papel entre Terraform e Ansible?`, `O que torna uma tarefa idempotente?`, `Por que infraestrutura imutável reduz a necessidade de gerência de configuração?`] },
]
