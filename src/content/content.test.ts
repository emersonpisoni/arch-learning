import { describe, expect, it } from 'vitest'
import { trilhas } from '.'
import { buildCatalog, resolveRef } from '../lib/trilha'

/** Mínimo de perguntas no banco de cada assunto (o quiz sorteia 5). */
const MIN_QUESTIONS = 6

const catalog = buildCatalog(trilhas)

describe('trilhas', () => {
  it('têm ids e números únicos', () => {
    expect(new Set(trilhas.map((t) => t.id)).size).toBe(trilhas.length)
    expect(new Set(trilhas.map((t) => t.numero)).size).toBe(trilhas.length)
  })
})

describe.each(trilhas.map((t) => [t.id, t] as const))('trilha %s', (_, trilha) => {
  const stageIds = new Set(trilha.stages.map((s) => s.id))

  it('tem assuntos com ids únicos', () => {
    const ids = trilha.topics.map((t) => t.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it('coloca cada assunto numa etapa existente, e toda etapa tem assunto', () => {
    expect(trilha.topics.filter((t) => !stageIds.has(t.stage)).map((t) => t.id)).toEqual([])
    const used = new Set(trilha.topics.map((t) => t.stage))
    expect(trilha.stages.filter((s) => !used.has(s.id)).map((s) => s.id)).toEqual([])
  })

  it('só liga assuntos que existem', () => {
    const broken = trilha.topics.flatMap((t) =>
      t.conecta
        .map(([ref]) => resolveRef(trilha.id, ref))
        .filter((key) => !catalog.entries.has(key) || key === `${trilha.id}/${t.id}`)
        .map((key) => `${t.id} -> ${key}`),
    )
    expect(broken).toEqual([])
  })

  it('usa links de documentação https', () => {
    const bad = trilha.topics.flatMap((t) => t.docs.filter(([, url]) => !url.startsWith('https://')).map(([l]) => `${t.id}: ${l}`))
    expect(bad).toEqual([])
  })

  it(`tem pelo menos ${MIN_QUESTIONS} perguntas de quiz por assunto`, () => {
    const short = trilha.topics
      .filter((t) => (trilha.quiz[t.id]?.length ?? 0) < MIN_QUESTIONS)
      .map((t) => `${t.id} (${trilha.quiz[t.id]?.length ?? 0})`)
    expect(short).toEqual([])
  })

  it('só tem quiz para assuntos que existem', () => {
    const ids = new Set(trilha.topics.map((t) => t.id))
    expect(Object.keys(trilha.quiz).filter((id) => !ids.has(id))).toEqual([])
  })

  it('tem perguntas com 4 alternativas distintas e sem enunciado repetido', () => {
    const all = Object.entries(trilha.quiz).flatMap(([id, list]) => list.map((question) => ({ id, ...question })))
    const badOptions = all.filter((x) => new Set(x.options.map((o) => o.trim())).size !== 4 || x.options.some((o) => !o.trim()))
    expect(badOptions.map((x) => `${x.id}: ${x.q}`)).toEqual([])

    const texts = all.map((x) => x.q)
    expect(texts.filter((t, i) => texts.indexOf(t) !== i)).toEqual([])
  })
})
