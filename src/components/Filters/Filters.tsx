import { useEffect, useRef } from 'react'
import type { Level } from '../../types'
import { LEVEL_LABEL } from '../../lib/trilha'
import styles from './Filters.module.css'

export type LevelFilter = Level | 'todos'

const LEVELS: LevelFilter[] = ['todos', 'essencial', 'importante', 'aprofundar']
const LEVEL_DOT: Record<Level, string> = { essencial: 'var(--l1)', importante: 'var(--l2)', aprofundar: 'var(--l3)' }

interface Props {
  query: string
  onQuery: (q: string) => void
  level: LevelFilter
  onLevel: (l: LevelFilter) => void
  hideDone: boolean
  onHideDone: (v: boolean) => void
}

export function Filters({ query, onQuery, level, onLevel, hideDone, onHideDone }: Props) {
  const searchRef = useRef<HTMLInputElement>(null)

  // Atalho "/" para focar a busca, como em muitas documentações.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={styles.controls}>
      <label className={styles.search} htmlFor="q">
        <svg viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={searchRef}
          id="q"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value.trim())}
          placeholder="Buscar assunto, ex.: cache, JWT, threads"
          autoComplete="off"
          aria-label="Buscar assunto"
        />
        <kbd>/</kbd>
      </label>

      <div className={styles.chips} role="group" aria-label="Filtrar por nível">
        {LEVELS.map((l) => (
          <button key={l} type="button" className="chip" aria-pressed={level === l} onClick={() => onLevel(l)}>
            {l !== 'todos' && <span className={styles.dot} style={{ background: LEVEL_DOT[l] }} />}
            {l === 'todos' ? 'Todos' : LEVEL_LABEL[l]}
          </button>
        ))}
      </div>

      <label className={styles.toggle} htmlFor="hide-done">
        <input id="hide-done" type="checkbox" checked={hideDone} onChange={(e) => onHideDone(e.target.checked)} />
        Esconder concluídos
      </label>
    </div>
  )
}
