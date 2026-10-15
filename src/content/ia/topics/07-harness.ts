import type { Topic } from '../../../types'

export const harness: Topic[] = [
{ id: 'harness', stage: 'harness', level: 'essencial', title: 'O que é um harness de agente', short: 'Harness',
  resumo: `Tudo o que envolve o modelo para transformá-lo num agente: loop, ferramentas, contexto, permissões e recuperação de erros.`,
  porque: `Dois produtos com o mesmo modelo podem ter desempenhos muito diferentes por causa do harness. Claude Code, Codex, Cursor e agentes de atendimento são, em grande parte, harnesses diferentes em volta de modelos parecidos. Entender o harness é entender onde a engenharia de agentes realmente acontece.`,
  como: [
    `O modelo só recebe texto e devolve texto (e pedidos de ferramenta). O <b>harness</b> é o programa em volta: monta o contexto (instruções, histórico, arquivos), oferece as <b>ferramentas</b>, executa as chamadas, aplica <b>permissões</b> e aprovações, trata erros e repetições, decide quando parar, gerencia o <b>contexto longo</b> (resumir, limpar, cachear), registra tudo para observabilidade e apresenta o progresso ao usuário.`,
    `Duas perguntas separam as opções: <b>quem fornece o harness</b> (você escreve o loop, um SDK fornece, ou uma plataforma) e <b>quem fornece a execução</b> (você hospeda ou o provedor hospeda o ambiente onde as ferramentas rodam). Exemplos: o loop manual com a API, o Tool Runner do SDK, o Claude Agent SDK (o harness do Claude Code como biblioteca) e agentes gerenciados (o provedor roda o loop e um ambiente isolado por sessão).`,
    `Decisões de desenho do harness: <b>ferramentas genéricas</b> (bash, que dá alcance amplo) versus <b>ferramentas dedicadas</b> (que o harness consegue interceptar, aprovar, auditar, renderizar e paralelizar); onde pedir confirmação; como lidar com resultados enormes; como retomar uma tarefa interrompida.`,
  ],
  conecta: [['agentes', 'O harness é o que torna o loop de agente possível.'], ['context-engineering', 'Montar o contexto é a principal função do harness.'], ['sandbox-permissoes', 'Permissões e isolamento são responsabilidade do harness.'], ['agent-sdks', 'Construir o próprio harness ou usar um pronto.'], ['tool-use', 'O harness executa as ferramentas pedidas pelo modelo.']],
  front: `Muito do harness é interface: mostrar o que o agente está fazendo, pedir aprovação, renderizar perguntas como formulários e permitir interromper. Essas decisões de UX mudam a utilidade do agente tanto quanto o prompt.`,
  ex: { lang: 'texto', code: `            ┌──────────────────────── HARNESS ────────────────────────┐
usuário ──> │ monta contexto: system + instruções do projeto + histórico │
            │        │                                                  │
            │        ▼                                                  │
            │     [ MODELO ] ──pede ferramenta──> permissão? ──> executa │
            │        ▲                               │          │       │
            │        └──── resultado (resumido se grande) ◄─────┘       │
            │ compacta/limpa contexto · limites de passos e custo        │
            │ logs e traces · progresso na interface · checkpoints       │
            └────────────────────────────────────────────────────────────┘` },
  docs: [['Anthropic · Building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents'], ['Anthropic · Effective harnesses for long-running agents', 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents'], ['Claude Agent SDK · Overview', 'https://code.claude.com/docs/en/agent-sdk/overview']],
  perguntas: [`Que partes de um harness você já reconhece em ferramentas que usa, como assistentes de código?`, `Quando promover uma ação do bash para uma ferramenta dedicada?`, `Quem fornece o harness e a execução em cada opção que você conhece?`] },

{ id: 'context-engineering', stage: 'harness', level: 'essencial', title: 'Engenharia de contexto', short: 'Contexto',
  resumo: `Decidir o que entra na janela de contexto do modelo, em que ordem e em que momento.`,
  porque: `Em agentes, o problema deixa de ser escrever um bom prompt e passa a ser gerenciar dezenas de milhares de tokens que mudam a cada passo. O que o modelo vê determina o que ele consegue fazer, e contexto demais ou desorganizado piora as decisões e encarece cada passo.`,
  como: [
    `Componentes do contexto: <b>instruções estáveis</b> (prompt de sistema, regras do projeto como CLAUDE.md), <b>ferramentas</b> (descrições e schemas), <b>conhecimento</b> recuperado (RAG, arquivos lidos), <b>histórico</b> e <b>resultados de ferramentas</b>. Princípios: o mínimo de tokens com o máximo de sinal; carregar sob demanda (o agente lê o arquivo quando precisa, em vez de tudo de uma vez); e ordem estável para aproveitar o cache.`,
    `Técnicas: <b>skills</b> e <b>tool search</b> (só as descrições ficam no contexto; o detalhe é carregado quando relevante), resultados de ferramentas resumidos ou truncados com indicação de como ver mais, notas estruturadas que o agente mantém (lista de tarefas, decisões) e <b>subagentes</b> que leem muito e devolvem só o resumo.`,
  ],
  conecta: [['harness', 'Montar o contexto é a principal função do harness.'], ['tokens-contexto', 'A janela de contexto é o recurso gerenciado.'], ['gerenciamento-contexto', 'O que fazer quando o contexto cresce.'], ['custo-latencia', 'Ordem estável aproveita o cache.'], ['subagentes', 'Isolar leituras pesadas em outro contexto.']],
  front: `O arquivo de instruções do projeto que você escreve para o assistente de código é engenharia de contexto: comandos, convenções e cuidados que o agente lê antes de cada tarefa.`,
  ex: { lang: 'texto', code: `Contexto de um agente de código, em ordem (estável → variável)
1. prompt de sistema do harness                         (fixo, cacheado)
2. definições de ferramentas                            (fixo, cacheado)
3. CLAUDE.md do projeto: comandos, convenções           (fixo por projeto)
4. descrições curtas das skills disponíveis             (o conteúdo carrega sob demanda)
5. histórico da tarefa e resultados de ferramentas      (cresce; é compactado)
6. mensagem atual do usuário                            (muda sempre)

Antes: "leia todos os arquivos do projeto" → 400 mil tokens, decisões piores
Depois: grep → ler 3 arquivos relevantes → 12 mil tokens` },
  docs: [['Anthropic · Effective context engineering for AI agents', 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents'], ['Claude Docs · Agent Skills', 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview'], ['Claude Docs · Tool search', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool']],
  perguntas: [`O que um agente do seu projeto precisaria saber antes de qualquer tarefa?`, `Por que carregar informação sob demanda é melhor do que colocar tudo no início?`, `Como a ordem do contexto afeta o custo?`] },

{ id: 'gerenciamento-contexto', stage: 'harness', level: 'importante', title: 'Contexto longo: compactação, edição e cache', short: 'Contexto longo',
  resumo: `Manter agentes trabalhando por horas sem estourar a janela nem degradar a qualidade.`,
  porque: `Tarefas longas geram muito mais tokens do que cabem numa janela de contexto. Sem gestão, o agente para no meio, fica caro a cada passo ou passa a errar por excesso de informação velha.`,
  como: [
    `<b>Edição de contexto</b>: limpar resultados de ferramentas antigos e blocos de raciocínio já usados, mantendo o resto. <b>Compactação</b>: quando o contexto se aproxima do limite, resumir o histórico anterior num bloco e continuar a partir dele (alguns provedores fazem isso no servidor). <b>Memória</b>: guardar fora do contexto o que precisa sobreviver entre sessões.`,
    `Cuidados: compactar perde detalhes, então mantenha fora do contexto o que é crítico (arquivos de progresso, listas de tarefas, commits); preserve exatamente os blocos que a API devolve ao reenviar o histórico; e combine com <b>cache de prompt</b>, mantendo o prefixo estável (trocar ferramentas ou o prompt de sistema no meio da sessão invalida o cache).`,
  ],
  conecta: [['context-engineering', 'Faz parte de gerenciar o contexto.'], ['memoria-agentes', 'Persistir entre sessões.'], ['custo-latencia', 'O cache de prompt depende de prefixo estável.'], ['agentes-longos', 'Tarefas longas dependem dessas técnicas.']],
  front: `Em interfaces de chat longas, um aviso como "a conversa foi resumida para continuar" deixa claro por que o assistente pode ter esquecido um detalhe do começo.`,
  ex: { lang: 'typescript', code: `// compactação no servidor (beta): o histórico antigo vira um resumo automaticamente
const response = await client.beta.messages.create({
  betas: ["compact-2026-01-12"],
  model: "claude-opus-5-5",
  max_tokens: 16000,
  messages,
  context_management: { edits: [{ type: "compact_20260112" }] },
});

// importante: anexe o conteúdo completo, não só o texto,
// para preservar o bloco de compactação nas próximas chamadas
messages.push({ role: "assistant", content: response.content });` },
  docs: [['Claude Docs · Compaction', 'https://platform.claude.com/docs/en/build-with-claude/compaction'], ['Claude Docs · Context editing', 'https://platform.claude.com/docs/en/build-with-claude/context-editing'], ['Claude Docs · Prompt caching', 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching']],
  perguntas: [`Que informação de uma tarefa longa não poderia se perder num resumo?`, `Qual a diferença entre editar e compactar o contexto?`, `Por que trocar ferramentas no meio da sessão afeta o custo?`] },

{ id: 'memoria-agentes', stage: 'harness', level: 'importante', title: 'Memória de agentes', short: 'Memória',
  resumo: `Fazer o agente lembrar de preferências, decisões e aprendizados entre sessões.`,
  porque: `Cada sessão começa do zero: sem memória, o usuário repete as mesmas instruções e o agente repete os mesmos erros. Memória bem feita aumenta a utilidade; mal feita, guarda informação errada, desatualizada ou sensível.`,
  como: [
    `Tipos: <b>memória de trabalho</b> (o contexto atual), <b>memória episódica</b> (o que aconteceu em sessões anteriores), <b>memória semântica</b> (fatos e preferências) e <b>procedimental</b> (como fazer as coisas, como skills e instruções). Implementações: arquivos que o próprio agente lê e escreve (uma ferramenta de memória), bancos com busca vetorial ou registros estruturados.`,
    `Cuidados: o que lembrar (fatos estáveis e úteis, não tudo), como corrigir e apagar memórias erradas, como evitar que uma memória antiga contradiga o estado atual, privacidade (o usuário deve saber e controlar o que é guardado) e segurança (uma memória envenenada por conteúdo malicioso afeta sessões futuras).`,
  ],
  conecta: [['gerenciamento-contexto', 'Memória é o que sobrevive além da sessão.'], ['rag', 'Recuperar memórias relevantes é um problema de busca.'], ['etica-privacidade', 'O usuário precisa saber o que é lembrado.'], ['guardrails', 'Memórias podem ser envenenadas.']],
  front: `Telas de "o que o assistente sabe sobre você", com opção de editar e apagar, são a interface da memória e uma exigência de transparência.`,
  ex: { lang: 'markdown', code: `<!-- memórias de um assistente de código, uma por arquivo -->
# preferencia-testes.md
O usuário prefere testes com Testing Library e MSW; nunca mockar fetch diretamente.
Motivo: mocks de fetch quebraram em refatorações anteriores.

# decisao-estado.md
Estado do servidor fica no TanStack Query (decidido em 2026-09, ADR 0012).
Não sugerir Redux para dados da API.` },
  docs: [['Claude Docs · Memory tool', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool'], ['Letta (MemGPT) · Memória para agentes', 'https://docs.letta.com/'], ['LangChain · Memory concepts', 'https://langchain-ai.github.io/langgraph/concepts/memory/']],
  perguntas: [`O que um assistente deveria lembrar sobre você e o seu projeto?`, `Como corrigir uma memória errada?`, `Que risco existe em guardar memórias a partir de conteúdo externo?`] },

{ id: 'subagentes', stage: 'harness', level: 'importante', title: 'Subagentes e sistemas multiagente', short: 'Multiagente',
  resumo: `Dividir uma tarefa entre vários agentes, cada um com seu contexto e sua especialidade.`,
  porque: `Pesquisas amplas, revisões de muitos arquivos e tarefas paralelas estouram o contexto de um agente só. Subagentes isolam o trabalho pesado e devolvem resumos, mas multiplicam custo e complexidade.`,
  como: [
    `Padrão <b>orquestrador e trabalhadores</b>: um agente principal divide a tarefa, dispara subagentes (muitas vezes em paralelo), cada um com contexto próprio e limpo, e combina os resultados. Subagentes podem usar modelos mais baratos e ferramentas mais restritas. A grande vantagem é <b>isolar contexto</b>: o subagente lê 50 arquivos e devolve um parágrafo.`,
    `Custos e riscos: mais tokens no total, coordenação difícil (trabalho duplicado, resultados conflitantes), erros que se propagam e depuração complexa. Use quando a tarefa é paralelizável ou exige leitura ampla; para tarefas sequenciais e muito acopladas, um agente só costuma ser melhor.`,
  ],
  conecta: [['context-engineering', 'Subagentes isolam leituras pesadas.'], ['workflows-agentes', 'O padrão orquestrador e executores.'], ['custo-latencia', 'Mais agentes significam mais tokens.'], ['avaliacao-agentes', 'Medir se o sistema multiagente compensa.']],
  front: `Uma auditoria de acessibilidade em 200 componentes é um bom caso: subagentes revisam grupos de componentes em paralelo e o principal consolida um relatório único.`,
  ex: { lang: 'texto', code: `Tarefa: "encontrar todos os usos da API antiga de pagamentos e propor a migração"

orquestrador
 ├─ subagente A (modelo menor): busca usos em apps/web     → 14 usos, resumo
 ├─ subagente B (modelo menor): busca usos em apps/mobile  → 6 usos, resumo
 ├─ subagente C (modelo menor): busca usos em services/*   → 9 usos, resumo
 └─ consolida (contexto limpo, só os resumos) → plano de migração em 3 etapas` },
  docs: [['Anthropic · How we built our multi-agent research system', 'https://www.anthropic.com/engineering/multi-agent-research-system'], ['Claude Code · Subagents', 'https://code.claude.com/docs/en/sub-agents'], ['OpenAI Agents SDK · Handoffs', 'https://openai.github.io/openai-agents-python/handoffs/']],
  perguntas: [`Que tarefa sua seria paralelizável entre subagentes?`, `Por que isolar contexto é a principal vantagem dos subagentes?`, `Quando um único agente é melhor que vários?`] },

{ id: 'sandbox-permissoes', stage: 'harness', level: 'essencial', title: 'Sandbox, permissões e hooks', short: 'Sandbox',
  resumo: `Limitar o que um agente pode fazer e onde, e interceptar suas ações.`,
  porque: `Um agente com acesso a terminal, arquivos e rede pode apagar dados, vazar segredos ou ser manipulado por conteúdo malicioso. Isolamento e permissões são o que permite dar autonomia com segurança.`,
  como: [
    `<b>Sandbox</b>: rodar as ações do agente num ambiente isolado (container, VM, ambiente gerenciado) com sistema de arquivos restrito, rede limitada a destinos permitidos e sem credenciais além das necessárias. <b>Permissões</b>: políticas por ferramenta e por ação (sempre permitir leituras, pedir aprovação para escrever, negar comandos perigosos), escaladas conforme a confiança.`,
    `<b>Hooks</b>: pontos do harness onde código seu roda antes ou depois de cada ação, para validar, bloquear, registrar, formatar ou notificar. Princípios: menor privilégio, ações irreversíveis sempre com confirmação, segredos fora do alcance do modelo (injetados na saída da rede, não no ambiente) e registro auditável de tudo o que o agente fez.`,
  ],
  conecta: [['guardrails', 'Defesas contra prompt injection na arquitetura.'], ['harness', 'Permissões são parte do harness.'], ['seguranca/zero-trust', 'Menor privilégio aplicado a agentes.'], ['backend/docker', 'Containers como sandbox.']],
  front: `Os diálogos de aprovação de um agente ("permitir executar npm install?") são uma parte crítica da interface: claros sobre o efeito da ação, com opção de permitir sempre para ações seguras.`,
  ex: { lang: 'json', code: `// configuração de permissões de um agente de código (exemplo genérico)
{
  "permissions": {
    "allow": ["Read", "Grep", "Bash(npm test:*)", "Bash(git status)"],
    "ask":   ["Edit", "Bash(npm install:*)", "Bash(git push:*)"],
    "deny":  ["Bash(rm -rf:*)", "Read(./.env)", "WebFetch(domain:*.interno.com)"]
  },
  "hooks": {
    "PostToolUse": [{ "matcher": "Edit", "command": "npx prettier --write $FILE" }]
  }
}` },
  docs: [['Claude Code · Permissões e configurações', 'https://code.claude.com/docs/en/settings'], ['Claude Code · Hooks', 'https://code.claude.com/docs/en/hooks'], ['Anthropic · Claude Code sandboxing', 'https://www.anthropic.com/engineering/claude-code-sandboxing']],
  perguntas: [`Que ações de um agente no seu projeto deveriam sempre pedir aprovação?`, `Por que segredos não devem ficar acessíveis ao ambiente do agente?`, `Que hook seria útil no seu fluxo de trabalho?`] },

{ id: 'agent-sdks', stage: 'harness', level: 'importante', title: 'Construir ou usar: SDKs, frameworks e agentes gerenciados', short: 'Agent SDKs',
  resumo: `As opções para não escrever o loop de agente do zero, e o que cada uma entrega.`,
  porque: `Escrever um harness completo (loop, ferramentas, contexto, permissões, retomada) é muito trabalho. Escolher bem entre loop próprio, SDK, framework ou plataforma gerenciada define o esforço e a flexibilidade do projeto.`,
  como: [
    `<b>Loop manual</b> com a API: controle total, nenhuma dependência extra. <b>Tool runner</b> do SDK do provedor: você escreve só as funções das ferramentas e o SDK faz o loop. <b>SDK de agente completo</b> (como o Claude Agent SDK, que traz o harness do Claude Code com ferramentas de arquivo, bash, busca e subagentes) para agentes de código e de arquivos. <b>Frameworks</b> (LangGraph, OpenAI Agents SDK, Mastra, Vercel AI SDK) para grafos de estado e integrações.`,
    `<b>Agentes gerenciados</b>: o provedor roda o loop e um ambiente isolado por sessão, com configuração versionada, sessões longas e agendamento, e você só define o agente e as ferramentas. Critérios: quanto controle você precisa, onde o código deve rodar, dependência do fornecedor e maturidade das abstrações. Comece pelo mais simples que resolve.`,
  ],
  conecta: [['harness', 'Cada opção entrega partes diferentes do harness.'], ['tool-use', 'A base de todas as opções.'], ['workflows-agentes', 'Às vezes um workflow simples basta.'], ['devops/cloud-modelos', 'O mesmo espectro gerenciado × próprio da nuvem.']],
  front: `O Vercel AI SDK é popular no front porque cobre as duas pontas: o loop de ferramentas no servidor e hooks de React para streaming e estado da conversa.`,
  ex: { lang: 'typescript', code: `// Tool Runner do SDK: você escreve a ferramenta, o SDK faz o loop
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const client = new Anthropic();

const statusPedido = betaZodTool({
  name: "status_pedido",
  description: "Consulta o status de um pedido do usuário atual pelo número",
  inputSchema: z.object({ numero: z.string() }),
  run: async ({ numero }) => JSON.stringify(await pedidos.status(usuario.id, numero)),
});

const final = await client.beta.messages.toolRunner({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  tools: [statusPedido],
  messages: [{ role: "user", content: "Meu pedido 981 já saiu para entrega?" }],
});` },
  docs: [['Claude Docs · Tool use overview', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview'], ['Claude Agent SDK', 'https://code.claude.com/docs/en/agent-sdk/overview'], ['Claude Docs · Managed Agents: agent setup', 'https://platform.claude.com/docs/en/managed-agents/agent-setup'], ['OpenAI Agents SDK', 'https://openai.github.io/openai-agents-python/']],
  perguntas: [`Para o agente que você imagina, qual nível de abstração faz sentido?`, `O que você ganha e perde com um agente gerenciado pelo provedor?`, `Quando escrever o próprio loop ainda compensa?`] },

{ id: 'computer-use', stage: 'harness', level: 'aprofundar', title: 'Agentes que usam navegador e computador', short: 'Computer use',
  resumo: `Modelos que veem a tela e controlam mouse, teclado e navegador.`,
  porque: `Muitos sistemas não têm API: só uma interface. Agentes que operam interfaces abrem automação para esses casos, e também são usados para testar aplicações web, o que interessa diretamente a quem faz front.`,
  como: [
    `O agente recebe <b>capturas de tela</b> (e, em navegadores, às vezes a árvore de acessibilidade ou o DOM) e responde com ações: clicar em coordenadas, digitar, rolar, navegar. O harness executa num ambiente isolado (VM, container com navegador) e devolve a nova tela. Alternativas mais estáveis usam automação estruturada (Playwright, MCP de navegador) em vez de pixels.`,
    `Limitações e riscos: mais lento e caro que APIs, sensível a mudanças visuais, e vulnerável a prompt injection presente nas páginas visitadas. Rode isolado, sem sessões logadas desnecessárias, com confirmação para ações sensíveis (compras, envios) e listas de sites permitidos.`,
  ],
  conecta: [['sandbox-permissoes', 'Isolamento é obrigatório.'], ['guardrails', 'Páginas visitadas podem conter injeções.'], ['frontend/a11y-fundamentos', 'Interfaces acessíveis são mais fáceis de operar por agentes.'], ['frontend/testes-front', 'Agentes também testam interfaces.']],
  front: `Uma interface com HTML semântico, rótulos claros e árvore de acessibilidade bem feita é muito mais fácil de operar tanto por leitores de tela quanto por agentes.`,
  ex: { lang: 'texto', code: `Loop de computer use
1. harness envia: captura de tela + tarefa ("baixe a nota fiscal de outubro")
2. modelo responde: clicar(812, 344)   # botão "Notas fiscais"
3. harness executa no ambiente isolado e envia a nova captura
4. modelo responde: digitar("outubro 2026") → clicar(…) → ...
5. antes de "Enviar por e-mail": harness pede confirmação ao usuário` },
  docs: [['Claude Docs · Computer use tool', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool'], ['Playwright MCP', 'https://github.com/microsoft/playwright-mcp'], ['OpenAI · Computer use', 'https://platform.openai.com/docs/guides/tools-computer-use']],
  perguntas: [`Que tarefa sem API na sua empresa poderia ser automatizada por um agente de interface?`, `Por que automação estruturada costuma ser mais estável que pixels?`, `Que riscos um agente navegando na web enfrenta?`] },

{ id: 'agentes-longos', stage: 'harness', level: 'aprofundar', title: 'Agentes de longa duração', short: 'Tarefas longas',
  resumo: `Agentes que trabalham por horas: planejamento, checkpoints, orçamento e verificação.`,
  porque: `Os modelos mais recentes conseguem trabalhar autonomamente por muito tempo em tarefas grandes, como migrar uma base de código. Isso exige um harness que mantenha a direção, salve progresso e saiba quando o trabalho está realmente pronto.`,
  como: [
    `Práticas: dar a tarefa completa e os critérios de sucesso desde o início; fazer o agente manter um <b>plano</b> e um arquivo de <b>progresso</b> fora do contexto; <b>checkpoints</b> frequentes (commits) para retomar após falhas; testes como verificação objetiva; e um <b>orçamento</b> de tokens ou tempo para o agente se organizar e terminar com elegância.`,
    `<b>Verificação</b> é o ponto central: um avaliador separado (outro agente ou testes) checa o resultado contra critérios, e o agente itera até passar. Para trabalho muito grande, divide-se em muitas tarefas menores executadas por vários agentes em fases. Monitore: um agente que repete ações ou não avança deve ser interrompido.`,
  ],
  conecta: [['gerenciamento-contexto', 'Contexto longo exige compactação e memória.'], ['subagentes', 'Trabalhos grandes viram muitas tarefas paralelas.'], ['avaliacao-agentes', 'Verificar o resultado objetivamente.'], ['praticas/commits-prs', 'Commits frequentes como checkpoints.']],
  front: `Migrações grandes de front (trocar a biblioteca de componentes em 300 telas) são candidatas a agentes de longa duração com testes visuais e de componentes como verificação.`,
  ex: { lang: 'markdown', code: `# progresso.md (mantido pelo próprio agente)
## Objetivo
Migrar todos os formulários de Formik para React Hook Form, sem mudar comportamento.

## Critério de pronto
npm test e npm run test:e2e passando; nenhum import de "formik".

## Status
- [x] 18/42 formulários migrados (commits a1f…, b7c…)
- [ ] CheckoutForm: validação assíncrona de CEP precisa de cuidado
## Decisões
- schemas Yup convertidos para Zod (zodResolver)` },
  docs: [['Anthropic · Effective harnesses for long-running agents', 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents'], ['Claude Docs · Managed Agents: define outcomes', 'https://platform.claude.com/docs/en/managed-agents/define-outcomes'], ['METR · Measuring AI ability to complete long tasks', 'https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/']],
  perguntas: [`Que tarefa longa e repetitiva do seu projeto poderia ser feita por um agente com testes como verificação?`, `Por que manter o progresso fora do contexto do modelo?`, `Como saber que um agente está travado em vez de avançando?`] },
]
