import type { Topic } from '../../../types'

export const supplyChain: Topic[] = [
{ id: 'dependencias', stage: 'supply-chain', level: 'essencial', title: 'Dependências vulneráveis e maliciosas', short: 'Dependências',
  resumo: `O código de terceiros que roda no seu produto também é responsabilidade sua.`,
  porque: `Um projeto de front típico tem centenas ou milhares de dependências transitivas. Vulnerabilidades conhecidas e pacotes maliciosos publicados no npm são vetores de ataque reais e frequentes.`,
  como: [
    `<b>Vulnerabilidades conhecidas</b> (CVEs) são detectadas por <b>SCA</b> (Software Composition Analysis): <code>npm audit</code>, Dependabot, Renovate, Snyk, OSV-Scanner. Priorize pelo que é realmente alcançável e explorável, não só pela nota.`,
    `<b>Pacotes maliciosos</b>: typosquatting (nomes parecidos), contas de mantenedores comprometidas, scripts de <code>postinstall</code> que roubam credenciais. Defesas: lockfile versionado e <code>npm ci</code> no CI, revisar dependências novas antes de adicionar, desabilitar scripts de instalação quando possível, preferir pacotes mantidos e com proveniência verificável, e atualizar com frequência em pequenos passos.`,
  ],
  conecta: [['sast-dast', 'SCA é uma das varreduras do pipeline.'], ['sbom-assinatura', 'Saber o que está dentro do artefato.'], ['backend/owasp', 'Componentes vulneráveis estão no OWASP Top 10.'], ['hardening', 'Imagens também carregam dependências do sistema.']],
  front: `O front costuma ter a maior árvore de dependências da empresa. Antes de instalar uma biblioteca para resolver algo pequeno, vale olhar o tamanho da árvore que vem junto.`,
  ex: { lang: 'bash', code: `npm ci                         # instala exatamente o lockfile
npm audit --omit=dev           # vulnerabilidades do que vai para produção
npx osv-scanner --lockfile=package-lock.json

# desabilitar scripts de instalação por padrão (.npmrc)
ignore-scripts=true

# ver por que um pacote está na árvore
npm explain minimist` },
  docs: [['OWASP · Vulnerable Dependency Management', 'https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html'], ['GitHub · Dependabot', 'https://docs.github.com/en/code-security/dependabot'], ['OSV · Open Source Vulnerabilities', 'https://osv.dev/'], ['npm · Provenance', 'https://docs.npmjs.com/generating-provenance-statements']],
  perguntas: [`Quantas dependências transitivas o seu projeto tem?`, `Como o seu time decide se uma nova dependência pode entrar?`, `O que um script de postinstall malicioso consegue fazer?`] },

{ id: 'sast-dast', stage: 'supply-chain', level: 'importante', title: 'SAST, DAST e pipelines seguros', short: 'SAST e DAST',
  resumo: `Varreduras automáticas de segurança no código, na aplicação rodando e no próprio pipeline.`,
  porque: `Revisão humana não escala para todo commit. Ferramentas automáticas pegam padrões conhecidos cedo, quando corrigir é barato, e o pipeline em si precisa ser protegido, porque tem acesso a produção.`,
  como: [
    `<b>SAST</b> (estática): analisa o código-fonte em busca de padrões perigosos (CodeQL, Semgrep, SonarQube). <b>DAST</b> (dinâmica): ataca a aplicação rodando, como um scanner externo (OWASP ZAP). <b>SCA</b>: dependências. <b>IaC scanning</b>: configurações de infraestrutura. Cada uma pega um tipo de problema; ajuste as regras para reduzir falsos positivos, senão o time passa a ignorá-las.`,
    `<b>Segurança do pipeline</b>: tokens com permissões mínimas, credenciais via OIDC, actions fixadas por SHA, cuidado com workflows disparados por pull requests de forks (que não devem ter acesso a segredos), branches protegidas com revisão obrigatória e runners isolados.`,
  ],
  conecta: [['devops/pipelines', 'Onde as varreduras rodam.'], ['dependencias', 'SCA cobre as dependências.'], ['injecoes', 'SAST detecta padrões de injeção.'], ['secrets-scanning', 'Outra verificação automática do pipeline.']],
  front: `Regras de lint de segurança (eslint-plugin-security, regras contra <code>dangerouslySetInnerHTML</code>) são um SAST leve que roda direto no editor.`,
  ex: { lang: 'yaml', code: `# GitHub Actions: varreduras de segurança em cada PR
permissions: { contents: read, security-events: write }
jobs:
  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: javascript-typescript }
      - uses: github/codeql-action/analyze@v3
  semgrep:
    runs-on: ubuntu-latest
    container: { image: semgrep/semgrep }
    steps:
      - uses: actions/checkout@v4
      - run: semgrep scan --config auto --error` },
  docs: [['OWASP · DevSecOps Guideline', 'https://owasp.org/www-project-devsecops-guideline/'], ['GitHub · CodeQL', 'https://codeql.github.com/docs/'], ['Semgrep', 'https://semgrep.dev/docs/'], ['OWASP ZAP', 'https://www.zaproxy.org/docs/']],
  perguntas: [`Que varredura de segurança roda hoje no pipeline do seu time?`, `Qual a diferença entre o que SAST e DAST conseguem encontrar?`, `Por que workflows de PRs vindos de forks não devem ter acesso a segredos?`] },

{ id: 'sbom-assinatura', stage: 'supply-chain', level: 'aprofundar', title: 'SBOM, proveniência e assinatura', short: 'SBOM',
  resumo: `Saber exatamente o que há dentro de cada artefato e provar de onde ele veio.`,
  porque: `Quando surge uma vulnerabilidade grave numa biblioteca popular, a pergunta é "estamos expostos, e onde?". Com SBOM, a resposta leva minutos. Assinaturas e proveniência impedem que um artefato adulterado chegue à produção.`,
  como: [
    `Um <b>SBOM</b> (Software Bill of Materials) lista todos os componentes e versões de um artefato, em formatos como <b>SPDX</b> e <b>CycloneDX</b>, gerado no build (Syft, cdxgen, plugins de bundler). Guardado junto do artefato, permite cruzar com novas vulnerabilidades.`,
    `<b>Assinatura</b> (Sigstore/cosign) prova que a imagem foi produzida por quem você espera; políticas no cluster recusam imagens não assinadas. <b>Proveniência</b> (atestados SLSA) registra como, onde e a partir de qual commit o artefato foi construído. O framework <b>SLSA</b> define níveis de maturidade dessa cadeia.`,
  ],
  conecta: [['devops/artefatos', 'O artefato que é assinado e descrito.'], ['dependencias', 'O SBOM lista as dependências.'], ['hardening', 'Políticas de admissão exigem imagens assinadas.'], ['resposta-incidentes', 'Saber rapidamente quem é afetado por uma CVE.']],
  front: `O npm já suporta proveniência: pacotes publicados com <code>--provenance</code> mostram de qual repositório e workflow vieram, o que ajuda a escolher dependências confiáveis.`,
  ex: { lang: 'bash', code: `# gerar SBOM da imagem
syft ghcr.io/loja/api:3f9a2c1 -o cyclonedx-json > sbom.json

# assinar a imagem (keyless, com a identidade do pipeline)
cosign sign ghcr.io/loja/api@sha256:9b1d4f...

# verificar antes do deploy
cosign verify ghcr.io/loja/api@sha256:9b1d4f... \\
  --certificate-identity-regexp "https://github.com/loja/api/.*" \\
  --certificate-oidc-issuer https://token.actions.githubusercontent.com` },
  docs: [['SLSA', 'https://slsa.dev/'], ['Sigstore · cosign', 'https://docs.sigstore.dev/cosign/signing/overview/'], ['CycloneDX', 'https://cyclonedx.org/'], ['CISA · SBOM', 'https://www.cisa.gov/sbom']],
  perguntas: [`Quanto tempo o seu time levaria para descobrir se usa uma biblioteca recém-vulnerável?`, `O que uma assinatura de imagem garante?`, `Que informação um atestado de proveniência registra?`] },

{ id: 'secrets-scanning', stage: 'supply-chain', level: 'essencial', title: 'Varredura de segredos', short: 'Segredos vazados',
  resumo: `Impedir que chaves e senhas cheguem ao repositório e agir rápido quando chegam.`,
  porque: `Segredos commitados são uma das causas mais comuns de incidentes. Bots varrem repositórios públicos em segundos, e mesmo em repositórios privados qualquer pessoa com acesso ao histórico pode encontrá-los.`,
  como: [
    `Prevenção em camadas: <b>hooks de pre-commit</b> (gitleaks, detect-secrets), <b>push protection</b> no provedor Git e varredura do histórico no CI. Use <code>.gitignore</code> para arquivos <code>.env</code> e mantenha um <code>.env.example</code> sem valores reais.`,
    `Se um segredo vazou: <b>revogue e rotacione imediatamente</b>; apagar o commit não basta, porque cópias e clones já existem. Depois, verifique nos logs do provedor se a credencial foi usada e corrija a causa (por que o segredo estava num arquivo versionado?).`,
  ],
  conecta: [['backend/segredos', 'Onde os segredos devem ficar.'], ['sast-dast', 'Mais uma verificação do pipeline.'], ['resposta-incidentes', 'Um segredo vazado é um incidente.'], ['devops/iam', 'Credenciais temporárias reduzem o valor de um vazamento.']],
  front: `Chaves de serviços que aparecem em código de front (mapas, analytics) são públicas por natureza; restrinja-as por domínio e por API no painel do provedor. Chaves realmente secretas nunca podem estar no front.`,
  ex: { lang: 'bash', code: `# pre-commit com gitleaks
gitleaks protect --staged --verbose

# varrer todo o histórico
gitleaks detect --source . --log-opts="--all"

# .gitignore
.env
.env.*
!.env.example` },
  docs: [['GitHub · Secret scanning e push protection', 'https://docs.github.com/en/code-security/secret-scanning'], ['gitleaks', 'https://github.com/gitleaks/gitleaks'], ['OWASP · Secrets Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html']],
  perguntas: [`O que fazer nos primeiros cinco minutos depois de commitar uma chave?`, `Por que apagar o commit não resolve?`, `Que chave usada no front do seu produto é pública, e como ela está restringida?`] },
]
