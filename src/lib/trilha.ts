import type { Level, Stage, Status, Topic, Trilha } from '../types'

export const LEVEL_LABEL: Record<Level, string> = {
  essencial: 'Essencial',
  importante: 'Importante',
  aprofundar: 'Aprofundar',
}

export const STATUS_LABEL: Record<Status, string> = {
  nenhum: 'Não iniciei',
  estudando: 'Estudando',
  concluido: 'Concluído',
}

/** Identificador global de um assunto: "trilha/id" */
export const topicKey = (trilhaId: string, id: string) => `${trilhaId}/${id}`

/** Converte uma referência de `conecta` ("id" ou "trilha/id") em chave global. */
export const resolveRef = (trilhaId: string, ref: string) => (ref.includes('/') ? ref : topicKey(trilhaId, ref))

export type StageWithNum = Stage & { num: number }

export interface TopicEntry {
  key: string
  topic: Topic
  trilha: Trilha
  stage: StageWithNum
}

export interface Catalog {
  trilhas: Trilha[]
  trilhaById: Map<string, Trilha>
  entries: Map<string, TopicEntry>
  /** Assuntos que citam um assunto, sem repetir os que ele mesmo já cita */
  backlinks: Map<string, TopicEntry[]>
}

export function buildCatalog(trilhas: Trilha[]): Catalog {
  const trilhaById = new Map(trilhas.map((t) => [t.id, t]))
  const entries = new Map<string, TopicEntry>()

  for (const trilha of trilhas) {
    const stages = new Map(trilha.stages.map((s, i) => [s.id, { ...s, num: i + 1 }]))
    for (const topic of trilha.topics) {
      const key = topicKey(trilha.id, topic.id)
      entries.set(key, { key, topic, trilha, stage: stages.get(topic.stage)! })
    }
  }

  const backlinks = new Map<string, TopicEntry[]>([...entries.keys()].map((k) => [k, []]))
  for (const entry of entries.values()) {
    for (const [ref] of entry.topic.conecta) {
      const target = entries.get(resolveRef(entry.trilha.id, ref))
      if (!target) continue
      const targetCites = target.topic.conecta.some(([r]) => resolveRef(target.trilha.id, r) === entry.key)
      if (!targetCites) backlinks.get(target.key)!.push(entry)
    }
  }

  return { trilhas, trilhaById, entries, backlinks }
}

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function matchesQuery(topic: Topic, query: string): boolean {
  if (!query) return true
  const haystack = [topic.title, topic.short, topic.resumo, topic.porque, ...topic.como].join(' ')
  return normalize(haystack).includes(normalize(query))
}

export const pad = (n: number) => String(n).padStart(2, '0')

export const countQuestions = (trilha: Trilha) =>
  Object.values(trilha.quiz).reduce((sum, list) => sum + list.length, 0)
