import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'fundamentos', title: 'Fundamentos de segurança', desc: 'Como pensar em ameaças, camadas de defesa e criptografia na prática.',
    pratica: 'Faça um threat model de uma funcionalidade do seu produto (por exemplo, o upload de avatar) usando STRIDE: desenhe o fluxo de dados, liste ameaças e anote uma mitigação para cada.' },
  { id: 'identidade', title: 'Identidade e acesso', desc: 'OAuth, OIDC, MFA, passkeys e o ciclo de vida de sessões e tokens.',
    pratica: 'Implemente login com um provedor OIDC (Keycloak local ou uma conta de teste) usando Authorization Code com PKCE e inspecione cada requisição do fluxo no DevTools.' },
  { id: 'aplicacao', title: 'Segurança da aplicação web', desc: 'As vulnerabilidades mais exploradas em aplicações web e como cada camada se defende.',
    pratica: 'Resolva os laboratórios de XSS, CSRF e SSRF da PortSwigger Web Security Academy e depois aplique uma Content Security Policy no seu projeto em modo report-only.' },
  { id: 'infra', title: 'Infraestrutura e nuvem', desc: 'Proteger servidores, redes e contas de nuvem.',
    pratica: 'Rode uma ferramenta de postura de nuvem (Prowler ou ScoutSuite) numa conta de teste e um scanner de imagem (Trivy) numa imagem do seu projeto. Corrija os três achados mais graves.' },
  { id: 'supply-chain', title: 'Cadeia de suprimentos', desc: 'Dependências, pipelines e artefatos: o código que você não escreveu também é seu problema.',
    pratica: 'Adicione ao pipeline do seu projeto: auditoria de dependências, varredura de segredos e geração de SBOM. Configure o Dependabot ou o Renovate.' },
  { id: 'operacao', title: 'Operação e conformidade', desc: 'Detectar, responder, cumprir a lei e testar as defesas.',
    pratica: 'Mapeie quais dados pessoais o seu produto coleta, onde ficam guardados, por quanto tempo e quem acessa. Compare com o que a LGPD exige.' },
  { id: 'avancado', title: 'Segurança avançada', desc: 'Gestão de chaves, vulnerabilidades sutis, lógica de negócio, fraude, programas de AppSec e criptografia pós-quântica.',
    pratica: 'Escolha um fluxo com dinheiro ou limites no seu produto (cupom, saldo, frete grátis) e tente abusar dele: valores negativos, requisições paralelas e etapas puladas. Corrija o que encontrar com operações atômicas e validação no servidor.' },
]
