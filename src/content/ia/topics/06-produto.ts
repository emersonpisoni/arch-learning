import type { Topic } from '../../../types'

export const produto: Topic[] = [
{ id: 'ux-ia', stage: 'produto', level: 'essencial', title: 'UX para funcionalidades de IA', short: 'UX de IA',
  resumo: `Desenhar interfaces que lidam com respostas lentas, incertas e às vezes erradas.`,
  porque: `A experiência de uma funcionalidade de IA depende tanto da interface quanto do modelo. É aqui que o trabalho de interface mais influencia o resultado.`,
  como: [
    `Princípios: mostrar <b>progresso</b> (streaming, etapas do agente); deixar claro que o conteúdo é <b>gerado por IA</b>; mostrar <b>fontes</b>; permitir <b>editar, refazer e desfazer</b>; pedir <b>confirmação</b> antes de ações; coletar <b>feedback</b> simples; e projetar os estados de erro, recusa e "não sei responder".`,
    `Escolha o formato certo: nem tudo precisa ser chat. IA embutida no fluxo (sugestão num campo, resumo no topo de uma página, preenchimento de formulário, ação num botão) costuma ser mais útil e mais fácil de usar do que uma caixa de conversa genérica. Defina expectativas: diga o que a funcionalidade faz e o que não faz.`,
  ],
  conecta: [['streaming-llm', 'Mostrar a resposta enquanto é gerada.'], ['limitacoes', 'A interface precisa lidar com erros do modelo.'], ['agentes', 'Mostrar e controlar as ações do agente.'], ['frontend/a11y-fundamentos', 'Respostas dinâmicas precisam ser acessíveis.']],
  front: `Atualizações de texto em streaming precisam de cuidado com acessibilidade (regiões <code>aria-live</code> com moderação) e com layout, para o conteúdo não pular enquanto a resposta cresce.`,
  ex: { lang: 'texto', code: `Checklist de UX para uma funcionalidade de IA
[ ] o usuário entende o que a funcionalidade faz e seus limites
[ ] há indicação de progresso desde o primeiro instante
[ ] dá para parar uma geração em andamento
[ ] o conteúdo gerado é identificado como tal
[ ] fontes visíveis quando a resposta se baseia em documentos
[ ] o resultado pode ser editado, refeito ou desfeito
[ ] ações com efeito real pedem confirmação
[ ] erro, recusa e "não encontrei" têm estados próprios
[ ] feedback simples (útil / não útil) ligado ao trace` },
  docs: [['Google · People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/'], ['Microsoft · Guidelines for Human-AI Interaction', 'https://www.microsoft.com/en-us/research/project/guidelines-for-human-ai-interaction/'], ['Nielsen Norman Group · AI', 'https://www.nngroup.com/topic/ai/']],
  perguntas: [`Que funcionalidade de IA do seu produto seria melhor fora de um chat?`, `Como a sua interface lida com uma resposta errada do modelo?`, `Que estados de tela uma funcionalidade de IA precisa ter?`] },

{ id: 'ia-no-dia-a-dia', stage: 'produto', level: 'essencial', title: 'Assistentes de IA no trabalho de engenharia', short: 'IA no dia a dia',
  resumo: `Usar assistentes e agentes de código para produzir mais, sem perder qualidade nem entendimento.`,
  porque: `Assistentes de código mudaram o dia a dia da engenharia. Usados bem, aceleram muito; usados mal, geram código que ninguém entende, bugs sutis e vazamento de dados.`,
  como: [
    `Bons usos: entender código desconhecido, gerar testes, refatorações mecânicas, protótipos, consultas SQL, scripts, documentação e revisão inicial de PRs. Agentes de código (como o Claude Code) executam tarefas inteiras: ler o repositório, editar arquivos, rodar testes. Dê contexto (arquivos de instruções do projeto, como CLAUDE.md) e peça planos antes de mudanças grandes.`,
    `Responsabilidade continua sendo sua: <b>revise</b> tudo o que for gerado como se fosse de outra pessoa, garanta testes, entenda o código antes de publicar e respeite as políticas da empresa sobre que dados e código podem ir para quais ferramentas. Para aprender, use a IA como tutora (pedir explicações, quizzes), não só como geradora de respostas.`,
  ],
  conecta: [['praticas/code-review', 'Código gerado passa pelo mesmo review.'], ['praticas/aprendizado', 'IA como apoio ao aprendizado.'], ['etica-privacidade', 'Que dados podem ir para quais ferramentas.'], ['agentes', 'Agentes de código são agentes com ferramentas de repositório.']],
  front: `Peça ao assistente para explicar um serviço desconhecido, gerar tipos a partir de um contrato ou escrever testes de componentes; e sempre rode os testes e revise o diff.`,
  ex: { lang: 'markdown', code: `# CLAUDE.md (instruções do projeto para o assistente)

## Comandos
- npm run dev · npm test · npm run lint

## Convenções
- React com TypeScript estrito; componentes em src/components/<Nome>/
- estilos com CSS Modules e tokens de src/styles/global.css
- dados do servidor com TanStack Query; nada de fetch em useEffect

## Antes de terminar uma tarefa
- rode npm test e npm run lint
- não altere arquivos em src/generated/ (são gerados do OpenAPI)` },
  docs: [['Claude Code · Documentação', 'https://code.claude.com/docs/en/overview'], ['Claude Code · Best practices', 'https://www.anthropic.com/engineering/claude-code-best-practices'], ['GitHub Copilot · Documentação', 'https://docs.github.com/en/copilot']],
  perguntas: [`Que tarefa repetitiva do seu trabalho um assistente de código poderia fazer?`, `Como garantir que você entende o código gerado antes de publicar?`, `Que regras da sua empresa limitam o uso de ferramentas de IA?`] },

{ id: 'etica-privacidade', stage: 'produto', level: 'importante', title: 'Ética, privacidade e uso responsável', short: 'Uso responsável',
  resumo: `Dados pessoais, vieses, transparência e regulação em funcionalidades de IA.`,
  porque: `Funcionalidades de IA processam dados de usuários, tomam ou influenciam decisões e podem reproduzir vieses. Leis de proteção de dados já valem, e regulações específicas para IA estão chegando.`,
  como: [
    `<b>Privacidade</b>: saiba que dados vão para o provedor, por quanto tempo ficam retidos e se são usados para treinamento; minimize dados pessoais nos prompts; aplique a LGPD (base legal, finalidade, direitos do titular) e cuidado redobrado com dados sensíveis. <b>Transparência</b>: informe quando o usuário interage com IA ou recebe conteúdo gerado.`,
    `<b>Vieses e decisões</b>: modelos podem reproduzir preconceitos dos dados; teste com perfis variados e mantenha revisão humana em decisões que afetam pessoas (crédito, contratação, saúde). Acompanhe regulações como o <b>AI Act</b> europeu e as propostas brasileiras, que classificam usos por nível de risco.`,
  ],
  conecta: [['seguranca/lgpd', 'A LGPD se aplica a dados usados com IA.'], ['limitacoes', 'Erros têm impacto real em decisões.'], ['observabilidade-llm', 'Logs de prompts também contêm dados pessoais.'], ['ux-ia', 'Transparência é parte da experiência.']],
  front: `Avisos claros de que o conteúdo é gerado por IA, opção de falar com uma pessoa e controle sobre o uso dos próprios dados são decisões de interface com impacto ético e legal.`,
  ex: { lang: 'texto', code: `Checklist de uso responsável
[ ] que dados pessoais entram nos prompts, e todos são necessários?
[ ] o provedor retém os dados? usa para treinamento? onde processa?
[ ] o usuário sabe que está interagindo com IA?
[ ] decisões que afetam pessoas têm revisão humana?
[ ] testamos o comportamento com perfis e grupos variados?
[ ] logs e traces respeitam a retenção e a LGPD?
[ ] existe um caminho para o usuário contestar ou falar com uma pessoa?` },
  docs: [['ANPD · Inteligência artificial e proteção de dados', 'https://www.gov.br/anpd/pt-br'], ['União Europeia · AI Act', 'https://artificialintelligenceact.eu/'], ['NIST · AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework']],
  perguntas: [`Que dados pessoais a funcionalidade de IA do seu produto envia ao provedor?`, `Que decisão influenciada por IA no seu produto deveria ter revisão humana?`, `Como o usuário fica sabendo que está lidando com IA?`] },
]
