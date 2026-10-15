import type { Topic } from '../../../types'

export const entrega: Topic[] = [
{ id: 'pipelines', stage: 'entrega', level: 'essencial', title: 'Pipelines de CI na prática', short: 'Pipelines',
  resumo: `Montar pipelines rápidos, confiáveis e seguros.`,
  porque: `Um pipeline lento ou instável vira gargalo para o time inteiro. Pipeline também é infraestrutura crítica: ele tem permissão para publicar em produção.`,
  como: [
    `Estrutura comum: <b>jobs</b> (lint, testes, build) com <b>steps</b>, rodando em paralelo quando independentes. Acelere com <b>cache</b> de dependências e de camadas Docker, <b>matrix</b> para testar várias versões, e rodando só o que mudou em monorepos. <b>Artefatos</b> passam resultados de um job para outro.`,
    `Confiabilidade: testes intermitentes (<i>flaky</i>) precisam ser corrigidos ou isolados, não ignorados. Segurança: permissões mínimas para o token do pipeline, credenciais de nuvem via OIDC, actions de terceiros fixadas por SHA e aprovação manual (environments protegidos) para produção.`,
  ],
  conecta: [['backend/cicd', 'Os conceitos de CI e CD.'], ['artefatos', 'O pipeline gera e publica o artefato.'], ['iam', 'Credenciais temporárias via OIDC.'], ['seguranca/sast-dast', 'Varreduras de segurança entram no pipeline.'], ['shell-scripting', 'Cada step é, no fundo, um comando.']],
  front: `Lint, typecheck, testes e build do front são os jobs mais comuns. Cache do <code>node_modules</code> ou do store do pnpm costuma cortar minutos de cada execução.`,
  ex: { lang: 'yaml', code: `name: CI
on: { pull_request: {}, push: { branches: [main] } }
permissions: { contents: read, id-token: write }

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix: { node: [20, 22] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "\${{ matrix.node }}", cache: npm }
      - run: npm ci
      - run: npm run lint && npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: production        # exige aprovação
    runs-on: ubuntu-latest
    steps:
      - run: echo "deploy da imagem \${{ github.sha }}"` },
  docs: [['GitHub Actions · Documentação', 'https://docs.github.com/en/actions'], ['GitHub · Cache de dependências', 'https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows'], ['GitHub · Security hardening para Actions', 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions']],
  perguntas: [`Qual etapa do pipeline do seu time é a mais lenta, e por quê?`, `Como você trataria um teste que falha de vez em quando?`, `Por que fixar actions de terceiros por SHA?`] },

{ id: 'estrategias-deploy', stage: 'entrega', level: 'essencial', title: 'Estratégias de deploy e rollback', short: 'Deploy',
  resumo: `Colocar versões novas no ar sem downtime e voltar atrás rápido.`,
  porque: `O risco de um deploy não está no código, está em como ele chega aos usuários. Uma boa estratégia transforma um bug grave em um incidente de minutos.`,
  como: [
    `<b>Rolling</b>: troca instâncias aos poucos (padrão do Kubernetes). <b>Blue-green</b>: sobe a versão nova completa e muda o tráfego de uma vez, com volta instantânea. <b>Canary</b>: manda uma fração do tráfego para a versão nova, observa métricas e aumenta gradualmente, ou reverte automaticamente (Argo Rollouts, Flagger).`,
    `Para funcionar, a aplicação precisa de <b>graceful shutdown</b> (terminar requisições antes de sair), readiness probes corretas e mudanças de banco <b>compatíveis com as duas versões</b>. <b>Rollback</b> deve ser rápido e ensaiado; migrations destrutivas são o que costuma impedir a volta.`,
  ],
  conecta: [['backend/cicd', 'A teoria das estratégias.'], ['k8s-config', 'Probes decidem quando a versão nova recebe tráfego.'], ['service-mesh', 'Divisão de tráfego fina para canary.'], ['slo', 'Métricas de SLO decidem se o canary avança.'], ['dados/migracoes-zero-downtime', 'O banco precisa aceitar as duas versões.']],
  front: `No front, a questão parecida é "o usuário está com a aba aberta na versão antiga": a API precisa aceitar clientes antigos por um tempo, e chunks antigos devem continuar disponíveis.`,
  ex: { lang: 'texto', code: `Canary com análise automática
  passo 1:  5% → v2   observar 10 min: erro < 1%, p95 < 300 ms?
  passo 2: 25% → v2   observar 10 min
  passo 3: 50% → v2   observar 10 min
  passo 4: 100% → v2
  qualquer métrica ruim → volta 100% para v1 automaticamente` },
  docs: [['Kubernetes · Rolling update', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/'], ['Argo Rollouts', 'https://argoproj.github.io/argo-rollouts/'], ['Martin Fowler · Blue Green Deployment', 'https://martinfowler.com/bliki/BlueGreenDeployment.html']],
  perguntas: [`Qual estratégia de deploy o seu time usa hoje?`, `O que impede um rollback rápido?`, `Que métricas você usaria para decidir se um canary pode avançar?`] },

{ id: 'artefatos', stage: 'entrega', level: 'importante', title: 'Artefatos, versões e registries', short: 'Artefatos',
  resumo: `O que exatamente vai para produção, como é identificado e onde fica guardado.`,
  porque: `Saber qual versão está rodando em cada ambiente é básico para investigar bugs e fazer rollback. Tags genéricas como "latest" tornam isso impossível.`,
  como: [
    `O <b>artefato</b> é o resultado imutável do build: imagem Docker, pacote npm, binário, bundle do front. Guarde em <b>registries</b> (GHCR, ECR, Artifactory, npm registry) e identifique de forma única: <b>SHA do commit</b>, <b>versão semântica</b> ou ambos. Imagens também têm <b>digest</b> (<code>sha256:...</code>), que identifica o conteúdo exato.`,
    `Registre metadados (commit, data, pipeline) e, cada vez mais, gere <b>SBOM</b> e <b>assinatura</b> do artefato para provar a origem. Políticas de retenção limpam versões antigas sem apagar as que estão em uso.`,
  ],
  conecta: [['pipelines', 'O pipeline produz e publica o artefato.'], ['ambientes', 'O mesmo artefato é promovido entre ambientes.'], ['dockerfile', 'A imagem é o artefato mais comum.'], ['seguranca/sbom-assinatura', 'Provar de onde o artefato veio.']],
  front: `Mostrar a versão (SHA ou semver) no rodapé ou num endpoint <code>/version</code> do front facilita muito confirmar o que está no ar quando alguém reporta um bug.`,
  ex: { lang: 'bash', code: `# tag pelo commit: rastreável e imutável
docker build -t ghcr.io/loja/api:3f9a2c1 .
docker push ghcr.io/loja/api:3f9a2c1

# o digest identifica o conteúdo exato da imagem
docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/loja/api:3f9a2c1
# ghcr.io/loja/api@sha256:9b1d4f...` },
  docs: [['Docker · Tags e digests', 'https://docs.docker.com/reference/cli/docker/image/tag/'], ['Semantic Versioning', 'https://semver.org/lang/pt-BR/'], ['GitHub Container Registry', 'https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry']],
  perguntas: [`Como você descobre qual commit está rodando em produção agora?`, `Por que a tag "latest" é perigosa em deploys?`, `Qual a diferença entre uma tag e um digest?`] },
]
