import type { Topic } from '../../../types'

export const seguranca: Topic[] = [
{ id: 'autenticacao', stage: 'seguranca', level: 'essencial', title: 'Autenticação', short: 'Autenticação',
  resumo: `Provar quem é o usuário: sessões, JWT, OAuth 2.0 e OpenID Connect.`,
  porque: `É onde front e back mais se cruzam: login, refresh de token, logout, SSO. Erros aqui viram vulnerabilidades graves.`,
  como: [
    `<b>Sessão</b>: após o login, o servidor guarda a sessão (em memória, Redis ou banco) e envia um cookie com o id dela. É simples e fácil de revogar. <b>JWT</b>: token assinado que carrega dados (claims) e é validado sem consultar o banco. Como é difícil revogar antes de expirar, usa-se vida curta e um <b>refresh token</b>.`,
    `<b>OAuth 2.0</b> é delegação de acesso ("permitir que este app leia seu Google Drive"). <b>OpenID Connect</b> adiciona identidade por cima ("entrar com Google"). Para SPAs, o fluxo recomendado é <b>Authorization Code com PKCE</b>. Keycloak, Auth0, Cognito e Entra ID implementam tudo isso.`,
  ],
  conecta: [['autorizacao', 'Depois de saber quem é, decide-se o que pode fazer.'], ['segredos', 'Senhas exigem hash; chaves de assinatura são segredos.'], ['https-tls', 'Tokens só são seguros num canal cifrado.'], ['cors', 'Cookies entre domínios dependem da configuração de CORS.'], ['gateway', 'O gateway ou BFF pode validar o token uma vez para todos.']],
  front: `Onde guardar o token? Um cookie <code>HttpOnly</code> + <code>Secure</code> + <code>SameSite</code> impede que um XSS leia o token; o <code>localStorage</code> é acessível por qualquer script na página. Essa escolha é feita junto com o backend.`,
  ex: { lang: 'texto', code: `JWT = header.payload.assinatura   (cada parte em base64url)

header:  { "alg": "RS256", "typ": "JWT" }
payload: { "sub": "user_7", "roles": ["admin"], "exp": 1760550000 }

Cookie de sessão:
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/` },
  docs: [['OWASP · Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'], ['jwt.io · Introdução ao JWT', 'https://jwt.io/introduction'], ['oauth.net · OAuth 2.0', 'https://oauth.net/2/'], ['OpenID · Como o OIDC funciona', 'https://openid.net/developers/how-connect-works/']],
  perguntas: [`Qual a vantagem da sessão sobre o JWT na hora do logout?`, `Para que serve o refresh token?`, `Por que o PKCE é necessário em SPAs?`] },

{ id: 'autorizacao', stage: 'seguranca', level: 'essencial', title: 'Autorização', short: 'Autorização',
  resumo: `Decidir o que um usuário autenticado pode fazer.`,
  porque: `Falhas de controle de acesso estão no topo do OWASP Top 10. Esconder o botão no front não protege nada: quem decide é o backend.`,
  como: [
    `<b>RBAC</b>: permissões por papel (admin, editor, leitor). <b>ABAC</b>: regras por atributos (só edita pedidos da própria loja, em horário comercial). <b>ReBAC</b>: por relações (quem compartilhou o documento com quem), como no Google Drive.`,
    `Toda rota precisa checar a <b>autenticação</b> e a <b>autorização sobre aquele recurso específico</b>. O erro clássico é o <b>IDOR</b>: <code>GET /pedidos/982</code> devolve o pedido de outro cliente porque só se verificou que o usuário estava logado.`,
  ],
  conecta: [['autenticacao', 'Primeiro se identifica o usuário, depois se autoriza.'], ['owasp', 'Controle de acesso quebrado é a falha número 1.'], ['gateway', 'Regras grossas podem ficar no gateway.'], ['camadas', 'A checagem fina fica no service, perto da regra.']],
  front: `O front usa permissões para esconder ações e melhorar a experiência, mas a API sempre verifica de novo. Um endpoint como <code>/me/permissoes</code> evita duplicar regras na interface.`,
  ex: { lang: 'typescript', code: `// verificar o dono do recurso, não só o login
app.get("/pedidos/:id", autenticar, async (req, res) => {
  const pedido = await repo.buscar(req.params.id);
  if (!pedido) return res.sendStatus(404);

  const dono = pedido.clienteId === req.user.id;
  if (!dono && !req.user.roles.includes("admin")) {
    return res.sendStatus(404); // 404 para não revelar que o pedido existe
  }
  res.json(pedido);
});` },
  docs: [['OWASP · Authorization Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'], ['OWASP · API Security Top 10', 'https://owasp.org/API-Security/'], ['OpenFGA · Conceitos de ReBAC', 'https://openfga.dev/docs/concepts']],
  perguntas: [`O que é IDOR e como evitar?`, `Quando RBAC não é suficiente?`, `Por que às vezes responder 404 em vez de 403?`] },

{ id: 'cors', stage: 'seguranca', level: 'essencial', title: 'CORS', short: 'CORS',
  resumo: `A regra do navegador que decide se uma página pode ler a resposta de outra origem.`,
  porque: `É o erro de integração mais famoso entre front e back. Entender CORS evita sair colocando <code>Access-Control-Allow-Origin: *</code> em tudo achando que resolveu.`,
  como: [
    `A <b>Same-Origin Policy</b> impede que um script de <code>app.loja.com</code> leia respostas de <code>api.loja.com</code> (origem = protocolo + domínio + porta). <b>CORS</b> é o servidor dizendo, por headers, quais origens podem ler suas respostas.`,
    `Requisições "não simples" (PUT, DELETE, JSON, headers customizados) disparam antes um <b>preflight</b> <code>OPTIONS</code>. Com cookies (<code>credentials: "include"</code>), o servidor precisa devolver a origem exata e <code>Access-Control-Allow-Credentials: true</code>, e o curinga <code>*</code> não é aceito. Quem aplica o CORS é o navegador: curl e outros servidores ignoram, então não é proteção do backend.`,
  ],
  conecta: [['http', 'CORS é feito de headers HTTP.'], ['autenticacao', 'Cookies entre origens exigem credentials e SameSite.'], ['gateway', 'Um BFF na mesma origem elimina o CORS.'], ['owasp', 'CSRF explora justamente requisições entre origens.']],
  front: `Em desenvolvimento, o proxy do Vite ou do Next faz a chamada parecer da mesma origem. Em produção, servir front e API no mesmo domínio (ex.: <code>/api</code> via proxy reverso) também elimina o CORS.`,
  ex: { lang: 'http', code: `OPTIONS /pedidos HTTP/1.1
Origin: https://app.loja.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.loja.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: content-type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600` },
  docs: [['MDN · CORS', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'], ['MDN · Same-origin policy', 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy'], ['web.dev · Cross-Origin Resource Sharing', 'https://web.dev/articles/cross-origin-resource-sharing']],
  perguntas: [`Por que o curl funciona e o navegador dá erro de CORS?`, `O que dispara um preflight?`, `Por que o curinga * não funciona com cookies?`] },

{ id: 'owasp', stage: 'seguranca', level: 'essencial', title: 'OWASP e vulnerabilidades comuns', short: 'OWASP',
  resumo: `As falhas de segurança mais exploradas em aplicações web e como evitá-las.`,
  porque: `Segurança é responsabilidade de todo dev. O OWASP Top 10 é a referência que auditorias, pentests e times de segurança usam.`,
  como: [
    `As principais: <b>controle de acesso quebrado</b> (IDOR); <b>injeção</b> (SQL injection ao concatenar input na query, resolvida com parâmetros); <b>XSS</b> (script injetado na página, evitado escapando a saída e com CSP); <b>CSRF</b> (um site malicioso dispara uma ação usando o cookie do usuário, evitado com SameSite e tokens); <b>SSRF</b> (o servidor é induzido a acessar URLs internas); configuração insegura e dependências vulneráveis.`,
    `Regras de ouro: nunca confie no input (valide no servidor), dê o mínimo de privilégio, não exponha stack traces, mantenha dependências atualizadas (Dependabot, <code>npm audit</code>) e registre eventos de segurança.`,
  ],
  conecta: [['autorizacao', 'Controle de acesso quebrado lidera a lista.'], ['autenticacao', 'Falhas de autenticação e de sessão.'], ['cors', 'CSRF e políticas de origem andam juntos.'], ['segredos', 'Credenciais expostas e criptografia fraca.'], ['rate-limit', 'Defesa contra força bruta e abuso.']],
  front: `XSS e CSRF são vulnerabilidades em que front e back dividem a defesa. O React escapa por padrão, mas <code>dangerouslySetInnerHTML</code> e URLs <code>javascript:</code> reabrem a porta.`,
  ex: { lang: 'typescript', code: `// VULNERÁVEL: input concatenado na query
db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'");
// com email = ' OR '1'='1  a query devolve todos os usuários

// SEGURO: query parametrizada
db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);` },
  docs: [['OWASP · Top 10', 'https://owasp.org/www-project-top-ten/'], ['OWASP · Cheat Sheet Series', 'https://cheatsheetseries.owasp.org/'], ['PortSwigger · Web Security Academy (labs gratuitos)', 'https://portswigger.net/web-security']],
  perguntas: [`Como uma query parametrizada impede SQL injection?`, `Qual a diferença entre XSS e CSRF?`, `O que é SSRF e por que é tão perigoso na nuvem?`] },

{ id: 'segredos', stage: 'seguranca', level: 'importante', title: 'Senhas e segredos', short: 'Segredos',
  resumo: `Guardar senhas de usuários com hash e manter as credenciais do sistema fora do código.`,
  porque: `Vazamentos de banco acontecem; se as senhas tiverem hash forte, o estrago é muito menor. Chaves de API commitadas no git estão entre as causas mais comuns de incidentes.`,
  como: [
    `Senhas de usuário nunca são guardadas, nem criptografadas: guarda-se um <b>hash lento com salt</b> (<b>Argon2id</b>, bcrypt ou scrypt). Hash rápido como SHA-256 não serve, porque permite bilhões de tentativas por segundo.`,
    `Segredos da aplicação (senha do banco, chaves de API) vêm de <b>variáveis de ambiente</b> ou de um <b>cofre</b> (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault), com rotação periódica. Arquivos <code>.env</code> ficam fora do git, e ferramentas como gitleaks bloqueiam commits com segredos.`,
  ],
  conecta: [['autenticacao', 'O login compara a senha com o hash guardado.'], ['owasp', 'Credenciais expostas e criptografia fraca estão no Top 10.'], ['cicd', 'O pipeline injeta segredos sem expô-los nos logs.'], ['docker', 'Segredos não devem ficar dentro da imagem.']],
  front: `Tudo que vai no bundle do front é público, incluindo variáveis <code>VITE_*</code> e <code>NEXT_PUBLIC_*</code>. Uma chave secreta de API precisa ficar no backend ou no BFF.`,
  ex: { lang: 'typescript', code: `import argon2 from "argon2";

// cadastro: o hash já inclui salt e parâmetros
const hash = await argon2.hash(senha);
await repo.salvarUsuario({ email, hash });

// login
const ok = await argon2.verify(usuario.hash, senhaDigitada);` },
  docs: [['OWASP · Password Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'], ['OWASP · Secrets Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'], ['The Twelve-Factor App · Config', 'https://12factor.net/config']],
  perguntas: [`Por que um hash rápido é ruim para senhas?`, `Para que serve o salt?`, `Uma variável VITE_API_KEY é secreta?`] },
]
