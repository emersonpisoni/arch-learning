import type { QuizQuestion } from '../types'

/**
 * Atalho para escrever perguntas de quiz.
 * A primeira alternativa é sempre a correta; a interface embaralha.
 */
export const q = (question: string, options: QuizQuestion['options'], explain: string): QuizQuestion => ({
  q: question,
  options,
  explain,
})
