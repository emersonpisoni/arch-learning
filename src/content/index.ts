import type { Trilha } from '../types'
import { backend } from './backend'
import { devops } from './devops'
import { arquitetura } from './arquitetura'
import { frontend } from './frontend'
import { seguranca } from './seguranca'
import { dados } from './dados'
import { praticas } from './praticas'
import { ia } from './ia'
import { fundamentos } from './fundamentos'
import { mobile } from './mobile'

// A ordem aqui é a ordem em que as trilhas aparecem na tela inicial.
export const trilhas: Trilha[] = [backend, devops, arquitetura, frontend, seguranca, dados, praticas, ia, fundamentos, mobile]
