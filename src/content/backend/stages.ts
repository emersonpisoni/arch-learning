import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'fundamentos', title: 'Fundamentos da web', desc: 'O caminho de uma requisição: do nome do site até os bytes chegarem.',
    pratica: 'Use dig, curl -v e a aba Network do DevTools para seguir uma requisição do DNS até a resposta, anotando cada etapa e quanto tempo ela levou.' },
  { id: 'runtime', title: 'Runtime e concorrência', desc: 'Como um servidor atende milhares de tarefas ao mesmo tempo.',
    pratica: 'Crie um endpoint que faz um loop pesado de 3 s e outro instantâneo. Chame os dois juntos e veja o rápido travar. Depois mova o pesado para um worker thread.' },
  { id: 'apis', title: 'APIs e comunicação', desc: 'Os formatos de conversa entre front, back e serviços.',
    pratica: 'Descreva em OpenAPI a API de um mini e-commerce (produtos e pedidos) e gere os tipos TypeScript do cliente a partir do contrato.' },
  { id: 'codigo', title: 'Organização do código', desc: 'Onde cada responsabilidade mora dentro do backend.',
    pratica: 'Implemente o caso de uso "pagar pedido" com controller, service e repository, e teste o service com um repositório falso em memória.' },
  { id: 'dados', title: 'Dados e persistência', desc: 'Guardar, relacionar e buscar dados sem perder nada.',
    pratica: 'Suba um Postgres com Docker, crie as tabelas de clientes, pedidos e itens, insira 100 mil pedidos e compare o EXPLAIN ANALYZE antes e depois de criar um índice.' },
  { id: 'seguranca', title: 'Segurança', desc: 'Quem é o usuário, o que ele pode fazer e como proteger a API.',
    pratica: 'Adicione login com sessão em cookie HttpOnly à sua API. Depois tente ler o pedido de outro usuário trocando o id na URL e corrija a falha.' },
  { id: 'escala', title: 'Performance e escala', desc: 'Aguentar mais usuários sem reescrever o sistema.',
    pratica: 'Coloque três réplicas da API atrás de um Nginx, adicione Redis como cache e meça a diferença com uma ferramenta de carga como k6 ou autocannon.' },
  { id: 'operacao', title: 'Entrega e operação', desc: 'Levar o código até produção e saber o que acontece lá.',
    pratica: 'Crie um pipeline no GitHub Actions que roda os testes com Postgres e publica a imagem Docker. Adicione logs estruturados com request id.' },
  { id: 'distribuidos', title: 'Sistemas distribuídos', desc: 'O que muda quando o sistema vira vários serviços conversando pela rede.',
    pratica: 'Separe as notificações em um serviço que consome o evento PedidoPago de uma fila. Derrube o worker, publique eventos e veja o que acontece quando ele volta.' },
  { id: 'avancado', title: 'Backend avançado', desc: 'Padrões de sistemas que já estão em produção há anos: ciclo de vida, fluxo, integrações, jobs e workflows.',
    pratica: 'Implemente graceful shutdown na sua API e meça com um teste de carga durante um deploy; depois adicione um webhook assinado com verificação de assinatura e idempotência.' },
]
