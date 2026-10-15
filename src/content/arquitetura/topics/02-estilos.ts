import type { Topic } from '../../../types'

export const estilos: Topic[] = [
{ id: 'monolito-modular', stage: 'estilos', level: 'essencial', title: 'Monolito modular', short: 'Monolito modular',
  resumo: `Um único deploy, dividido por dentro em módulos com fronteiras rígidas.`,
  porque: `É o ponto de partida recomendado para a maioria dos sistemas: mantém a simplicidade do monolito e evita a "bola de lama". Muitas empresas que voltaram de microsserviços pararam aqui.`,
  como: [
    `Cada <b>módulo</b> corresponde a um pedaço do negócio (pedidos, pagamentos, catálogo) e expõe uma <b>API pública</b> interna; o resto é privado. Módulos não leem as tabelas uns dos outros, e as regras de dependência são verificadas por ferramentas (ArchUnit, dependency-cruiser, Nx, Spring Modulith).`,
    `A comunicação pode ser por chamadas diretas à API do módulo ou por eventos internos. Como as fronteiras já existem, extrair um módulo para serviço, se um dia for preciso, vira uma mudança localizada.`,
  ],
  conecta: [['backend/microsservicos', 'A alternativa distribuída.'], ['acoplamento-coesao', 'Módulos coesos e pouco acoplados.'], ['backend/ddd', 'Bounded contexts definem os módulos.'], ['strangler', 'Extrair módulos aos poucos.']],
  front: `Um monorepo de front com pacotes bem separados e regras de import (ex.: um módulo não importa arquivos internos de outro) aplica a mesma ideia.`,
  ex: { lang: 'texto', code: `src/
  pedidos/
    api.ts          ← única porta de entrada do módulo
    internal/       ← ninguém de fora importa daqui
  pagamentos/
    api.ts
    internal/
  catalogo/
    api.ts
    internal/

regra (dependency-cruiser):
  "pedidos/internal" não pode ser importado de fora de "pedidos/"
  cada módulo acessa apenas as próprias tabelas` },
  docs: [['Martin Fowler · Monolith First', 'https://martinfowler.com/bliki/MonolithFirst.html'], ['Spring Modulith', 'https://docs.spring.io/spring-modulith/reference/'], ['Shopify Engineering · Deconstructing the Monolith', 'https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity']],
  perguntas: [`O que diferencia um monolito modular de uma "bola de lama"?`, `Como impedir que um módulo leia as tabelas de outro?`, `Quando valeria a pena extrair um módulo para um serviço?`] },

{ id: 'serverless-arch', stage: 'estilos', level: 'importante', title: 'Arquitetura serverless', short: 'Serverless',
  resumo: `Sistemas inteiros feitos de funções, filas e serviços gerenciados que reagem a eventos.`,
  porque: `Serverless muda o foco de "gerenciar servidores" para "ligar serviços", e reduz muito o custo de sistemas com tráfego irregular. Também traz desafios de debug, limites e dependência do fornecedor.`,
  como: [
    `O sistema é montado com <b>funções</b> (Lambda), <b>gateways de API</b>, <b>filas e tópicos</b> (SQS, SNS, EventBridge), <b>workflows</b> (Step Functions) e <b>bancos gerenciados</b> (DynamoDB). Cada peça escala sozinha e cobra pelo uso.`,
    `Desafios: cold start, limites de tempo e de concorrência, observabilidade distribuída, testes locais e <b>vendor lock-in</b>. Funciona melhor para cargas orientadas a eventos e tráfego variável; cargas constantes e altas podem sair mais caras que containers.`,
  ],
  conecta: [['devops/serverless', 'O funcionamento das funções em si.'], ['backend/eventos', 'Serverless é naturalmente orientado a eventos.'], ['devops/finops', 'O modelo de custo é por uso.'], ['trade-offs', 'Menos operação em troca de dependência do provedor.']],
  front: `Um front estático na CDN com funções para as poucas rotas de API é uma arquitetura serverless completa, e muito comum em projetos novos.`,
  ex: { lang: 'texto', code: `Upload de foto, 100% serverless

[Navegador] ──PUT (URL pré-assinada)──> [Bucket]
                                            │ evento "objeto criado"
                                            ▼
                                     [Função: miniatura] ──> [Bucket miniaturas]
                                            │
                                            ▼
                                     [Fila] ──> [Função: atualizar banco] ──> [DynamoDB]` },
  docs: [['AWS · Serverless Land', 'https://serverlessland.com/'], ['AWS Well-Architected · Serverless Lens', 'https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html'], ['Martin Fowler · Serverless Architectures', 'https://martinfowler.com/articles/serverless.html']],
  perguntas: [`Que parte do seu sistema poderia ser serverless sem perder nada?`, `Como depurar um fluxo que passa por cinco funções e duas filas?`, `O que é vendor lock-in e quanto ele preocupa no seu contexto?`] },

{ id: 'cqrs', stage: 'estilos', level: 'importante', title: 'CQRS', short: 'CQRS',
  resumo: `Separar o modelo que escreve do modelo que lê.`,
  porque: `Telas pedem dados agregados e desnormalizados; regras de negócio pedem um modelo consistente e normalizado. Tentar atender os dois com o mesmo modelo gera queries complexas e lentas.`,
  como: [
    `<b>Command</b> altera estado (criar pedido) e passa pelas regras de negócio. <b>Query</b> só lê, a partir de um <b>modelo de leitura</b> otimizado para a tela, que pode ser uma view materializada, uma tabela desnormalizada ou outro banco (Elasticsearch, Redis).`,
    `O modelo de leitura é atualizado a partir das escritas, muitas vezes por eventos, o que traz <b>consistência eventual</b>. Use em partes do sistema com leitura muito diferente da escrita; aplicado em tudo, só adiciona complexidade.`,
  ],
  conecta: [['event-sourcing', 'Combinação comum: eventos alimentam os modelos de leitura.'], ['backend/eventos', 'Eventos sincronizam escrita e leitura.'], ['backend/cap', 'O modelo de leitura é eventualmente consistente.'], ['dados/elasticsearch', 'Um modelo de leitura otimizado para busca.']],
  front: `Um endpoint "pronto para a tela" que devolve o dashboard já agregado é um modelo de leitura. Por isso a lista pode demorar alguns segundos para refletir uma alteração.`,
  ex: { lang: 'texto', code: `            Command: PagarPedido
[Front] ───────────────────────> [Modelo de escrita] ──> [Postgres normalizado]
                                         │ evento PedidoPago
                                         ▼
                                 [Projeção] ──> [tabela painel_vendas (desnormalizada)]
[Front] <───── Query: PainelVendas ─────────────────────┘` },
  docs: [['Martin Fowler · CQRS', 'https://martinfowler.com/bliki/CQRS.html'], ['Microsoft · Padrão CQRS', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs'], ['microservices.io · CQRS', 'https://microservices.io/patterns/data/cqrs.html']],
  perguntas: [`Que tela do seu produto teria um modelo de leitura próprio?`, `Que efeito a consistência eventual tem na experiência do usuário?`, `Por que não aplicar CQRS no sistema inteiro?`] },

{ id: 'event-sourcing', stage: 'estilos', level: 'aprofundar', title: 'Event sourcing', short: 'Event sourcing',
  resumo: `Guardar a sequência de eventos em vez do estado atual.`,
  porque: `Para domínios em que o histórico importa (financeiro, contábil, logística), saber exatamente como se chegou a um estado é um requisito. Event sourcing dá esse histórico por construção, com custos importantes.`,
  como: [
    `Em vez de <code>UPDATE contas SET saldo = 50</code>, grava-se <code>Depositado(100)</code> e <code>Sacado(50)</code> num <b>event store</b> que só aceita inclusões. O estado atual é obtido <b>reproduzindo</b> os eventos; <b>snapshots</b> evitam reprocessar tudo a cada leitura.`,
    `Ganhos: auditoria completa, reconstruir modelos de leitura novos a partir do histórico e "viajar no tempo". Custos: eventos são um contrato permanente (mudar o formato exige versionamento), consultas dependem de projeções e a curva de aprendizado é alta.`,
  ],
  conecta: [['cqrs', 'Projeções de eventos viram modelos de leitura.'], ['backend/eventos', 'Eventos como fonte da verdade.'], ['backend/ddd', 'Domain events são a matéria-prima.'], ['dados/soft-delete-auditoria', 'Alternativa mais simples para auditoria.']],
  front: `O Redux tem a mesma ideia: o estado é o resultado de aplicar uma sequência de ações a um reducer, e o time-travel debugging reproduz essas ações.`,
  ex: { lang: 'typescript', code: `type Evento =
  | { tipo: "ContaAberta"; titular: string }
  | { tipo: "Depositado"; valor: number }
  | { tipo: "Sacado"; valor: number };

// o estado é derivado dos eventos, como um reducer
const saldo = (eventos: Evento[]) =>
  eventos.reduce((s, e) =>
    e.tipo === "Depositado" ? s + e.valor :
    e.tipo === "Sacado" ? s - e.valor : s, 0);` },
  docs: [['Martin Fowler · Event Sourcing', 'https://martinfowler.com/eaaDev/EventSourcing.html'], ['Microsoft · Padrão Event Sourcing', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing'], ['EventStoreDB · Event sourcing explicado', 'https://www.eventstore.com/event-sourcing']],
  perguntas: [`Que domínio da sua empresa se beneficiaria de histórico completo?`, `Como mudar o formato de um evento que já está gravado?`, `Qual a semelhança entre event sourcing e o Redux?`] },

{ id: 'strangler', stage: 'estilos', level: 'importante', title: 'Migração com Strangler Fig', short: 'Strangler',
  resumo: `Substituir um sistema legado aos poucos, rota por rota, sem reescrita do zero.`,
  porque: `Reescritas completas ("big bang") costumam atrasar anos e falhar. Quase todo time vai participar de alguma migração de legado, incluindo migrações de front (de AngularJS para React, por exemplo).`,
  como: [
    `Coloca-se uma <b>fachada</b> (proxy, gateway ou o próprio roteador do front) na frente do sistema antigo. Cada funcionalidade nova ou migrada passa a ser atendida pelo sistema novo, e a fachada roteia o resto para o legado. Com o tempo, o legado "estrangulado" é desligado.`,
    `Técnicas de apoio: <b>anti-corruption layer</b> (traduz o modelo do legado para o novo), sincronização de dados durante a transição, feature flags para alternar e comparação de resultados entre o antigo e o novo antes de virar a chave.`,
  ],
  conecta: [['monolito-modular', 'Extrair módulos aos poucos.'], ['backend/gateway', 'O gateway serve de fachada de roteamento.'], ['evolucao-apis', 'Manter contratos durante a migração.'], ['frontend/microfrontends', 'Migrar o front tela por tela.']],
  front: `Migrar um front legado por rotas (as novas telas em React, as antigas no sistema velho, sob o mesmo domínio) é um Strangler Fig clássico.`,
  ex: { lang: 'nginx', code: `# a fachada decide quem atende cada rota
location /checkout/ { proxy_pass http://novo-checkout; }   # já migrado
location /api/pedidos { proxy_pass http://api-nova; }      # já migrado
location / { proxy_pass http://legado; }                    # todo o resto` },
  docs: [['Martin Fowler · Strangler Fig Application', 'https://martinfowler.com/bliki/StranglerFigApplication.html'], ['Microsoft · Padrão Strangler Fig', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig'], ['Microsoft · Anti-corruption layer', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer']],
  perguntas: [`Por que reescritas completas costumam falhar?`, `Qual seria a primeira rota a migrar num sistema legado que você conhece?`, `Para que serve uma anti-corruption layer?`] },
]
