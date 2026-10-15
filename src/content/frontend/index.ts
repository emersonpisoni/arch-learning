import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const frontend: Trilha = {
  id: 'frontend',
  numero: 4,
  title: 'Frontend em profundidade',
  lede: 'Como o navegador renderiza, estratégias de renderização, performance medida em campo, acessibilidade, arquitetura de aplicações grandes e o caminho do build até o usuário.',
  stages,
  topics,
  quiz,
}
