import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const fundamentos: Trilha = {
  id: 'fundamentos',
  numero: 9,
  title: 'Fundamentos de computação',
  lede: 'A base que vale para qualquer linguagem e área: complexidade, estruturas de dados, algoritmos, como a máquina executa código, memória, tipos, compiladores, sistema operacional e concorrência.',
  stages,
  topics,
  quiz,
}
