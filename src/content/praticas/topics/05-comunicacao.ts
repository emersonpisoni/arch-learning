import type { Topic } from '../../../types'

export const comunicacao: Topic[] = [
{ id: 'debugging', stage: 'comunicacao', level: 'essencial', title: 'Debugging sistemático', short: 'Debugging',
  resumo: `Encontrar a causa de um problema com método, em vez de tentativa e erro.`,
  porque: `Bugs de integração atravessam front, API, banco e infraestrutura. Um processo sistemático encurta horas de investigação e evita "consertos" que só escondem o sintoma.`,
  como: [
    `O método: <b>reproduzir</b> de forma confiável, <b>observar</b> (logs, traces, rede, dados), formular uma <b>hipótese</b>, <b>testar</b> mudando uma coisa por vez e registrar o que foi descartado. Reduza o problema ao menor caso que ainda falha. Perguntas úteis: o que mudou recentemente? Acontece em todos os ambientes? Para todos os usuários?`,
    `Ferramentas: breakpoints e o debugger (no navegador e no Node com <code>--inspect</code>), a aba Network para ver exatamente o que foi enviado e recebido, o request id para seguir a requisição até o backend, <b>git bisect</b> para achar o commit que introduziu o bug e "explicar para o pato de borracha".`,
  ],
  conecta: [['tratamento-erros', 'Bons erros encurtam a investigação.'], ['backend/observabilidade', 'Logs e traces mostram o que aconteceu.'], ['leitura-codigo', 'Investigar exige ler código desconhecido.'], ['devops/incidentes', 'Debugging sob pressão durante incidentes.']],
  front: `Antes de dizer "a API está errada", confira na aba Network o payload enviado e a resposta recebida, e copie como cURL; isso transforma uma discussão em um fato reproduzível para o time de backend.`,
  ex: { lang: 'bash', code: `# achar o commit que introduziu um bug por busca binária
git bisect start
git bisect bad                 # a versão atual tem o bug
git bisect good v2.30.0        # esta versão funcionava
# o Git faz checkout no meio; teste e responda:
git bisect good                # ou: git bisect bad
# ... repita até ele apontar o commit culpado
git bisect reset

# depurar o Node com o DevTools do Chrome
node --inspect-brk dist/server.js     # abra chrome://inspect` },
  docs: [['Chrome DevTools · Debug JavaScript', 'https://developer.chrome.com/docs/devtools/javascript'], ['Git · bisect', 'https://git-scm.com/docs/git-bisect'], ['Node.js · Debugging guide', 'https://nodejs.org/en/learn/getting-started/debugging']],
  perguntas: [`Qual foi o último bug que levou mais tempo do que deveria para ser encontrado, e por quê?`, `Como você reduziria um bug ao menor caso que ainda falha?`, `Quando o git bisect é a melhor ferramenta?`] },

{ id: 'leitura-codigo', stage: 'comunicacao', level: 'importante', title: 'Ler código desconhecido', short: 'Ler código',
  resumo: `Entender rapidamente um sistema que você não escreveu.`,
  porque: `Integrar com outro time muitas vezes significa ler o código do serviço deles para entender um comportamento. Ler código é uma habilidade que se treina, e acelera muito o trabalho em sistemas grandes.`,
  como: [
    `Comece pelo <b>todo</b>: README, estrutura de pastas, dependências, ponto de entrada e testes (que mostram como o código deve ser usado). Depois siga um <b>fluxo concreto</b> de ponta a ponta: uma requisição chega na rota, passa pelo controller, pelo service e chega ao banco.`,
    `Técnicas: "ir para a definição" e "encontrar referências" na IDE, ler os testes, olhar o histórico (<code>git log -p</code>, <code>git blame</code>) para entender por que algo existe, rodar localmente com breakpoints e anotar um mapa do que descobriu. Assistentes de código ajudam a resumir, mas confira no próprio código.`,
  ],
  conecta: [['debugging', 'Investigar exige navegar pelo código.'], ['legibilidade', 'O outro lado: escrever para ser lido.'], ['documentacao', 'Documentação acelera a leitura.'], ['backend/mvc', 'Conhecer o padrão ajuda a saber onde procurar.']],
  front: `Para entender um endpoint de outro time, procure a rota pelo caminho da URL no repositório deles; dali você chega à validação, às regras e às consultas que explicam a resposta.`,
  ex: { lang: 'bash', code: `# onde está a rota que o front chama?
rg "\\"/pedidos/:id/cancelar\\"" --type ts

# quem mexeu nesta regra e por quê?
git log -p -S "PEDIDO_JA_ENVIADO" -- src/
git blame -L 40,60 src/pedidos/pedidos.service.ts

# como esta função é usada?
rg "cancelarPedido\\(" --type ts` },
  docs: [['ripgrep', 'https://github.com/BurntSushi/ripgrep'], ['Git · log e pickaxe (-S)', 'https://git-scm.com/docs/git-log'], ['The Programmer\'s Brain (livro)', 'https://www.manning.com/books/the-programmers-brain']],
  perguntas: [`Como você começaria a entender o código de um serviço que nunca viu?`, `O que os testes de um projeto ensinam sobre o código?`, `Como descobrir por que uma regra estranha existe?`] },

{ id: 'comunicacao-tecnica', stage: 'comunicacao', level: 'essencial', title: 'Comunicação técnica e entre times', short: 'Comunicação',
  resumo: `Escrever e falar sobre problemas técnicos de forma clara para quem precisa entender.`,
  porque: `A maior parte do atrito em integrações entre front, backend, infra e produto é de comunicação, não técnica. Clareza ao pedir ajuda, reportar problemas e propor mudanças acelera tudo.`,
  como: [
    `<b>Comece pela conclusão</b> (o que você precisa ou propõe), depois o contexto e os detalhes. Adapte ao público: para produto, impacto e prazo; para engenharia, mecanismo e evidência. Ao pedir ajuda, mostre o que já tentou, o resultado esperado e o obtido, e o mínimo para reproduzir.`,
    `Entre times: combine <b>contratos</b> por escrito (APIs, eventos, prazos), use canais públicos em vez de mensagens privadas (o conhecimento fica para todos), registre decisões e seja explícito sobre dependências e riscos. Prefira escrita para o que precisa ser lembrado e conversa para resolver divergências.`,
  ],
  conecta: [['arquitetura/design-docs', 'Propostas técnicas por escrito.'], ['code-review', 'Comentários claros e gentis.'], ['arquitetura/conway', 'Comunicação entre times molda o sistema.'], ['estimativas', 'Comunicar incerteza e riscos.']],
  front: `Quem trabalha no front fica no meio do caminho entre produto, design e backend; um bom resumo escrito de cada integração ("o que a tela precisa, o que a API devolve, o que falta") evita retrabalho dos dois lados.`,
  ex: { lang: 'markdown', code: `**Pedido de ajuda: checkout retornando 422 em staging**

**Preciso:** entender por que POST /checkout rejeita pedidos com cupom desde ontem.

**Esperado:** 201 com o pedido criado. **Obtido:** 422 { "code": "CUPOM_INVALIDO" }
**Reproduzir:** curl em anexo (cupom BEMVINDO10, usuário de teste 7)
**Já tentei:** outros cupons (mesmo erro); sem cupom funciona; front não mudou desde sexta.
**Suspeita:** deploy da api-promocoes às 14h de ontem?
**Impacto:** bloqueia o teste da campanha que entra na quinta.` },
  docs: [['Google · Technical writing', 'https://developers.google.com/tech-writing/one'], ['Stack Overflow · Como fazer uma boa pergunta', 'https://pt.stackoverflow.com/help/how-to-ask'], ['Pragmatic Engineer · Writing as a software engineer', 'https://blog.pragmaticengineer.com/']],
  perguntas: [`Qual foi o último mal-entendido entre o seu time e outro, e como poderia ter sido evitado?`, `O que uma boa mensagem pedindo ajuda deve conter?`, `Por que preferir canais públicos a mensagens privadas para dúvidas técnicas?`] },
]
