import type { Topic } from '../../../types'

export const aplicacao: Topic[] = [
{ id: 'xss-csp', stage: 'aplicacao', level: 'essencial', title: 'XSS e Content Security Policy', short: 'XSS e CSP',
  resumo: `Impedir que script de terceiros rode no seu domínio, e limitar o estrago se acontecer.`,
  porque: `XSS é a vulnerabilidade de front por excelência: um script injetado age como o usuário, lê dados da página e faz requisições autenticadas. Frameworks ajudam, mas não cobrem tudo.`,
  como: [
    `Tipos: <b>refletido</b> (o input volta na resposta), <b>armazenado</b> (fica no banco e atinge todos que veem) e <b>baseado em DOM</b> (o próprio JS insere dados não confiáveis com <code>innerHTML</code>, <code>eval</code> ou URLs <code>javascript:</code>). Defesa principal: escapar a saída conforme o contexto (React faz isso em texto) e sanitizar HTML que precisa ser renderizado (DOMPurify).`,
    `A <b>Content Security Policy</b> é a segunda camada: um header que diz quais scripts podem rodar. Uma CSP estrita usa <b>nonces</b> ou hashes por script e <code>'strict-dynamic'</code>, sem <code>'unsafe-inline'</code>. Comece com <code>Content-Security-Policy-Report-Only</code> para descobrir o que quebraria. <b>Trusted Types</b> força que atribuições perigosas no DOM passem por funções aprovadas.`,
  ],
  conecta: [['backend/owasp', 'XSS no contexto do OWASP Top 10.'], ['headers-seguranca', 'CSP é um dos headers de segurança.'], ['tokens-sessoes', 'XSS rouba tokens acessíveis por JavaScript.'], ['defesa-profundidade', 'Escapar, sanitizar e CSP são camadas.']],
  front: `Fique atento a <code>dangerouslySetInnerHTML</code>, <code>href</code> montado a partir de dados do usuário (pode ser <code>javascript:</code>), bibliotecas de markdown sem sanitização e scripts de terceiros carregados sem controle.`,
  ex: { lang: 'tsx', code: `import DOMPurify from "dompurify";

// perigoso: HTML do usuário direto na página
<div dangerouslySetInnerHTML={{ __html: comentario.html }} />

// melhor: sanitizar antes
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comentario.html) }} />

// perigoso: link com protocolo controlado pelo usuário
const seguro = /^https?:\\/\\//.test(perfil.site) ? perfil.site : "#";
<a href={seguro}>Site</a>

// header de resposta (CSP estrita com nonce gerado por requisição)
// Content-Security-Policy: script-src 'nonce-r4nd0m' 'strict-dynamic'; object-src 'none'; base-uri 'none'` },
  docs: [['OWASP · XSS Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'], ['web.dev · Strict CSP', 'https://web.dev/articles/strict-csp'], ['MDN · Content Security Policy', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP'], ['DOMPurify', 'https://github.com/cure53/DOMPurify']],
  perguntas: [`Onde o seu código usa dangerouslySetInnerHTML ou innerHTML?`, `Por que uma CSP com 'unsafe-inline' protege pouco contra XSS?`, `Como introduzir uma CSP sem quebrar o site?`] },

{ id: 'csrf-samesite', stage: 'aplicacao', level: 'essencial', title: 'CSRF e cookies SameSite', short: 'CSRF',
  resumo: `Impedir que outro site faça o navegador do usuário executar ações na sua aplicação.`,
  porque: `Quando a autenticação é por cookie, o navegador o envia automaticamente, inclusive em requisições disparadas por outros sites. Sem proteção, um link malicioso pode transferir dinheiro ou trocar o e-mail da conta.`,
  como: [
    `O atacante não lê a resposta, mas provoca a ação: um formulário oculto que faz POST para <code>loja.com/conta/email</code> com o cookie da vítima. Defesas: cookies <b>SameSite</b> (<code>Lax</code> bloqueia o envio em POSTs entre sites; <code>Strict</code> bloqueia sempre), <b>tokens anti-CSRF</b> (valor imprevisível exigido em cada ação), verificar os headers <code>Origin</code>/<code>Sec-Fetch-Site</code> e exigir um header customizado em APIs JSON.`,
    `Nunca use GET para ações que mudam estado. APIs que só aceitam tokens no header <code>Authorization</code> não sofrem CSRF clássico, porque o navegador não envia esse header sozinho, mas expõem o token a XSS: é um trade-off.`,
  ],
  conecta: [['backend/cors', 'CORS controla leitura; não impede o envio da requisição.'], ['tokens-sessoes', 'Cookies de sessão são o alvo do CSRF.'], ['xss-csp', 'Com XSS, as defesas de CSRF caem.'], ['backend/http', 'Métodos seguros não devem mudar estado.']],
  front: `Um erro comum é achar que CORS protege contra CSRF. CORS impede que o site do atacante leia a resposta, mas um formulário HTML simples ainda envia a requisição com cookies.`,
  ex: { lang: 'html', code: `<!-- página do atacante -->
<form action="https://loja.com/conta/email" method="POST">
  <input type="hidden" name="email" value="atacante@mal.com" />
</form>
<script>document.forms[0].submit()</script>

<!-- defesas no servidor -->
Set-Cookie: sessao=abc; HttpOnly; Secure; SameSite=Lax
// + checar Origin / Sec-Fetch-Site: cross-site → 403
// + token anti-CSRF em formulários tradicionais` },
  docs: [['OWASP · CSRF Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html'], ['web.dev · SameSite cookies explained', 'https://web.dev/articles/samesite-cookies-explained'], ['MDN · Sec-Fetch-Site', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site']],
  perguntas: [`Por que CORS não protege contra CSRF?`, `Qual a diferença entre SameSite=Lax e Strict?`, `Alguma ação do seu produto muda estado com uma requisição GET?`] },

{ id: 'ssrf', stage: 'aplicacao', level: 'importante', title: 'SSRF', short: 'SSRF',
  resumo: `Quando o servidor é induzido a fazer requisições para onde não deveria.`,
  porque: `Funcionalidades como "importar imagem por URL", webhooks configuráveis e geração de prévia de links fazem o servidor buscar URLs informadas pelo usuário. Na nuvem, isso pode expor credenciais da própria infraestrutura.`,
  como: [
    `O atacante informa uma URL interna: <code>http://169.254.169.254/</code> (metadados da nuvem, com credenciais temporárias), <code>http://localhost:6379</code> (o Redis interno) ou serviços administrativos sem autenticação. Redirecionamentos e DNS que muda de resposta (DNS rebinding) burlam validações ingênuas.`,
    `Defesas: <b>lista de destinos permitidos</b> quando possível; resolver o DNS e bloquear IPs privados, de loopback e link-local <b>no momento da conexão</b>; não seguir redirecionamentos sem revalidar; isolar o serviço que faz as buscas numa rede sem acesso interno; e usar <b>IMDSv2</b> na AWS, que exige um token e dificulta o acesso aos metadados.`,
  ],
  conecta: [['backend/owasp', 'SSRF está no OWASP Top 10.'], ['cloud-misconfig', 'Metadados expostos levam a credenciais da nuvem.'], ['zero-trust', 'Serviços internos não devem confiar em quem está na rede.'], ['upload-seguro', 'Importar arquivos por URL é um vetor comum.']],
  front: `Campos "cole a URL da imagem" ou "configure seu webhook" numa interface quase sempre viram uma busca feita pelo servidor; vale perguntar ao backend como ela é protegida.`,
  ex: { lang: 'typescript', code: `import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

async function urlPermitida(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:") return false;
  const { address } = await lookup(url.hostname);
  const faixa = ipaddr.parse(address).range();
  // bloqueia privado, loopback, link-local (169.254.x.x) etc.
  return faixa === "unicast";
}
// e ao buscar: redirect: "manual", timeout curto, limite de tamanho` },
  docs: [['OWASP · SSRF Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html'], ['PortSwigger · SSRF', 'https://portswigger.net/web-security/ssrf'], ['AWS · IMDSv2', 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html']],
  perguntas: [`Que funcionalidade do seu produto faz o servidor buscar uma URL informada pelo usuário?`, `Por que validar só o texto da URL não basta?`, `O que um atacante consegue no endereço 169.254.169.254?`] },

{ id: 'injecoes', stage: 'aplicacao', level: 'essencial', title: 'Injeções: SQL, NoSQL, comando e template', short: 'Injeções',
  resumo: `Quando dados do usuário viram código em outro interpretador.`,
  porque: `Injeção acontece sempre que uma string vira comando: SQL, consultas de MongoDB, shell, templates, LDAP, expressões. A defesa é a mesma ideia em todos: separar dados de código.`,
  como: [
    `<b>SQL</b>: use queries parametrizadas ou o ORM; nunca concatene. Identificadores dinâmicos (nome de coluna para ordenação) devem vir de uma lista permitida. <b>NoSQL</b>: no MongoDB, um JSON como <code>{"$ne": null}</code> no lugar de uma senha vira operador; valide tipos. <b>Comando</b>: evite o shell; use APIs que recebem argumentos em lista (<code>execFile</code>).`,
    `<b>Template</b> (SSTI): nunca monte templates a partir de input. <b>Mass assignment</b> é parente próximo: aceitar o corpo inteiro da requisição num update permite enviar <code>"role": "admin"</code>. Valide a entrada com schemas (Zod, class-validator) e aceite só os campos esperados.`,
  ],
  conecta: [['backend/owasp', 'Injeção no OWASP Top 10.'], ['backend/orm', 'ORMs parametrizam por padrão.'], ['defesa-profundidade', 'Permissões mínimas no banco limitam o estrago.'], ['sast-dast', 'Ferramentas detectam padrões de injeção.']],
  front: `Validação com o mesmo schema (Zod) no front e no back é ótima para a experiência, mas a do servidor é a que conta. Formulários de edição de perfil são candidatos clássicos a mass assignment.`,
  ex: { lang: 'typescript', code: `import { z } from "zod";
import { execFile } from "node:child_process";

// mass assignment: aceite só o que é esperado
const AtualizarPerfil = z.object({ nome: z.string().max(80), bio: z.string().max(500) }).strict();
const dados = AtualizarPerfil.parse(req.body);   // "role": "admin" é rejeitado

// ordenação dinâmica: só colunas permitidas
const colunas = { data: "criado_em", total: "total" } as const;
const ordem = colunas[req.query.ordem as keyof typeof colunas] ?? "criado_em";

// comando: argumentos em lista, sem shell
execFile("convert", [entrada, "-resize", "200x200", saida]);` },
  docs: [['OWASP · Injection Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html'], ['OWASP · Mass Assignment Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html'], ['PortSwigger · SQL injection', 'https://portswigger.net/web-security/sql-injection']],
  perguntas: [`Onde o seu backend aceita o corpo inteiro da requisição num update?`, `Como ordenar por uma coluna escolhida pelo usuário sem abrir brecha?`, `Por que execFile é mais seguro que exec?`] },

{ id: 'upload-seguro', stage: 'aplicacao', level: 'importante', title: 'Uploads e arquivos', short: 'Uploads',
  resumo: `Aceitar arquivos de usuários sem abrir a porta para execução de código, XSS ou indisponibilidade.`,
  porque: `Upload é uma das funcionalidades mais exploradas: arquivos executáveis disfarçados, SVG com script, nomes que sobrescrevem arquivos do sistema e arquivos gigantes que derrubam o serviço.`,
  como: [
    `Valide o <b>tipo real</b> pelo conteúdo (magic bytes), não pela extensão nem pelo Content-Type do cliente; limite <b>tamanho</b>; gere o <b>nome</b> no servidor; guarde fora da raiz web, de preferência em object storage privado; e sirva com <code>Content-Type</code> correto, <code>Content-Disposition: attachment</code> quando for download e <code>X-Content-Type-Options: nosniff</code>.`,
    `Sirva arquivos de usuários a partir de um <b>domínio separado</b> (ex.: <code>usercontent.loja.com</code>), para que um SVG ou HTML malicioso não execute no domínio principal. Reprocesse imagens (redimensionar remove metadados e payloads), faça varredura antivírus quando o risco justificar e cuidado com arquivos compactados que expandem para gigabytes.`,
  ],
  conecta: [['devops/storage', 'Object storage e URLs pré-assinadas.'], ['xss-csp', 'SVG e HTML enviados podem conter script.'], ['headers-seguranca', 'nosniff e Content-Disposition.'], ['ssrf', 'Importar por URL tem riscos próprios.']],
  front: `O atributo <code>accept</code> do input de arquivo melhora a experiência, mas não é segurança. O front pode redimensionar imagens antes do envio para economizar banda, e o servidor ainda valida tudo.`,
  ex: { lang: 'typescript', code: `import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

const PERMITIDOS = new Set(["image/png", "image/jpeg", "image/webp"]);

async function processarAvatar(buffer: Buffer) {
  if (buffer.length > 5 * 1024 * 1024) throw new Error("Arquivo maior que 5 MB");
  const tipo = await fileTypeFromBuffer(buffer);          // magic bytes, não extensão
  if (!tipo || !PERMITIDOS.has(tipo.mime)) throw new Error("Formato não permitido");

  const limpa = await sharp(buffer).resize(256, 256).webp().toBuffer(); // remove metadados
  const chave = \`avatars/\${randomUUID()}.webp\`;             // nome gerado no servidor
  await storage.put(chave, limpa, { contentType: "image/webp" });
  return chave;
}` },
  docs: [['OWASP · File Upload Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html'], ['PortSwigger · File upload vulnerabilities', 'https://portswigger.net/web-security/file-upload'], ['Google · Hosting user content on a separate domain', 'https://security.googleblog.com/2012/08/content-hosting-for-modern-web.html']],
  perguntas: [`Como o seu sistema descobre o tipo real de um arquivo enviado?`, `Por que servir arquivos de usuários de outro domínio?`, `O que acontece se alguém enviar um SVG com script?`] },

{ id: 'headers-seguranca', stage: 'aplicacao', level: 'importante', title: 'Headers de segurança', short: 'Headers',
  resumo: `Configurações de resposta HTTP que ativam proteções do navegador.`,
  porque: `Com poucas linhas de configuração, o navegador passa a bloquear classes inteiras de ataque. É uma das melhorias de segurança com melhor custo-benefício, e normalmente fica entre o front e a infra.`,
  como: [
    `<b>Strict-Transport-Security</b> (HSTS): força HTTPS nas próximas visitas. <b>Content-Security-Policy</b>: controla scripts e outros recursos; <code>frame-ancestors</code> impede que o site seja embutido em iframes (contra clickjacking, substituindo o <code>X-Frame-Options</code>). <b>X-Content-Type-Options: nosniff</b>: impede o navegador de adivinhar tipos.`,
    `<b>Referrer-Policy</b> limita o que vaza na URL de origem; <b>Permissions-Policy</b> desliga APIs não usadas (câmera, geolocalização); <b>Cross-Origin-Opener-Policy</b> isola a janela de outras origens. Cookies com <code>Secure</code>, <code>HttpOnly</code>, <code>SameSite</code> e prefixo <code>__Host-</code> completam o conjunto.`,
  ],
  conecta: [['xss-csp', 'CSP é o header mais poderoso da lista.'], ['backend/https-tls', 'HSTS reforça o uso de HTTPS.'], ['upload-seguro', 'nosniff e Content-Disposition protegem downloads.'], ['devops/cdn-edge', 'Headers podem ser aplicados na CDN.']],
  front: `Ferramentas como securityheaders.com e o Mozilla Observatory dão uma nota ao seu site em segundos e mostram o que falta configurar.`,
  ex: { lang: 'http', code: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-r4nd0m'; frame-ancestors 'none'; object-src 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Set-Cookie: __Host-sessao=abc; Path=/; Secure; HttpOnly; SameSite=Lax` },
  docs: [['OWASP · HTTP Headers Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html'], ['MDN · HTTP Observatory', 'https://developer.mozilla.org/en-US/observatory'], ['securityheaders.com', 'https://securityheaders.com/']],
  perguntas: [`Que nota o seu site recebe no Mozilla Observatory?`, `Que ataque o frame-ancestors impede?`, `O que o HSTS com preload garante?`] },
]
