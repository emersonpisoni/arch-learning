import { useCallback, useEffect, useState } from 'react'
import type { Status } from '../types'

export interface QuizResult {
  best: number
  total: number
}

interface ProgressState {
  /** Por chave global "trilha/id". Ausente = não iniciado. */
  status: Record<string, Exclude<Status, 'nenhum'>>
  quiz: Record<string, QuizResult>
}

const KEY = 'arch-learning:progress:v2'
const LEGACY_BACKEND_KEY = 'trilha-backend:status:v1'

function load(): ProgressState {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return JSON.parse(saved) as ProgressState

    // Migra o progresso da primeira versão, que só tinha a trilha backend.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_BACKEND_KEY) ?? '{}') as Record<string, Status>
    const status: ProgressState['status'] = {}
    for (const [id, s] of Object.entries(legacy)) if (s !== 'nenhum') status[`backend/${id}`] = s
    return { status, quiz: {} }
  } catch {
    return { status: {}, quiz: {} }
  }
}

/** Progresso de estudo de todas as trilhas, salvo no localStorage deste navegador. */
export function useProgress() {
  const [state, setState] = useState<ProgressState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // modo privado ou storage bloqueado: o progresso vale só nesta sessão
    }
  }, [state])

  const statusOf = useCallback((key: string): Status => state.status[key] ?? 'nenhum', [state])
  const quizOf = useCallback((key: string): QuizResult | undefined => state.quiz[key], [state])

  const setStatus = useCallback((key: string, s: Status) => {
    setState((prev) => {
      const status = { ...prev.status }
      if (s === 'nenhum') delete status[key]
      else status[key] = s
      return { ...prev, status }
    })
  }, [])

  /** Guarda o resultado do quiz; passar no quiz conclui o assunto. */
  const recordQuiz = useCallback((key: string, score: number, total: number, passed: boolean) => {
    setState((prev) => {
      const old = prev.quiz[key]
      const quiz = old && old.best / old.total >= score / total ? prev.quiz : { ...prev.quiz, [key]: { best: score, total } }
      const status = passed ? { ...prev.status, [key]: 'concluido' as const } : prev.status
      return { status, quiz }
    })
  }, [])

  const resetTrilha = useCallback((trilhaId: string) => {
    const keep = (k: string) => !k.startsWith(`${trilhaId}/`)
    setState((prev) => ({
      status: Object.fromEntries(Object.entries(prev.status).filter(([k]) => keep(k))),
      quiz: Object.fromEntries(Object.entries(prev.quiz).filter(([k]) => keep(k))),
    }))
  }, [])

  return { statusOf, quizOf, setStatus, recordQuiz, resetTrilha }
}

export type Progress = ReturnType<typeof useProgress>
