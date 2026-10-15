import type { QuizBank } from '../../../types'
import { navegador } from './01-navegador'
import { renderizacao } from './02-renderizacao'
import { performance } from './03-performance'
import { acessibilidade } from './04-acessibilidade'
import { arquiteturaFront } from './05-arquitetura-front'
import { build } from './06-build'
import { avancado } from './07-avancado'
import { interfaceBase } from './08-interface'

export const quiz: QuizBank = { ...navegador, ...renderizacao, ...performance, ...acessibilidade, ...arquiteturaFront, ...build, ...avancado, ...interfaceBase }
