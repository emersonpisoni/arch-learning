import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const ia: Trilha = {
  id: 'ia',
  numero: 8,
  title: 'IA aplicada para devs',
  lede: 'Construir funcionalidades com LLMs de forma confiável: como os modelos funcionam, integração e prompts, RAG, ferramentas e agentes, avaliação, custo e segurança, e boas experiências de produto.',
  stages,
  topics,
  quiz,
}
