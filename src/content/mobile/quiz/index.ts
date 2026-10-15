import type { QuizBank } from '../../../types'
import { fundamentos } from './01-fundamentos'
import { tecnologias } from './02-tecnologias'
import { dadosRede } from './03-dados-rede'
import { qualidade } from './04-qualidade'
import { entrega } from './05-entrega'
import { plataforma } from './06-plataforma'

export const quiz: QuizBank = { ...fundamentos, ...tecnologias, ...dadosRede, ...qualidade, ...entrega, ...plataforma }
