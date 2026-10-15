import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const arquitetura: Trilha = {
  id: 'arquitetura',
  numero: 3,
  title: 'Arquitetura e System Design',
  lede: 'Como sistemas inteiros são desenhados: requisitos e trade-offs, estilos de arquitetura, comunicação resiliente, dados em escala, documentação de decisões e estudos de caso clássicos de system design.',
  stages,
  topics,
  quiz,
}
