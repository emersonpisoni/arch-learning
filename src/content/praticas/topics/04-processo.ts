import type { Topic } from '../../../types'

export const processo: Topic[] = [
{ id: 'agil', stage: 'processo', level: 'essencial', title: 'Scrum e Kanban na prática', short: 'Ágil',
  resumo: `Como times organizam o trabalho em ciclos curtos e com fluxo contínuo.`,
  porque: `Quase todo time diz que é ágil, mas cada um aplica de um jeito. Entender a intenção por trás das cerimônias ajuda a participar delas de forma útil e a propor mudanças quando viram burocracia.`,
  como: [
    `<b>Scrum</b>: ciclos fixos (sprints de 1 a 4 semanas) com planejamento, daily curta, review com stakeholders e retrospectiva para melhorar o processo. Papéis: product owner (prioriza), scrum master (facilita) e time de desenvolvimento.`,
    `<b>Kanban</b>: fluxo contínuo, quadro visível e <b>limite de trabalho em progresso</b> (WIP): terminar antes de começar algo novo. Métricas de fluxo: <b>lead time</b> (do pedido à entrega) e <b>throughput</b>. Muitos times usam uma mistura. O que importa é entregar valor em ciclos curtos, com feedback, e ajustar o próprio processo.`,
  ],
  conecta: [['estimativas', 'Planejamento depende de estimar.'], ['dora', 'Métricas de entrega do time.'], ['comunicacao-tecnica', 'Cerimônias são, no fundo, comunicação.']],
  front: `Dividir uma funcionalidade de front em partes que entregam valor sozinhas (primeiro a listagem, depois filtros, depois exportação) é o que torna ciclos curtos possíveis.`,
  ex: { lang: 'texto', code: `Quadro Kanban com limite de WIP
A fazer    │ Em andamento (máx. 3) │ Em review (máx. 2) │ Pronto
───────────┼───────────────────────┼────────────────────┼────────
filtros    │ checkout parcelado    │ fix: CEP inválido  │ busca
exportação │ tela de devolução     │                    │ login social
...        │ ajuste de frete       │                    │

Coluna cheia? Ajude a terminar o que está em andamento antes de puxar algo novo.` },
  docs: [['Scrum Guide', 'https://scrumguides.org/scrum-guide.html'], ['Atlassian · Kanban', 'https://www.atlassian.com/agile/kanban'], ['Manifesto Ágil', 'https://agilemanifesto.org/iso/ptbr/manifesto.html']],
  perguntas: [`Qual cerimônia do seu time gera mais valor, e qual gera menos?`, `Por que limitar o trabalho em progresso aumenta a entrega?`, `Como dividir uma funcionalidade grande em partes que entregam valor sozinhas?`] },

{ id: 'estimativas', stage: 'processo', level: 'importante', title: 'Estimativas e planejamento', short: 'Estimativas',
  resumo: `Prever esforço com honestidade sobre a incerteza.`,
  porque: `"Quanto tempo leva?" é uma das perguntas mais frequentes e mais difíceis. Estimativas ruins geram prazos impossíveis e perda de confiança; boas estimativas comunicam incerteza e riscos.`,
  como: [
    `Técnicas: <b>story points</b> (tamanho relativo, comparando com trabalhos conhecidos), <b>planning poker</b> (estimar em grupo revela diferenças de entendimento), <b>t-shirt sizes</b> para visão de longo prazo e <b>previsão probabilística</b> com dados históricos de throughput ("com 85% de chance, termina em até 3 semanas").`,
    `Boas práticas: quebrar o trabalho até partes estimáveis, explicitar suposições e riscos ("depende da API de pagamentos estar pronta"), usar intervalos em vez de um número só, reservar tempo para descoberta em trabalhos desconhecidos (spikes) e revisar estimativas quando o cenário muda.`,
  ],
  conecta: [['agil', 'Planejamento de sprints e fluxo.'], ['comunicacao-tecnica', 'Comunicar incerteza com clareza.'], ['divida-tecnica', 'Dívida torna as estimativas menos previsíveis.']],
  front: `Tarefas de front costumam esconder trabalho: estados de carregamento e erro, responsividade, acessibilidade e casos de borda. Liste-os antes de estimar.`,
  ex: { lang: 'texto', code: `Estimativa: tela de devolução de pedido
  listagem de pedidos elegíveis           1–2 dias
  formulário com motivo e fotos            2–3 dias
  estados de loading, erro e vazio         1 dia
  responsivo e acessibilidade              1 dia
  integração com API (ainda não pronta) ⚠  1–3 dias, depende do backend
  ───────────────────────────────────────────────────
  total: 6 a 10 dias · risco principal: contrato da API de devolução` },
  docs: [['Mike Cohn · Agile Estimating and Planning', 'https://www.mountaingoatsoftware.com/books/agile-estimating-and-planning'], ['Atlassian · Story points', 'https://www.atlassian.com/agile/project-management/estimation'], ['Troy Magennis · Forecasting (Focused Objective)', 'https://www.focusedobjective.com/']],
  perguntas: [`Que parte do trabalho você costuma esquecer ao estimar?`, `Por que um intervalo comunica melhor que um número?`, `Como estimar algo que ninguém do time fez antes?`] },

{ id: 'dora', stage: 'processo', level: 'essencial', title: 'Métricas DORA', short: 'DORA',
  resumo: `Quatro métricas que medem velocidade e estabilidade da entrega de software.`,
  porque: `Pesquisas com milhares de times mostram que velocidade e estabilidade andam juntas: os melhores times entregam com mais frequência e quebram menos. As métricas DORA dão uma linguagem comum para discutir melhoria.`,
  como: [
    `Velocidade: <b>frequência de deploy</b> (com que frequência se publica em produção) e <b>lead time de mudanças</b> (do commit até produção). Estabilidade: <b>taxa de falha de mudanças</b> (quantos deploys causam problema) e <b>tempo de recuperação</b> (quanto tempo para restaurar após uma falha). Versões recentes da pesquisa também consideram a taxa de retrabalho.`,
    `Práticas que melhoram as quatro: lotes pequenos, integração contínua, testes automatizados, deploy automatizado, trunk-based development, feature flags e boa observabilidade. Use as métricas para o time aprender, não para comparar pessoas.`,
  ],
  conecta: [['backend/cicd', 'Automação é a base das métricas de velocidade.'], ['devops/incidentes', 'Tempo de recuperação depende da gestão de incidentes.'], ['branching', 'Trunk-based reduz o lead time.'], ['commits-prs', 'Lotes pequenos melhoram todas as métricas.']],
  front: `Deploy do front várias vezes ao dia, com previews por PR e rollback instantâneo na CDN, costuma colocar o time de front entre os de melhor desempenho nessas métricas.`,
  ex: { lang: 'texto', code: `Métrica                       Elite            Baixo desempenho
───────────────────────────   ───────────────  ─────────────────
Frequência de deploy          sob demanda,     menos de uma vez
                              várias por dia   por mês
Lead time de mudanças         menos de 1 dia   mais de 1 mês
Taxa de falha de mudanças     baixa (~5%)      alta (~40% ou mais)
Tempo de recuperação          menos de 1 hora  mais de 1 semana
(faixas aproximadas, variam entre edições do relatório)` },
  docs: [['DORA · Research program', 'https://dora.dev/'], ['DORA · Quick check', 'https://dora.dev/quickcheck/'], ['Accelerate (livro)', 'https://itrevolution.com/product/accelerate/']],
  perguntas: [`Qual das quatro métricas DORA é a pior no seu time?`, `Por que velocidade e estabilidade andam juntas?`, `Por que não usar essas métricas para comparar pessoas?`] },

{ id: 'versionamento-semantico', stage: 'processo', level: 'importante', title: 'Versionamento semântico e changelog', short: 'SemVer',
  resumo: `Números de versão que comunicam o impacto de cada mudança.`,
  porque: `Bibliotecas, design systems, APIs e apps móveis precisam dizer aos consumidores se uma atualização é segura. SemVer é o contrato que torna isso previsível, inclusive no package.json que você usa todo dia.`,
  como: [
    `<b>MAJOR.MINOR.PATCH</b>: MAJOR para mudanças incompatíveis, MINOR para funcionalidades compatíveis e PATCH para correções compatíveis. Versões <code>0.x</code> indicam API instável. No npm, <code>^1.4.2</code> aceita qualquer 1.x a partir de 1.4.2; <code>~1.4.2</code> só 1.4.x.`,
    `Um <b>changelog</b> lista o que mudou em cada versão, para humanos. Ferramentas como semantic-release, Changesets e release-please geram versão e changelog a partir de Conventional Commits ou de arquivos de mudança. Aplicações web publicadas continuamente normalmente não precisam de SemVer; versionam pelo commit.`,
  ],
  conecta: [['commits-prs', 'Conventional Commits definem o tipo de versão.'], ['arquitetura/evolucao-apis', 'Versionamento de APIs segue a mesma lógica.'], ['frontend/design-system', 'Design systems versionados com SemVer.'], ['devops/artefatos', 'Identificar artefatos por versão.']],
  front: `O lockfile existe porque intervalos como <code>^18.2.0</code> poderiam instalar versões diferentes em máquinas diferentes; SemVer promete compatibilidade, mas nem todo pacote cumpre.`,
  ex: { lang: 'markdown', code: `# Changelog · @loja/ui

## 3.0.0
### Mudanças incompatíveis
- \`Button\`: prop \`kind\` renomeada para \`variant\` (veja o guia de migração)

## 2.4.0
### Novidades
- \`DatePicker\` com suporte a intervalo de datas

## 2.3.1
### Correções
- \`Modal\`: foco volta ao botão que abriu ao fechar com Esc` },
  docs: [['Semantic Versioning (pt-BR)', 'https://semver.org/lang/pt-BR/'], ['Keep a Changelog (pt-BR)', 'https://keepachangelog.com/pt-BR/1.1.0/'], ['Changesets', 'https://github.com/changesets/changesets'], ['npm · semver calculator', 'https://semver.npmjs.com/']],
  perguntas: [`O que ^ e ~ significam nas versões do seu package.json?`, `Que mudança num componente do design system exigiria uma versão MAJOR?`, `Por que aplicações web raramente usam SemVer?`] },

{ id: 'documentacao', stage: 'processo', level: 'importante', title: 'Documentação técnica', short: 'Documentação',
  resumo: `Escrever o mínimo necessário, no lugar certo, para quem vai ler.`,
  porque: `Documentação desatualizada engana; documentação inexistente obriga a perguntar tudo a alguém. Em integrações entre times, a documentação certa economiza reuniões e evita erros.`,
  como: [
    `O framework <b>Diátaxis</b> separa quatro tipos: <b>tutoriais</b> (aprender fazendo), <b>guias práticos</b> (resolver uma tarefa), <b>referência</b> (descrição precisa, como a de uma API) e <b>explicação</b> (o porquê). Misturar tipos num mesmo documento confunde o leitor.`,
    `Mantenha a documentação <b>perto do código</b> (README, ADRs, comentários de porquê, OpenAPI), revisada nos mesmos PRs, e gere o que for possível (referência de API, tipos). Todo projeto precisa de pelo menos: como rodar localmente, como testar, como publicar e a quem pedir ajuda.`,
  ],
  conecta: [['arquitetura/adr', 'Registrar decisões.'], ['backend/contratos', 'Referência de API gerada do contrato.'], ['comunicacao-tecnica', 'Escrever com clareza.'], ['commits-prs', 'PRs também documentam o porquê.']],
  front: `Um Storybook bem cuidado é documentação de referência do design system; o README com "como rodar o front apontando para staging" economiza horas de cada pessoa nova.`,
  ex: { lang: 'markdown', code: `# api-pedidos

Serviço que cria, consulta e cancela pedidos da loja.

## Rodar localmente
docker compose up -d && npm install && npm run dev   # http://localhost:3000

## Testar
npm test               # unitários e integração (sobe Postgres via Testcontainers)

## Publicar
Merge na main → deploy automático em staging → aprovação manual para produção.

## Documentos
- Contrato da API: docs/openapi.yaml
- Decisões: docs/adr/
- Runbooks de alertas: docs/runbooks/

## Contato
#time-pedidos no chat · on-call: ver escala no PagerDuty` },
  docs: [['Diátaxis', 'https://diataxis.fr/'], ['Google · Technical writing courses', 'https://developers.google.com/tech-writing'], ['Write the Docs · Guia', 'https://www.writethedocs.org/guide/']],
  perguntas: [`Uma pessoa nova consegue rodar o seu projeto só com o README?`, `Que tipo de documento do Diátaxis falta no seu time?`, `Como evitar que a documentação fique desatualizada?`] },
]
