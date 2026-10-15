import type { Topic } from '../../../types'

export const decisoes: Topic[] = [
{ id: 'c4', stage: 'decisoes', level: 'essencial', title: 'Modelo C4 e diagramas', short: 'C4',
  resumo: `Diagramas de arquitetura em quatro níveis de zoom, cada um para um público.`,
  porque: `Diagramas improvisados misturam níveis ("caixa do sistema" ao lado de "classe Usuário") e confundem mais do que explicam. O C4 dá um vocabulário simples e se tornou um padrão comum em documentação de arquitetura.`,
  como: [
    `Quatro níveis: <b>Contexto</b> (o sistema como uma caixa, com usuários e sistemas externos), <b>Containers</b> (aplicações e armazenamentos que podem ser publicados separadamente: front, API, banco, fila), <b>Componentes</b> (as partes dentro de um container) e <b>Código</b> (raramente necessário).`,
    `Regras que ajudam: todo diagrama tem título e legenda, toda seta diz o que trafega e por qual protocolo, e cada elemento tem nome, tipo e tecnologia. Ferramentas como Structurizr, Mermaid e PlantUML permitem manter diagramas como código, versionados no repositório.`,
  ],
  conecta: [['adr', 'Diagramas mostram o quê; ADRs explicam o porquê.'], ['design-docs', 'Diagramas são parte central de um design doc.'], ['papel-arquitetura', 'Comunicar arquitetura é parte do trabalho.']],
  front: `No nível de containers, o front aparece como uma caixa própria ("SPA em React, servida pela CDN") que fala com a API por HTTPS e JSON. É um bom ponto de partida para desenhar o sistema em que você trabalha.`,
  ex: { lang: 'mermaid', code: `C4Container
title Loja: diagrama de containers
Person(cliente, "Cliente")
System_Boundary(loja, "Loja") {
  Container(spa, "Front", "React, CDN", "Interface de compra")
  Container(api, "API", "Node.js", "Pedidos e pagamentos")
  ContainerDb(db, "Banco", "PostgreSQL", "Pedidos e clientes")
  ContainerQueue(fila, "Fila", "SQS", "Eventos de pedido")
}
System_Ext(gateway, "Gateway de pagamento")
Rel(cliente, spa, "Usa", "HTTPS")
Rel(spa, api, "Chama", "HTTPS/JSON")
Rel(api, db, "Lê e grava", "SQL")
Rel(api, fila, "Publica eventos")
Rel(api, gateway, "Cobra", "HTTPS")` },
  docs: [['c4model.com', 'https://c4model.com/'], ['Mermaid · Diagramas C4', 'https://mermaid.js.org/syntax/c4.html'], ['Structurizr', 'https://docs.structurizr.com/']],
  perguntas: [`Como seria o diagrama de contexto do sistema em que você trabalha?`, `Que informação toda seta de um diagrama deveria ter?`, `Por que manter diagramas como código?`] },

{ id: 'adr', stage: 'decisoes', level: 'essencial', title: 'ADRs: registros de decisão', short: 'ADR',
  resumo: `Um documento curto por decisão importante: contexto, opções, escolha e consequências.`,
  porque: `"Por que usamos isso?" é uma das perguntas mais comuns em times, e a resposta costuma ter saído da empresa junto com quem decidiu. ADRs guardam o porquê, evitam refazer discussões e ajudam quem chega depois.`,
  como: [
    `Um <b>Architecture Decision Record</b> tem título, data, <b>status</b> (proposto, aceito, substituído), <b>contexto</b> (o problema e as restrições), <b>opções consideradas</b>, <b>decisão</b> e <b>consequências</b>, as boas e as ruins. Uma ou duas páginas bastam.`,
    `ADRs ficam no repositório (<code>docs/adr/0007-usar-sqs-para-pedidos.md</code>), são revisados por pull request e <b>não são editados</b> depois de aceitos: quando a decisão muda, um novo ADR substitui o anterior. Assim o histórico de raciocínio se preserva.`,
  ],
  conecta: [['trade-offs', 'O ADR registra o trade-off escolhido.'], ['design-docs', 'Design docs exploram; ADRs registram a decisão final.'], ['c4', 'Diagramas e decisões se complementam.'], ['praticas/documentacao', 'Parte da documentação técnica do time.']],
  front: `Decisões de front também merecem ADR: escolher a biblioteca de estado, adotar SSR ou migrar de framework. Daqui a dois anos, alguém vai perguntar por quê.`,
  ex: { lang: 'markdown', code: `# 0007. Usar SQS para eventos de pedido

Status: aceito · 2026-10-15

## Contexto
O envio de e-mail e a emissão de nota bloqueiam o checkout (p95 de 2,4 s).
O time tem 4 pessoas e nenhuma experiência operando Kafka.

## Opções
1. Processar em background com threads na própria API
2. RabbitMQ autogerenciado
3. Amazon SQS (gerenciado)

## Decisão
Opção 3: SQS com dead-letter queue e consumidores idempotentes.

## Consequências
+ checkout deixa de esperar e-mail e nota
+ nada para operar além da configuração
− dependência da AWS
− sem reprocessamento de histórico (se precisarmos, reavaliar Kafka)` },
  docs: [['adr.github.io', 'https://adr.github.io/'], ['Michael Nygard · Documenting Architecture Decisions', 'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions'], ['AWS · Boas práticas de ADR', 'https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/welcome.html']],
  perguntas: [`Que decisão do seu sistema ninguém sabe mais explicar?`, `Por que um ADR aceito não deve ser editado?`, `Que decisão recente do seu time merecia um ADR?`] },

{ id: 'design-docs', stage: 'decisoes', level: 'importante', title: 'Design docs e RFCs', short: 'Design docs',
  resumo: `Pensar por escrito antes de construir e colher feedback cedo.`,
  porque: `Escrever obriga a clarear o raciocínio e permite que pessoas de outros times (incluindo front, segurança e infra) apontem problemas quando ainda é barato mudar. É assim que muitas empresas tomam decisões técnicas grandes.`,
  como: [
    `Estrutura comum: <b>contexto e problema</b>, <b>objetivos e não objetivos</b> (o que fica de fora é tão importante quanto o que entra), <b>proposta</b> com diagramas, <b>alternativas consideradas</b>, impactos (segurança, custo, migração, observabilidade) e <b>perguntas em aberto</b>.`,
    `O documento circula para comentários por um prazo definido, com revisores dos times afetados. A meta não é perfeição, é alinhamento: um bom design doc encurta a implementação. Para mudanças pequenas, um parágrafo na descrição do PR basta.`,
  ],
  conecta: [['adr', 'A decisão final do design doc vira um ADR.'], ['c4', 'Diagramas dão forma à proposta.'], ['requisitos-nao-funcionais', 'O documento deve deixar os RNFs explícitos.'], ['praticas/comunicacao-tecnica', 'Escrever bem é uma habilidade técnica.']],
  front: `Uma feature que exige mudanças de API, de eventos e de tela é o caso clássico para um design doc. Ter alguém de front na revisão evita contratos ruins para a interface.`,
  ex: { lang: 'markdown', code: `# Design: notificações em tempo real no painel

## Problema
O painel faz polling a cada 10 s: atraso visível e 40% das requisições da API.

## Objetivos
- novos pedidos aparecem em menos de 2 s
- reduzir a carga de polling

## Não objetivos
- notificações push no celular (fica para depois)

## Proposta
SSE a partir de um serviço "notificador" que assina eventos da fila.
[diagrama C4 de containers]

## Alternativas
WebSocket (bidirecional, desnecessário aqui) · manter polling com 30 s

## Perguntas em aberto
- o load balancer atual suporta conexões de longa duração?` },
  docs: [['Industrial Empathy · Design Docs at Google', 'https://www.industrialempathy.com/posts/design-docs-at-google/'], ['Pragmatic Engineer · RFCs e design docs', 'https://blog.pragmaticengineer.com/rfcs-and-design-docs/'], ['Rust RFCs · Um processo aberto de RFC', 'https://github.com/rust-lang/rfcs']],
  perguntas: [`Que projeto recente teria se beneficiado de um design doc?`, `Por que listar os não objetivos?`, `Quem deveria revisar um design doc que muda contratos de API?`] },

{ id: 'fitness-functions', stage: 'decisoes', level: 'aprofundar', title: 'Fitness functions e arquitetura evolutiva', short: 'Fitness functions',
  resumo: `Testes automatizados que verificam se a arquitetura continua respeitando suas regras.`,
  porque: `Diagramas e ADRs descrevem a intenção, mas o código diverge com o tempo. Fitness functions transformam regras de arquitetura em verificações que quebram o build quando são violadas.`,
  como: [
    `Uma <b>fitness function</b> é qualquer verificação objetiva de uma característica desejada: "o módulo pedidos não importa o interno de pagamentos", "o bundle inicial tem menos de 200 KB", "p95 abaixo de 300 ms no teste de carga", "nenhuma dependência com vulnerabilidade crítica".`,
    `Elas rodam no CI (regras de dependência, tamanho de bundle, testes de contrato) ou continuamente em produção (SLOs, alertas). O conceito vem do livro <i>Building Evolutionary Architectures</i>: arquitetura que pode mudar com segurança porque suas propriedades são verificadas o tempo todo.`,
  ],
  conecta: [['monolito-modular', 'Verificar as fronteiras entre módulos.'], ['requisitos-nao-funcionais', 'Cada RNF pode virar uma verificação.'], ['devops/pipelines', 'O CI executa as verificações.'], ['frontend/medicao', 'Orçamentos de performance são fitness functions de front.']],
  front: `Um limite de tamanho de bundle no CI (size-limit) ou um orçamento de Lighthouse é uma fitness function que você pode adicionar hoje.`,
  ex: { lang: 'javascript', code: `// .dependency-cruiser.cjs: regra de arquitetura que quebra o build
module.exports = {
  forbidden: [{
    name: "modulos-so-pela-api-publica",
    severity: "error",
    from: { path: "^src/([^/]+)/" },
    to: { path: "^src/([^/]+)/internal/", pathNot: "^src/$1/" },
  }],
};

// package.json: orçamento de tamanho do front
// "size-limit": [{ "path": "dist/assets/index-*.js", "limit": "200 KB" }]` },
  docs: [['Thoughtworks · Fitness function-driven development', 'https://www.thoughtworks.com/insights/articles/fitness-function-driven-development'], ['Building Evolutionary Architectures (livro)', 'https://evolutionaryarchitecture.com/'], ['ArchUnit', 'https://www.archunit.org/userguide/html/000_Index.html']],
  perguntas: [`Que regra de arquitetura do seu sistema já foi violada sem ninguém perceber?`, `Que RNF do front você poderia verificar no CI?`, `Qual a diferença entre uma fitness function e um teste unitário?`] },
]
