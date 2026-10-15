import type { Topic } from '../../../types'

export const fundamentos: Topic[] = [
{ id: 'papel-arquitetura', stage: 'fundamentos', level: 'essencial', title: 'O que é arquitetura de software', short: 'Arquitetura',
  resumo: `As decisões estruturais que são caras de mudar depois, e quem cuida delas.`,
  porque: `Saber o que é uma decisão de arquitetura ajuda a reconhecer quando uma escolha "pequena" do dia a dia vai pesar por anos, e a participar dessas discussões em vez de só receber o resultado.`,
  como: [
    `Uma definição útil: arquitetura é o conjunto de <b>decisões importantes e difíceis de reverter</b>, como dividir o sistema em partes, como elas se comunicam, onde ficam os dados e quais tecnologias são a base. Escolher o nome de uma variável não é arquitetura; escolher entre um banco relacional ou de documentos é.`,
    `O arquiteto (ou o time, em empresas sem esse cargo) traduz necessidades do negócio em estrutura técnica, equilibra <b>requisitos não funcionais</b>, comunica as decisões e acompanha se continuam válidas. Arquitetura boa é <b>evolutiva</b>: preparada para mudar, não "certa para sempre".`,
  ],
  conecta: [['requisitos-nao-funcionais', 'São eles que orientam as decisões.'], ['trade-offs', 'Toda decisão de arquitetura é uma troca.'], ['adr', 'Decisões importantes precisam ser registradas.'], ['backend/hexagonal', 'Um exemplo de arquitetura no nível do código.']],
  front: `A arquitetura de front também existe: escolher SPA ou SSR, como dividir o estado e como organizar um monorepo são decisões caras de reverter.`,
  ex: { lang: 'texto', code: `É decisão de arquitetura?
  ✔ monolito ou serviços separados
  ✔ banco relacional ou de documentos
  ✔ comunicação síncrona ou por eventos
  ✔ renderização no servidor ou no cliente
  ✘ nome de uma função
  ✘ biblioteca de datas
  ? framework de UI   (depende de quão espalhado e difícil de trocar)` },
  docs: [['Martin Fowler · Software Architecture Guide', 'https://martinfowler.com/architecture/'], ['Martin Fowler · Who needs an architect?', 'https://martinfowler.com/ieeeSoftware/whoNeedsArchitect.pdf'], ['roadmap.sh · Software Architect', 'https://roadmap.sh/software-architect']],
  perguntas: [`Qual decisão do seu sistema é hoje a mais cara de mudar?`, `Quem toma decisões de arquitetura no seu time?`, `Que escolha recente parecia pequena e acabou pesando muito?`] },

{ id: 'requisitos-nao-funcionais', stage: 'fundamentos', level: 'essencial', title: 'Requisitos não funcionais', short: 'RNFs',
  resumo: `As qualidades do sistema: desempenho, disponibilidade, segurança, custo e outras.`,
  porque: `Duas soluções que fazem a mesma coisa podem ser completamente diferentes por causa de um requisito como "10 mil pedidos por segundo" ou "não pode perder nenhuma transação". São eles que definem a arquitetura.`,
  como: [
    `Requisitos funcionais dizem <b>o que</b> o sistema faz; os não funcionais (também chamados de atributos de qualidade, ou "-ilidades") dizem <b>quão bem</b>: desempenho, escalabilidade, disponibilidade, segurança, manutenibilidade, observabilidade, custo, conformidade legal.`,
    `Um RNF só é útil se for <b>mensurável</b>. "Rápido" não ajuda; "p95 abaixo de 300 ms com 2 mil requisições por segundo" ajuda. Eles costumam conflitar entre si, por isso é preciso priorizar: nem tudo pode ser o mais importante.`,
  ],
  conecta: [['trade-offs', 'Priorizar RNFs é escolher trocas.'], ['estimativas', 'Números de carga tornam RNFs concretos.'], ['devops/slo', 'SLOs são RNFs de confiabilidade formalizados.'], ['fitness-functions', 'Testes automáticos que verificam RNFs.']],
  front: `Core Web Vitals, acessibilidade e suporte a navegadores são RNFs de front. "Funcionar bem em celulares de entrada com 3G" muda completamente o desenho de uma aplicação.`,
  ex: { lang: 'texto', code: `Vago                         Mensurável
───────────────────────────  ────────────────────────────────────────
"tem que ser rápido"         p95 < 300 ms com 2.000 req/s
"não pode cair"              99,9% de disponibilidade mensal
"tem que escalar"            suportar 5× o pico atual sem mudança de código
"seguro"                     dados pessoais cifrados em repouso; MFA para admins
"barato"                     custo de infra < R$ 0,02 por pedido` },
  docs: [['Wikipedia · Requisitos não funcionais', 'https://en.wikipedia.org/wiki/Non-functional_requirement'], ['ISO 25010 · Modelo de qualidade', 'https://iso25000.com/index.php/en/iso-25000-standards/iso-25010'], ['AWS Well-Architected Framework', 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html']],
  perguntas: [`Quais são os três RNFs mais importantes do produto em que você trabalha?`, `Algum deles está escrito com um número?`, `Que dois RNFs do seu sistema entram em conflito?`] },

{ id: 'trade-offs', stage: 'fundamentos', level: 'essencial', title: 'Trade-offs e decisões', short: 'Trade-offs',
  resumo: `Não existe solução melhor em tudo; arquitetura é escolher o que sacrificar.`,
  porque: `Muitas discussões técnicas emperram porque cada pessoa defende um lado sem dizer o que está trocando. Explicitar trade-offs torna as decisões mais rápidas e mais fáceis de revisar depois.`,
  como: [
    `Trocas clássicas: <b>consistência × disponibilidade</b>, <b>latência × custo</b>, <b>flexibilidade × simplicidade</b>, <b>velocidade de entrega × qualidade interna</b>, <b>construir × comprar</b>. A resposta certa depende do contexto, por isso "depende" é honesto, desde que você diga do que depende.`,
    `Uma prática útil é comparar opções numa tabela com os critérios que importam (vindos dos RNFs), dar peso a cada um e registrar a escolha num ADR. Prefira decisões <b>reversíveis</b> quando houver dúvida, e invista mais análise nas irreversíveis.`,
  ],
  conecta: [['requisitos-nao-funcionais', 'Os critérios da comparação.'], ['adr', 'Onde registrar a decisão e as alternativas.'], ['backend/cap', 'O trade-off mais famoso de sistemas distribuídos.'], ['backend/microsservicos', 'Autonomia × complexidade operacional.']],
  front: `SSR ou CSR, biblioteca de estado global ou não, design system próprio ou pronto: são trade-offs do front. A tabela de critérios funciona igual.`,
  ex: { lang: 'texto', code: `Decisão: fila para processar pedidos     peso  RabbitMQ  SQS  Kafka
──────────────────────────────────────── ────  ────────  ───  ─────
Operação (time pequeno)                   3       1       3     1
Reprocessar histórico de eventos          1       1       1     3
Custo no volume atual                     2       2       3     1
Experiência do time                       2       3       2     1
──────────────────────────────────────── ────  ────────  ───  ─────
Total ponderado                                  15      21    11   → SQS` },
  docs: [['Martin Fowler · Design Stamina Hypothesis', 'https://martinfowler.com/bliki/DesignStaminaHypothesis.html'], ['Martin Fowler · Is High Quality Software Worth the Cost?', 'https://martinfowler.com/articles/is-quality-worth-cost.html'], ['Fundamentals of Software Architecture (livro)', 'https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/']],
  perguntas: [`Qual trade-off o seu time fez recentemente sem dizer em voz alta?`, `Por que decisões reversíveis podem ser tomadas mais rápido?`, `Quando faz sentido comprar em vez de construir?`] },

{ id: 'acoplamento-coesao', stage: 'fundamentos', level: 'essencial', title: 'Acoplamento e coesão', short: 'Acoplamento',
  resumo: `O quanto as partes dependem umas das outras, e o quanto cada parte faz sentido sozinha.`,
  porque: `"Mudei uma coisa aqui e quebrou ali" é sintoma de acoplamento alto. Esses dois conceitos explicam por que alguns sistemas são fáceis de mudar e outros não, em qualquer escala: função, módulo ou serviço.`,
  como: [
    `<b>Coesão alta</b>: o que muda junto fica junto (tudo de "pagamento" num módulo). <b>Acoplamento baixo</b>: as partes se conhecem por interfaces pequenas e estáveis, não por detalhes internos. A meta é as duas coisas ao mesmo tempo.`,
    `Formas de acoplamento menos óbvias: <b>temporal</b> (A precisa que B esteja no ar agora), de <b>dados</b> (dois serviços lendo a mesma tabela), de <b>implantação</b> (precisam ser publicados juntos) e <b>semântico</b> (ambos dependem do mesmo significado de um campo). Microsserviços com acoplamento alto formam um "monolito distribuído", que junta o pior dos dois mundos.`,
  ],
  conecta: [['backend/patterns', 'SOLID é, no fundo, sobre coesão e acoplamento.'], ['monolito-modular', 'Fronteiras de módulo com baixo acoplamento.'], ['sincrono-assincrono', 'Eventos reduzem o acoplamento temporal.'], ['backend/ddd', 'Bounded contexts organizam a coesão por negócio.']],
  front: `Componentes que recebem 20 props ou que importam o store global inteiro estão acoplados demais. Colocar estilos, testes e lógica de uma feature na mesma pasta aumenta a coesão.`,
  ex: { lang: 'texto', code: `Monolito distribuído (acoplamento alto)
  [Pedidos] ──lê tabela── [db de Estoque]
  [Pedidos] ──chama sync──> [Pagamentos] ──chama sync──> [Fraude]
  deploy de Pedidos exige deploy de Pagamentos no mesmo dia

Serviços com baixo acoplamento
  [Pedidos] ──evento PedidoCriado──> fila ──> [Estoque]
  [Pedidos] ──API estável e versionada──> [Pagamentos]
  cada um tem o próprio banco e publica sozinho` },
  docs: [['Wikipedia · Coupling', 'https://en.wikipedia.org/wiki/Coupling_(computer_programming)'], ['Martin Fowler · Reducing Coupling', 'https://martinfowler.com/ieeeSoftware/coupling.pdf'], ['Vlad Khononov · Balancing Coupling', 'https://coupling.dev/']],
  perguntas: [`Que parte do seu código sempre quebra quando você mexe em outra?`, `O que é um monolito distribuído?`, `Que tipo de acoplamento existe entre o front e a API do seu produto?`] },

{ id: 'conway', stage: 'fundamentos', level: 'importante', title: 'Lei de Conway e times', short: 'Conway',
  resumo: `Sistemas tendem a copiar a estrutura de comunicação das organizações que os constroem.`,
  porque: `Arquitetura não é só técnica. Se três times compartilham um módulo, ele vai virar um campo de batalha; se um time é dono de cinco serviços pequenos, vai sofrer com operação. Entender isso explica muitos atritos de integração.`,
  como: [
    `A <b>Lei de Conway</b> (1968) diz que o desenho do sistema espelha a comunicação entre as pessoas. A <b>manobra inversa de Conway</b> usa isso a favor: organizar os times do jeito que se quer que a arquitetura fique.`,
    `O livro <b>Team Topologies</b> propõe tipos de time (alinhado a fluxo de valor, plataforma, capacitação e subsistema complicado) e formas de interação. A ideia central é limitar a <b>carga cognitiva</b>: cada time deve ser dono de uma parte que consegue entender por inteiro.`,
  ],
  conecta: [['backend/microsservicos', 'Serviços costumam seguir a divisão dos times.'], ['acoplamento-coesao', 'Fronteiras entre times viram fronteiras de acoplamento.'], ['praticas/comunicacao-tecnica', 'Integração entre times depende de comunicação.']],
  front: `Microfrontends são, muitas vezes, uma resposta de Conway: vários times precisando publicar partes da mesma interface de forma independente.`,
  ex: { lang: 'texto', code: `Organização                     Arquitetura que tende a surgir
──────────────────────────────  ───────────────────────────────────
time de front + time de back    front e back separados por uma API
3 times de produto + 1 de DBA   3 serviços falando com um banco central
times por domínio (pedidos,     serviços por domínio, com APIs entre eles
pagamentos, catálogo)` },
  docs: [['Martin Fowler · Conway\'s Law', 'https://martinfowler.com/bliki/ConwaysLaw.html'], ['Team Topologies · Key concepts', 'https://teamtopologies.com/key-concepts'], ['Melvin Conway · How do committees invent?', 'https://www.melconway.com/Home/Committees_Paper.html']],
  perguntas: [`Como a divisão dos times da sua empresa aparece na arquitetura?`, `Que parte do sistema não tem um dono claro?`, `O que é carga cognitiva de um time?`] },
]
