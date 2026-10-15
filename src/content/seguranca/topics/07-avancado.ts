import type { Topic } from '../../../types'

export const avancado: Topic[] = [
{ id: 'gestao-chaves', stage: 'avancado', level: 'importante', title: 'Gestão de chaves: KMS e envelope encryption', short: 'KMS',
  resumo: `Criptografar dados em escala sem que as chaves virem o elo fraco.`,
  porque: `Criptografar é fácil; difícil é proteger, rotacionar e auditar as chaves. Um vazamento de chave anula toda a criptografia, e leis e clientes exigem dados sensíveis cifrados com chaves bem controladas.`,
  como: [
    `Um <b>KMS</b> (AWS KMS, Google Cloud KMS, Azure Key Vault, HashiCorp Vault) guarda as chaves mestras em hardware protegido (HSM), sem nunca expô-las, e registra cada uso. Na <b>envelope encryption</b>, cada dado (ou arquivo) é cifrado com uma <b>chave de dados</b> própria, e essa chave é cifrada pela chave mestra do KMS e guardada junto do dado.`,
    `Vantagens: dados grandes cifrados localmente com rapidez, rotação da chave mestra sem recriptografar tudo, apagamento criptográfico (destruir a chave torna os dados ilegíveis) e permissões finas sobre quem pode decifrar. Criptografia em nível de campo protege colunas sensíveis mesmo de quem tem acesso ao banco.`,
  ],
  conecta: [['criptografia', 'Os fundamentos de criptografia simétrica e assimétrica.'], ['backend/segredos', 'Segredos e chaves fora do código.'], ['dados/retencao-anonimizacao', 'Apagamento criptográfico para exclusão.'], ['devops/iam', 'Permissões para usar cada chave.']],
  front: `Nada de chaves de criptografia no front: se o navegador precisa de dados sensíveis, a API decifra no servidor, aplica autorização e devolve só o necessário.`,
  ex: { lang: 'texto', code: `Envelope encryption de um documento
1. app pede ao KMS uma chave de dados → recebe {chave em claro, chave cifrada}
2. cifra o documento localmente (AES-GCM) com a chave em claro
3. descarta a chave em claro; guarda: documento cifrado + chave cifrada
Para ler:
4. envia a chave cifrada ao KMS (com permissão) → recebe a chave em claro
5. decifra o documento localmente
A chave mestra nunca sai do KMS; todo uso fica registrado na auditoria.` },
  docs: [['AWS · Envelope encryption', 'https://docs.aws.amazon.com/kms/latest/developerguide/kms-cryptography.html#enveloping'], ['Google Cloud · Envelope encryption', 'https://cloud.google.com/kms/docs/envelope-encryption'], ['OWASP · Key Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html']],
  perguntas: [`Que dados do seu sistema mereceriam criptografia em nível de campo?`, `Por que cifrar cada dado com uma chave própria?`, `O que é apagamento criptográfico?`] },

{ id: 'prototype-pollution', stage: 'avancado', level: 'aprofundar', title: 'Prototype pollution e deserialização insegura', short: 'Prototype pollution',
  resumo: `Vulnerabilidades que exploram como objetos são criados a partir de dados externos.`,
  porque: `Em JavaScript, mesclar um JSON recebido num objeto pode alterar o protótipo de todos os objetos da aplicação. Em outras linguagens, deserializar dados não confiáveis pode executar código. São falhas sutis, comuns em bibliotecas e graves.`,
  como: [
    `<b>Prototype pollution</b>: funções que fazem merge profundo ou atribuem caminhos dinâmicos (<code>obj[chave1][chave2] = valor</code>) com dados do usuário permitem chaves como <code>__proto__</code> ou <code>constructor.prototype</code>, adicionando propriedades a todos os objetos. Isso pode burlar verificações (<code>if (user.isAdmin)</code>) ou levar a XSS e execução remota em certos frameworks.`,
    `Defesas: validar a entrada com schema e aceitar só campos esperados, usar <code>Object.create(null)</code> ou <code>Map</code> para dicionários com chaves externas, bloquear <code>__proto__</code>, <code>constructor</code> e <code>prototype</code>, manter bibliotecas atualizadas e congelar protótipos em casos críticos. <b>Deserialização insegura</b> (pickle, Java serialization, YAML com tipos) segue a mesma regra: nunca deserializar formatos que instanciam objetos a partir de dados não confiáveis; prefira JSON com validação.`,
  ],
  conecta: [['injecoes', 'Mais uma forma de dados virarem comportamento.'], ['dependencias', 'Muitas ocorrências vêm de bibliotecas.'], ['xss-csp', 'Prototype pollution pode levar a XSS.'], ['backend/owasp', 'Integridade de dados e software no OWASP Top 10.']],
  front: `Funções de merge profundo de configurações ou de estado a partir de query strings e JSON externos, no próprio front, também podem sofrer prototype pollution.`,
  ex: { lang: 'typescript', code: `// vulnerável: merge profundo com dados do usuário
function merge(destino: any, origem: any) {
  for (const k in origem) {
    if (typeof origem[k] === "object") merge(destino[k] ??= {}, origem[k]);
    else destino[k] = origem[k];
  }
}
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
({} as any).isAdmin; // true: TODOS os objetos agora têm isAdmin!

// defesas
const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);
const dicionario = new Map<string, string>();      // chaves externas em Map
const Preferencias = z.object({ tema: z.enum(["claro", "escuro"]) }).strict(); // só o esperado` },
  docs: [['PortSwigger · Prototype pollution', 'https://portswigger.net/web-security/prototype-pollution'], ['OWASP · Prototype Pollution Prevention', 'https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html'], ['OWASP · Deserialization Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html']],
  perguntas: [`Onde o seu código faz merge profundo de dados vindos de fora?`, `Por que um Map é mais seguro que um objeto para chaves externas?`, `Que formatos de serialização nunca devem receber dados não confiáveis?`] },

{ id: 'logica-negocio', stage: 'avancado', level: 'importante', title: 'Falhas de lógica de negócio', short: 'Lógica de negócio',
  resumo: `Vulnerabilidades que nenhum scanner encontra: o sistema faz exatamente o que foi programado, e é isso o problema.`,
  porque: `Cupom aplicado duas vezes, quantidade negativa no carrinho, pular a etapa de pagamento, transferir com saldo insuficiente usando requisições simultâneas: são falhas caras e que dependem de entender o negócio, inclusive o fluxo que o front conduz.`,
  como: [
    `Padrões comuns: <b>confiar no cliente</b> para preço, quantidade ou etapa do fluxo; <b>valores fora do domínio</b> (negativos, zero, enormes, decimais onde se espera inteiro); <b>pular etapas</b> chamando a API final diretamente; <b>race conditions</b> em limites (usar o mesmo saldo ou cupom em requisições paralelas); e regras aplicadas só na interface.`,
    `Defesas: o servidor recalcula tudo e valida o estado do fluxo (uma máquina de estados explícita), limites de domínio em cada campo, operações atômicas e idempotência em ações com dinheiro ou limites, testes de casos abusivos e threat modeling focado em "como alguém poderia lucrar com isso?".`,
  ],
  conecta: [['backend/race', 'Requisições paralelas contra limites.'], ['arquitetura/case-checkout', 'O checkout é o alvo clássico.'], ['threat-modeling', 'Pensar como quem quer abusar.'], ['pentest-bug-bounty', 'Testadores humanos encontram essas falhas.']],
  front: `Desabilitar o botão "aplicar cupom" depois do primeiro uso melhora a experiência, mas a regra de uso único precisa estar no servidor, com uma operação atômica.`,
  ex: { lang: 'sql', code: `-- vulnerável: verificar e depois usar (duas requisições paralelas passam)
-- SELECT usado FROM cupons WHERE codigo = 'BEMVINDO10';   → false, false
-- UPDATE cupons SET usado = true ...                       → aplicado duas vezes

-- seguro: verificar e marcar numa operação atômica
UPDATE cupons
   SET usado = true, pedido_id = $2
 WHERE codigo = $1 AND usado = false AND expira_em > now()
RETURNING desconto_cents;          -- nenhuma linha = cupom inválido ou já usado` },
  docs: [['PortSwigger · Business logic vulnerabilities', 'https://portswigger.net/web-security/logic-flaws'], ['OWASP · Business Logic Abuse', 'https://owasp.org/www-project-top-10-for-business-logic-abuse/'], ['PortSwigger · Race conditions', 'https://portswigger.net/web-security/race-conditions']],
  perguntas: [`Que regra de negócio do seu produto é verificada só na interface?`, `Como alguém poderia lucrar abusando de um fluxo do seu produto?`, `Por que verificar e depois atualizar é perigoso em limites como cupons?`] },

{ id: 'fraude-abuso', stage: 'avancado', level: 'aprofundar', title: 'Fraude e abuso de plataforma', short: 'Fraude',
  resumo: `Contas falsas, uso de cartões roubados, spam e abuso de promoções em escala.`,
  porque: `Todo produto que dá algo de valor (crédito grátis, cupom, envio de mensagens, computação) atrai abuso automatizado. Fraude custa dinheiro diretamente e pode bloquear a empresa junto a processadores de pagamento.`,
  como: [
    `Sinais de risco: velocidade (muitas contas ou tentativas num curto período), reputação de IP e dispositivo, e-mails descartáveis, divergência entre país do cartão e do IP, padrões de comportamento automatizado. Defesas em camadas: rate limiting, desafios de bot, verificação progressiva (exigir mais quando o risco sobe), regras e modelos de risco, e revisão manual para casos ambíguos.`,
    `Em pagamentos: <b>3-D Secure</b>, ferramentas de risco do processador (Stripe Radar e similares) e monitoramento de chargebacks. Equilibre o atrito: barreiras demais afastam clientes legítimos. Fraude é adversarial; regras precisam evoluir com base nos dados.`,
  ],
  conecta: [['waf-ddos', 'Gestão de bots na borda.'], ['backend/rate-limit', 'Limites de velocidade.'], ['logica-negocio', 'Abuso de regras de promoção.'], ['mfa-passkeys', 'Verificação progressiva de identidade.']],
  front: `O front contribui com sinais (dispositivo, comportamento) e com a experiência de verificação; desafios devem aparecer só quando o risco justifica, para não penalizar todos.`,
  ex: { lang: 'texto', code: `Pontuação de risco no cadastro com cupom de boas-vindas (exemplo)
+30  e-mail de domínio descartável
+25  5 contas criadas do mesmo dispositivo hoje
+20  IP de data center ou proxy anônimo
+10  país do IP diferente do país do telefone
───
 85  → exigir verificação por SMS antes de liberar o cupom
>95  → bloquear e enviar para revisão manual
<40  → fluxo normal, sem atrito` },
  docs: [['OWASP · Automated Threats to Web Applications', 'https://owasp.org/www-project-automated-threats-to-web-applications/'], ['Stripe · Radar', 'https://docs.stripe.com/radar'], ['EMVCo · 3-D Secure', 'https://www.emvco.com/emv-technologies/3-d-secure/']],
  perguntas: [`Que recurso de valor do seu produto atrai abuso automatizado?`, `Como equilibrar segurança e atrito para clientes legítimos?`, `O que é verificação progressiva?`] },

{ id: 'security-champions', stage: 'avancado', level: 'importante', title: 'Programa de AppSec e security champions', short: 'AppSec',
  resumo: `Como empresas organizam segurança de aplicações para escalar com muitos times.`,
  porque: `Um time de segurança pequeno não consegue revisar o trabalho de centenas de desenvolvedores. Programas de AppSec espalham conhecimento e responsabilidade, e é provável que você participe de um.`,
  como: [
    `<b>Security champions</b>: desenvolvedores de cada time com interesse e treinamento extra em segurança, que trazem o assunto para revisões, threat models e decisões do dia a dia, e servem de ponte com o time de segurança. Complementos: treinamentos práticos, guias seguros de padrões comuns (autenticação, upload, criptografia) e bibliotecas internas "seguras por padrão".`,
    `Um <b>ciclo de desenvolvimento seguro</b> (SSDLC) define em que momento cada prática entra: threat modeling no desenho, revisão e SAST no PR, varreduras no CI, testes de intrusão antes de lançamentos grandes, bug bounty contínuo e métricas (tempo para corrigir vulnerabilidades críticas). Modelos de maturidade como o OWASP SAMM ajudam a planejar a evolução.`,
  ],
  conecta: [['threat-modeling', 'Uma prática central do programa.'], ['sast-dast', 'Ferramentas automáticas no ciclo.'], ['praticas/code-review', 'Segurança como parte da revisão.'], ['pentest-bug-bounty', 'Testes externos.']],
  front: `Um champion de front cuida de temas como CSP, XSS, dependências do bundle, armazenamento de tokens e dados enviados a ferramentas de terceiros.`,
  ex: { lang: 'texto', code: `Ciclo de desenvolvimento seguro (exemplo)
Desenho      → threat model em funcionalidades com dados sensíveis
Código       → bibliotecas seguras por padrão, lint de segurança no editor
Pull request → revisão com checklist, SAST, SCA, varredura de segredos
CI/CD        → varredura de imagem, IaC e políticas; assinatura do artefato
Produção     → WAF, detecção, bug bounty, pentest anual
Métrica      → vulnerabilidades críticas corrigidas em até 7 dias` },
  docs: [['OWASP · Security Champions Guide', 'https://owasp.org/www-project-security-champions-guidebook/'], ['OWASP · SAMM', 'https://owaspsamm.org/model/'], ['NIST · Secure Software Development Framework', 'https://csrc.nist.gov/projects/ssdf']],
  perguntas: [`Existe um security champion no seu time?`, `Em que etapa do seu ciclo de desenvolvimento a segurança entra hoje?`, `Que biblioteca "segura por padrão" ajudaria todos os times?`] },

{ id: 'cripto-pos-quantica', stage: 'avancado', level: 'aprofundar', title: 'Criptografia pós-quântica', short: 'Pós-quântica',
  resumo: `A transição para algoritmos resistentes a computadores quânticos.`,
  porque: `Computadores quânticos suficientemente grandes quebrariam RSA e curvas elípticas, a base do TLS e das assinaturas atuais. Dados capturados hoje podem ser decifrados no futuro ("colete agora, decifre depois"), por isso a migração já começou.`,
  como: [
    `O NIST padronizou algoritmos pós-quânticos em 2024: <b>ML-KEM</b> (antigo Kyber) para troca de chaves e <b>ML-DSA</b> (antigo Dilithium) e <b>SLH-DSA</b> para assinaturas. Navegadores e CDNs já usam troca de chaves <b>híbrida</b> (clássica + pós-quântica) no TLS, de forma transparente para as aplicações.`,
    `Para a maioria dos times, a ação prática é <b>agilidade criptográfica</b>: inventariar onde se usa criptografia, evitar algoritmos fixos no código, manter bibliotecas e infraestrutura (TLS, VPN, assinaturas) atualizadas e priorizar dados que precisam ficar secretos por muitos anos. Criptografia simétrica (AES-256) e hashes continuam adequados.`,
  ],
  conecta: [['criptografia', 'Os algoritmos que estão sendo substituídos.'], ['certificados-pki', 'Assinaturas pós-quânticas em certificados.'], ['backend/https-tls', 'Troca de chaves híbrida no TLS.'], ['gestao-chaves', 'Inventário e rotação de chaves.']],
  front: `Navegadores modernos já negociam troca de chaves pós-quântica híbrida com servidores compatíveis; não exige mudanças no código do front.`,
  ex: { lang: 'texto', code: `Algoritmo hoje                Risco quântico      Substituto
───────────────────────────── ─────────────────── ─────────────────────────
RSA / ECDH (troca de chaves)  quebrável           ML-KEM (híbrido no TLS)
RSA / ECDSA (assinaturas)     quebrável           ML-DSA, SLH-DSA
AES-128                       enfraquecido        AES-256
AES-256, SHA-256/384          adequados           manter` },
  docs: [['NIST · Post-quantum cryptography', 'https://csrc.nist.gov/projects/post-quantum-cryptography'], ['Cloudflare · The state of the post-quantum Internet', 'https://blog.cloudflare.com/pq-2024/'], ['CISA · Quantum readiness', 'https://www.cisa.gov/quantum']],
  perguntas: [`Que dados do seu sistema precisam continuar secretos por mais de 10 anos?`, `O que significa "colete agora, decifre depois"?`, `O que é agilidade criptográfica?`] },
]
