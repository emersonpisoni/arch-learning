import type { Topic } from '../../../types'
import { complexidade } from './01-complexidade'
import { estruturas } from './02-estruturas'
import { algoritmos } from './03-algoritmos'
import { maquina } from './04-maquina'
import { linguagens } from './05-linguagens'
import { sistema } from './06-sistema'

// A ordem aqui é a ordem de estudo sugerida.
export const topics: Topic[] = [...complexidade, ...estruturas, ...algoritmos, ...maquina, ...linguagens, ...sistema]
