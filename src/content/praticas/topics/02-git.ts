import type { Topic } from '../../../types'

export const git: Topic[] = [
{ id: 'git-interno', stage: 'git', level: 'importante', title: 'Como o Git funciona por dentro', short: 'Git por dentro',
  resumo: `Commits, árvores, branches como ponteiros e o reflog que salva o dia.`,
  porque: `Quem entende o modelo do Git deixa de ter medo de comandos como rebase e reset, e consegue recuperar trabalho que parecia perdido. Isso muda a confiança no dia a dia.`,
  como: [
    `O Git guarda <b>snapshots</b>, não diferenças. Cada <b>commit</b> aponta para uma árvore de arquivos e para o(s) commit(s) pai(s), identificado por um hash do conteúdo. Uma <b>branch</b> é só um ponteiro móvel para um commit; <b>HEAD</b> aponta para onde você está.`,
    `As três áreas: <b>working directory</b>, <b>staging (index)</b> e <b>repositório</b>. Quase nada se perde de verdade: o <b>reflog</b> registra para onde HEAD e as branches apontaram, permitindo desfazer um reset ou um rebase errado. Comandos que reescrevem histórico (rebase, amend, reset) só devem ser usados em commits que ainda não foram compartilhados.`,
  ],
  conecta: [['branching', 'Estratégias usando branches.'], ['conflitos-rebase', 'Merge e rebase na prática.'], ['commits-prs', 'O que vai em cada commit.']],
  front: `Entender que uma branch é só um ponteiro torna natural criar branches para experimentos rápidos e descartá-las sem medo.`,
  ex: { lang: 'bash', code: `git log --oneline --graph --all     # ver o grafo de commits
git cat-file -p HEAD                # o conteúdo de um commit: árvore, pai, autor

# "apaguei meu trabalho com reset --hard"
git reflog                          # lista para onde HEAD apontou
git reset --hard HEAD@{2}           # volta para antes do erro

git switch -c experimento           # branch = novo ponteiro, barato` },
  docs: [['Pro Git (livro gratuito)', 'https://git-scm.com/book/pt-br/v2'], ['Pro Git · Git internals', 'https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain'], ['Learn Git Branching (interativo)', 'https://learngitbranching.js.org/?locale=pt_BR']],
  perguntas: [`O que é, de fato, uma branch no Git?`, `Como recuperar um commit depois de um reset --hard?`, `Por que não reescrever histórico já compartilhado?`] },

{ id: 'branching', stage: 'git', level: 'essencial', title: 'Estratégias de branch', short: 'Branching',
  resumo: `Trunk-based, GitHub Flow e GitFlow: como o time integra o trabalho.`,
  porque: `Branches longas geram conflitos enormes e integrações dolorosas. A estratégia de branch define quanto tempo o código fica isolado e quão rápido ele chega à produção.`,
  como: [
    `<b>Trunk-based development</b>: todos integram na branch principal com frequência (pelo menos diariamente), com branches de vida curta e <b>feature flags</b> para esconder o que não está pronto. É a prática associada aos times de melhor desempenho. <b>GitHub Flow</b>: branch curta por mudança, PR, review e merge na main, que está sempre publicável.`,
    `<b>GitFlow</b> (develop, release, hotfix) foi criado para software com versões lançadas periodicamente; para aplicações web com deploy contínuo, costuma acrescentar burocracia. O que mais importa é integrar cedo e com frequência.`,
  ],
  conecta: [['git-interno', 'Branches são ponteiros.'], ['dora', 'Integração frequente melhora as métricas de entrega.'], ['backend/cicd', 'Feature flags separam deploy de lançamento.'], ['commits-prs', 'PRs pequenos tornam branches curtas viáveis.']],
  front: `Uma funcionalidade grande de front pode ser integrada aos poucos atrás de uma feature flag, em vez de viver semanas numa branch que diverge cada vez mais.`,
  ex: { lang: 'texto', code: `Trunk-based / GitHub Flow
main ─●───●───●───●───●───●──   (sempre publicável)
       \\─●─/   \\─●●─/            branches de horas ou poucos dias

GitFlow
main     ─●───────────●─────    (só releases)
develop  ─●──●──●──●──●──●──
feature    \\──●──●──●──●──/     branches de semanas` },
  docs: [['trunkbaseddevelopment.com', 'https://trunkbaseddevelopment.com/'], ['GitHub Flow', 'https://docs.github.com/en/get-started/using-github/github-flow'], ['Martin Fowler · Patterns for Managing Source Code Branches', 'https://martinfowler.com/articles/branching-patterns.html']],
  perguntas: [`Quanto tempo uma branch costuma viver no seu time?`, `Como entregar uma funcionalidade incompleta sem branch longa?`, `Quando o GitFlow ainda faz sentido?`] },

{ id: 'commits-prs', stage: 'git', level: 'essencial', title: 'Commits e pull requests bons', short: 'Commits e PRs',
  resumo: `Mudanças pequenas, bem descritas e fáceis de revisar.`,
  porque: `PRs pequenos são revisados mais rápido e com mais atenção, quebram menos coisas e são fáceis de reverter. A descrição do PR é, muitas vezes, a única documentação do porquê de uma mudança.`,
  como: [
    `<b>Commits</b>: uma mudança lógica por commit, mensagem no imperativo explicando o quê e o porquê. <b>Conventional Commits</b> (<code>feat:</code>, <code>fix:</code>, <code>refactor:</code>) permitem gerar changelog e versão automaticamente. <b>PRs</b>: pequenos (algumas centenas de linhas no máximo), com um propósito só.`,
    `Uma boa descrição de PR tem: contexto e motivação, o que mudou, como testar, capturas de tela para mudanças visuais, riscos e o que ficou de fora. Revise o próprio diff antes de pedir review. Para mudanças grandes, divida em PRs empilhados ou use feature flags.`,
  ],
  conecta: [['code-review', 'O outro lado do PR.'], ['versionamento-semantico', 'Conventional Commits alimentam o SemVer.'], ['branching', 'PRs pequenos permitem branches curtas.'], ['documentacao', 'A descrição do PR é documentação.']],
  front: `Para mudanças de interface, prints ou um vídeo curto de antes e depois no PR economizam muito tempo de quem revisa, inclusive de design e produto.`,
  ex: { lang: 'markdown', code: `feat(checkout): calcula frete grátis acima de R$ 200

## Contexto
Campanha de novembro: frete grátis para pedidos acima de R$ 200 (ticket PRD-412).

## O que mudou
- regra no serviço de frete (backend) e exibição no resumo do pedido
- flag "frete-gratis-200" desligada por padrão

## Como testar
1. ligar a flag no staging
2. carrinho com R$ 199,90 → frete cobrado; R$ 200,00 → "Frete grátis"

## Riscos
Cache do resumo do pedido: invalidado ao mudar o carrinho.` },
  docs: [['Conventional Commits', 'https://www.conventionalcommits.org/pt-br/v1.0.0/'], ['Google · Small CLs', 'https://google.github.io/eng-practices/review/developer/small-cls.html'], ['cbea.ms · How to write a Git commit message', 'https://cbea.ms/git-commit/']],
  perguntas: [`Qual o tamanho médio dos PRs do seu time?`, `O que a descrição do seu último PR explicava sobre o porquê?`, `Como dividir uma mudança grande em PRs revisáveis?`] },

{ id: 'code-review', stage: 'git', level: 'essencial', title: 'Code review', short: 'Code review',
  resumo: `Revisar código para encontrar problemas, espalhar conhecimento e manter padrões.`,
  porque: `Code review é um dos principais pontos de contato entre pessoas e times. Feito bem, melhora o código e o time; feito mal, vira gargalo e fonte de atrito.`,
  como: [
    `O que olhar, em ordem de importância: <b>design</b> e se a mudança faz sentido, <b>corretude</b> e casos de borda, <b>testes</b>, <b>segurança</b>, legibilidade e só por último estilo (que deveria ser automático, por lint e formatador). Revise rápido: um PR parado por dias custa mais do que imperfeições pequenas.`,
    `Comentários claros e gentis: explique o porquê, diferencie bloqueios de sugestões (prefixos como "nit:" ou "sugestão:"), pergunte em vez de afirmar quando não tiver certeza e elogie o que está bom. Quem recebe: não leve para o pessoal, responda todos os comentários e mova discussões longas para uma conversa.`,
  ],
  conecta: [['commits-prs', 'PRs pequenos tornam o review possível.'], ['lint-format', 'Automatizar o estilo libera o review para o que importa.'], ['seguranca/threat-modeling', 'Segurança também se revisa.'], ['comunicacao-tecnica', 'Escrever comentários claros.']],
  front: `Em PRs de backend que mudam a API, quem consome essa API (como o time de front) é quem mais facilmente nota quebras de contrato ou formatos difíceis de consumir na interface.`,
  ex: { lang: 'texto', code: `Comentários de review
✘ "Isso está errado."
✔ "Se a lista vier vazia, total fica NaN (linha 42). Que tal iniciar o reduce com 0?"

✘ "Por que você fez assim?"
✔ "Pergunta: considerou usar o hook useFrete que já existe? Ele já trata o cache."

✔ "nit: o nome 'dados' poderia ser 'resumoPedido' (não bloqueia)"
✔ "Gostei de como você separou a regra de desconto, ficou bem fácil de testar."` },
  docs: [['Google · Engineering practices: code review', 'https://google.github.io/eng-practices/review/'], ['Google · How to write code review comments', 'https://google.github.io/eng-practices/review/reviewer/comments.html'], ['Conventional Comments', 'https://conventionalcomments.org/']],
  perguntas: [`Quanto tempo um PR espera por review no seu time?`, `Como diferenciar um comentário que bloqueia de uma sugestão?`, `O que você olha primeiro ao revisar um PR?`] },

{ id: 'conflitos-rebase', stage: 'git', level: 'importante', title: 'Merge, rebase e conflitos', short: 'Merge e rebase',
  resumo: `Duas formas de integrar mudanças e como resolver conflitos sem medo.`,
  porque: `Conflitos são inevitáveis em times. Saber escolher entre merge e rebase e resolver conflitos com calma evita perder trabalho e histórico confuso.`,
  como: [
    `<b>Merge</b> une duas linhas criando um commit de merge, preservando o histórico como aconteceu. <b>Rebase</b> reaplica seus commits sobre a base atualizada, gerando histórico linear, mas reescrevendo os commits (nunca faça rebase de commits já compartilhados por outras pessoas). <b>Squash merge</b> junta o PR num commit só na main.`,
    `Conflitos acontecem quando as duas linhas mudaram o mesmo trecho. Resolva entendendo a intenção dos dois lados (não só escolhendo um), rode os testes depois e, em conflitos difíceis, converse com quem escreveu a outra parte. <code>git rebase -i</code> permite reorganizar commits locais antes do PR.`,
  ],
  conecta: [['git-interno', 'Rebase reescreve commits; o reflog permite voltar.'], ['branching', 'Branches curtas têm menos conflitos.'], ['commits-prs', 'Organizar commits antes de abrir o PR.']],
  front: `Conflitos em arquivos gerados (lockfiles, snapshots) normalmente se resolvem regenerando o arquivo, não editando à mão.`,
  ex: { lang: 'bash', code: `# atualizar sua branch com a main
git fetch origin
git rebase origin/main          # histórico linear (só em branch sua, não compartilhada)
# ou
git merge origin/main           # preserva o histórico, cria commit de merge

# durante um conflito
git status                      # arquivos em conflito
# edite, mantendo a intenção dos dois lados
git add arquivo.ts
git rebase --continue           # ou: git rebase --abort para desistir

# conflito no lockfile: regenerar
git checkout --theirs package-lock.json && npm install` },
  docs: [['Pro Git · Rebasing', 'https://git-scm.com/book/pt-br/v2/Ramifica%C3%A7%C3%A3o-do-Git-Rebase'], ['Atlassian · Merging vs rebasing', 'https://www.atlassian.com/git/tutorials/merging-vs-rebasing'], ['GitHub · Resolvendo conflitos', 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line']],
  perguntas: [`Quando você prefere merge e quando prefere rebase?`, `Por que não fazer rebase de uma branch que outras pessoas usam?`, `Como resolver um conflito sem perder a intenção da outra pessoa?`] },
]
