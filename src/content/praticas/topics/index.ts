import type { Topic } from '../../../types'
import { codigo } from './01-codigo'
import { git } from './02-git'
import { qualidade } from './03-qualidade'
import { processo } from './04-processo'
import { comunicacao } from './05-comunicacao'
import { carreira } from './06-carreira'
import { lideranca } from './07-lideranca'

// A ordem aqui é a ordem de estudo sugerida.
export const topics: Topic[] = [...codigo, ...git, ...qualidade, ...processo, ...comunicacao, ...carreira, ...lideranca]
