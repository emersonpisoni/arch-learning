import type { Topic } from '../../../types'

export const identidade: Topic[] = [
{ id: 'oauth-a-fundo', stage: 'identidade', level: 'essencial', title: 'OAuth 2.0 a fundo', short: 'OAuth 2.0',
  resumo: `Os papéis, os fluxos e os detalhes que separam uma integração segura de uma vulnerável.`,
  porque: `OAuth está em todo login social, integração com APIs de terceiros e acesso entre serviços. A maioria das falhas vem de escolher o fluxo errado ou pular um parâmetro de segurança.`,
  como: [
    `Papéis: <b>resource owner</b> (o usuário), <b>client</b> (o app), <b>authorization server</b> (emite tokens) e <b>resource server</b> (a API). No fluxo <b>Authorization Code com PKCE</b>, o app redireciona o usuário para o servidor de autorização, recebe um <b>code</b> de uso único no <code>redirect_uri</code> e o troca por tokens, provando com o <code>code_verifier</code> que foi ele quem iniciou o fluxo.`,
    `Detalhes que importam: o parâmetro <b>state</b> previne CSRF no retorno; <code>redirect_uri</code> deve ser exato, registrado previamente; <b>scopes</b> limitam o que o token pode fazer; o fluxo <b>Client Credentials</b> serve para comunicação entre máquinas. Os fluxos Implicit e Password estão obsoletos pelo OAuth 2.1.`,
  ],
  conecta: [['backend/autenticacao', 'A introdução a sessões, JWT e OAuth.'], ['oidc-sso', 'OIDC adiciona identidade ao OAuth.'], ['tokens-sessoes', 'O que fazer com os tokens recebidos.'], ['backend/gateway', 'Um BFF pode cuidar do fluxo no lugar do navegador.'], ['mobile/seguranca-mobile', 'PKCE e armazenamento seguro em apps.']],
  front: `Numa SPA, a recomendação atual é que um backend (BFF) faça o fluxo OAuth e guarde os tokens, deixando no navegador só um cookie de sessão HttpOnly.`,
  ex: { lang: 'http', code: `# 1. o app redireciona o usuário
GET https://auth.loja.com/authorize?response_type=code
    &client_id=web-loja&redirect_uri=https://loja.com/callback
    &scope=openid%20pedidos:read&state=x8Kq2&code_challenge=E9Mel...&code_challenge_method=S256

# 2. o usuário volta com um code de uso único
GET https://loja.com/callback?code=SplxlOB&state=x8Kq2     ← conferir o state!

# 3. o app troca o code por tokens, provando o code_verifier
POST https://auth.loja.com/token
grant_type=authorization_code&code=SplxlOB&redirect_uri=https://loja.com/callback
&client_id=web-loja&code_verifier=dBjftJeZ4CVP...` },
  docs: [['oauth.net · OAuth 2.0', 'https://oauth.net/2/'], ['OAuth 2.1 (draft)', 'https://oauth.net/2.1/'], ['RFC 9700 · OAuth 2.0 Security Best Current Practice', 'https://www.rfc-editor.org/rfc/rfc9700'], ['IETF · OAuth for Browser-Based Apps', 'https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/']],
  perguntas: [`Que ataque o parâmetro state previne?`, `Por que o redirect_uri precisa ser exato e registrado?`, `Qual fluxo usar para um serviço que chama outro, sem usuário envolvido?`] },

{ id: 'oidc-sso', stage: 'identidade', level: 'importante', title: 'OpenID Connect e SSO', short: 'OIDC e SSO',
  resumo: `Login único entre aplicações, construído sobre o OAuth.`,
  porque: `Empresas usam SSO para que funcionários entrem em todas as ferramentas com uma conta só, e produtos B2B precisam integrar com o provedor de identidade de cada cliente. É um tema frequente de integração entre times.`,
  como: [
    `O <b>OpenID Connect</b> adiciona ao OAuth o <b>ID token</b> (um JWT com quem é o usuário: <code>sub</code>, <code>email</code>, <code>iss</code>, <code>aud</code>, <code>exp</code>), o endpoint <b>userinfo</b> e a <b>descoberta</b> automática (<code>/.well-known/openid-configuration</code>). O cliente deve validar a assinatura e as claims do ID token.`,
    `<b>SSO</b>: o usuário autentica uma vez no <b>provedor de identidade</b> (IdP: Entra ID, Okta, Google Workspace, Keycloak) e as aplicações confiam nele. Em ambientes corporativos ainda existe o <b>SAML</b>, mais antigo e baseado em XML. O <b>SCIM</b> sincroniza a criação e a remoção de usuários entre o IdP e as aplicações.`,
  ],
  conecta: [['oauth-a-fundo', 'O OIDC é uma camada sobre o OAuth 2.0.'], ['tokens-sessoes', 'O ID token inicia a sessão da aplicação.'], ['mfa-passkeys', 'O IdP centraliza MFA.'], ['backend/autenticacao', 'Login social é OIDC.']],
  front: `O ID token serve para a aplicação saber quem logou; para chamar APIs, use o access token. Misturar os dois é um erro comum.`,
  ex: { lang: 'json', code: `// payload de um ID token (OIDC)
{
  "iss": "https://auth.loja.com",          // quem emitiu: precisa ser o IdP esperado
  "aud": "web-loja",                        // para quem: precisa ser o seu client_id
  "sub": "248289761001",                    // id estável do usuário
  "email": "ana@empresa.com",
  "email_verified": true,
  "iat": 1760540000,
  "exp": 1760543600,                        // validade
  "nonce": "n-0S6_WzA2Mj"                   // amarra o token à sua requisição
}` },
  docs: [['OpenID · How Connect works', 'https://openid.net/developers/how-connect-works/'], ['OpenID Connect Core', 'https://openid.net/specs/openid-connect-core-1_0.html'], ['Keycloak · Documentação', 'https://www.keycloak.org/documentation']],
  perguntas: [`Qual a diferença entre ID token e access token?`, `Que claims do ID token precisam ser validadas?`, `Para que serve o SCIM num produto B2B?`] },

{ id: 'mfa-passkeys', stage: 'identidade', level: 'importante', title: 'MFA e passkeys', short: 'MFA e passkeys',
  resumo: `Ir além da senha: segundo fator e autenticação resistente a phishing.`,
  porque: `Senhas vazam e são reutilizadas. MFA bloqueia a grande maioria dos ataques automatizados de tomada de conta, e passkeys eliminam o phishing de credenciais, além de melhorar a experiência.`,
  como: [
    `Fatores: algo que você <b>sabe</b> (senha), <b>tem</b> (celular, chave de segurança) ou <b>é</b> (biometria). Em ordem de força: SMS (vulnerável a SIM swap), <b>TOTP</b> (apps autenticadores), push com confirmação de número e chaves <b>FIDO2/WebAuthn</b>, as únicas resistentes a phishing.`,
    `<b>Passkeys</b> são credenciais WebAuthn sincronizadas entre dispositivos: o navegador cria um par de chaves por site, a privada nunca sai do dispositivo, e o login é uma assinatura de um desafio vinculado ao domínio, o que impede que um site falso a use. Planeje recuperação de conta com o mesmo cuidado, porque é por lá que os atacantes tentam entrar.`,
  ],
  conecta: [['backend/autenticacao', 'Completa o login com senha.'], ['criptografia', 'WebAuthn é baseado em assinaturas.'], ['oidc-sso', 'O IdP aplica MFA para todas as aplicações.'], ['devops/iam', 'MFA é obrigatório para acessos administrativos.']],
  front: `A API <code>navigator.credentials</code> do navegador é quem cria e usa passkeys. Bibliotecas como SimpleWebAuthn cuidam das partes delicadas no front e no back.`,
  ex: { lang: 'typescript', code: `// front: login com passkey (o desafio vem do servidor)
const opcoes = await fetch("/auth/passkey/opcoes").then((r) => r.json());

const credencial = await navigator.credentials.get({
  publicKey: {
    challenge: base64ParaBuffer(opcoes.challenge), // valor aleatório de uso único
    rpId: "loja.com",                              // vinculado ao domínio: anti-phishing
    userVerification: "preferred",
  },
});

await fetch("/auth/passkey/verificar", { method: "POST", body: serializar(credencial) });` },
  docs: [['passkeys.dev', 'https://passkeys.dev/'], ['MDN · Web Authentication API', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API'], ['OWASP · Multifactor Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html']],
  perguntas: [`Por que SMS é o fator mais fraco?`, `O que torna passkeys resistentes a phishing?`, `Como funciona a recuperação de conta no seu produto, e ela é mais fraca que o login?`] },

{ id: 'tokens-sessoes', stage: 'identidade', level: 'essencial', title: 'Ciclo de vida de tokens e sessões', short: 'Tokens e sessões',
  resumo: `Expiração, renovação, rotação, revogação e onde guardar cada credencial.`,
  porque: `A maior parte dos problemas de sessão aparece no dia a dia do front: logout que não desloga, token expirado no meio de uma operação, sessão que nunca expira. As decisões aqui são compartilhadas entre front e back.`,
  como: [
    `<b>Access tokens</b> curtos (minutos) limitam o estrago de um vazamento. <b>Refresh tokens</b> renovam a sessão e devem ter <b>rotação</b>: a cada uso, um novo é emitido e o antigo invalidado; reutilizar um antigo indica roubo e deve derrubar toda a cadeia. Sessões precisam de expiração por inatividade e absoluta.`,
    `Logout de verdade invalida a sessão no servidor (e o refresh token), não só apaga o cookie. Troque o id de sessão após o login (evita <b>session fixation</b>) e após mudanças de privilégio. No navegador, prefira cookies <code>HttpOnly</code>, <code>Secure</code> e <code>SameSite</code>; validar JWT exige checar assinatura, <code>exp</code>, <code>iss</code> e <code>aud</code>, e nunca aceitar <code>alg: none</code>.`,
  ],
  conecta: [['backend/autenticacao', 'Sessão e JWT: os fundamentos.'], ['frontend/storage-browser', 'Onde guardar credenciais no navegador.'], ['csrf-samesite', 'Cookies de sessão exigem proteção contra CSRF.'], ['oauth-a-fundo', 'De onde vêm os tokens.']],
  front: `Um interceptor que renova o token ao receber 401 precisa evitar várias renovações simultâneas: se dez requisições falharem ao mesmo tempo, só uma deve renovar e as outras esperam.`,
  ex: { lang: 'typescript', code: `// interceptor: uma única renovação para várias requisições que falharam
let renovando: Promise<void> | null = null;

async function comRenovacao(fazer: () => Promise<Response>) {
  let res = await fazer();
  if (res.status !== 401) return res;

  renovando ??= fetch("/auth/refresh", { method: "POST", credentials: "include" })
    .then((r) => { if (!r.ok) throw new Error("sessão expirada"); })
    .finally(() => { renovando = null; });

  await renovando;          // todas esperam a mesma renovação
  return fazer();           // e repetem uma vez
}` },
  docs: [['OWASP · Session Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html'], ['OWASP · JSON Web Token Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html'], ['Auth0 · Refresh token rotation', 'https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation']],
  perguntas: [`O logout do seu produto invalida a sessão no servidor?`, `O que a reutilização de um refresh token antigo indica?`, `Por que trocar o id de sessão depois do login?`] },

{ id: 'identidade-servicos', stage: 'identidade', level: 'aprofundar', title: 'Identidade entre serviços', short: 'Identidade de serviços',
  resumo: `Como serviços provam quem são uns para os outros, sem senhas espalhadas.`,
  porque: `Em sistemas com muitos serviços, "qualquer coisa dentro da rede pode chamar qualquer coisa" é um risco enorme. Cada serviço precisa de identidade própria e permissões próprias, como as pessoas.`,
  como: [
    `Opções: <b>mTLS</b> com certificados por serviço (comum com service mesh), <b>tokens de serviço</b> obtidos via OAuth Client Credentials, e <b>identidade de workload</b> da plataforma (roles de IAM associadas a pods ou funções, SPIFFE/SPIRE), que entrega credenciais temporárias sem nenhum segredo fixo.`,
    `Com identidade, dá para aplicar <b>autorização entre serviços</b> (o serviço de relatórios só lê pedidos, não cria) e auditar quem chamou o quê. Propague também a identidade do usuário final quando necessário, por exemplo com token exchange, para que o serviço de destino saiba em nome de quem a chamada é feita.`,
  ],
  conecta: [['zero-trust', 'Nenhuma chamada é confiável só por vir de dentro da rede.'], ['devops/service-mesh', 'O mesh automatiza mTLS entre serviços.'], ['devops/iam', 'Roles de workload na nuvem.'], ['certificados-pki', 'mTLS depende de uma CA interna.']],
  front: `Do lado do front, isso aparece no BFF: ele chama os serviços internos com uma identidade própria e repassa, de forma controlada, quem é o usuário.`,
  ex: { lang: 'texto', code: `[api-pedidos] ── mTLS (cert spiffe://loja/api-pedidos) ──> [api-pagamentos]
                                                          │ política: só api-pedidos
                                                          │ pode chamar POST /cobrancas
[relatorios]  ── mTLS (cert spiffe://loja/relatorios) ──> [api-pagamentos]
                                                          │ GET permitido, POST negado` },
  docs: [['SPIFFE · Conceitos', 'https://spiffe.io/docs/latest/spiffe-about/overview/'], ['AWS · IAM roles para service accounts (EKS)', 'https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html'], ['RFC 8693 · OAuth Token Exchange', 'https://www.rfc-editor.org/rfc/rfc8693']],
  perguntas: [`Como os serviços do seu sistema se autenticam entre si hoje?`, `Por que confiar em "qualquer chamada da rede interna" é arriscado?`, `Quando é preciso propagar a identidade do usuário entre serviços?`] },
]
