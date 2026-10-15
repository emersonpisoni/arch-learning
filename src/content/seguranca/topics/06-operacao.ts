import type { Topic } from '../../../types'

export const operacao: Topic[] = [
{ id: 'logs-seguranca', stage: 'operacao', level: 'importante', title: 'Logs de auditoria e detecção', short: 'Detecção',
  resumo: `Registrar eventos de segurança e perceber quando algo suspeito acontece.`,
  porque: `Muitos ataques são descobertos meses depois, por terceiros. Registrar os eventos certos e alertar sobre padrões suspeitos encurta esse tempo e torna possível investigar o que aconteceu.`,
  como: [
    `Registre eventos como: logins (sucesso e falha), MFA, troca de senha e e-mail, mudanças de permissão, acesso a dados sensíveis, ações administrativas, exportações em massa e erros de autorização. Cada evento com <b>quem</b>, <b>o quê</b>, <b>quando</b>, <b>de onde</b> e <b>resultado</b>; nunca registre senhas, tokens ou dados sensíveis.`,
    `Centralize os logs num lugar que o atacante não consiga apagar (SIEM, conta separada, armazenamento imutável) e crie <b>detecções</b>: muitos logins falhos de um IP, login de país incomum, um usuário baixando milhares de registros, uso de credenciais fora do horário. Retenção deve seguir requisitos legais e de investigação.`,
  ],
  conecta: [['backend/observabilidade', 'A mesma infraestrutura de logs, com outro propósito.'], ['resposta-incidentes', 'Os logs alimentam a investigação.'], ['lgpd', 'Logs não podem vazar dados pessoais.'], ['cloud-misconfig', 'Logs de auditoria da nuvem ligados em todas as contas.']],
  front: `Eventos de segurança também nascem no front: tentativas de login, troca de senha e exportações. Garanta que o backend registre essas ações com o contexto certo.`,
  ex: { lang: 'json', code: `{
  "tipo": "auth.login.falha",
  "quando": "2026-10-15T03:12:44Z",
  "usuario": "user_7",
  "ip": "203.0.113.45",
  "pais": "RO",
  "userAgent": "python-requests/2.31",
  "motivo": "senha_incorreta",
  "tentativasUltimos5min": 37
}
// detecção: > 20 falhas em 5 min para a mesma conta → bloquear e alertar` },
  docs: [['OWASP · Logging Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'], ['OWASP · Security Logging and Monitoring Failures', 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/'], ['MITRE ATT&CK', 'https://attack.mitre.org/']],
  perguntas: [`O seu sistema registra tentativas de login com falha?`, `Um atacante com acesso ao servidor conseguiria apagar os logs?`, `Que comportamento suspeito do seu produto mereceria um alerta?`] },

{ id: 'resposta-incidentes', stage: 'operacao', level: 'essencial', title: 'Resposta a incidentes de segurança', short: 'Resposta',
  resumo: `O que fazer, em que ordem, quando uma violação é descoberta.`,
  porque: `Num incidente de segurança, ações apressadas destroem evidências e ações lentas aumentam o estrago. Ter um plano ensaiado faz diferença em horas de exposição e em obrigações legais.`,
  como: [
    `Fases clássicas (NIST): <b>preparação</b> (plano, contatos, acessos, logs), <b>detecção e análise</b> (confirmar e dimensionar), <b>contenção</b> (isolar sistemas, revogar credenciais, bloquear acessos), <b>erradicação</b> (remover a causa e a persistência do atacante), <b>recuperação</b> (voltar à operação monitorando) e <b>lições aprendidas</b>.`,
    `Diferenças em relação a incidentes de disponibilidade: preserve evidências (snapshots, logs) antes de apagar; comunique por canais seguros, porque o atacante pode estar lendo o chat; envolva jurídico e privacidade cedo, porque a LGPD exige comunicar a ANPD e os titulares quando há risco relevante.`,
  ],
  conecta: [['devops/incidentes', 'A gestão de incidentes em geral.'], ['logs-seguranca', 'Base da investigação.'], ['lgpd', 'Obrigações de comunicação.'], ['secrets-scanning', 'Segredos vazados exigem resposta imediata.']],
  front: `Se você notar algo estranho (requisições inesperadas, script de terceiro alterado, dados de outro usuário na tela), reporte pelo canal de segurança com prints e horário, sem tentar investigar sozinho em produção.`,
  ex: { lang: 'texto', code: `Primeira hora após detectar acesso indevido a um banco
[ ] abrir incidente e nomear um responsável (canal separado)
[ ] preservar evidências: snapshot do banco, export dos logs
[ ] conter: revogar a credencial usada, bloquear IPs, isolar a máquina
[ ] dimensionar: quais dados, quantos titulares, desde quando
[ ] acionar jurídico/privacidade (avaliar comunicação à ANPD)
[ ] registrar a linha do tempo desde o início` },
  docs: [['NIST SP 800-61 · Incident Response', 'https://csrc.nist.gov/pubs/sp/800/61/r3/final'], ['ANPD · Comunicação de incidente de segurança', 'https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis'], ['CISA · Incident response playbooks', 'https://www.cisa.gov/resources-tools/resources/federal-government-cybersecurity-incident-and-vulnerability-response-playbooks']],
  perguntas: [`Para quem você reporta um possível incidente de segurança na sua empresa?`, `Por que preservar evidências antes de "limpar" o sistema?`, `Por que comunicar por um canal separado durante o incidente?`] },

{ id: 'lgpd', stage: 'operacao', level: 'essencial', title: 'LGPD e privacidade', short: 'LGPD',
  resumo: `As regras brasileiras para tratar dados pessoais e o que mudam no software.`,
  porque: `Quase todo produto trata dados pessoais. A LGPD impõe obrigações que viram requisitos técnicos: consentimento, exclusão, minimização, segurança e comunicação de incidentes, com multas e danos de reputação.`,
  como: [
    `Conceitos: <b>dado pessoal</b> (identifica alguém) e <b>dado pessoal sensível</b> (saúde, biometria, religião, origem racial...); <b>titular</b>, <b>controlador</b>, <b>operador</b> e <b>encarregado (DPO)</b>. Todo tratamento precisa de uma <b>base legal</b> (consentimento, execução de contrato, obrigação legal, legítimo interesse, entre outras).`,
    `Impacto no software: <b>privacy by design</b>; coletar só o necessário (<b>minimização</b>); prazos de <b>retenção</b>; atender <b>direitos do titular</b> (acesso, correção, portabilidade, exclusão); registrar consentimentos; cuidar de dados pessoais em logs, analytics, replays e ambientes de teste; e contratos com fornecedores que processam dados.`,
  ],
  conecta: [['dados/retencao-anonimizacao', 'Retenção, anonimização e exclusão na prática.'], ['resposta-incidentes', 'Incidentes com dados pessoais têm comunicação obrigatória.'], ['devops/ambientes', 'Dados reais em staging são risco.'], ['frontend/observabilidade-front', 'Replays e logs de front podem conter dados pessoais.']],
  front: `Banners de cookies, formulários com consentimento separado por finalidade, telas de "baixar meus dados" e "excluir minha conta" e não enviar dados pessoais para ferramentas de analytics são requisitos que caem no front.`,
  ex: { lang: 'texto', code: `Checklist de privacidade para uma funcionalidade nova
[ ] quais dados pessoais coleta, e todos são necessários?
[ ] qual a base legal para cada finalidade?
[ ] por quanto tempo ficam guardados, e como são apagados?
[ ] quem acessa, e há registro desse acesso?
[ ] vão para algum fornecedor (analytics, e-mail, IA)?
[ ] aparecem em logs, replays ou ambientes de teste?
[ ] o titular consegue acessar, corrigir e excluir?` },
  docs: [['Lei 13.709/2018 · LGPD', 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm'], ['ANPD · Autoridade Nacional de Proteção de Dados', 'https://www.gov.br/anpd/pt-br'], ['OWASP · Top 10 Privacy Risks', 'https://owasp.org/www-project-top-10-privacy-risks/']],
  perguntas: [`Que dados pessoais o seu produto coleta que poderiam deixar de ser coletados?`, `Como funciona a exclusão de conta, e ela apaga os dados de verdade?`, `Que ferramentas de terceiros recebem dados pessoais dos seus usuários?`] },

{ id: 'pentest-bug-bounty', stage: 'operacao', level: 'aprofundar', title: 'Pentest e bug bounty', short: 'Pentest',
  resumo: `Pagar pessoas para encontrar as falhas antes dos atacantes.`,
  porque: `Ferramentas automáticas pegam o que é conhecido; testadores humanos encontram falhas de lógica de negócio, encadeamentos de pequenos problemas e abusos que nenhuma regra prevê.`,
  como: [
    `<b>Pentest</b>: uma equipe contratada ataca um escopo definido, num período definido, e entrega um relatório com achados, gravidade e recomendações. Pode ser caixa-preta (sem conhecimento interno) ou caixa-branca (com código e documentação). Costuma ser exigido por clientes e certificações.`,
    `<b>Bug bounty</b>: pesquisadores externos reportam falhas continuamente em troca de recompensas, por plataformas como HackerOne e Bugcrowd. Antes disso, publique uma <b>política de divulgação de vulnerabilidades</b> e um arquivo <code>security.txt</code> para que quem encontre algo saiba como reportar com segurança.`,
  ],
  conecta: [['sast-dast', 'Testes humanos complementam os automáticos.'], ['threat-modeling', 'Os achados alimentam os próximos threat models.'], ['backend/owasp', 'A lista de vulnerabilidades que pentesters buscam.']],
  front: `Achados de pentest frequentemente envolvem o front: XSS, dados sensíveis expostos em respostas da API que a tela não mostra, e validações feitas só no cliente.`,
  ex: { lang: 'texto', code: `# https://loja.com/.well-known/security.txt
Contact: mailto:seguranca@loja.com
Expires: 2027-10-15T00:00:00.000Z
Policy: https://loja.com/seguranca/divulgacao
Preferred-Languages: pt, en` },
  docs: [['securitytxt.org', 'https://securitytxt.org/'], ['OWASP · Web Security Testing Guide', 'https://owasp.org/www-project-web-security-testing-guide/'], ['HackerOne · Vulnerability disclosure', 'https://www.hackerone.com/vulnerability-disclosure-policy']],
  perguntas: [`Como alguém de fora reportaria uma falha de segurança no seu produto hoje?`, `Que tipo de falha um pentester encontra e uma ferramenta automática não?`, `Que dados a sua API devolve que a tela não mostra?`] },
]
