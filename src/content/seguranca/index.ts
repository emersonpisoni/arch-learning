import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const seguranca: Trilha = {
  id: 'seguranca',
  numero: 5,
  title: 'Segurança',
  lede: 'Pensar como atacante para construir como defensor: modelagem de ameaças, identidade, vulnerabilidades web, infraestrutura e nuvem, cadeia de suprimentos, resposta a incidentes e LGPD.',
  stages,
  topics,
  quiz,
}
