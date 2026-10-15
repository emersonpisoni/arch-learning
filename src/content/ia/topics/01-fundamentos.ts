import type { Topic } from '../../../types'

export const fundamentos: Topic[] = [
{ id: 'llm-como-funciona', stage: 'fundamentos', level: 'essencial', title: 'Como um LLM funciona', short: 'LLM',
  resumo: `Um modelo que prevê o próximo token, treinado em muito texto e ajustado para seguir instruções.`,
  porque: `Entender o mecanismo explica por que o modelo erra com confiança, por que a mesma pergunta gera respostas diferentes e por que o contexto importa tanto. Isso evita tanto o deslumbramento quanto o descrédito.`,
  como: [
    `Um <b>LLM</b> (large language model) é uma rede neural do tipo <b>transformer</b> que, dado um texto, calcula a probabilidade de cada <b>token</b> possível vir a seguir. Gerar uma resposta é repetir isso: escolher um token, acrescentá-lo e prever o próximo. O mecanismo de <b>atenção</b> permite que cada token considere todos os anteriores.`,
    `O <b>pré-treinamento</b> em grandes volumes de texto ensina linguagem e conhecimento geral. Depois, o <b>ajuste fino</b> com exemplos e <b>feedback humano</b> transforma o modelo num assistente que segue instruções. O modelo não consulta um banco de fatos: o conhecimento está nos pesos e para numa <b>data de corte</b>. Modelos recentes também "raciocinam" (thinking) antes de responder, gastando tokens para pensar.`,
  ],
  conecta: [['tokens-contexto', 'Tudo é medido em tokens.'], ['limitacoes', 'O mecanismo explica as alucinações.'], ['rag', 'Como dar ao modelo informação que ele não tem.'], ['escolha-modelo', 'Modelos diferem em tamanho, custo e capacidade.']],
  front: `O efeito "digitando" das interfaces de chat existe porque o modelo realmente gera um token por vez; o streaming só mostra isso ao usuário conforme acontece.`,
  ex: { lang: 'texto', code: `Entrada:  "O pedido foi enviado para o"
Previsão do próximo token (probabilidades ilustrativas):
  " endereço"   0,41
  " cliente"    0,22
  " cep"        0,09
  " Brasil"     0,04
  ...
O modelo escolhe um token, anexa ao texto e repete até terminar.` },
  docs: [['Jay Alammar · The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/'], ['3Blue1Brown · Neural networks (série em vídeo)', 'https://www.3blue1brown.com/topics/neural-networks'], ['Andrej Karpathy · Intro to Large Language Models (vídeo)', 'https://www.youtube.com/watch?v=zjkBMFhNj_g']],
  perguntas: [`Por que a mesma pergunta pode gerar respostas diferentes?`, `O que significa dizer que o modelo tem uma data de corte?`, `O que muda quando o modelo "pensa" antes de responder?`] },

{ id: 'tokens-contexto', stage: 'fundamentos', level: 'essencial', title: 'Tokens e janela de contexto', short: 'Tokens',
  resumo: `A unidade de custo, de limite e de memória de um LLM.`,
  porque: `Preço, latência e o quanto de informação cabe numa requisição são medidos em tokens. Entender isso é a base para estimar custo e desenhar qualquer funcionalidade com IA.`,
  como: [
    `<b>Tokens</b> são pedaços de texto (partes de palavras, pontuação). Em inglês, um token tem em média uns 4 caracteres; em português costuma render menos, ou seja, o mesmo conteúdo usa mais tokens. Cobra-se separadamente por tokens de <b>entrada</b> e de <b>saída</b> (a saída é mais cara).`,
    `A <b>janela de contexto</b> é o máximo de tokens que o modelo considera de uma vez: instruções, histórico, documentos e a própria resposta. Modelos atuais chegam a centenas de milhares ou milhões de tokens, mas contexto maior custa mais e nem sempre melhora a resposta. O modelo não tem memória entre requisições: a aplicação reenvia o histórico a cada chamada.`,
  ],
  conecta: [['llm-como-funciona', 'O modelo processa e gera tokens.'], ['custo-latencia', 'Tokens definem custo e tempo.'], ['chunking', 'Dividir documentos para caber e ser relevante.'], ['api-llm', 'Cada chamada reenvia o contexto.']],
  front: `Num chat, cada mensagem nova reenvia toda a conversa; conversas longas ficam progressivamente mais caras e lentas, e por isso existem limites e resumos de histórico.`,
  ex: { lang: 'typescript', code: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// contar tokens antes de enviar (não gera resposta nem cobra a geração)
const { input_tokens } = await client.messages.countTokens({
  model: "claude-opus-5-5",
  messages: [{ role: "user", content: documentoDoContrato }],
});
console.log(\`O documento usa \${input_tokens} tokens de entrada\`);` },
  docs: [['Claude Docs · Context windows', 'https://platform.claude.com/docs/en/build-with-claude/context-windows'], ['Claude Docs · Token counting', 'https://platform.claude.com/docs/en/build-with-claude/token-counting'], ['Claude Docs · Pricing', 'https://platform.claude.com/docs/en/about-claude/pricing']],
  perguntas: [`Por que o mesmo texto pode custar mais tokens em português do que em inglês?`, `O que acontece com o custo de um chat à medida que a conversa cresce?`, `Por que um contexto enorme nem sempre melhora a resposta?`] },

{ id: 'parametros-geracao', stage: 'fundamentos', level: 'importante', title: 'Controle da geração: effort, raciocínio e limites', short: 'Parâmetros',
  resumo: `Os botões que controlam quanto o modelo pensa, quanto escreve e como escolhe as palavras.`,
  porque: `Respostas lentas demais, caras demais ou cortadas no meio costumam vir de parâmetros mal escolhidos. Os controles disponíveis também mudam entre gerações de modelos.`,
  como: [
    `<b>max_tokens</b>: limite de tokens da resposta; se for atingido, a resposta é cortada (<code>stop_reason: "max_tokens"</code>). <b>Raciocínio</b> (thinking): modelos recentes pensam antes de responder; o <b>effort</b> (low, medium, high...) controla quanto pensam e, portanto, custo e latência.`,
    `Parâmetros de <b>amostragem</b> como <b>temperature</b> e top_p controlam o grau de aleatoriedade na escolha dos tokens. Em vários modelos recentes (incluindo os Claude atuais) eles foram removidos, e o controle passa a ser feito por effort e pelas instruções. <b>Stop sequences</b> encerram a geração ao encontrar um texto. Confira sempre na documentação do modelo quais parâmetros ele aceita.`,
  ],
  conecta: [['llm-como-funciona', 'Os parâmetros agem sobre a escolha de tokens.'], ['custo-latencia', 'Effort e max_tokens afetam custo e tempo.'], ['escolha-modelo', 'Cada modelo aceita um conjunto de parâmetros.'], ['avaliacao', 'Ajustes precisam ser medidos.']],
  front: `Se a interface mostra respostas cortadas no meio, verifique o <code>stop_reason</code>: provavelmente o <code>max_tokens</code> está baixo demais para o que se pede.`,
  ex: { lang: 'typescript', code: `const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,                  // limite da resposta (cortar no meio é pior que gastar um pouco mais)
  output_config: { effort: "low" },   // tarefa simples: pensar pouco, responder rápido
  messages: [{ role: "user", content: "Classifique o sentimento: 'A entrega atrasou de novo.'" }],
});

if (response.stop_reason === "max_tokens") {
  console.warn("Resposta cortada: aumente max_tokens ou peça algo mais curto");
}` },
  docs: [['Claude Docs · Effort', 'https://platform.claude.com/docs/en/build-with-claude/effort'], ['Claude Docs · Adaptive thinking', 'https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking'], ['Claude Docs · Escolher modelo, custo e inteligência', 'https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence']],
  perguntas: [`Que tarefa do seu produto precisaria de pouco raciocínio e qual precisaria de muito?`, `O que significa stop_reason "max_tokens"?`, `Por que não copiar parâmetros de um tutorial antigo sem conferir a documentação do modelo?`] },

{ id: 'escolha-modelo', stage: 'fundamentos', level: 'importante', title: 'Escolher o modelo', short: 'Escolha de modelo',
  resumo: `Capacidade, custo, latência, contexto e onde o modelo pode rodar.`,
  porque: `O mesmo recurso pode custar cem vezes mais com o modelo errado, ou falhar com um modelo fraco demais. A escolha também envolve privacidade, regiões e contratos.`,
  como: [
    `Provedores oferecem <b>famílias</b> em tamanhos diferentes: modelos maiores são mais capazes, mais lentos e mais caros; menores são rápidos e baratos para tarefas simples (classificar, extrair, resumir). Comparar exige olhar <b>preço por milhão de tokens</b> de entrada e saída, latência, janela de contexto e recursos (imagens, ferramentas, saída estruturada).`,
    `Critérios além da qualidade: onde os dados são processados e retidos, disponibilidade nas nuvens que a empresa já usa, limites de uso (rate limits) e modelos <b>abertos</b> (pesos disponíveis) quando é preciso rodar internamente. A melhor forma de escolher é testar com casos reais da sua aplicação, não com rankings genéricos.`,
  ],
  conecta: [['custo-latencia', 'Custo depende do modelo e do volume.'], ['avaliacao', 'Escolha baseada em testes próprios.'], ['parametros-geracao', 'Cada modelo aceita controles diferentes.'], ['etica-privacidade', 'Onde os dados são processados importa.']],
  front: `Funcionalidades de interface como autocomplete e sugestões curtas pedem modelos rápidos; análises longas podem usar modelos maiores e mostrar progresso enquanto processam.`,
  ex: { lang: 'texto', code: `Exemplo: família Claude (consulte preços atuais na documentação)
Modelo              Uso típico                                   Custo relativo
claude-haiku-5-5    classificar, extrair, tarefas em volume      $
claude-sonnet-5-5   uso geral, código, agentes do dia a dia      $$
claude-opus-5-5     raciocínio complexo, agentes longos          $$$

Regra prática: comece pelo modelo capaz, meça a qualidade com casos reais
e só então teste um menor (ou menos effort) para ver se a qualidade se mantém.` },
  docs: [['Claude Docs · Models overview', 'https://platform.claude.com/docs/en/about-claude/models/overview'], ['Claude Docs · Pricing', 'https://platform.claude.com/docs/en/about-claude/pricing'], ['Artificial Analysis · Comparativos de modelos', 'https://artificialanalysis.ai/']],
  perguntas: [`Qual tarefa de IA do seu produto poderia usar um modelo menor?`, `Que critérios além da qualidade pesam na escolha na sua empresa?`, `Por que rankings genéricos não substituem testes com seus casos?`] },

{ id: 'limitacoes', stage: 'fundamentos', level: 'essencial', title: 'Alucinações e limitações', short: 'Limitações',
  resumo: `Por que modelos erram com confiança e como projetar sistemas que convivem com isso.`,
  porque: `Uma funcionalidade de IA que trata a resposta do modelo como verdade absoluta vai falhar em produção. Saber onde os modelos erram define onde colocar verificação, fontes e revisão humana.`,
  como: [
    `<b>Alucinação</b> é uma resposta plausível e errada: o modelo gera o texto mais provável, não o mais verdadeiro. É mais comum em fatos específicos, números, citações, informações posteriores à data de corte e assuntos de nicho. Outras limitações: cálculo exato, contagem de caracteres, informações de tempo real e sensibilidade a como a pergunta é feita.`,
    `Mitigações: fornecer as fontes no contexto (RAG) e pedir citações, deixar o modelo dizer "não sei", usar <b>ferramentas</b> para cálculos e dados atuais, validar saídas com código, medir com avaliações e manter <b>revisão humana</b> onde o erro é caro. Mostre ao usuário de onde veio a informação.`,
  ],
  conecta: [['rag', 'Dar fontes reduz alucinações.'], ['tool-use', 'Ferramentas para cálculos e dados atuais.'], ['avaliacao', 'Medir a taxa de erro.'], ['ux-ia', 'Comunicar incerteza na interface.']],
  front: `Interfaces que mostram as fontes de cada resposta, permitem conferir e editar e deixam claro que o conteúdo foi gerado por IA reduzem o dano de uma alucinação.`,
  ex: { lang: 'texto', code: `Prompt frágil:
  "Qual o prazo de devolução da loja?"
  → o modelo pode inventar "30 dias" com toda a confiança

Prompt robusto:
  "Responda usando apenas a política abaixo. Se a resposta não estiver nela,
   diga que não encontrou e sugira falar com o atendimento. Cite o trecho usado.
   <politica>...texto real da política de devolução...</politica>"` },
  docs: [['Claude Docs · Prompt engineering', 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview'], ['Claude Docs · Citations', 'https://platform.claude.com/docs/en/build-with-claude/citations'], ['OWASP · Top 10 for LLM Applications', 'https://genai.owasp.org/llm-top-10/']],
  perguntas: [`Que funcionalidade do seu produto seria perigosa se o modelo alucinasse?`, `Por que modelos erram com tanta confiança?`, `Como a interface pode ajudar o usuário a perceber um erro do modelo?`] },
]
