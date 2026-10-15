import type { QuizBank } from '../../../types'
import { codigo } from './01-codigo'
import { git } from './02-git'
import { qualidade } from './03-qualidade'
import { processo } from './04-processo'
import { comunicacao } from './05-comunicacao'
import { carreira } from './06-carreira'
import { lideranca } from './07-lideranca'

export const quiz: QuizBank = { ...codigo, ...git, ...qualidade, ...processo, ...comunicacao, ...carreira, ...lideranca }
