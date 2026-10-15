import type { QuizBank } from '../../../types'
import { fundamentos } from './01-fundamentos'
import { identidade } from './02-identidade'
import { aplicacao } from './03-aplicacao'
import { infra } from './04-infra'
import { supplyChain } from './05-supply-chain'
import { operacao } from './06-operacao'
import { avancado } from './07-avancado'

export const quiz: QuizBank = { ...fundamentos, ...identidade, ...aplicacao, ...infra, ...supplyChain, ...operacao, ...avancado }
