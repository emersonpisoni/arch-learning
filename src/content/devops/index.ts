import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const devops: Trilha = {
  id: 'devops',
  numero: 2,
  title: 'DevOps e Infraestrutura',
  lede: 'Onde o código roda e como ele chega lá: Linux e redes, nuvem, containers e Kubernetes, infraestrutura como código, entrega contínua e confiabilidade. Aprofunda o que a trilha Backend apresenta.',
  stages,
  topics,
  quiz,
}
