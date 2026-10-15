import type { Topic } from '../../../types'

export const cloud: Topic[] = [
{ id: 'cloud-modelos', stage: 'cloud', level: 'essencial', title: 'IaaS, PaaS, SaaS e serverless', short: 'Modelos de nuvem',
  resumo: `Quanto da pilha você gerencia e quanto o provedor gerencia por você.`,
  porque: `A escolha entre uma VM, uma plataforma gerenciada ou uma função serverless define custo, esforço de operação e flexibilidade. Muitas discussões de arquitetura começam com "vamos rodar isso onde?".`,
  como: [
    `<b>IaaS</b> (EC2, Compute Engine): você recebe máquinas virtuais e cuida do sistema operacional para cima. <b>PaaS</b> (App Engine, Heroku, Elastic Beanstalk, Render): você entrega o código e a plataforma cuida de servidor, escala e deploy. <b>SaaS</b>: o software pronto (Gmail, Slack). <b>Serverless/FaaS</b> (Lambda, Cloud Functions): você entrega funções que rodam por evento e paga por execução.`,
    `Entre eles ficam os <b>serviços gerenciados</b>: banco (RDS, Cloud SQL), fila (SQS), Kubernetes (EKS, GKE). A regra prática é usar o mais gerenciado que atenda ao caso, porque cada camada que você opera é trabalho de plantão. O <b>modelo de responsabilidade compartilhada</b> define o que é seu e o que é do provedor em cada opção.`,
  ],
  conecta: [['serverless', 'O extremo "gerenciado" do espectro.'], ['kubernetes', 'Meio-termo entre VM e plataforma pronta.'], ['finops', 'Cada modelo tem uma forma diferente de cobrança.'], ['arquitetura/serverless-arch', 'Como desenhar sistemas inteiros sobre serverless.']],
  front: `Vercel e Netlify são PaaS focados em front. Quando um projeto sai deles para a "nuvem da empresa", a decisão de modelo aparece de novo.`,
  ex: { lang: 'texto', code: `                 IaaS     Container    PaaS     Serverless
Aplicação         você      você        você      você (funções)
Runtime           você      você        provedor  provedor
Sistema op.       você      provedor*   provedor  provedor
Escala            você      você/orq.   provedor  provedor
Cobrança          por hora  por nó/pod  por app   por execução
* em Kubernetes gerenciado, o nó ainda é parcialmente seu` },
  docs: [['AWS · Tipos de computação em nuvem', 'https://aws.amazon.com/types-of-cloud-computing/'], ['AWS · Modelo de responsabilidade compartilhada', 'https://aws.amazon.com/compliance/shared-responsibility-model/'], ['Google Cloud · Onde rodar seu código', 'https://cloud.google.com/hosting-options']],
  perguntas: [`Em que modelo roda a aplicação principal da sua empresa?`, `O que deixa de ser sua responsabilidade ao trocar uma VM por um banco gerenciado?`, `Quando uma VM ainda é a melhor escolha?`] },

{ id: 'regioes-az', stage: 'cloud', level: 'essencial', title: 'Regiões e zonas de disponibilidade', short: 'Regiões e AZs',
  resumo: `Onde os recursos ficam fisicamente e como isso define latência e resiliência.`,
  porque: `Uma aplicação numa única zona cai junto com ela. Escolher região também afeta latência para o usuário, custo, serviços disponíveis e exigências legais de onde os dados podem ficar.`,
  como: [
    `Uma <b>região</b> (ex.: <code>sa-east-1</code>, São Paulo) é uma área geográfica com vários <b>data centers isolados</b>, as <b>zonas de disponibilidade</b> (AZs). As AZs têm energia e rede independentes e ficam próximas o bastante para latência de poucos milissegundos.`,
    `<b>Multi-AZ</b> (instâncias e réplicas de banco em zonas diferentes, atrás de um load balancer) é o padrão para produção e protege contra a queda de um data center. <b>Multi-região</b> protege contra a queda de uma região inteira, mas exige replicar dados a distância, o que é bem mais caro e complexo.`,
  ],
  conecta: [['backend/load-balancer', 'Distribui o tráfego entre zonas.'], ['backup-dr', 'Recuperação de desastre define quantas regiões usar.'], ['backend/cap', 'Replicar entre regiões esbarra em latência e consistência.'], ['cdn-edge', 'A CDN aproxima conteúdo do usuário sem multiplicar regiões.']],
  front: `Uma API em us-east-1 acrescenta mais de 100 ms de ida e volta para usuários no Brasil. Isso aparece direto no TTFB medido no navegador.`,
  ex: { lang: 'texto', code: `Região sa-east-1 (São Paulo)
├── AZ sa-east-1a   [API]  [Postgres primário]
├── AZ sa-east-1b   [API]  [Postgres réplica síncrona]
└── AZ sa-east-1c   [API]
           ▲
   Load balancer distribui entre as três zonas.
   Se a 1a cair, o banco faz failover para a 1b.` },
  docs: [['AWS · Regiões e zonas de disponibilidade', 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'], ['Google Cloud · Geografia e regiões', 'https://cloud.google.com/docs/geography-and-regions'], ['AWS Well-Architected · Confiabilidade', 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html']],
  perguntas: [`Qual a diferença de proteção entre multi-AZ e multi-região?`, `Por que nem todo serviço existe em todas as regiões?`, `Que lei pode influenciar a escolha da região dos seus dados?`] },

{ id: 'iam', stage: 'cloud', level: 'essencial', title: 'IAM e identidade na nuvem', short: 'IAM',
  resumo: `Quem (pessoa ou serviço) pode fazer o que em quais recursos da nuvem.`,
  porque: `A maioria dos incidentes graves na nuvem começa com uma credencial com permissão demais. IAM é a fronteira de segurança mais importante de uma conta de nuvem.`,
  como: [
    `<b>Identidades</b> são usuários, grupos e <b>roles</b> (papéis assumidos temporariamente). <b>Políticas</b> em JSON listam ações permitidas (<code>s3:GetObject</code>) em recursos específicos. Aplique o <b>menor privilégio</b>: só as ações e recursos necessários.`,
    `Aplicações não devem usar chaves de acesso fixas: na nuvem, o serviço assume uma <b>role</b> e recebe credenciais temporárias automaticamente. Em CI, use <b>OIDC</b> para o pipeline trocar seu token por credenciais temporárias, sem guardar segredos. Para pessoas, use SSO com MFA.`,
  ],
  conecta: [['backend/autorizacao', 'Os mesmos conceitos de autorização, aplicados à infraestrutura.'], ['pipelines', 'Pipelines precisam de permissão para fazer deploy.'], ['seguranca/cloud-misconfig', 'Permissões amplas são a configuração insegura mais comum.'], ['storage', 'Buckets públicos por engano são falhas de política.']],
  front: `O erro "AccessDenied" ao subir arquivos para um bucket direto do navegador normalmente é política de IAM ou de bucket; URLs pré-assinadas resolvem sem expor credenciais.`,
  ex: { lang: 'json', code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::uploads-loja/avatars/*"
  }]
}` },
  docs: [['AWS · Boas práticas de IAM', 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html'], ['Google Cloud · Visão geral do IAM', 'https://cloud.google.com/iam/docs/overview'], ['GitHub · OIDC para provedores de nuvem', 'https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect']],
  perguntas: [`Por que roles com credenciais temporárias são melhores que chaves fixas?`, `Como o pipeline do seu time obtém permissão para fazer deploy?`, `Que estrago uma chave com "Action": "*" pode causar se vazar?`] },

{ id: 'storage', stage: 'cloud', level: 'importante', title: 'Armazenamento: bloco, arquivo e objeto', short: 'Storage',
  resumo: `Os três tipos de armazenamento na nuvem e quando usar cada um.`,
  porque: `Upload de usuários, backups, arquivos estáticos do front e discos de bancos usam tipos de armazenamento diferentes. Escolher errado custa caro ou cria gargalos.`,
  como: [
    `<b>Bloco</b> (EBS, Persistent Disk): um disco virtual ligado a uma máquina; é onde rodam bancos e sistemas operacionais. <b>Arquivo</b> (EFS, Filestore): um sistema de arquivos compartilhado por várias máquinas. <b>Objeto</b> (S3, Cloud Storage, R2): arquivos acessados por HTTP com chave e metadados, praticamente ilimitado e barato.`,
    `Object storage é o padrão para uploads, assets do front, logs e backups. Recursos importantes: <b>classes de armazenamento</b> (padrão, acesso raro, arquivo), <b>regras de ciclo de vida</b>, versionamento e <b>URLs pré-assinadas</b>, que deixam o navegador enviar ou baixar um arquivo direto, por tempo limitado, sem passar pela API.`,
  ],
  conecta: [['cdn-edge', 'Buckets costumam ser a origem de uma CDN.'], ['iam', 'Políticas controlam quem lê e escreve.'], ['backup-dr', 'Backups vão para object storage, em outra região.'], ['finops', 'Classes de armazenamento mudam muito o custo.']],
  front: `O build do front (HTML, JS, CSS) costuma ser publicado num bucket atrás de uma CDN. Uploads grandes vão melhor direto do navegador para o bucket via URL pré-assinada.`,
  ex: { lang: 'typescript', code: `// API gera uma URL temporária; o navegador envia o arquivo direto ao S3
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "sa-east-1" });
const url = await getSignedUrl(
  s3,
  new PutObjectCommand({ Bucket: "uploads-loja", Key: "avatars/user-7.png" }),
  { expiresIn: 300 }, // 5 minutos
);
// front: await fetch(url, { method: "PUT", body: arquivo })` },
  docs: [['AWS · Tipos de armazenamento', 'https://aws.amazon.com/what-is/cloud-storage/'], ['AWS · URLs pré-assinadas', 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html'], ['Cloudflare · O que é object storage', 'https://www.cloudflare.com/learning/cloud/what-is-object-storage/']],
  perguntas: [`Por que um banco de dados não roda em object storage?`, `Que vantagem uma URL pré-assinada traz para uploads grandes?`, `Que dados da sua empresa poderiam ir para uma classe de armazenamento mais barata?`] },

{ id: 'serverless', stage: 'cloud', level: 'importante', title: 'Funções serverless', short: 'Serverless',
  resumo: `Código que roda sob demanda, por evento, sem servidor para gerenciar.`,
  porque: `Serverless é ótimo para cargas irregulares, integrações e tarefas por evento, e é a base de muitos backends de front (rotas de API do Next.js na Vercel, por exemplo). Também tem limites que surpreendem quem não conhece.`,
  como: [
    `Uma <b>função</b> é disparada por um evento: requisição HTTP, arquivo novo num bucket, mensagem numa fila, horário agendado. O provedor cria instâncias conforme a demanda, inclusive do zero, e cobra por execução e tempo.`,
    `Pontos de atenção: <b>cold start</b> (a primeira execução numa instância nova é mais lenta), <b>tempo máximo</b> por execução, ausência de estado local entre chamadas, e <b>conexões com banco</b>: milhares de instâncias abrindo conexões esgotam o banco, por isso existem proxies de conexão e bancos serverless.`,
  ],
  conecta: [['cloud-modelos', 'O modelo mais gerenciado de computação.'], ['backend/filas', 'Funções consumindo filas é um uso clássico.'], ['dados/pool-conexoes', 'Muitas funções exigem pool de conexões externo.'], ['arquitetura/serverless-arch', 'Desenhar sistemas inteiros com funções e eventos.']],
  front: `As API Routes e Server Actions do Next.js, quando hospedadas na Vercel, viram funções serverless. Cold start é o que explica a primeira chamada mais lenta depois de um tempo parado.`,
  ex: { lang: 'typescript', code: `// AWS Lambda disparada por upload num bucket
import type { S3Event } from "aws-lambda";

export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const key = record.s3.object.key;
    await gerarMiniatura(record.s3.bucket.name, key); // não guarda estado local
  }
};` },
  docs: [['AWS Lambda · Guia do desenvolvedor', 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html'], ['Google Cloud Run functions', 'https://cloud.google.com/functions/docs'], ['Vercel · Functions', 'https://vercel.com/docs/functions']],
  perguntas: [`Por que funções serverless podem esgotar as conexões de um banco relacional?`, `Que tipo de carga combina mal com serverless?`, `Como reduzir o impacto do cold start?`] },

{ id: 'cdn-edge', stage: 'cloud', level: 'importante', title: 'CDN e edge', short: 'CDN',
  resumo: `Servir conteúdo e rodar lógica em pontos próximos do usuário.`,
  porque: `CDN é o que faz um site carregar rápido no mundo inteiro e aguentar picos sem cair. Para o front, é a primeira camada de infraestrutura que toca o usuário.`,
  como: [
    `Uma <b>CDN</b> (CloudFront, Cloudflare, Fastly, Akamai) tem servidores em centenas de cidades (<b>PoPs</b>). Na primeira requisição ela busca o conteúdo na <b>origem</b> (bucket, servidor) e guarda conforme os headers de cache; as seguintes são servidas do PoP mais próximo. Invalidação força a CDN a buscar de novo.`,
    `<b>Edge computing</b> leva código para esses PoPs (Cloudflare Workers, CloudFront Functions, Vercel Edge): redirecionamentos, testes A/B, autenticação leve e personalização perto do usuário. CDNs também absorvem ataques DDoS e podem ter WAF.`,
  ],
  conecta: [['backend/cache', 'A CDN é uma camada de cache controlada por headers HTTP.'], ['storage', 'Buckets são a origem mais comum.'], ['frontend/cache-assets', 'Estratégia de cache dos assets do front.'], ['seguranca/waf-ddos', 'CDNs ficam na linha de frente contra DDoS.']],
  front: `Depois de um deploy, "os usuários ainda veem a versão antiga" costuma ser HTML cacheado na CDN. Assets com hash podem ter cache longo; o HTML precisa de cache curto ou revalidação.`,
  ex: { lang: 'http', code: `# HTML: sempre revalidar
Cache-Control: public, max-age=0, must-revalidate

# assets com hash no nome: cache por 1 ano
Cache-Control: public, max-age=31536000, immutable

# header de diagnóstico de muitas CDNs
X-Cache: Hit from cloudfront` },
  docs: [['Cloudflare · O que é uma CDN', 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/'], ['AWS · CloudFront', 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html'], ['Cloudflare Workers', 'https://developers.cloudflare.com/workers/']],
  perguntas: [`Por que o HTML precisa de uma política de cache diferente dos assets?`, `O que é a "origem" de uma CDN?`, `Que lógica faria sentido rodar no edge em vez de no servidor?`] },
]
