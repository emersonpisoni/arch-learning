export type Level = 'essencial' | 'importante' | 'aprofundar'

export type Status = 'nenhum' | 'estudando' | 'concluido'

export interface Stage {
  id: string
  title: string
  desc: string
  /** Exercício prático sugerido ao fim da etapa */
  pratica: string
}

export interface Topic {
  id: string
  /** id da Stage a que o assunto pertence */
  stage: string
  level: Level
  title: string
  /** Rótulo curto, usado no mapa de conexões */
  short: string
  resumo: string
  porque: string
  /** Parágrafos. Aceitam HTML simples: <b>, <i> e <code>. */
  como: string[]
  /**
   * [assunto relacionado, motivo da ligação].
   * Use o id puro para assuntos da mesma trilha ("cache")
   * ou "trilha/id" para outra trilha ("devops/kubernetes").
   */
  conecta: [ref: string, motivo: string][]
  /** Como o assunto aparece no frontend: interface, navegador e integração com a API */
  front: string
  ex: { lang: string; code: string }
  /** [rótulo, url] */
  docs: [label: string, url: string][]
  /** Perguntas abertas, para reflexão */
  perguntas: string[]
}

export interface QuizQuestion {
  q: string
  /** A primeira alternativa é a correta; a interface embaralha antes de mostrar. */
  options: [correta: string, string, string, string]
  /** Explicação mostrada depois da resposta */
  explain: string
}

/** Perguntas de quiz por id de assunto */
export type QuizBank = Record<string, QuizQuestion[]>

export interface Trilha {
  id: string
  numero: number
  title: string
  lede: string
  stages: Stage[]
  /** Na ordem de estudo sugerida */
  topics: Topic[]
  quiz: QuizBank
}
