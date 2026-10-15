import type { Topic } from '../../../types'

export const codigo: Topic[] = [
{ id: 'mvc', stage: 'codigo', level: 'essencial', title: 'MVC', short: 'MVC',
  resumo: `Separar entrada (Controller), regras e dados (Model) e apresentação (View).`,
  porque: `É a organização base da maioria dos frameworks backend: Spring MVC, Rails, Laravel, ASP.NET, NestJS. Entender o papel de cada parte ajuda a achar as coisas no código do time.`,
  como: [
    `O <b>Controller</b> recebe a requisição, valida a entrada e chama a lógica. O <b>Model</b> representa os dados e as regras do domínio. A <b>View</b> gera a resposta: HTML renderizado no servidor ou, em APIs, a serialização para JSON (muitas vezes via DTOs).`,
    `Em APIs modernas, o MVC costuma ganhar uma camada de <b>service</b> entre controller e model, porque regra de negócio no controller (o "fat controller") dificulta testes e reuso. O controller deve ser fino: traduz HTTP em chamadas de código, e o resultado de volta em HTTP.`,
  ],
  conecta: [['camadas', 'A evolução natural do MVC em APIs: controller, service, repository.'], ['rest', 'Cada endpoint vira um método de controller.'], ['orm', 'O Model costuma ser mapeado por um ORM.'], ['patterns', 'MVC é uma combinação de padrões de design.']],
  front: `No front, o React é basicamente a View, e estado e lógica foram para hooks e stores. O MVC do backend responde à mesma pergunta de separar componentes de lógica no front: onde fica a regra de negócio?`,
  ex: { lang: 'typescript', code: `// NestJS: controller fino, regra no service
@Controller("pedidos")
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {}

  @Post()
  criar(@Body() dto: CriarPedidoDto) {
    return this.pedidos.criar(dto); // vira 201 + JSON (a "view")
  }
}` },
  docs: [['MDN · MVC', 'https://developer.mozilla.org/en-US/docs/Glossary/MVC'], ['Martin Fowler · GUI Architectures', 'https://martinfowler.com/eaaDev/uiArchs.html'], ['Spring · Web MVC', 'https://docs.spring.io/spring-framework/reference/web/webmvc.html'], ['NestJS · Controllers', 'https://docs.nestjs.com/controllers']],
  perguntas: [`O que é um fat controller e por que evitar?`, `Numa API JSON, o que faz o papel da View?`, `Onde fica a validação de entrada e onde fica a regra de negócio?`] },

{ id: 'camadas', stage: 'codigo', level: 'essencial', title: 'Camadas e injeção de dependência', short: 'Camadas',
  resumo: `Organizar o código em controller, service e repository, ligados por injeção de dependência.`,
  porque: `É o padrão que você vai encontrar na maioria dos backends corporativos. Facilita testes, troca de banco ou de fornecedor externo e divisão de trabalho no time.`,
  como: [
    `Camadas típicas: <b>apresentação</b> (controllers, HTTP), <b>aplicação/serviço</b> (casos de uso e regras), <b>dados</b> (repositories que falam com o banco) e <b>clients</b> para APIs externas. A regra é que cada camada só chama a de baixo.`,
    `Na <b>injeção de dependência</b> (DI), em vez de uma classe criar suas dependências (<code>new PostgresRepo()</code>), ela as recebe pelo construtor. Um container (Spring, NestJS, .NET) monta tudo, e nos testes você injeta um repositório falso. DTOs separam o formato da API do formato do banco.`,
  ],
  conecta: [['mvc', 'Camadas são o MVC com responsabilidades mais bem divididas.'], ['hexagonal', 'Leva a mesma ideia além, com o domínio no centro.'], ['testes', 'DI permite trocar dependências reais por falsas.'], ['orm', 'O repository encapsula o ORM.']],
  front: `É a mesma ideia de separar componentes, hooks e uma camada de API (<code>services/api.ts</code>) no front. Context e providers do React são uma forma simples de injeção de dependência.`,
  ex: { lang: 'typescript', code: `class PedidosService {
  constructor(
    private repo: PedidosRepository,       // interface, não o Postgres em si
    private pagamentos: PagamentosClient,
  ) {}

  async pagar(id: number) {
    const pedido = await this.repo.buscar(id);
    if (pedido.status !== "PENDENTE") throw new Error("Pedido já processado");
    await this.pagamentos.cobrar(pedido.total);
    await this.repo.salvar({ ...pedido, status: "PAGO" });
  }
}` },
  docs: [['Martin Fowler · Presentation Domain Data Layering', 'https://martinfowler.com/bliki/PresentationDomainDataLayering.html'], ['Martin Fowler · Inversion of Control e DI', 'https://martinfowler.com/articles/injection.html'], ['NestJS · Providers', 'https://docs.nestjs.com/providers']],
  perguntas: [`Por que injetar dependências facilita testes?`, `O que um repository esconde do service?`, `Por que não devolver a entidade do banco direto na resposta da API?`] },

{ id: 'hexagonal', stage: 'codigo', level: 'importante', title: 'Clean Architecture e hexagonal', short: 'Hexagonal',
  resumo: `Colocar as regras de negócio no centro, independentes de framework, banco e HTTP.`,
  porque: `Aparece muito em discussões de arquitetura e code review. Ajuda a manter sistemas grandes testáveis e a trocar tecnologias sem reescrever a regra de negócio.`,
  como: [
    `Na <b>arquitetura hexagonal</b> (Ports and Adapters), o domínio define <b>portas</b>, interfaces como <code>PedidoRepository</code> e <code>Notificador</code>, e o mundo externo fornece <b>adaptadores</b>: Postgres, e-mail, controller HTTP, consumidor de fila. A <b>Clean Architecture</b> segue a mesma regra de dependência: as setas apontam para dentro e o domínio não importa nada de fora.`,
    `O custo é mais arquivos e mais indireção. Para CRUDs simples pode ser exagero; vale a pena quando a regra de negócio é rica e o sistema vai viver por muitos anos.`,
  ],
  conecta: [['camadas', 'Evolução da arquitetura em camadas.'], ['ddd', 'O domínio rico do DDD mora no centro do hexágono.'], ['patterns', 'Portas e adaptadores aplicam Dependency Inversion e Adapter.'], ['testes', 'O domínio é testado sem banco nem HTTP.']],
  front: `O mesmo raciocínio vale no front: isolar regras de negócio do React e da biblioteca de fetch deixa a lógica testável sem renderizar componentes.`,
  ex: { lang: 'diagrama', code: `     [Controller HTTP]     [Consumidor de fila]
              \\                 /
            adaptadores de entrada
                      |
        +-----------------------------+
        |  DOMÍNIO / CASOS DE USO     |  <- não conhece framework
        |  portas: PedidoRepository,  |
        |          Notificador        |
        +-----------------------------+
                      |
            adaptadores de saída
              /                \\
  [PostgresPedidoRepository]  [EmailNotificador]` },
  docs: [['Alistair Cockburn · Hexagonal Architecture', 'https://alistair.cockburn.us/hexagonal-architecture/'], ['Uncle Bob · The Clean Architecture', 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html'], ['Netflix Tech Blog · Hexagonal na prática', 'https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749']],
  perguntas: [`Para que lado apontam as dependências na Clean Architecture?`, `O que é uma porta e o que é um adaptador?`, `Quando essa arquitetura é exagero?`] },

{ id: 'patterns', stage: 'codigo', level: 'importante', title: 'SOLID e design patterns', short: 'Patterns',
  resumo: `Princípios e soluções com nome para problemas recorrentes de design de código.`,
  porque: `Dão vocabulário comum ao time ("isso é um Strategy", "quebra o Single Responsibility") e ajudam a ler código de frameworks, que usam esses padrões o tempo todo.`,
  como: [
    `<b>SOLID</b>: Single Responsibility (um só motivo para mudar), Open/Closed (estender sem modificar), Liskov (subtipos substituíveis), Interface Segregation (interfaces pequenas) e Dependency Inversion (depender de abstrações).`,
    `Padrões mais vistos em backend: <b>Repository</b> (acesso a dados), <b>Strategy</b> (trocar algoritmo, como meios de pagamento), <b>Factory</b>, <b>Adapter</b> (integrar APIs externas), <b>Decorator</b> e <b>Middleware</b> (logar ou autenticar em volta de uma chamada), <b>Observer</b> (eventos) e <b>Singleton</b>, este com cuidado.`,
  ],
  conecta: [['camadas', 'Repository e DI são padrões aplicados.'], ['hexagonal', 'Adaptadores são o padrão Adapter em escala de arquitetura.'], ['mvc', 'MVC combina Observer, Strategy e Composite.'], ['eventos', 'Observer levado para sistemas distribuídos.']],
  front: `Esses padrões também aparecem no front: middlewares do Redux são Chain of Responsibility, HOCs são Decorator e os eventos do DOM são Observer.`,
  ex: { lang: 'typescript', code: `// Strategy: cada meio de pagamento implementa a mesma interface
interface MeioPagamento { cobrar(valor: number): Promise<string> }

class Pix implements MeioPagamento { async cobrar(v: number) { return "pix-" + v } }
class Cartao implements MeioPagamento { async cobrar(v: number) { return "card-" + v } }

const meios: Record<string, MeioPagamento> = { pix: new Pix(), cartao: new Cartao() };
await meios[pedido.meio].cobrar(pedido.total);   // sem switch gigante` },
  docs: [['Refactoring Guru · Design Patterns', 'https://refactoring.guru/design-patterns'], ['Wikipedia · SOLID', 'https://en.wikipedia.org/wiki/SOLID'], ['Martin Fowler · Catálogo P of EAA', 'https://martinfowler.com/eaaCatalog/']],
  perguntas: [`Qual princípio SOLID um service de 2.000 linhas costuma quebrar?`, `Como o Strategy elimina um switch gigante?`, `Por que o Singleton é visto com desconfiança?`] },

{ id: 'ddd', stage: 'codigo', level: 'aprofundar', title: 'Domain-Driven Design', short: 'DDD',
  resumo: `Modelar o software a partir da linguagem e das regras do negócio.`,
  porque: `Em sistemas complexos, o maior problema não é técnico, é entender o negócio. O DDD dá ferramentas para isso e é a base para dividir sistemas em serviços com fronteiras certas.`,
  como: [
    `<b>Estratégico</b>: <b>linguagem ubíqua</b> (devs e negócio usam as mesmas palavras), <b>bounded contexts</b> (o "Cliente" do Faturamento não é o mesmo "Cliente" do Suporte) e o mapa de como esses contextos se relacionam.`,
    `<b>Tático</b>: <b>entidades</b> (têm identidade), <b>value objects</b> (definidos pelo valor, como Dinheiro), <b>agregados</b> (grupo alterado como unidade, com uma raiz que protege as regras), <b>domain events</b> (PedidoPago) e um repository por agregado.`,
  ],
  conecta: [['hexagonal', 'O modelo de domínio fica no centro da arquitetura.'], ['microsservicos', 'Um bounded context costuma virar um serviço.'], ['eventos', 'Domain events viram eventos de integração.'], ['modelagem', 'Agregados influenciam como as tabelas são desenhadas.']],
  front: `Usar os mesmos nomes do negócio em componentes e tipos do front reduz o ruído nas conversas com produto e backend.`,
  ex: { lang: 'typescript', code: `// O agregado Pedido protege as próprias regras
class Pedido {
  private itens: Item[] = [];
  private status: "ABERTO" | "PAGO" = "ABERTO";

  adicionar(item: Item) {
    if (this.status !== "ABERTO") throw new Error("Pedido fechado");
    this.itens.push(item);
  }

  pagar(): PedidoPago {                       // devolve um domain event
    this.status = "PAGO";
    return { tipo: "PedidoPago", total: this.total() };
  }

  total() { return this.itens.reduce((s, i) => s + i.preco * i.qtd, 0); }
}` },
  docs: [['Martin Fowler · Domain-Driven Design', 'https://martinfowler.com/bliki/DomainDrivenDesign.html'], ['Martin Fowler · Bounded Context', 'https://martinfowler.com/bliki/BoundedContext.html'], ['Eric Evans · DDD Reference', 'https://www.domainlanguage.com/ddd/reference/']],
  perguntas: [`O que é um bounded context? Dê um exemplo da sua empresa.`, `Qual a diferença entre entidade e value object?`, `Por que um agregado só deve ser alterado pela raiz?`] },
]
