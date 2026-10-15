import type { Topic } from '../../../types'

export const integracao: Topic[] = [
{ id: 'api-llm', stage: 'integracao', level: 'essencial', title: 'Chamar uma API de LLM', short: 'API de LLM',
  resumo: `Mensagens, papéis, chaves de API e onde a chamada deve acontecer.`,
  porque: `Integrar um LLM é, tecnicamente, uma chamada HTTP. O que define a qualidade da integração são os detalhes: onde a chave fica, como tratar erros e limites, e como montar as mensagens.`,
  como: [
    `A API recebe um <b>modelo</b>, um <b>prompt de sistema</b> (instruções e papel), uma lista de <b>mensagens</b> alternando <code>user</code> e <code>assistant</code> e um limite de tokens. A resposta traz blocos de conteúdo, o motivo da parada (<code>stop_reason</code>) e o uso de tokens. Use o SDK oficial do provedor, que trata autenticação, retries e tipos.`,
    `A chamada deve sair do <b>servidor</b> (ou de um BFF/função), nunca do navegador: a chave de API é secreta. Trate os erros esperados: <b>429</b> (limite de uso, com retry e backoff), <b>5xx</b> e sobrecarga, timeouts e respostas recusadas. Registre o uso de tokens para acompanhar custo.`,
  ],
  conecta: [['prompt-engineering', 'O que vai dentro das mensagens.'], ['streaming-llm', 'Mostrar a resposta enquanto é gerada.'], ['backend/segredos', 'A chave de API fica no servidor.'], ['backend/rate-limit', 'Tratar 429 com backoff.']],
  front: `O front chama a sua API (ou uma rota do BFF), que chama o provedor de LLM. Assim a chave fica protegida e você pode aplicar autenticação, limites por usuário e logs.`,
  ex: { lang: 'typescript', code: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // lê a chave do ambiente do servidor

const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  system: "Você é o assistente de suporte da Loja. Responda em português, de forma breve.",
  messages: [{ role: "user", content: "Como troco o endereço de entrega?" }],
});

for (const block of response.content) {
  if (block.type === "text") console.log(block.text);
}
console.log(response.usage.input_tokens, response.usage.output_tokens); // para custo` },
  docs: [['Claude Docs · Models overview', 'https://platform.claude.com/docs/en/about-claude/models/overview'], ['Claude Docs · Errors', 'https://platform.claude.com/docs/en/api/errors'], ['Claude Docs · Rate limits', 'https://platform.claude.com/docs/en/api/rate-limits'], ['GitHub · anthropic-sdk-typescript', 'https://github.com/anthropics/anthropic-sdk-typescript']],
  perguntas: [`Por que a chamada ao LLM não deve sair do navegador?`, `Como sua aplicação deveria reagir a um 429?`, `Onde você registraria o uso de tokens para acompanhar o custo?`] },

