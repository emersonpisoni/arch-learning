import type { Topic } from '../../../types'

export const fundamentos: Topic[] = [
{ id: 'cia', stage: 'fundamentos', level: 'essencial', title: 'Confidencialidade, integridade e disponibilidade', short: 'Tríade CIA',
  resumo: `As três propriedades que a segurança tenta proteger.`,
  porque: `Toda discussão de segurança fica mais clara quando se pergunta qual propriedade está em risco. Um vazamento ataca a confidencialidade; um pedido com preço alterado, a integridade; um DDoS, a disponibilidade.`,
  como: [
    `<b>Confidencialidade</b>: só quem deve vê o dado (criptografia, controle de acesso). <b>Integridade</b>: o dado não é alterado sem autorização (assinaturas, hashes, validação no servidor, logs imutáveis). <b>Disponibilidade</b>: o sistema funciona quando precisa (redundância, proteção contra DDoS, backups).`,
    `Costuma-se acrescentar <b>autenticidade</b> (saber quem fez algo) e <b>não repúdio</b> (quem fez não pode negar). Segurança é gestão de <b>risco</b>: probabilidade × impacto, priorizando onde o estrago seria maior.`,
  ],
  conecta: [['threat-modeling', 'Ameaças são classificadas pela propriedade que atacam.'], ['criptografia', 'Ferramenta central para confidencialidade e integridade.'], ['waf-ddos', 'Defesa da disponibilidade.'], ['backend/owasp', 'Vulnerabilidades comuns e o que cada uma ataca.']],
  front: `Validar no front protege a experiência, não a integridade: qualquer valor pode ser alterado antes de chegar ao servidor.`,
  ex: { lang: 'texto', code: `Incidente                                    Propriedade atacada
───────────────────────────────────────────  ───────────────────
base de clientes publicada num fórum          Confidencialidade
preço alterado na requisição do checkout      Integridade
site fora do ar por um ataque DDoS            Disponibilidade
ransomware criptografa o banco                Disponibilidade (e integridade)` },
  docs: [['NIST · Glossário: CIA triad', 'https://csrc.nist.gov/glossary/term/cia_triad'], ['OWASP · Security by design principles', 'https://owasp.org/www-project-developer-guide/draft/foundations/security_principles/'], ['Cloudflare · O que é segurança da informação', 'https://www.cloudflare.com/learning/security/what-is-information-security/']],
  perguntas: [`Qual das três propriedades é mais crítica no seu produto?`, `Que validação do front alguém poderia contornar?`, `Como o ransomware afeta mais de uma propriedade?`] },

{ id: 'threat-modeling', stage: 'fundamentos', level: 'essencial', title: 'Modelagem de ameaças', short: 'Threat modeling',
  resumo: `Pensar como um atacante antes de construir, de forma estruturada.`,
  porque: `É muito mais barato corrigir um problema de segurança no desenho do que em produção. Threat modeling dá ao time um método simples para fazer as perguntas certas, inclusive quem é de front.`,
  como: [
    `Quatro perguntas guiam o processo: <b>o que estamos construindo?</b> (diagrama de fluxo de dados com <b>fronteiras de confiança</b>), <b>o que pode dar errado?</b>, <b>o que vamos fazer a respeito?</b> e <b>fizemos um bom trabalho?</b>.`,
    `O <b>STRIDE</b> ajuda a lembrar categorias de ameaça: <b>S</b>poofing (falsificar identidade), <b>T</b>ampering (alterar dados), <b>R</b>epudiation (negar ações), <b>I</b>nformation disclosure (vazar dados), <b>D</b>enial of service (indisponibilidade) e <b>E</b>levation of privilege (ganhar permissões). Faça em sessões curtas, com o time, a cada funcionalidade relevante.`,
  ],
  conecta: [['cia', 'Cada ameaça ataca uma propriedade.'], ['defesa-profundidade', 'As mitigações formam camadas.'], ['arquitetura/c4', 'Diagramas são o ponto de partida.'], ['arquitetura/design-docs', 'A análise de ameaças pode ser uma seção do design doc.']],
  front: `Toda entrada que vem do navegador cruza uma fronteira de confiança. Num threat model, o front é sempre considerado território do usuário, e do atacante.`,
  ex: { lang: 'texto', code: `Funcionalidade: upload de avatar
Fluxo: [Navegador] ─(fronteira)─> [API] ─> [Bucket] ─> [CDN]

S  alguém sobe avatar em nome de outro          → autorização por usuário na API
T  arquivo trocado depois do upload             → chave do objeto gerada pelo servidor
R  "não fui eu que subi essa imagem"            → log de auditoria do upload
I  avatar privado acessível por URL previsível  → nomes aleatórios, bucket privado
D  upload de 5 GB derruba o serviço             → limite de tamanho na URL assinada
E  SVG com script executado no domínio          → servir de outro domínio, Content-Type fixo` },
  docs: [['OWASP · Threat Modeling', 'https://owasp.org/www-community/Threat_Modeling'], ['Threat Modeling Manifesto', 'https://www.threatmodelingmanifesto.org/'], ['Microsoft · STRIDE', 'https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats']],
  perguntas: [`Onde estão as fronteiras de confiança do sistema em que você trabalha?`, `Qual letra do STRIDE preocupa mais no seu produto?`, `Que funcionalidade recente teria se beneficiado de um threat model?`] },

{ id: 'defesa-profundidade', stage: 'fundamentos', level: 'essencial', title: 'Defesa em profundidade e menor privilégio', short: 'Defesa em camadas',
  resumo: `Várias camadas independentes e o mínimo de permissão em cada uma.`,
  porque: `Nenhum controle é perfeito. Quando uma camada falha (e alguma vai falhar), outras devem conter o estrago. Muitos incidentes graves aconteceram porque uma única falha dava acesso a tudo.`,
  como: [
    `<b>Defesa em profundidade</b>: WAF, validação na API, queries parametrizadas, permissões mínimas no banco, rede privada, criptografia em repouso e monitoramento. Cada camada pega o que a anterior deixou passar.`,
    `<b>Menor privilégio</b>: cada pessoa, serviço e credencial com só o necessário, pelo tempo necessário. Princípios relacionados: <b>falhar de forma segura</b> (negar por padrão), <b>separação de funções</b>, <b>reduzir a superfície de ataque</b> (desligar o que não é usado) e não confiar em <b>segurança por obscuridade</b>.`,
  ],
  conecta: [['zero-trust', 'Levar o menor privilégio até a rede.'], ['devops/iam', 'Menor privilégio aplicado à nuvem.'], ['threat-modeling', 'Ameaças mostram onde precisam existir camadas.'], ['hardening', 'Reduzir a superfície de ataque.']],
  front: `CSP, sanitização e cookies HttpOnly são camadas diferentes contra o mesmo XSS. Se uma falhar, as outras limitam o estrago.`,
  ex: { lang: 'texto', code: `Ataque: SQL injection num campo de busca
  camada 1  WAF bloqueia padrões conhecidos             (pode ser contornado)
  camada 2  validação de entrada na API                 (pode ter brecha)
  camada 3  query parametrizada                         (impede a injeção)
  camada 4  usuário do banco só com SELECT nas tabelas  (limita o estrago)
  camada 5  alerta de volume anormal de leitura         (detecta o ataque)` },
  docs: [['OWASP · Security principles', 'https://owasp.org/www-project-developer-guide/draft/foundations/security_principles/'], ['NIST · Least privilege', 'https://csrc.nist.gov/glossary/term/least_privilege'], ['CISA · Secure by Design', 'https://www.cisa.gov/securebydesign']],
  perguntas: [`Que credencial do seu sistema tem mais permissão do que precisa?`, `Se uma camada da sua aplicação falhar, o que segura o ataque?`, `Por que segurança por obscuridade não basta?`] },

{ id: 'criptografia', stage: 'fundamentos', level: 'essencial', title: 'Criptografia na prática', short: 'Criptografia',
  resumo: `Simétrica, assimétrica, hash, assinatura e HMAC: o que cada uma resolve.`,
  porque: `Criptografia aparece em TLS, senhas, tokens, webhooks e dados em repouso. O erro comum não é quebrar algoritmos, é usar a ferramenta errada ou inventar a própria.`,
  como: [
    `<b>Simétrica</b> (AES-GCM, ChaCha20): mesma chave para cifrar e decifrar; rápida, usada para dados. <b>Assimétrica</b> (RSA, ECC): par de chaves pública e privada, usada para troca de chaves e <b>assinaturas digitais</b> (provar autoria e integridade). <b>Hash</b> (SHA-256): impressão digital de mão única; para senhas, use algoritmos lentos (Argon2id).`,
    `<b>HMAC</b> combina hash e chave secreta para provar que uma mensagem veio de quem conhece a chave (webhooks, tokens). Regras: nunca crie seu próprio algoritmo, use bibliotecas consagradas, gere aleatoriedade com APIs criptográficas (<code>crypto.getRandomValues</code>, <code>crypto.randomUUID</code>), compare segredos em tempo constante e guarde chaves num KMS.`,
  ],
  conecta: [['backend/https-tls', 'TLS combina criptografia assimétrica e simétrica.'], ['backend/segredos', 'Hash de senhas e guarda de segredos.'], ['certificados-pki', 'Assinaturas digitais sustentam a PKI.'], ['tokens-sessoes', 'JWTs são assinados.']],
  front: `A Web Crypto API (<code>crypto.subtle</code>) existe no navegador, mas criptografar no front raramente protege algo: quem controla a página controla a chave. Use para casos específicos, como criptografia de ponta a ponta.`,
  ex: { lang: 'typescript', code: `import { createHmac, timingSafeEqual } from "node:crypto";

// verificar a assinatura de um webhook (HMAC-SHA256)
function webhookValido(corpo: string, assinatura: string, segredo: string) {
  const esperado = createHmac("sha256", segredo).update(corpo).digest("hex");
  const a = Buffer.from(esperado);
  const b = Buffer.from(assinatura);
  return a.length === b.length && timingSafeEqual(a, b); // comparação em tempo constante
}` },
  docs: [['OWASP · Cryptographic Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html'], ['MDN · Web Crypto API', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API'], ['Cloudflare · O que é criptografia', 'https://www.cloudflare.com/learning/ssl/what-is-encryption/']],
  perguntas: [`Qual a diferença entre cifrar e fazer hash?`, `Como verificar que um webhook veio mesmo do provedor?`, `Por que Math.random() não serve para gerar tokens?`] },

{ id: 'certificados-pki', stage: 'fundamentos', level: 'importante', title: 'Certificados e PKI', short: 'PKI',
  resumo: `A cadeia de confiança que permite saber que uma chave pública pertence a quem diz.`,
  porque: `Certificados expirados derrubam serviços inteiros, e erros de cadeia aparecem só em alguns clientes. Entender a PKI ajuda a diagnosticar esses problemas e a usar mTLS entre serviços.`,
  como: [
    `Uma <b>autoridade certificadora</b> (CA) assina certificados que ligam um nome (domínio) a uma chave pública. Navegadores e sistemas confiam num conjunto de <b>CAs raiz</b>; servidores apresentam a <b>cadeia</b> completa (certificado + intermediárias) até uma raiz confiável. A revogação usa OCSP e CRLs, com limitações conhecidas.`,
    `<b>Certificate Transparency</b> registra publicamente todos os certificados emitidos, o que permite detectar certificados indevidos para o seu domínio. Automatize renovação (ACME, cert-manager) e monitore datas de expiração. Para mTLS interno, use uma <b>CA privada</b>.`,
  ],
  conecta: [['backend/https-tls', 'Certificados são o que o TLS valida.'], ['criptografia', 'A PKI se baseia em assinaturas digitais.'], ['identidade-servicos', 'mTLS usa certificados para identificar serviços.'], ['devops/k8s-config', 'cert-manager automatiza certificados no Kubernetes.']],
  front: `Erros de certificado que aparecem só em celulares antigos costumam ser cadeia incompleta no servidor ou uma CA raiz nova que esses aparelhos não conhecem.`,
  ex: { lang: 'bash', code: `# ver a cadeia que o servidor apresenta
openssl s_client -connect api.loja.com:443 -servername api.loja.com -showcerts </dev/null

# certificados emitidos para o seu domínio (Certificate Transparency)
# https://crt.sh/?q=loja.com

# dias até expirar
echo | openssl s_client -connect api.loja.com:443 2>/dev/null | openssl x509 -noout -enddate` },
  docs: [['Let\'s Encrypt · Chain of trust', 'https://letsencrypt.org/certificates/'], ['Certificate Transparency', 'https://certificate.transparency.dev/'], ['cert-manager', 'https://cert-manager.io/docs/']],
  perguntas: [`Como o seu time descobre que um certificado está para expirar?`, `Por que um servidor precisa enviar os certificados intermediários?`, `Para que serve a Certificate Transparency?`] },
]
