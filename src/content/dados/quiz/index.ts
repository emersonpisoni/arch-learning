import type { QuizBank } from '../../../types'
import { producao } from './01-producao'
import { modelagem } from './02-modelagem'
import { pipelines } from './03-pipelines'
import { analytics } from './04-analytics'
import { busca } from './05-busca'
import { governanca } from './06-governanca'
import { avancado } from './07-avancado'

export const quiz: QuizBank = { ...producao, ...modelagem, ...pipelines, ...analytics, ...busca, ...governanca, ...avancado }