{ id: 'prompt-engineering', stage: 'integracao', level: 'essencial', title: 'Engenharia de prompts', short: 'Prompts',
  resumo: `Instruções claras, contexto, exemplos e estrutura para respostas consistentes.`,
  porque: `A maior parte da qualidade de uma funcionalidade de IA vem do prompt. Pequenas mudanças de instrução mudam muito o resultado, e prompts são código: versionados, revisados e testados.`,
  como: [
    `Princípios: seja <b>claro e direto</b> sobre a tarefa, o público e o formato; dê <b>contexto</b> (por que a tarefa existe, o que é sucesso); separe instruções e dados com <b>tags</b> (ex.: <code>&lt;documento&gt;</code>); inclua <b>exemplos</b> do resultado desejado (few-shot) quando o formato for específico; e diga o que fazer em casos de dúvida.`,
    `O <b>prompt de sistema</b> define papel e regras estáveis; a mensagem do usuário traz o caso. Para tarefas complexas, peça para o modelo raciocinar antes de responder ou divida em etapas encadeadas. Modelos recentes seguem instruções ao pé da letra: instruções exageradas ("SEMPRE", "NUNCA" em maiúsculas) podem atrapalhar mais que ajudar. Trate prompts como código e meça cada mudança.`,
  ],
  conecta: [['api-llm', 'O prompt vai dentro das mensagens.'], ['saida-estruturada', 'Formato garantido por schema.'], ['avaliacao', 'Cada mudança de prompt precisa ser medida.'], ['guardrails', 'Separar instruções de dados ajuda contra prompt injection.']],
  front: `Prompts que dependem de dados da tela (o carrinho, o texto selecionado) devem receber esses dados delimitados por tags, e nunca concatenados direto nas instruções.`,
  ex: { lang: 'typescript', code: `const system = \`Você é um assistente que resume avaliações de produtos para a equipe de compras.
Escreva em português, em até 3 frases, citando pontos positivos e negativos recorrentes.
Se houver menos de 3 avaliações, diga que não há dados suficientes.\`;

const user = \`<produto>Teclado mecânico TKL</produto>
<avaliacoes>
\${avaliacoes.map((a) => \`<avaliacao nota="\${a.nota}">\${a.texto}</avaliacao>\`).join("\\n")}
</avaliacoes>

Resuma as avaliações acima.\`;` },
  docs: [['Claude Docs · Prompt engineering overview', 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview'], ['Anthropic · Prompt engineering interactive tutorial', 'https://github.com/anthropics/prompt-eng-interactive-tutorial'], ['OpenAI · Prompt engineering guide', 'https://platform.openai.com/docs/guides/prompt-engineering']],
  perguntas: [`Por que separar instruções e dados com tags?`, `Quando exemplos (few-shot) ajudam mais que instruções?`, `Como saber se uma mudança de prompt melhorou ou piorou o resultado?`] },

{ id: 'saida-estruturada', stage: 'integracao', level: 'essencial', title: 'Saída estruturada', short: 'JSON',
  resumo: `Fazer o modelo devolver JSON válido, de acordo com um schema, para o código consumir.`,
  porque: `Integrar IA ao sistema exige dados, não parágrafos: categorias, campos extraídos, decisões. Pedir "responda em JSON" sem garantia gera respostas que quebram o parse em produção.`,
  como: [
    `APIs modernas oferecem <b>saída estruturada</b>: você envia um <b>JSON Schema</b> e o modelo é restringido a gerar algo que o respeita. Em TypeScript, bibliotecas como <b>Zod</b> definem o schema, geram o formato para a API e validam e tipam a resposta.`,
    `Mesmo com garantia de formato, valide a <b>semântica</b> (um e-mail extraído pode estar no formato certo e ainda assim errado), trate a possibilidade de recusa ou de resposta cortada, e prefira campos com valores enumerados (<code>enum</code>) para classificações.`,
  ],
  conecta: [['prompt-engineering', 'O prompt continua guiando o conteúdo.'], ['tool-use', 'Ferramentas também usam schemas.'], ['backend/contratos', 'O schema é um contrato.'], ['avaliacao', 'Saídas estruturadas são fáceis de avaliar automaticamente.']],
  front: `Com saída estruturada, o front recebe dados tipados prontos para preencher um formulário ("preencher com IA") ou uma tabela, em vez de texto livre para interpretar.`,
  ex: { lang: 'typescript', code: `import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const Chamado = z.object({
  categoria: z.enum(["entrega", "pagamento", "troca", "outro"]),
  urgente: z.boolean(),
  pedidoId: z.string().nullable(),
  resumo: z.string(),
});

const client = new Anthropic();
const response = await client.messages.parse({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  messages: [{ role: "user", content: \`Classifique o chamado: "\${textoDoCliente}"\` }],
  output_config: { format: zodOutputFormat(Chamado) },
});

const chamado = response.parsed_output; // tipado; null se não foi possível interpretar
if (chamado) await filas.publicar(chamado.categoria, chamado);` },
  docs: [['Claude Docs · Structured outputs', 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs'], ['Zod', 'https://zod.dev/'], ['JSON Schema', 'https://json-schema.org/learn/getting-started-step-by-step']],
  perguntas: [`Que funcionalidade do seu produto poderia virar "IA que preenche um formulário"?`, `Por que validar o conteúdo mesmo com o formato garantido?`, `Por que usar enum para categorias?`] },

{ id: 'streaming-llm', stage: 'integracao', level: 'importante', title: 'Streaming de respostas', short: 'Streaming',
  resumo: `Mostrar a resposta enquanto ela é gerada, do provedor até a interface.`,
  porque: `Respostas longas podem levar dezenas de segundos. Sem streaming, o usuário olha para um spinner; com streaming, começa a ler em menos de um segundo. É uma das maiores diferenças de experiência em produtos com IA.`,
  como: [
    `O provedor envia <b>eventos</b> com pedaços do texto (via SSE). O seu servidor consome esse stream e o repassa ao navegador, normalmente também por SSE ou por uma resposta HTTP em partes. Bibliotecas como o Vercel AI SDK simplificam as duas pontas.`,
    `Cuidados: proxies e CDNs não podem acumular a resposta; trate erros no meio do stream; permita <b>cancelar</b> (AbortController) para não pagar por tokens que ninguém vai ler; e, quando precisar da resposta completa (para salvar), use os utilitários do SDK que montam a mensagem final.`,
  ],
  conecta: [['backend/realtime', 'SSE é o transporte mais comum.'], ['frontend/streaming-ssr', 'Mesmos cuidados com proxies que acumulam a resposta.'], ['api-llm', 'A mesma chamada, em modo streaming.'], ['ux-ia', 'Streaming é parte da experiência.']],
  front: `No navegador, leia o stream com <code>fetch</code> e <code>ReadableStream</code> (ou EventSource), acrescente o texto a um estado e ofereça um botão "parar" que cancela a requisição.`,
  ex: { lang: 'typescript', code: `// servidor: repassa o texto do modelo para o navegador conforme chega
app.post("/api/assistente", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  const stream = client.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 64000,
    messages: [{ role: "user", content: req.body.pergunta }],
  });
  req.on("close", () => stream.abort());          // usuário cancelou: para de gerar

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      res.write(\`data: \${JSON.stringify(event.delta.text)}\\n\\n\`);
    }
  }
  const final = await stream.finalMessage();       // mensagem completa, para salvar
  await historico.salvar(final);
  res.end();
});` },
  docs: [['Claude Docs · Streaming', 'https://platform.claude.com/docs/en/build-with-claude/streaming'], ['MDN · Using readable streams', 'https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams'], ['Vercel AI SDK', 'https://ai-sdk.dev/docs/introduction']],
  perguntas: [`Por que permitir que o usuário cancele uma geração em andamento?`, `O que pode impedir o stream de chegar em partes ao navegador?`, `Como salvar a resposta completa sem perder o streaming?`] },

{ id: 'multimodal', stage: 'integracao', level: 'importante', title: 'Imagens, PDFs e outras entradas', short: 'Multimodal',
  resumo: `Modelos que entendem imagens e documentos além de texto.`,
  porque: `Muitas tarefas reais começam com um arquivo: nota fiscal em PDF, foto de um produto com defeito, print de uma tela com erro. Modelos multimodais permitem automatizar esses fluxos sem OCR e regras manuais.`,
  como: [
    `As APIs aceitam <b>imagens</b> e <b>PDFs</b> como blocos de conteúdo (em base64, por URL ou por id de arquivo enviado antes), junto com a instrução em texto. Casos comuns: extrair dados de documentos, descrever imagens, comparar telas, analisar gráficos e responder perguntas sobre contratos.`,
    `Cuidados: imagens e páginas consomem bastante contexto (tokens); reduza a resolução quando possível; combine com saída estruturada para extrair dados; e considere privacidade, porque documentos costumam ter dados pessoais.`,
  ],
  conecta: [['saida-estruturada', 'Extrair dados de documentos em JSON.'], ['tokens-contexto', 'Imagens e PDFs consomem muitos tokens.'], ['etica-privacidade', 'Documentos costumam ter dados pessoais.'], ['devops/storage', 'Arquivos enviados vivem em object storage.']],
  front: `Um "envie a foto do comprovante e preenchemos o formulário" combina upload no front, extração multimodal no servidor e saída estruturada voltando para os campos da tela.`,
  ex: { lang: 'typescript', code: `import fs from "node:fs";

const pdf = fs.readFileSync("./nota-fiscal.pdf").toString("base64");

const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  messages: [{
    role: "user",
    content: [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf } },
      { type: "text", text: "Extraia o CNPJ do emitente, a data de emissão e o valor total." },
    ],
  }],
});` },
  docs: [['Claude Docs · Vision', 'https://platform.claude.com/docs/en/build-with-claude/vision'], ['Claude Docs · PDF support', 'https://platform.claude.com/docs/en/build-with-claude/pdf-support'], ['Claude Docs · Files API', 'https://platform.claude.com/docs/en/build-with-claude/files']],
  perguntas: [`Que fluxo manual da sua empresa começa com um documento ou uma imagem?`, `Por que reduzir a resolução das imagens enviadas?`, `Que cuidados de privacidade um upload de documento exige?`] },
]
