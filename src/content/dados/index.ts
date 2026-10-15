import type { Trilha } from '../../types'
import { stages } from './stages'
import { topics } from './topics'
import { quiz } from './quiz'

export const dados: Trilha = {
  id: 'dados',
  numero: 6,
  title: 'Dados',
  lede: 'Da tabela em produção ao dashboard da diretoria: bancos sob tráfego real, modelagem avançada, pipelines, analytics, busca e governança. Aprofunda a etapa de dados da trilha Backend.',
  stages,
  topics,
  quiz,
}
