import type { QuizBank } from '../../../types'
import { fundamentos } from './01-fundamentos'
import { estilos } from './02-estilos'
import { comunicacao } from './03-comunicacao'
import { escalaDados } from './04-escala-dados'
import { decisoes } from './05-decisoes'
import { casos } from './06-casos'
import { avancado } from './07-avancado'

export const quiz: QuizBank = { ...fundamentos, ...estilos, ...comunicacao, ...escalaDados, ...decisoes, ...casos, ...avancado }
