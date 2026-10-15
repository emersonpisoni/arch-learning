import type { QuizQuestion } from '../types'

/** Perguntas sorteadas por rodada do quiz de um assunto */
export const QUIZ_SIZE = 5
/** Perguntas sorteadas no simulado de uma trilha */
export const SIMULADO_SIZE = 20
/** Fração mínima de acertos para concluir um assunto */
export const PASS_RATIO = 0.8

export const passMark = (total: number) => Math.ceil(total * PASS_RATIO)

export interface QuizItem {
  q: string
  options: string[]
  correct: number
  explain: string
  /** Assunto de origem, mostrado no simulado */
  source?: string
}

export function shuffle<T>(list: readonly T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function toItem(question: QuizQuestion, source?: string): QuizItem {
  const order = shuffle([0, 1, 2, 3])
  return {
    q: question.q,
    options: order.map((i) => question.options[i]),
    correct: order.indexOf(0),
    explain: question.explain,
    source,
  }
}

/** Sorteia `size` perguntas do banco e embaralha as alternativas. */
export const drawQuiz = (pool: QuizQuestion[], size = QUIZ_SIZE, source?: string): QuizItem[] =>
  shuffle(pool)
    .slice(0, size)
    .map((question) => toItem(question, source))
