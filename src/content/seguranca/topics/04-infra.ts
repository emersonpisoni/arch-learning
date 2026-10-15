import type { Topic } from '../../../types'

export const infra: Topic[] = [
{ id: 'hardening', stage: 'infra', level: 'essencial', title: 'Hardening de servidores e containers', short: 'Hardening',
  resumo: `Reduzir a superfície de ataque de máquinas e imagens ao mínimo necessário.`,
  porque: `Configurações padrão priorizam facilidade, não segurança. Um container rodando como root com centenas de pacotes desnecessários transforma qualquer falha da aplicação num problema muito maior.`,
  como: [
    `<b>Servidores</b>: atualizações automáticas de segurança, SSH só com chave e sem root, firewall fechado por padrão, serviços desnecessários desligados e benchmarks como o <b>CIS</b> como referência. <b>Containers</b>: imagens mínimas (distroless, slim), usuário não root, sistema de arquivos somente leitura, sem capabilities extras, sem modo privilegiado e com limites de recursos.`,
    `<b>Varredura de imagens</b> (Trivy, Grype) aponta vulnerabilidades conhecidas nos pacotes; reconstruir as imagens com frequência aplica as correções da imagem base. No Kubernetes, <b>Pod Security Standards</b> e políticas de admissão (Kyverno, OPA Gatekeeper) impedem que pods inseguros sejam implantados.`,
  ],
  conecta: [['devops/dockerfile', 'Imagens enxutas são o primeiro passo.'], ['devops/ssh', 'Endurecer o acesso remoto.'], ['defesa-profundidade', 'Hardening reduz a superfície de ataque.'], ['dependencias', 'Pacotes da imagem também têm vulnerabilidades.']],
  front: `A imagem Nginx que serve um front também deve rodar sem root e só com o necessário; o mesmo vale para servidores de SSR em Node.`,
  ex: { lang: 'yaml', code: `# Kubernetes: pod endurecido
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  seccompProfile: { type: RuntimeDefault }
containers:
  - name: api
    image: ghcr.io/loja/api@sha256:9b1d4f...   # fixada por digest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities: { drop: ["ALL"] }

# varredura da imagem no CI
# trivy image --severity HIGH,CRITICAL --exit-code 1 ghcr.io/loja/api:3f9a2c1` },
  docs: [['CIS Benchmarks', 'https://www.cisecurity.org/cis-benchmarks'], ['Kubernetes · Pod Security Standards', 'https://kubernetes.io/docs/concepts/security/pod-security-standards/'], ['OWASP · Docker Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html'], ['Trivy', 'https://trivy.dev/latest/']],
  perguntas: [`As imagens do seu time rodam como root?`, `Com que frequência as imagens são reconstruídas para aplicar correções?`, `Que capabilities o seu container realmente precisa?`] },

{ id: 'zero-trust', stage: 'infra', level: 'importante', title: 'Zero trust', short: 'Zero trust',
  resumo: `Nunca confiar por localização na rede; verificar sempre identidade e contexto.`,
  porque: `O modelo antigo ("dentro da VPN é confiável") falhou: basta um notebook comprometido ou um serviço vulnerável para o atacante andar livremente. Zero trust é a abordagem que empresas e governos adotaram como referência.`,
  como: [
    `Princípios: <b>verificar explicitamente</b> cada acesso (identidade forte, estado do dispositivo, contexto), <b>menor privilégio</b> por padrão e <b>presumir violação</b> (segmentar para limitar movimentação lateral e monitorar tudo).`,
    `Na prática: acesso a aplicações internas via um <b>proxy com identidade</b> (BeyondCorp, Cloudflare Access, IAP) em vez de VPN aberta; <b>microssegmentação</b> da rede (NetworkPolicies, security groups por serviço); <b>mTLS e identidade de serviços</b>; e autorização em cada serviço, não só na borda.`,
  ],
  conecta: [['defesa-profundidade', 'Zero trust aplica o menor privilégio em todas as camadas.'], ['identidade-servicos', 'Serviços também se autenticam uns com os outros.'], ['backend/redes-infra', 'Segmentação de rede com subnets e security groups.'], ['devops/k8s-rede', 'NetworkPolicies segmentam o cluster.']],
  front: `Ferramentas internas (painéis administrativos, Storybook, ambientes de homologação) costumam ficar atrás de um proxy de identidade: você faz login com a conta da empresa em vez de entrar na VPN.`,
  ex: { lang: 'texto', code: `Modelo de perímetro                   Zero trust
───────────────────────────────────    ───────────────────────────────────────
VPN dá acesso à rede inteira           acesso por aplicação, com identidade e MFA
"está na rede interna, é confiável"    toda chamada verifica quem é e se pode
rede plana entre serviços              segmentação: cada serviço só fala com o necessário
um invasor anda livremente             movimentação lateral é bloqueada e detectada` },
  docs: [['NIST SP 800-207 · Zero Trust Architecture', 'https://csrc.nist.gov/pubs/sp/800/207/final'], ['Google · BeyondCorp', 'https://cloud.google.com/beyondcorp'], ['Cloudflare · O que é zero trust', 'https://www.cloudflare.com/learning/security/glossary/what-is-zero-trust/']],
  perguntas: [`Uma máquina comprometida na rede da sua empresa alcançaria o banco de produção?`, `Como as ferramentas internas do seu time são protegidas?`, `O que é movimentação lateral?`] },

{ id: 'cloud-misconfig', stage: 'infra', level: 'essencial', title: 'Configuração insegura na nuvem', short: 'Cloud misconfig',
  resumo: `Buckets públicos, permissões amplas e chaves expostas: as falhas mais comuns na nuvem.`,
  porque: `A maioria dos vazamentos na nuvem não vem de ataques sofisticados, mas de configuração errada: um bucket aberto, uma porta de banco exposta, uma chave com permissão de administrador num repositório.`,
  como: [
    `Falhas típicas: <b>storage público</b> por engano, <b>IAM com curingas</b> (<code>"Action": "*"</code>), bancos e painéis administrativos <b>expostos à internet</b>, <b>chaves de acesso</b> de longa duração vazadas, logs de auditoria desligados e metadados da instância acessíveis via SSRF.`,
    `Defesas: bloquear acesso público a buckets no nível da conta, <b>guardrails</b> organizacionais (SCPs, políticas de organização), IaC com varredura (Checkov, tfsec) antes do apply, ferramentas de postura (<b>CSPM</b>: Prowler, Security Hub, Security Command Center), CloudTrail e logs de auditoria ligados em todas as contas e alertas para mudanças sensíveis.`,
  ],
  conecta: [['devops/iam', 'Permissões são a fronteira principal.'], ['devops/storage', 'Buckets públicos são o vazamento clássico.'], ['ssrf', 'SSRF leva a credenciais da instância.'], ['devops/iac', 'Configuração revisada e verificada como código.']],
  front: `Se o front sobe arquivos direto para um bucket, a política desse bucket e das URLs pré-assinadas precisa ser revisada com o time de infra: é comum liberar mais do que o necessário.`,
  ex: { lang: 'bash', code: `# varredura de IaC antes do apply
checkov -d infra/terraform

# postura da conta AWS (CIS, boas práticas)
prowler aws --compliance cis_2.0_aws

# bloquear acesso público a todos os buckets da conta
aws s3control put-public-access-block --account-id 123456789012 \\
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true` },
  docs: [['OWASP · Cloud Security (Top 10 cloud-native)', 'https://owasp.org/www-project-cloud-native-application-security-top-10/'], ['Prowler', 'https://docs.prowler.com/'], ['Checkov', 'https://www.checkov.io/1.Welcome/What%20is%20Checkov.html'], ['AWS · Security best practices', 'https://docs.aws.amazon.com/security/']],
  perguntas: [`Existe alguma forma de um bucket da sua empresa ficar público por engano?`, `Quem é avisado quando uma permissão de administrador é criada?`, `Que verificação de segurança roda antes de um terraform apply?`] },

{ id: 'waf-ddos', stage: 'infra', level: 'importante', title: 'WAF, bots e DDoS', short: 'WAF e DDoS',
  resumo: `Proteger a borda contra tráfego malicioso em volume e em conteúdo.`,
  porque: `Sites públicos recebem tráfego automatizado o tempo todo: scrapers, tentativas de login com senhas vazadas, varreduras de vulnerabilidades e, às vezes, ataques de negação de serviço.`,
  como: [
    `<b>DDoS volumétrico</b> (camadas 3 e 4) é absorvido pela capacidade de CDNs e provedores (Cloudflare, AWS Shield). <b>DDoS de aplicação</b> (camada 7) mira rotas caras, como busca e login, e exige rate limiting, cache e regras específicas. O <b>WAF</b> filtra requisições com padrões de ataque conhecidos (conjuntos de regras como o OWASP CRS) e regras próprias.`,
    `<b>Gestão de bots</b> distingue bots bons (buscadores) de ruins (credential stuffing, scalping) usando reputação, comportamento e desafios. WAF é uma camada a mais, não substitui corrigir a aplicação, e regras mal ajustadas bloqueiam usuários legítimos.`,
  ],
  conecta: [['devops/cdn-edge', 'A CDN é a linha de frente.'], ['backend/rate-limit', 'Limites por cliente contra abuso.'], ['cia', 'DDoS ataca a disponibilidade.'], ['defesa-profundidade', 'O WAF é uma camada, não a solução.']],
  front: `Desafios de bot (como Turnstile ou reCAPTCHA) aparecem no front; colocá-los só nos pontos de abuso (login, cadastro, checkout) evita prejudicar a experiência no resto do site.`,
  ex: { lang: 'texto', code: `Camadas na borda
Internet ──> [CDN: absorve volume, cache] ──> [WAF: regras OWASP + próprias]
         ──> [Rate limit por IP/conta na rota /login] ──> [Desafio de bot se suspeito]
         ──> Load balancer ──> Aplicação

Exemplo de regra própria
  se rota = /login e > 10 tentativas/min do mesmo IP → desafio
  se user-agent vazio e rota = /api/busca → bloquear` },
  docs: [['Cloudflare · O que é um ataque DDoS', 'https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/'], ['OWASP · Core Rule Set', 'https://coreruleset.org/'], ['OWASP · Automated Threats to Web Applications', 'https://owasp.org/www-project-automated-threats-to-web-applications/']],
  perguntas: [`Qual rota do seu produto seria o alvo mais barato de um DDoS de aplicação?`, `Como saber se uma regra do WAF está bloqueando usuários legítimos?`, `Onde faz sentido mostrar um desafio de bot?`] },
]
