import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const mobile: Trilha = {
  id: 'mobile',
  numero: 10,
  title: 'Mobile',
  lede: 'Como apps de celular são construídos e entregues: nativo e multiplataforma, ciclo de vida, offline e rede instável, notificações, performance, publicação nas lojas e segurança no aparelho.',
  stages,
  topics,
  quiz,
}
