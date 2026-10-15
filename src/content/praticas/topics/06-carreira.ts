import type { Topic } from '../../../types'

export const carreira: Topic[] = [
{ id: 'senioridade', stage: 'carreira', level: 'importante', title: 'O que muda com a senioridade', short: 'Senioridade',
  resumo: `De resolver tarefas a resolver problemas, e de influenciar o próprio código a influenciar o time.`,
  porque: `Saber o que se espera em cada nível ajuda a direcionar o próprio crescimento e a entender por que conhecer áreas além da sua especialidade (backend, front, infra, arquitetura) faz diferença na carreira.`,
  como: [
    `Em geral: <b>júnior</b> executa tarefas bem definidas com orientação; <b>pleno</b> entrega funcionalidades de ponta a ponta com autonomia; <b>sênior</b> resolve problemas ambíguos, enxerga o sistema inteiro, antecipa riscos e eleva o time (reviews, mentoria, padrões). Depois disso, a carreira costuma se dividir entre trilha técnica (staff, principal) e gestão.`,
    `O que diferencia, mais do que conhecimento de ferramentas: <b>escopo</b> (tarefa, funcionalidade, sistema, organização), <b>autonomia</b> diante de ambiguidade, <b>impacto</b> mensurável, qualidade das <b>decisões e trade-offs</b> e capacidade de <b>comunicar</b> e influenciar sem autoridade.`,
  ],
  conecta: [['aprendizado', 'Crescer exige aprender de forma deliberada.'], ['comunicacao-tecnica', 'Influência depende de comunicação.'], ['arquitetura/papel-arquitetura', 'Decisões estruturais crescem com a senioridade.']],
  front: `Uma pessoa sênior de front se destaca justamente por entender o sistema além da interface: negociar contratos de API, prever impacto em performance e infra e participar de decisões de arquitetura.`,
  ex: { lang: 'texto', code: `Mesma situação, níveis diferentes: "o checkout está lento"
Júnior   recebe a tarefa "otimizar componente X" e otimiza
Pleno    mede, descobre que é a API, abre um ticket bem descrito
Sênior   mede o fluxo inteiro, encontra a cascata de requisições,
         propõe um endpoint agregado com o backend, define um orçamento
         de performance no CI e mede o impacto na conversão
Staff    percebe que três times sofrem do mesmo problema e propõe
         um padrão (BFF) para toda a organização` },
  docs: [['StaffEng', 'https://staffeng.com/'], ['Pragmatic Engineer · Engineering career paths', 'https://blog.pragmaticengineer.com/engineering-career-paths/'], ['progression.fyi · frameworks de carreira', 'https://www.progression.fyi/']],
  perguntas: [`Que problema ambíguo você poderia assumir no seu time?`, `Que decisão recente você teria tomado de outro jeito com uma visão de sistema?`, `O que o framework de carreira da sua empresa espera do próximo nível?`] },

{ id: 'aprendizado', stage: 'carreira', level: 'essencial', title: 'Aprender de forma contínua', short: 'Aprendizado',
  resumo: `Estratégias para aprender tecnologia de forma profunda e duradoura.`,
  porque: `A área muda o tempo todo, e é impossível saber tudo. Aprender bem (e não só consumir conteúdo) é o que transforma estudo em habilidade, como o que você está fazendo com estas trilhas.`,
  como: [
    `O que funciona, segundo a pesquisa sobre aprendizagem: <b>prática de recuperação</b> (testar a memória, como nos quizzes, em vez de reler), <b>repetição espaçada</b> (revisar em intervalos crescentes), <b>prática deliberada</b> (projetos um pouco acima do seu nível) e <b>ensinar</b> (explicar revela as lacunas).`,
    `Na prática: aprender construindo (os exercícios de cada etapa), ler documentação oficial antes de tutoriais, manter notas próprias, conectar assuntos novos ao que você já sabe (o "lado do front" de cada tópico) e focar nos fundamentos, que mudam muito mais devagar que as ferramentas.`,
  ],
  conecta: [['senioridade', 'Aprender é o motor do crescimento.'], ['leitura-codigo', 'Ler código de bons projetos ensina muito.'], ['documentacao', 'Escrever o que aprendeu consolida o conhecimento.'], ['ia/ia-no-dia-a-dia', 'IA como tutora, com cuidado.']],
  front: `Conhecimentos de uma área servem de ponte para outras: event loop, cache HTTP e CORS aparecem tanto no front quanto no backend e na infra.`,
  ex: { lang: 'texto', code: `Rotina de estudo baseada em evidências
seg  ler um assunto da trilha + anotar em palavras próprias
ter  fazer o quiz (recuperação) sem consultar
qua  exercício prático da etapa
qui  explicar o assunto para alguém (ou escrever um post curto)
sex  refazer os quizzes errados de 1 e 2 semanas atrás (espaçamento)` },
  docs: [['Make It Stick (livro)', 'https://www.retrievalpractice.org/make-it-stick'], ['Retrieval Practice', 'https://www.retrievalpractice.org/'], ['Learning How to Learn (curso gratuito)', 'https://www.coursera.org/learn/learning-how-to-learn']],
  perguntas: [`Que assunto você "estudou" mas não conseguiria explicar hoje?`, `Por que fazer um quiz ensina mais que reler o conteúdo?`, `Que projeto prático colocaria em uso o que você aprendeu nesta trilha?`] },

{ id: 'entrevistas', stage: 'carreira', level: 'aprofundar', title: 'Entrevistas técnicas', short: 'Entrevistas',
  resumo: `Os formatos mais comuns e como se preparar para cada um.`,
  porque: `Processos seletivos para vagas plenas e sêniores costumam incluir system design e perguntas de integração com backend, mesmo para posições de front. Conhecer o formato reduz a ansiedade e melhora o desempenho.`,
  como: [
    `Formatos: <b>código ao vivo</b> (algoritmos ou problemas práticos), <b>take-home</b> (projeto em casa), <b>system design</b> (desenhar um sistema; para front, também "frontend system design": arquitetura de uma aplicação, estado, performance, API), <b>comportamental</b> (situações reais, respondidas com o formato STAR: situação, tarefa, ação, resultado).`,
    `Em system design: esclareça requisitos e números antes de desenhar, comece simples e evolua, fale os trade-offs em voz alta e aprofunde onde o entrevistador mostrar interesse. Em todos os formatos, pensar em voz alta mostra o raciocínio, que conta tanto quanto a resposta.`,
  ],
  conecta: [['arquitetura/estimativas', 'O começo de toda entrevista de system design.'], ['arquitetura/case-encurtador', 'Estudos de caso clássicos.'], ['comunicacao-tecnica', 'Pensar em voz alta é comunicação.'], ['senioridade', 'O que cada nível precisa demonstrar.'], ['fundamentos/big-o', 'Complexidade aparece em toda entrevista de algoritmos.']],
  front: `Em "frontend system design" (ex.: "desenhe o feed do Twitter"), espera-se discutir componentes, estado, paginação, cache, performance, acessibilidade e o contrato com a API, não só a interface.`,
  ex: { lang: 'texto', code: `Roteiro para system design (45 min)
 5 min  requisitos funcionais e não funcionais, números de escala
 5 min  API e modelo de dados
15 min  desenho de alto nível (componentes e fluxo)
15 min  aprofundar: gargalos, escala, falhas, trade-offs
 5 min  resumo e o que melhoraria com mais tempo

STAR (comportamental)
Situação: integração com a API de pagamentos atrasando a entrega
Tarefa:   garantir o lançamento da campanha
Ação:     propus contrato OpenAPI e mocks para trabalharmos em paralelo
Resultado: lançamos no prazo; o padrão virou prática do time` },
  docs: [['System Design Primer', 'https://github.com/donnemartin/system-design-primer'], ['GreatFrontEnd · Front end system design', 'https://www.greatfrontend.com/front-end-system-design-playbook'], ['Tech Interview Handbook', 'https://www.techinterviewhandbook.org/']],
  perguntas: [`Qual história do seu trabalho funcionaria bem no formato STAR?`, `Que perguntas você faria antes de desenhar um sistema numa entrevista?`, `Como você desenharia a arquitetura de front de um app de chat?`] },
]
