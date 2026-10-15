import type { Topic } from '../../../types'

export const lideranca: Topic[] = [
{ id: 'conduzir-decisoes', stage: 'lideranca', level: 'importante', title: 'Conduzir decisões técnicas em grupo', short: 'Decisões em grupo',
  resumo: `Levar um time de várias opiniões a uma decisão clara, registrada e respeitada.`,
  porque: `Discussões técnicas que nunca terminam, decisões tomadas por quem fala mais alto e decisões refeitas a cada reunião custam muito tempo. Conduzir decisões é uma das habilidades que mais diferenciam pessoas sêniores.`,
  como: [
    `Antes: deixe claro <b>o que</b> está sendo decidido, <b>quem decide</b> (consenso, consulta ou uma pessoa responsável, como no modelo DACI ou RACI), o <b>prazo</b> e os <b>critérios</b>. Envie opções por escrito antes da reunião. Durante: separe fatos de opiniões, explicite os trade-offs, ouça primeiro quem fala menos.`,
    `Depois: registre a decisão (ADR, design doc) com as alternativas e o porquê, comunique a quem é afetado e defina quando revisitar. "Discordar e se comprometer" permite avançar mesmo sem unanimidade. Diferencie decisões reversíveis (decida rápido) de irreversíveis (invista tempo).`,
  ],
  conecta: [['arquitetura/adr', 'Registrar a decisão e o porquê.'], ['arquitetura/trade-offs', 'Decisões são trocas.'], ['comunicacao-tecnica', 'Escrever opções com clareza.'], ['arquitetura/design-docs', 'Propostas por escrito antes da reunião.']],
  front: `Escolhas como biblioteca de estado, estratégia de renderização ou migração de framework afetam vários times; conduzir essas decisões com critérios e registro evita discussões repetidas a cada novo integrante.`,
  ex: { lang: 'texto', code: `Decisão: biblioteca de formulários para o novo app
Quem decide: tech lead de front (após ouvir os 3 times)   Prazo: sexta
Critérios:   tipagem, performance em formulários grandes, validação com Zod, acessibilidade
Opções:      React Hook Form · TanStack Form · Formik
─────────────────────────────────────────────────────────────
Decisão:     React Hook Form (ADR 0021)
Por quê:     melhor desempenho medido no protótipo, integração madura com Zod
Discordância registrada: time B preferia TanStack Form (tipagem)
Revisitar:   em 6 meses, ou se a tipagem virar problema` },
  docs: [['Atlassian · DACI decision framework', 'https://www.atlassian.com/team-playbook/plays/daci'], ['Amazon · Disagree and commit', 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles'], ['Will Larson · Staff Engineer', 'https://staffeng.com/book']],
  perguntas: [`Que decisão técnica do seu time foi refeita várias vezes?`, `Quem decide, no seu time, quando não há consenso?`, `O que significa discordar e se comprometer?`] },

{ id: 'priorizacao', stage: 'lideranca', level: 'importante', title: 'Priorização e impacto', short: 'Priorização',
  resumo: `Escolher em que trabalhar quando tudo parece importante.`,
  porque: `Há sempre mais trabalho do que tempo. Saber escolher o que gera mais impacto (e dizer não ao resto) é o que separa entregar muito de entregar o que importa, e é cobrado em toda avaliação de senioridade.`,
  como: [
    `Ferramentas: <b>impacto × esforço</b> (comece pelo alto impacto e baixo esforço), <b>RICE</b> (alcance, impacto, confiança, esforço), custo do atraso e a pergunta "o que acontece se não fizermos?". Conecte o trabalho técnico a resultados que o negócio entende: receita, custo, risco, velocidade do time.`,
    `Na prática: limite o trabalho em andamento, quebre iniciativas grandes em entregas que geram valor sozinhas, revise prioridades quando o contexto muda e torne visíveis os trade-offs ("se fizermos X agora, Y atrasa duas semanas"). Trabalho invisível (manutenção, dívida, suporte) também precisa entrar na conta.`,
  ],
  conecta: [['divida-tecnica', 'Dívida disputa espaço com funcionalidades.'], ['agil', 'Backlog e limites de trabalho em progresso.'], ['senioridade', 'Escolher o problema certo é parte do nível sênior.'], ['comunicacao-tecnica', 'Explicar trade-offs para o negócio.']],
  front: `Numa lista de melhorias de front, "reduzir o JavaScript da página de produto" pode ter mais impacto em conversão do que três telas novas; estimar esse impacto ajuda a defender a prioridade.`,
  ex: { lang: 'texto', code: `RICE = (Alcance × Impacto × Confiança) / Esforço
Iniciativa                     Alcance   Impacto  Confiança  Esforço   RICE
reduzir JS da página produto   200 mil   2        80%        2 sem     160.000
novo filtro de busca           50 mil    1        50%        3 sem      8.333
migrar componentes legados     equipe    2        90%        6 sem     (medir em tempo do time)
Alcance = usuários por mês · Impacto: 0,5 baixo · 1 médio · 2 alto · 3 enorme` },
  docs: [['Intercom · RICE prioritization', 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/'], ['Lenny\'s Newsletter · Prioritization', 'https://www.lennysnewsletter.com/'], ['Pragmatic Engineer · Impact', 'https://blog.pragmaticengineer.com/']],
  perguntas: [`Qual trabalho do seu backlog teria mais impacto, e por que ainda não foi feito?`, `Como você explicaria o impacto de pagar uma dívida técnica?`, `O que acontece se o time não fizer a tarefa de maior prioridade este mês?`] },

{ id: 'legado', stage: 'lideranca', level: 'importante', title: 'Trabalhar com sistemas legados', short: 'Legado',
  resumo: `Mudar com segurança código antigo, sem testes e que ninguém entende por completo.`,
  porque: `A maior parte do trabalho real acontece em código que já existe, muitas vezes crítico, antigo e pouco documentado. Saber evoluí-lo sem quebrar (e sem reescrever tudo) é uma das habilidades mais valiosas e menos ensinadas.`,
  como: [
    `Técnicas de <b>Working Effectively with Legacy Code</b>: encontrar pontos de corte (<i>seams</i>) para isolar dependências, escrever <b>testes de caracterização</b> antes de mudar, fazer mudanças pequenas e reversíveis, e acrescentar código novo testado ao lado do antigo (<i>sprout</i>) em vez de editar o meio de funções gigantes.`,
    `Em escala: entender o sistema por logs, traces e histórico do Git; documentar o que descobrir; medir uso real (código morto pode ser removido); migrar aos poucos com o padrão Strangler Fig e feature flags; e respeitar o legado: ele paga as contas e codifica anos de regras de negócio que ninguém escreveu em lugar nenhum.`,
  ],
  conecta: [['refatoracao', 'Melhorar a estrutura com segurança.'], ['arquitetura/strangler', 'Substituir aos poucos.'], ['leitura-codigo', 'Entender código desconhecido.'], ['divida-tecnica', 'O legado acumula dívida.']],
  front: `Migrar um front antigo (jQuery, AngularJS) para React costuma ser feito por rotas ou por "ilhas" de componentes novos dentro das páginas antigas, nunca de uma vez.`,
  ex: { lang: 'typescript', code: `// "sprout": a regra nova nasce testada, ao lado da função legada gigante
export function calcularDescontoProgressivo(totalCents: number): number {
  if (totalCents >= 100_000) return Math.round(totalCents * 0.1);
  if (totalCents >= 50_000) return Math.round(totalCents * 0.05);
  return 0;
}

// na função legada (900 linhas, sem testes), só uma linha muda:
// total = total - calcularDescontoProgressivo(total);

// antes de mexer no legado: teste de caracterização registra o comportamento atual
test("fecharPedido mantém o comportamento atual", () => {
  expect(fecharPedidoLegado(pedidoExemplo)).toMatchSnapshot();
});` },
  docs: [['Michael Feathers · Working Effectively with Legacy Code', 'https://www.oreilly.com/library/view/working-effectively-with/0131177052/'], ['Martin Fowler · Legacy Seam', 'https://martinfowler.com/bliki/LegacySeam.html'], ['Martin Fowler · Strangler Fig Application', 'https://martinfowler.com/bliki/StranglerFigApplication.html']],
  perguntas: [`Que parte legada do seu sistema todos evitam mexer?`, `O que é um seam e como ajuda a testar código legado?`, `Por que reescrever do zero costuma ser mais arriscado que evoluir?`] },

{ id: 'mentoria', stage: 'lideranca', level: 'importante', title: 'Mentoria e crescimento de outras pessoas', short: 'Mentoria',
  resumo: `Ajudar outras pessoas a crescer, como parte do trabalho de engenharia.`,
  porque: `O impacto de uma pessoa sênior se multiplica pelo crescimento de quem está ao redor. Mentoria, pareamento e bons reviews são das formas mais eficientes de elevar um time inteiro.`,
  como: [
    `Formas: <b>pareamento</b> (programar junto, alternando quem conduz), <b>code review</b> como ensino (explicar o porquê, apontar recursos), <b>delegar</b> tarefas um pouco acima do nível da pessoa com apoio, e conversas periódicas sobre objetivos de carreira.`,
    `Boas práticas: perguntar antes de responder ("o que você já tentou?"), deixar a pessoa errar em situações seguras, dar feedback específico e frequente, reconhecer publicamente o progresso e adaptar ao momento de cada um. Mentoria também ensina quem mentora: explicar revela lacunas no próprio entendimento.`,
  ],
  conecta: [['code-review', 'Review como ferramenta de ensino.'], ['senioridade', 'Elevar o time é parte do nível sênior.'], ['aprendizado', 'Ensinar consolida o aprendizado.'], ['onboarding', 'Os primeiros meses de quem chega.']],
  front: `Pareamento em tarefas de acessibilidade ou performance de front é uma ótima forma de espalhar conhecimentos que costumam ficar concentrados em poucas pessoas.`,
  ex: { lang: 'texto', code: `Comentário de review que ensina
✘ "Use useMemo aqui."
✔ "Essa lista filtra 5 mil itens a cada tecla. Que tal medir com o React Profiler?
   Se o filtro aparecer como gargalo, useDeferredValue mantém o input fluido
   (react.dev/reference/react/useDeferredValue). Topa fazer junto amanhã?"` },
  docs: [['Google · How to do a code review: mentoring', 'https://google.github.io/eng-practices/review/reviewer/comments.html'], ['Martin Fowler · On Pair Programming', 'https://martinfowler.com/articles/on-pair-programming.html'], ['Lara Hogan · Resilient Management', 'https://larahogan.me/resources/']],
  perguntas: [`Que conhecimento seu poderia ser ensinado a alguém do time este mês?`, `Como transformar um comentário de review em uma oportunidade de ensino?`, `Por que perguntar antes de responder ajuda quem está aprendendo?`] },

{ id: 'produtividade-dev', stage: 'lideranca', level: 'aprofundar', title: 'Experiência e produtividade do desenvolvedor', short: 'DevEx',
  resumo: `Medir e melhorar o quanto é fácil e rápido trabalhar no dia a dia de engenharia.`,
  porque: `Builds lentos, ambientes quebrados, revisões que demoram dias e interrupções constantes custam mais do que parece. Melhorar a experiência dos desenvolvedores é uma das formas mais baratas de aumentar a entrega de uma empresa.`,
  como: [
    `Frameworks: <b>SPACE</b> (satisfação, desempenho, atividade, comunicação, eficiência) e <b>DevEx</b> (fluxo, carga cognitiva e ciclos de feedback). Combine dados de sistemas (tempo de build, tempo até o primeiro review, frequência de deploy) com pesquisas periódicas com os próprios desenvolvedores.`,
    `Alavancas comuns: CI e builds rápidos, ambientes reproduzíveis, documentação encontrável, menos reuniões e interrupções (tempo de foco), revisões rápidas, caminhos pavimentados da plataforma e boas ferramentas de IA. Cuidado com métricas de atividade (commits, linhas): medem movimento, não valor, e viram metas distorcidas.`,
  ],
  conecta: [['dora', 'Métricas de entrega complementam as de experiência.'], ['devops/platform-engineering', 'Plataformas existem para melhorar a experiência.'], ['devops/dev-environments', 'Ambientes reproduzíveis.'], ['devops/pipelines', 'CI rápido é feedback rápido.']],
  front: `Tempo do servidor de desenvolvimento, do hot reload e do build de produção são métricas de experiência que o time de front pode medir e melhorar.`,
  ex: { lang: 'texto', code: `Painel de experiência do desenvolvedor (exemplo)
Ciclos de feedback
  build local (p50)               14 s
  CI do PR até verde (p50)        11 min   ← meta: < 8 min
  tempo até o primeiro review     19 h     ← principal gargalo
Fluxo
  horas de foco por semana        11 h     (pesquisa trimestral)
Carga cognitiva
  "sei onde encontrar a documentação": 54% concordam` },
  docs: [['ACM Queue · The SPACE of Developer Productivity', 'https://queue.acm.org/detail.cfm?id=3454124'], ['ACM Queue · DevEx: What Actually Drives Productivity', 'https://queue.acm.org/detail.cfm?id=3595878'], ['DORA · Research', 'https://dora.dev/research/']],
  perguntas: [`O que mais atrasa o seu dia a dia de desenvolvimento?`, `Por que medir commits ou linhas de código é enganoso?`, `Que ciclo de feedback do seu time poderia ficar mais rápido?`] },

{ id: 'onboarding', stage: 'lideranca', level: 'importante', title: 'Onboarding e transferência de conhecimento', short: 'Onboarding',
  resumo: `Fazer pessoas novas ficarem produtivas rápido e evitar que o conhecimento fique preso em poucas cabeças.`,
  porque: `Cada pessoa que chega leva semanas ou meses para ser produtiva, e cada pessoa que sai leva conhecimento embora. Um bom processo de onboarding e de compartilhamento de conhecimento reduz os dois custos.`,
  como: [
    `Onboarding: ambiente funcionando no primeiro dia, documento com o mapa do sistema (C4), os times e quem procurar, uma primeira tarefa pequena e real em produção na primeira semana, um "padrinho" para dúvidas e checkpoints de 30, 60 e 90 dias. Peça a quem chega para corrigir a documentação que encontrou desatualizada.`,
    `Transferência contínua: rodízio de pessoas entre áreas do sistema, pareamento, documentação perto do código, gravações de sessões de arquitetura e o indicador de "<b>bus factor</b>": quantas pessoas precisariam sair para que uma parte do sistema ficasse sem ninguém que a entenda.`,
  ],
  conecta: [['documentacao', 'A base do onboarding.'], ['devops/dev-environments', 'Ambiente pronto no primeiro dia.'], ['mentoria', 'Acompanhamento de quem chega.'], ['arquitetura/c4', 'O mapa do sistema.']],
  front: `Um README que coloca o front para rodar apontando para staging em 15 minutos economiza dias de cada pessoa nova no time.`,
  ex: { lang: 'markdown', code: `# Onboarding: primeiros 30 dias (time de checkout)
## Dia 1
- [ ] ambiente rodando (devcontainer) e acesso aos sistemas
- [ ] ler: mapa C4 do checkout, ADRs principais, runbooks
## Semana 1
- [ ] primeira mudança pequena em produção (com padrinho)
- [ ] acompanhar um deploy e um plantão
## Semana 2-4
- [ ] uma funcionalidade pequena de ponta a ponta
- [ ] corrigir 3 pontos desatualizados da documentação
## Dia 30: conversa de checkpoint com a liderança` },
  docs: [['GitLab Handbook · Onboarding', 'https://handbook.gitlab.com/handbook/people-group/general-onboarding/'], ['Martin Fowler · Bus factor (Truck factor)', 'https://martinfowler.com/bliki/TruckFactor.html'], ['Write the Docs · Docs for onboarding', 'https://www.writethedocs.org/guide/']],
  perguntas: [`Quanto tempo uma pessoa nova leva para fazer o primeiro deploy no seu time?`, `Qual parte do seu sistema tem bus factor 1?`, `O que você gostaria de ter recebido no seu onboarding?`] },
]
