# arch-learning

Uma biblioteca de trilhas de estudo interativas para devs de qualquer área entenderem as partes de um sistema de software, do navegador à produção. Cada assunto traz explicação, conexões com outros assuntos (inclusive de outras trilhas), como o assunto aparece no frontend, exemplo prático, documentação oficial, perguntas para refletir e um **quiz**: o assunto só é concluído quando você acerta 4 de 5 perguntas sorteadas.

| # | Trilha | Etapas | Assuntos | Perguntas |
|---|---|---|---|---|
| 01 | Backend | 10 | 53 | 318 |
| 02 | DevOps e Infraestrutura | 7 | 39 | 234 |
| 03 | Arquitetura e System Design | 7 | 35 | 210 |
| 04 | Frontend em profundidade | 8 | 41 | 246 |
| 05 | Segurança | 7 | 34 | 204 |
| 06 | Dados | 7 | 31 | 186 |
| 07 | Práticas de engenharia | 7 | 30 | 180 |
| 08 | IA aplicada para devs | 8 | 41 | 246 |
| 09 | Fundamentos de computação | 6 | 17 | 102 |
| 10 | Mobile | 6 | 18 | 108 |
| | **Total** | | **339** | **2.034** |

Feito com React, TypeScript e Vite.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # valida o conteúdo (links entre assuntos, quiz, alternativas)
npm run build
npm run lint
```

## Como funciona

- **Tela inicial** (`#`) lista as trilhas com o seu progresso.
- **Trilha** (`#backend`) mostra o mapa das etapas; cada **assunto** (`#backend/cors`) abre numa página de leitura própria.
- **Quiz**: cada assunto tem um banco de 6 perguntas; cada rodada sorteia 5 e embaralha as alternativas. Acertar 4 marca o assunto como concluído.
- **Simulado**: 20 perguntas sorteadas de todos os assuntos da trilha (não altera o status).
- **Progresso** fica no `localStorage` do navegador (`arch-learning:progress:v2`).

## Estrutura

```
src/
  types.ts                      # Trilha, Stage, Topic, QuizQuestion
  content/
    index.ts                    # lista de trilhas (ordem da tela inicial)
    quiz.ts                     # helper q() para escrever perguntas
    content.test.ts             # testes de integridade do conteúdo
    <trilha>/
      index.ts                  # metadados da trilha
      stages.ts                 # etapas, em ordem
      topics/NN-etapa.ts        # assuntos de cada etapa
      quiz/NN-etapa.ts          # perguntas de cada assunto
  lib/                          # catálogo, links entre trilhas, sorteio do quiz
  hooks/                        # progresso e rotas por #hash
  components/                   # Home, TrilhaView (mapa), TopicPage (leitura), Quiz...
```

## Escrevendo conteúdo

**Assunto:** adicione um `Topic` no arquivo da etapa. Em `conecta`, use o id puro para assuntos da mesma trilha (`"cache"`) ou `"trilha/id"` para outra trilha (`"devops/kubernetes"`). Os parágrafos aceitam `<b>`, `<i>` e `<code>`.

**Perguntas:** no arquivo de quiz da etapa, com a primeira alternativa sendo a correta (a interface embaralha):

```ts
q('Qual status indica excesso de requisições?',
  ['429 Too Many Requests', '403 Forbidden', '503 Service Unavailable', '404 Not Found'],
  'Geralmente vem acompanhado do header Retry-After.'),
```

`npm test` falha se um link apontar para um assunto inexistente, se um assunto tiver menos de 6 perguntas, se houver alternativas repetidas ou enunciados duplicados.

**Nova trilha:** crie `src/content/<id>/` com a mesma estrutura, exporte um `Trilha` e adicione em `src/content/index.ts`.
