import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'codigo', title: 'Código que dura', desc: 'Escrever código que outras pessoas (e você daqui a seis meses) conseguem entender e mudar.',
    pratica: 'Escolha um arquivo difícil do seu projeto e faça três refatorações pequenas, cada uma num commit, com os testes passando entre elas. Anote o que ficou mais claro.' },
  { id: 'git', title: 'Git e colaboração', desc: 'Versionar, revisar e integrar código em time.',
    pratica: 'Num repositório de teste, crie um conflito de propósito, resolva com merge e depois com rebase. Use git reflog para recuperar um commit "perdido".' },
  { id: 'qualidade', title: 'Qualidade e testes', desc: 'Práticas que mantêm o código confiável à medida que cresce.',
    pratica: 'Implemente uma função de cálculo de frete com TDD: escreva o teste, veja falhar, faça passar e refatore. Depois rode uma ferramenta de mutation testing nela.' },
  { id: 'processo', title: 'Entrega e processo', desc: 'Como times organizam o trabalho, medem a entrega e comunicam mudanças.',
    pratica: 'Calcule as quatro métricas DORA do seu time para o último mês, mesmo que de forma aproximada, e escolha uma para melhorar.' },
  { id: 'comunicacao', title: 'Investigar e comunicar', desc: 'Depurar, ler código desconhecido e explicar ideias técnicas com clareza.',
    pratica: 'Pegue um bug real, escreva a investigação passo a passo (hipótese, teste, resultado) e transforme isso numa descrição de PR que outra pessoa entenderia sem contexto.' },
  { id: 'carreira', title: 'Carreira', desc: 'Crescer como engenheiro além do código.',
    pratica: 'Escreva um documento curto sobre o seu impacto nos últimos seis meses, com exemplos concretos, e identifique uma habilidade desta trilha para desenvolver no próximo trimestre.' },
  { id: 'lideranca', title: 'Liderança técnica', desc: 'Conduzir decisões, priorizar, evoluir legado, desenvolver pessoas e melhorar o dia a dia do time.',
    pratica: 'Escolha uma decisão técnica pendente do seu time e conduza-a do começo ao fim: critérios, opções por escrito, quem decide, prazo e um ADR com o resultado.' },
]
