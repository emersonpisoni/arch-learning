import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const praticas: Trilha = {
  id: 'praticas',
  numero: 7,
  title: 'Práticas de engenharia',
  lede: 'O que faz um time entregar bem, além da tecnologia: código que dura, Git e code review, testes, processo e métricas de entrega, comunicação entre times e carreira.',
  stages,
  topics,
  quiz,
}
