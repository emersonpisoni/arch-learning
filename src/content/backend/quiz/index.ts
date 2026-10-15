import type { QuizBank } from '../../../types'
import { fundamentos } from './01-fundamentos'
import { runtime } from './02-runtime'
import { apis } from './03-apis'
import { codigo } from './04-codigo'
import { dados } from './05-dados'
import { seguranca } from './06-seguranca'
import { escala } from './07-escala'
import { operacao } from './08-operacao'
import { distribuidos } from './09-distribuidos'
import { avancado } from './10-avancado'

export const quiz: QuizBank = {
  ...fundamentos,
  ...runtime,
  ...apis,
  ...codigo,
  ...dados,
  ...seguranca,
  ...escala,
  ...operacao,
  ...distribuidos, ...avancado }
