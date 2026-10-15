import type { QuizBank } from '../../../types'
import { sistemas } from './01-sistemas'
import { cloud } from './02-cloud'
import { containers } from './03-containers'
import { iac } from './04-iac'
import { entrega } from './05-entrega'
import { sre } from './06-sre'
import { avancado } from './07-avancado'

export const quiz: QuizBank = { ...sistemas, ...cloud, ...containers, ...iac, ...entrega, ...sre, ...avancado }
