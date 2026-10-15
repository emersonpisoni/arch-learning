import type { Topic } from '../../../types'

export const agentes: Topic[] = [
{ id: 'tool-use', stage: 'agentes', level: 'essencial', title: 'Tool use (function calling)', short: 'Tool use',
  resumo: `Deixar o modelo pedir para a sua aplicação executar funções e usar os resultados.`,
  porque: `Tool use conecta o LLM aos seus sistemas: consultar um pedido, calcular frete, buscar no banco. É o que transforma um chat que só conversa num assistente que resolve coisas, e a base de qualquer agente.`,
  como: [
    `Você descreve cada <b>ferramenta</b> com nome, descrição e um <b>JSON Schema</b> dos parâmetros. Quando o modelo decide usar uma, a resposta vem com <code>stop_reason: "tool_use"</code> e um bloco com o nome e os argumentos. A <b>sua aplicação</b> executa a função e devolve o resultado num bloco <code>tool_result</code>; o modelo continua até responder.`,
    `O modelo nunca executa nada sozinho: quem executa é o seu código, com as permissões do seu código. Por isso: valide os argumentos, aplique a autorização do usuário real em cada ferramenta, devolva erros como resultado (<code>is_error</code>) em vez de lançar exceção, e escreva descrições claras, porque é por elas que o modelo decide quando e como usar cada ferramenta.`,
  ],
  conecta: [['agentes', 'Agentes são loops de tool use.'], ['mcp', 'Um padrão para expor ferramentas.'], ['saida-estruturada', 'Ferramentas usam schemas como a saída estruturada.'], ['backend/autorizacao', 'Cada ferramenta deve respeitar as permissões do usuário.'], ['guardrails', 'Ferramentas que alteram dados exigem confirmação.']],
  front: `Ferramentas que mudam algo (cancelar pedido, enviar e-mail) costumam pedir confirmação na interface antes de executar; ferramentas de leitura podem rodar direto.`,
  ex: { lang: 'typescript', code: `const tools: Anthropic.Tool[] = [{
  name: "buscar_pedido",
  description: "Busca o status e a previsão de entrega de um pedido do usuário atual pelo número.",
  input_schema: {
    type: "object",
    properties: { numero: { type: "string", description: "Número do pedido, ex.: 981" } },
    required: ["numero"],
  },
}];

const messages: Anthropic.MessageParam[] = [{ role: "user", content: "Cadê meu pedido 981?" }];

while (true) {
  const response = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, tools, messages });
  messages.push({ role: "assistant", content: response.content });
  if (response.stop_reason !== "tool_use") break;            // resposta final

  const resultados: Anthropic.ToolResultBlockParam[] = [];
  for (const block of response.content) {
    if (block.type !== "tool_use") continue;
    const pedido = await pedidos.buscarDoUsuario(usuario.id, (block.input as { numero: string }).numero);
    resultados.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(pedido ?? { erro: "não encontrado" }) });
  }
  messages.push({ role: "user", content: resultados });       // todos os resultados juntos
}` },
  docs: [['Claude Docs · Tool use overview', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview'], ['Anthropic · Writing effective tools for agents', 'https://www.anthropic.com/engineering/writing-tools-for-agents'], ['OpenAI · Function calling', 'https://platform.openai.com/docs/guides/function-calling']],
  perguntas: [`Que ferramentas dariam a um assistente do seu produto a capacidade de resolver problemas reais?`, `Por que o modelo nunca executa a ferramenta sozinho?`, `Como garantir que uma ferramenta só acesse dados do usuário atual?`] },

{ id: 'agentes', stage: 'agentes', level: 'importante', title: 'Agentes', short: 'Agentes',
  resumo: `Um modelo que decide sozinho quais ferramentas usar, em várias etapas, até cumprir uma tarefa.`,
  porque: `Agentes de código, de pesquisa e de atendimento estão em todo lugar. Entender como funcionam, e quando não usar um, evita sistemas caros, lentos e imprevisíveis onde um fluxo simples resolveria.`,
  como: [
    `Um <b>agente</b> é um loop: o modelo recebe a tarefa e as ferramentas, decide uma ação, observa o resultado e repete até concluir. A diferença para um fluxo fixo é que o <b>caminho</b> é decidido pelo modelo, o que permite lidar com tarefas abertas, ao custo de previsibilidade, latência e tokens.`,
    `Peças de um bom agente: ferramentas bem desenhadas, contexto gerenciado (resumir ou limpar resultados antigos para não estourar a janela), limites de passos e de custo, pontos de <b>aprovação humana</b> para ações sensíveis e observabilidade de cada passo. SDKs e plataformas (Tool Runner, Claude Agent SDK, OpenAI Agents SDK, LangGraph) cuidam do loop.`,
  ],
  conecta: [['tool-use', 'O mecanismo básico de cada passo.'], ['workflows-agentes', 'Quando um fluxo fixo é melhor.'], ['observabilidade-llm', 'Rastrear cada passo do agente.'], ['guardrails', 'Limites e aprovações para ações sensíveis.']],
  front: `Interfaces de agentes precisam mostrar o que está acontecendo ("buscando pedido...", "calculando frete..."), permitir interromper e pedir confirmação antes de ações irreversíveis.`,
  ex: { lang: 'texto', code: `Tarefa: "Reembolse o pedido 981 se ele chegou com defeito"

passo 1  buscar_pedido(981)            → entregue há 2 dias, R$ 199,90
passo 2  buscar_chamados(981)          → foto do produto quebrado anexada
passo 3  verificar_politica("defeito") → reembolso integral até 7 dias
passo 4  ⏸ pedir aprovação humana: "Reembolsar R$ 199,90 do pedido 981?"
passo 5  reembolsar(981, 19990)        → ok (após aprovação)
resposta: "Reembolso aprovado e processado. O valor aparece em até 5 dias úteis."` },
  docs: [['Anthropic · Building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents'], ['Claude Agent SDK', 'https://code.claude.com/docs/en/agent-sdk/overview'], ['LangGraph', 'https://langchain-ai.github.io/langgraph/']],
  perguntas: [`Que tarefa da sua empresa é aberta o suficiente para um agente?`, `Onde um agente do seu produto precisaria de aprovação humana?`, `Como mostrar ao usuário o que o agente está fazendo?`] },

{ id: 'mcp', stage: 'agentes', level: 'importante', title: 'Model Context Protocol (MCP)', short: 'MCP',
  resumo: `Um protocolo aberto para conectar ferramentas e dados a qualquer aplicação com IA.`,
  porque: `Antes do MCP, cada integração entre um assistente e um sistema (GitHub, banco, Jira) era feita sob medida. O MCP padroniza isso: um servidor MCP funciona em vários clientes, como IDEs, assistentes e agentes.`,
  como: [
    `Um <b>servidor MCP</b> expõe <b>tools</b> (ações), <b>resources</b> (dados para leitura) e <b>prompts</b> (modelos reutilizáveis). Um <b>cliente MCP</b> (Claude, IDEs, outros agentes) se conecta, descobre o que está disponível e oferece ao modelo. A comunicação usa JSON-RPC, localmente (stdio) ou pela rede (HTTP).`,
    `Para empresas, MCP permite expor sistemas internos para assistentes de forma padronizada. Cuidados de segurança: servidores MCP executam ações com as credenciais configuradas, então aplique menor privilégio, autenticação (OAuth) em servidores remotos, e desconfie de servidores de terceiros, cujas descrições e resultados podem conter instruções maliciosas.`,
  ],
  conecta: [['tool-use', 'MCP padroniza como ferramentas são oferecidas.'], ['agentes', 'Agentes consomem ferramentas via MCP.'], ['guardrails', 'Servidores de terceiros podem injetar instruções.'], ['seguranca/oauth-a-fundo', 'Servidores remotos usam OAuth.']],
  front: `Um servidor MCP do seu design system ou da sua API interna permite que o assistente de código consulte componentes e contratos reais em vez de inventá-los.`,
  ex: { lang: 'typescript', code: `// servidor MCP mínimo com o SDK oficial (TypeScript)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "loja", version: "1.0.0" });

server.tool(
  "status_pedido",
  "Consulta o status de um pedido pelo número",
  { numero: z.string() },
  async ({ numero }) => ({
    content: [{ type: "text", text: JSON.stringify(await pedidos.status(numero)) }],
  }),
);

await server.connect(new StdioServerTransport());` },
  docs: [['modelcontextprotocol.io', 'https://modelcontextprotocol.io/introduction'], ['MCP · Especificação', 'https://modelcontextprotocol.io/specification/latest'], ['GitHub · MCP TypeScript SDK', 'https://github.com/modelcontextprotocol/typescript-sdk']],
  perguntas: [`Que sistema interno da sua empresa valeria a pena expor via MCP?`, `Quais as três coisas que um servidor MCP pode oferecer?`, `Que riscos um servidor MCP de terceiros traz?`] },

{ id: 'workflows-agentes', stage: 'agentes', level: 'importante', title: 'Workflows versus agentes', short: 'Workflows',
  resumo: `Quando um fluxo definido em código é melhor que deixar o modelo decidir tudo.`,
  porque: `A maioria das funcionalidades de IA em produção são workflows: etapas definidas, com o LLM em pontos específicos. São mais previsíveis, baratos e fáceis de testar do que agentes, e muitas vezes resolvem o problema inteiro.`,
  como: [
    `Padrões de workflow: <b>encadeamento</b> (a saída de uma etapa é a entrada da próxima, com verificações no meio), <b>roteamento</b> (classificar a entrada e mandar para o tratamento certo), <b>paralelização</b> (várias chamadas ao mesmo tempo, depois combinar), <b>orquestrador e executores</b> e <b>avaliador e otimizador</b> (um gera, outro critica, repete).`,
    `Regra prática: comece pela solução mais simples (uma chamada bem feita), passe para um workflow quando houver etapas claras e só use um agente quando o caminho realmente não puder ser definido antes. Complexidade só se justifica quando melhora resultados de forma mensurável.`,
  ],
  conecta: [['agentes', 'A alternativa mais autônoma.'], ['prompt-engineering', 'Cada etapa tem seu prompt.'], ['avaliacao', 'Medir se a complexidade compensa.'], ['backend/filas', 'Etapas longas podem rodar de forma assíncrona.']],
  front: `Um "assistente de atendimento" pode ser um roteamento simples: classificar a mensagem (troca, entrega, pagamento) e chamar um fluxo específico para cada caso, sem agente nenhum.`,
  ex: { lang: 'typescript', code: `// roteamento: um LLM classifica, o código decide o fluxo
const { categoria } = await classificar(mensagem);      // saída estruturada com enum

switch (categoria) {
  case "rastreio":  return responderRastreio(mensagem);  // busca no sistema, sem agente
  case "troca":     return iniciarTroca(mensagem);       // formulário guiado
  case "pagamento": return encaminharFinanceiro(mensagem);
  default:          return respostaGeral(mensagem);      // uma chamada com RAG
}` },
  docs: [['Anthropic · Building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents'], ['Anthropic · Claude cookbooks', 'https://github.com/anthropics/claude-cookbooks'], ['Vercel AI SDK · Agents and workflows', 'https://ai-sdk.dev/docs/agents/overview']],
  perguntas: [`A funcionalidade de IA que você conhece precisa mesmo de um agente?`, `Que padrão de workflow resolveria um problema do seu produto?`, `Como você mediria se um agente é melhor que um workflow para o mesmo caso?`] },
]
