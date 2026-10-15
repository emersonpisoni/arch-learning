import type { Topic } from '../../../types'

export const modelos: Topic[] = [
{ id: 'treinamento-modelos', stage: 'modelos', level: 'importante', title: 'Como modelos são treinados', short: 'Treinamento',
  resumo: `Pré-treinamento, ajuste supervisionado e aprendizado por reforço, em linguagem de engenheiro.`,
  porque: `Saber de onde vêm as capacidades e os comportamentos do modelo explica limitações (data de corte, vieses), por que modelos novos se comportam diferente dos antigos e o que dá ou não para mudar com fine-tuning.`,
  como: [
    `<b>Pré-treinamento</b>: o modelo aprende a prever o próximo token em trilhões de tokens de texto e código, usando enormes clusters de GPUs ou TPUs por semanas. Daí vêm o conhecimento geral e as habilidades linguísticas. <b>Ajuste supervisionado</b> (SFT): exemplos de conversas e tarefas bem resolvidas ensinam o formato de assistente.`,
    `<b>Aprendizado por reforço</b>: com feedback humano (RLHF), com feedback de IA guiada por princípios (como a abordagem "constitucional") e, cada vez mais, com <b>recompensas verificáveis</b> (o código passou nos testes? a resposta matemática está correta?), que desenvolvem raciocínio e uso de ferramentas. As escolhas de treinamento explicam a "personalidade" e os pontos fortes de cada modelo.`,
  ],
  conecta: [['llm-como-funciona', 'O mecanismo que o treinamento ajusta.'], ['raciocinio', 'Reforço com recompensas verificáveis desenvolve raciocínio.'], ['fine-tuning', 'Continuar o treinamento com dados próprios.'], ['alinhamento', 'O treinamento molda valores e comportamentos.']],
  front: `Um modelo novo pode seguir instruções de forma mais literal que o anterior; é por isso que prompts precisam ser reavaliados a cada troca de modelo.`,
  ex: { lang: 'texto', code: `Pipeline de treinamento (simplificado)
dados brutos (web, livros, código) ──filtragem e deduplicação──> trilhões de tokens
        │
        ▼
pré-treinamento: prever o próximo token        → modelo base (completa texto)
        │
        ▼
ajuste supervisionado (SFT): exemplos de diálogos → segue instruções
        │
        ▼
reforço: preferências humanas, princípios, recompensas verificáveis
        │                                          → assistente útil, raciocina, usa ferramentas
        ▼
avaliações de capacidade e de segurança → lançamento` },
  docs: [['Hugging Face · LLM course', 'https://huggingface.co/learn/llm-course'], ['Anthropic · Constitutional AI', 'https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback'], ['Andrej Karpathy · Deep Dive into LLMs (vídeo)', 'https://www.youtube.com/watch?v=7xTGNNLPyMI']],
  perguntas: [`O que um modelo base (só pré-treinado) faria diferente de um assistente?`, `Por que recompensas verificáveis são úteis para treinar raciocínio?`, `Por que trocar de modelo exige reavaliar os prompts?`] },

{ id: 'raciocinio', stage: 'modelos', level: 'importante', title: 'Modelos de raciocínio e test-time compute', short: 'Raciocínio',
  resumo: `Gastar mais computação na hora de responder para resolver problemas mais difíceis.`,
  porque: `Modelos que "pensam antes de responder" mudaram o que é possível em código, matemática e agentes. Também mudaram o custo e a latência, e a forma de controlar ambos.`,
  como: [
    `Em vez de responder direto, o modelo gera uma cadeia de <b>raciocínio</b> (tokens de pensamento) explorando o problema, verificando e corrigindo antes da resposta final. Quanto mais pensa (mais <b>test-time compute</b>), melhor tende a ser em tarefas difíceis, até certo ponto. Os provedores oferecem controles como <b>effort</b> ou orçamento de raciocínio, e o pensamento pode ser intercalado com chamadas de ferramenta.`,
    `Implicações práticas: tarefas simples não precisam de muito raciocínio (custo e latência desnecessários); prompts muito prescritivos ("pense passo a passo assim...") podem atrapalhar modelos que já raciocinam; e o raciocínio exibido costuma ser um resumo, não necessariamente o processo literal. Meça qualidade e custo em diferentes níveis de effort para cada tipo de tarefa.`,
  ],
  conecta: [['parametros-geracao', 'Effort controla quanto o modelo pensa.'], ['treinamento-modelos', 'Raciocínio é desenvolvido por reforço.'], ['custo-latencia', 'Pensar mais custa mais tokens.'], ['avaliacao', 'Medir qualidade por nível de effort.']],
  front: `Com raciocínio longo, a interface precisa comunicar "pensando..." de forma útil, mostrando progresso (resumos do raciocínio ou etapas) para que a espera não pareça travamento.`,
  ex: { lang: 'typescript', code: `// mesmo problema, dois níveis de esforço: meça qual vale a pena
for (const effort of ["low", "high"] as const) {
  const r = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    thinking: { type: "adaptive", display: "summarized" },  // mostra um resumo do raciocínio
    output_config: { effort },
    messages: [{ role: "user", content: problemaDeAgendamento }],
  });
  console.log(effort, r.usage.output_tokens, avaliar(r));
}` },
  docs: [['Claude Docs · Adaptive thinking', 'https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking'], ['Claude Docs · Effort', 'https://platform.claude.com/docs/en/build-with-claude/effort'], ['OpenAI · Learning to reason with LLMs', 'https://openai.com/index/learning-to-reason-with-llms/']],
  perguntas: [`Que tarefa do seu produto se beneficiaria de mais raciocínio, e qual não?`, `Por que prompts muito prescritivos podem atrapalhar modelos de raciocínio?`, `Como comunicar na interface que o modelo está pensando?`] },

{ id: 'fine-tuning', stage: 'modelos', level: 'aprofundar', title: 'Fine-tuning e quando não fazer', short: 'Fine-tuning',
  resumo: `Ajustar um modelo com seus dados, e por que prompts e RAG costumam resolver antes.`,
  porque: `"Vamos treinar um modelo com os dados da empresa" é uma ideia frequente e quase sempre a solução errada para o problema real. Saber o que o fine-tuning faz bem evita meses de trabalho desnecessário.`,
  como: [
    `Fine-tuning continua o treinamento com exemplos seus. É bom para <b>formato e estilo</b> consistentes, tarefas estreitas em volume alto (onde um modelo menor ajustado substitui um maior) e comportamento difícil de descrever em instruções. Técnicas eficientes como <b>LoRA</b> ajustam poucos parâmetros. Também existe a <b>destilação</b>: treinar um modelo pequeno com saídas de um grande.`,
    `É ruim para <b>adicionar conhecimento</b> que muda (use RAG), exige um bom conjunto de exemplos e avaliação, precisa ser refeito quando o modelo base evolui e cria um artefato a manter. Ordem recomendada: prompt bem feito → exemplos no prompt → RAG → ferramentas → só então fine-tuning, com eval mostrando ganho.`,
  ],
  conecta: [['treinamento-modelos', 'Continuação do treinamento.'], ['rag', 'A alternativa certa para conhecimento.'], ['avaliacao', 'Só vale com ganho medido.'], ['modelos-abertos', 'Modelos abertos são os mais ajustados.']],
  front: `Se o objetivo é "o assistente conhecer nossa documentação", a resposta é RAG, não fine-tuning: a documentação muda toda semana.`,
  ex: { lang: 'texto', code: `Problema                                         Solução mais provável
───────────────────────────────────────────────  ──────────────────────────
responder sobre políticas internas que mudam     RAG
seguir um formato de saída rígido                saída estruturada
consultar dados atuais (pedidos, estoque)        ferramentas
classificar 10 milhões de tickets por dia barato fine-tuning (ou destilação) de um modelo pequeno
tom de voz muito específico da marca             exemplos no prompt → fine-tuning se não bastar` },
  docs: [['Hugging Face · PEFT e LoRA', 'https://huggingface.co/docs/peft/index'], ['OpenAI · Fine-tuning guide', 'https://platform.openai.com/docs/guides/fine-tuning'], ['Anyscale · Fine-tuning vs RAG', 'https://www.anyscale.com/blog/fine-tuning-is-for-form-not-facts']],
  perguntas: [`Que problema na sua empresa alguém quis resolver com fine-tuning e poderia ser RAG?`, `Por que fine-tuning é ruim para conhecimento que muda?`, `O que é destilação de modelos?`] },

{ id: 'modelos-abertos', stage: 'modelos', level: 'aprofundar', title: 'Modelos abertos e inferência local', short: 'Modelos abertos',
  resumo: `Rodar modelos na sua máquina ou na sua infraestrutura: quantização, servidores de inferência e trade-offs.`,
  porque: `Exigências de privacidade, custo em escala, uso offline e controle total levam empresas a rodar modelos próprios. Também é uma ótima forma de entender como inferência funciona na prática.`,
  como: [
    `Modelos de <b>pesos abertos</b> (Llama, Qwen, Mistral, Gemma, DeepSeek e outros) podem ser baixados e executados. <b>Quantização</b> reduz a precisão dos pesos (de 16 bits para 8 ou 4) para caber em menos memória, com alguma perda de qualidade. Ferramentas: <b>Ollama</b> e LM Studio para uso local; <b>vLLM</b>, TGI e SGLang para servir com alta vazão (batching contínuo, cache de KV).`,
    `Trade-offs: você assume a operação (GPUs caras, escala, atualizações, segurança), os melhores modelos abertos costumam ficar atrás dos fechados mais capazes, e licenças variam (algumas restringem uso comercial). Faz sentido para dados que não podem sair, volume alto de tarefas simples ou uso offline e embarcado.`,
  ],
  conecta: [['escolha-modelo', 'Mais uma opção na escolha.'], ['fine-tuning', 'Modelos abertos são os mais ajustados.'], ['etica-privacidade', 'Dados que não podem sair da empresa.'], ['devops/capacidade', 'Servir modelos exige planejamento de GPU.']],
  front: `Modelos pequenos já rodam no navegador (WebGPU, Transformers.js) para tarefas como classificar texto ou gerar embeddings sem enviar dados ao servidor.`,
  ex: { lang: 'bash', code: `# rodar um modelo aberto localmente com Ollama
ollama pull qwen3:8b
ollama run qwen3:8b "Resuma em uma frase: ..."

# API compatível, para chamar da sua aplicação
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:8b",
  "messages": [{ "role": "user", "content": "Classifique: a entrega atrasou" }]
}'` },
  docs: [['Ollama', 'https://ollama.com/'], ['vLLM · Documentação', 'https://docs.vllm.ai/'], ['Hugging Face · Quantization', 'https://huggingface.co/docs/transformers/quantization/overview']],
  perguntas: [`Que caso de uso na sua empresa exigiria um modelo rodando internamente?`, `O que a quantização troca por menos memória?`, `Que custos operacionais um modelo próprio traz?`] },

{ id: 'avaliacao-agentes', stage: 'modelos', level: 'importante', title: 'Avaliar agentes e ler benchmarks', short: 'Avaliar agentes',
  resumo: `Medir sistemas que tomam muitas decisões, e entender o que os rankings públicos dizem.`,
  porque: `Avaliar um agente é mais difícil que avaliar uma resposta: o caminho varia, há efeitos colaterais e o sucesso pode ser parcial. E rankings públicos raramente refletem o seu caso de uso.`,
  como: [
    `Avalie o <b>resultado final</b> num ambiente controlado (o teste passou? o estado do banco ficou correto?) e também a <b>trajetória</b> (passos desnecessários, ferramentas erradas, ações perigosas tentadas). Rode cada caso várias vezes, porque agentes variam entre execuções, e acompanhe custo, tempo e número de passos.`,
    `<b>Benchmarks</b> públicos (SWE-bench para código, Terminal-Bench, OSWorld para uso de computador, tau-bench para atendimento com ferramentas) medem capacidades gerais em tarefas específicas. São úteis para comparar tendências, mas podem estar contaminados nos dados de treino e dizem pouco sobre o seu produto. O que decide é o seu próprio conjunto de casos.`,
  ],
  conecta: [['avaliacao', 'Os fundamentos de evals.'], ['agentes', 'O que está sendo avaliado.'], ['agentes-longos', 'Verificação objetiva do resultado.'], ['observabilidade-llm', 'Traces mostram a trajetória.']],
  front: `Para um agente que mexe em interfaces, testes end-to-end (Playwright) são uma forma natural de verificar o resultado final de forma objetiva.`,
  ex: { lang: 'texto', code: `Eval de um agente de atendimento (por caso, 5 execuções)
caso                           sucesso  passos médios  custo médio  ações proibidas
reembolso dentro da política   5/5      4.2            $0.03        0
reembolso fora do prazo        3/5      6.8            $0.05        0   ← reembolsou 2x indevidamente? não: pediu aprovação
troca de endereço após envio   4/5      5.0            $0.04        1   ← tentou editar pedido já enviado
pergunta fora do escopo        5/5      1.0            $0.01        0` },
  docs: [['Anthropic · Demystifying evals for AI agents', 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents'], ['SWE-bench', 'https://www.swebench.com/'], ['tau-bench', 'https://github.com/sierra-research/tau-bench']],
  perguntas: [`Como você saberia que um agente do seu produto ficou melhor depois de uma mudança?`, `Por que rodar o mesmo caso várias vezes?`, `O que um benchmark público não diz sobre o seu caso?`] },

{ id: 'llmops', stage: 'modelos', level: 'importante', title: 'LLMOps: operar IA em produção', short: 'LLMOps',
  resumo: `Versionar prompts, rotear entre modelos, lidar com falhas do provedor e limites de uso.`,
  porque: `Funcionalidades de IA dependem de serviços externos com limites, falhas, mudanças de versão e preços que variam. Operar isso com segurança é parecido com operar qualquer dependência crítica, com algumas particularidades.`,
  como: [
    `<b>Prompts versionados</b> e implantados como configuração, com eval antes de promover. <b>Gateways de LLM</b> (LiteLLM, Portkey, gateways de nuvem) centralizam chaves, roteamento entre modelos, <b>fallbacks</b> para outro modelo ou provedor, cache, limites por time e registro de custo. <b>Limites de uso</b> (tokens e requisições por minuto) exigem filas, retries com backoff e prioridades.`,
    `Também: <b>migração de modelos</b> com eval comparativo (modelos são descontinuados), tratamento de <b>recusas</b> e respostas cortadas, monitoramento de qualidade em produção, testes A/B de prompts e um plano para quando o provedor fica fora do ar (degradar a funcionalidade com elegância).`,
  ],
  conecta: [['observabilidade-llm', 'Medir custo, latência e qualidade.'], ['avaliacao', 'Eval antes de promover mudanças.'], ['backend/rate-limit', 'Limites de uso do provedor.'], ['arquitetura/resiliencia', 'Fallback e degradação graciosa.'], ['devops/estrategias-deploy', 'Canary também vale para prompts.']],
  front: `Se o provedor de IA cair, a interface deve continuar funcionando: esconder ou desabilitar a funcionalidade com uma mensagem clara, em vez de quebrar a página.`,
  ex: { lang: 'yaml', code: `# configuração de um gateway de LLM (exemplo genérico)
rotas:
  suporte-resposta:
    prompt: suporte-v14            # versionado; v15 em canary para 10%
    modelo: claude-opus-5-5
    fallbacks: [claude-sonnet-5-5] # em caso de erro, sobrecarga ou recusa
    cache_semantico: true
    limite_tokens_minuto: 400000
  classificar-ticket:
    modelo: claude-haiku-5-5       # tarefa simples e em volume
    batch: true                    # pode esperar: metade do preço` },
  docs: [['LiteLLM', 'https://docs.litellm.ai/docs/'], ['Claude Docs · Rate limits', 'https://platform.claude.com/docs/en/api/rate-limits'], ['Claude Docs · Migration guide', 'https://platform.claude.com/docs/en/about-claude/models/migration-guide']],
  perguntas: [`O que acontece com a sua funcionalidade de IA se o provedor ficar fora do ar?`, `Como você promoveria uma nova versão de prompt com segurança?`, `Para que serve um gateway de LLM numa empresa com vários times?`] },

{ id: 'alinhamento', stage: 'modelos', level: 'aprofundar', title: 'Alinhamento, segurança de modelos e interpretabilidade', short: 'Alinhamento',
  resumo: `Como se tenta garantir que modelos cada vez mais capazes façam o que se pretende.`,
  porque: `À medida que modelos ganham autonomia, as perguntas sobre comportamento confiável deixam de ser teóricas. Entender a área ajuda a interpretar recusas, políticas de uso e as decisões de provedores sobre o que os modelos podem fazer.`,
  como: [
    `<b>Alinhamento</b> é fazer o modelo seguir as intenções e valores pretendidos, mesmo em situações não previstas no treinamento. Técnicas incluem RLHF, treinamento com princípios explícitos, avaliações de comportamento (red teaming, testes de perigos específicos) e <b>classificadores</b> de segurança que bloqueiam pedidos perigosos (o que explica algumas recusas).`,
    `<b>Interpretabilidade</b> tenta entender o que acontece dentro do modelo, identificando representações internas (features) e circuitos. Políticas de escalonamento de segurança ligam o nível de capacidade de um modelo às proteções exigidas antes do lançamento. Para quem constrói produtos: tratar recusas como um estado normal da aplicação e usar os mecanismos oferecidos (como fallbacks) em vez de tentar contorná-las.`,
  ],
  conecta: [['treinamento-modelos', 'O treinamento molda o comportamento.'], ['guardrails', 'Segurança da aplicação complementa a do modelo.'], ['etica-privacidade', 'Uso responsável no produto.'], ['llmops', 'Recusas e fallbacks em produção.']],
  front: `Recusas devem ter um estado próprio na interface ("não posso ajudar com isso; tente reformular ou fale com o suporte"), e não aparecer como erro genérico.`,
  ex: { lang: 'typescript', code: `// tratar recusa como um estado esperado da aplicação
const response = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 16000, messages });

if (response.stop_reason === "refusal") {
  // stop_details traz uma categoria e uma explicação, quando disponíveis
  return { estado: "recusado", motivo: response.stop_details?.category ?? null };
}
if (response.stop_reason === "max_tokens") {
  return { estado: "incompleto" };
}
return { estado: "ok", conteudo: response.content };` },
  docs: [['Anthropic · Responsible Scaling Policy', 'https://www.anthropic.com/responsible-scaling-policy'], ['Anthropic · Interpretability research', 'https://www.anthropic.com/research#interpretability'], ['AI Safety Fundamentals', 'https://aisafetyfundamentals.com/']],
  perguntas: [`Como a sua aplicação trata uma recusa do modelo hoje?`, `O que a interpretabilidade tenta descobrir?`, `Por que classificadores de segurança às vezes recusam pedidos legítimos?`] },
]
