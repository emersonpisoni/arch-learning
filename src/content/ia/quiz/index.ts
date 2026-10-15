import type { QuizBank } from '../../../types'
import { fundamentos } from './01-fundamentos'
import { integracao } from './02-integracao'
import { rag } from './03-rag'
import { agentes } from './04-agentes'
import { qualidade } from './05-qualidade'
import { produto } from './06-produto'
import { harness } from './07-harness'
import { modelos } from './08-modelos'

export const quiz: QuizBank = { ...fundamentos, ...integracao, ...rag, ...agentes, ...qualidade, ...produto, ...harness, ...modelos }
