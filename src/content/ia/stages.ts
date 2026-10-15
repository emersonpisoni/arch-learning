import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'fundamentos', title: 'Como LLMs funcionam', desc: 'O suficiente da teoria para tomar boas decisões de engenharia.',
    pratica: 'Conte os tokens de um texto em português e do mesmo texto em inglês com a API de contagem de tokens, e compare custo e espaço de contexto de cada um.' },
  { id: 'integracao', title: 'Integrar um LLM na aplicação', desc: 'Chamar a API, escrever prompts, obter saídas estruturadas e mostrar respostas em tempo real.',
    pratica: 'Construa uma rota de API que recebe a descrição de um produto e devolve JSON validado (título, categoria, tags) e uma tela que mostra uma resposta em streaming.' },
  { id: 'rag', title: 'RAG: respostas com os seus dados', desc: 'Dar ao modelo acesso ao conhecimento da empresa sem treinar nada.',
    pratica: 'Indexe a documentação do seu projeto em pedaços, gere embeddings, guarde no pgvector e responda perguntas citando os trechos usados.' },
  { id: 'agentes', title: 'Ferramentas e agentes', desc: 'Deixar o modelo agir: chamar funções, consultar sistemas e executar tarefas em várias etapas.',
    pratica: 'Dê ao modelo duas ferramentas (buscar pedido e calcular frete) e implemente o loop de tool use. Depois exponha as mesmas ferramentas num servidor MCP.' },
  { id: 'qualidade', title: 'Qualidade, custo e segurança', desc: 'Medir se funciona, quanto custa e como não ser enganado.',
    pratica: 'Monte um conjunto de 20 casos de teste para a sua funcionalidade de IA, rode antes e depois de uma mudança de prompt e compare os resultados e o custo.' },
  { id: 'produto', title: 'IA no produto e no dia a dia', desc: 'Desenhar boas experiências com IA e usar assistentes com responsabilidade.',
    pratica: 'Redesenhe uma funcionalidade de IA que você conhece incluindo: estado de geração, possibilidade de editar o resultado, feedback do usuário e o que acontece quando o modelo erra.' },
  { id: 'harness', title: 'Harness e engenharia de agentes', desc: 'O que transforma um modelo num agente confiável: loop, contexto, memória, subagentes, sandbox e permissões.',
    pratica: 'Construa um agente pequeno com o Tool Runner (ou o loop manual) que lê arquivos de um diretório e responde perguntas sobre eles. Acrescente: um arquivo de progresso, uma ferramenta que pede confirmação antes de escrever e um limite de passos.' },
  { id: 'modelos', title: 'Modelos por dentro e operação', desc: 'Treinamento, raciocínio, fine-tuning, modelos abertos, avaliação de agentes e operação em produção.',
    pratica: 'Rode um modelo aberto localmente com Ollama e compare com um modelo de API em 20 casos do seu eval: qualidade, latência e custo estimado.' },
]
