import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const backend: Trilha = {
  id: 'backend',
  numero: 1,
  title: 'Backend',
  lede: 'Do pacote TCP ao sistema distribuído: redes, APIs, organização do código, dados, segurança, escala e operação. Cada assunto explica por que importa, com o que se conecta, como aparece no frontend e onde ler a documentação oficial.',
  stages,
  topics,
  quiz,
}
