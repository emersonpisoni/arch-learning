import { useEffect, useRef, useState } from 'react'
import type { QuizItem } from '../../lib/quiz'
import styles from './QuizDialog.module.css'

interface Props {
  eyebrow: string
  title: string
  /** Chamado a cada rodada: sorteia perguntas e embaralha alternativas */
  makeItems: () => QuizItem[]
  passMark: (total: number) => number
  passLabel: string
  failLabel: string
  onFinish?: (score: number, total: number) => void
  onClose: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function QuizDialog({ eyebrow, title, makeItems, passMark, passLabel, failLabel, onFinish, onClose }: Props) {
  const [items, setItems] = useState(makeItems)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const dialogRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const finished = answers.length === items.length && current === items.length
  const item = items[current]
  const answered = answers[current] !== undefined
  const score = answers.filter((a, i) => a === items[i].correct).length

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Foco no enunciado a cada pergunta, para leitores de tela e teclado.
  useEffect(() => {
    headingRef.current?.focus()
  }, [current])

  const answer = (option: number) => {
    if (answered) return
    setAnswers((prev) => [...prev, option])
  }

  const advance = () => {
    const nextIndex = current + 1
    if (nextIndex === items.length) onFinish?.(score, items.length)
    setCurrent(nextIndex)
  }

  const retry = () => {
    setItems(makeItems())
    setAnswers([])
    setCurrent(0)
  }

  const passed = score >= passMark(items.length)

  return (
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="quiz-title">
        <header className={styles.top}>
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <div id="quiz-title" className={styles.title}>
              {title}
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            Fechar
          </button>
        </header>

        <ol className={styles.dots} aria-label="Progresso do quiz">
          {items.map((it, i) => {
            const a = answers[i]
            const state = a === undefined ? (i === current ? 'current' : 'todo') : a === it.correct ? 'right' : 'wrong'
            return <li key={i} className={styles[state]} aria-label={`Pergunta ${i + 1}: ${state}`} />
          })}
        </ol>

        {items.length === 0 ? (
          <p className={styles.empty}>Este assunto ainda não tem perguntas de quiz.</p>
        ) : !finished ? (
          <div className={styles.body}>
            <div className={styles.counter}>
              Pergunta {current + 1} de {items.length}
              {item.source && <span> · {item.source}</span>}
            </div>
            <h2 ref={headingRef} tabIndex={-1} className={styles.question}>
              {item.q}
            </h2>

            <div className={styles.options} role="group" aria-label="Alternativas">
              {item.options.map((opt, i) => {
                const state = !answered
                  ? ''
                  : i === item.correct
                    ? styles.right
                    : i === answers[current]
                      ? styles.wrong
                      : styles.dim
                return (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.option} ${state}`}
                    onClick={() => answer(i)}
                    disabled={answered}
                    aria-pressed={answers[current] === i}
                  >
                    <span className={styles.letter}>{LETTERS[i]}</span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className={styles.feedback} aria-live="polite">
                <strong className={answers[current] === item.correct ? styles.okText : styles.badText}>
                  {answers[current] === item.correct ? 'Correto.' : 'Não é essa.'}
                </strong>{' '}
                {item.explain}
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={advance} disabled={!answered}>
                {current + 1 === items.length ? 'Ver resultado' : 'Próxima pergunta'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.body}>
            <div className={`${styles.result} ${passed ? styles.resultOk : styles.resultBad}`}>
              <span className={styles.score}>
                {score}/{items.length}
              </span>
              <div>
                <h2 ref={headingRef} tabIndex={-1}>
                  {passed ? 'Aprovado' : `Faltou pouco: são necessários ${passMark(items.length)} acertos`}
                </h2>
                <p>{passed ? passLabel : failLabel}</p>
              </div>
            </div>

            {score < items.length && (
              <div className={styles.review}>
                <h3>Revise os erros</h3>
                <ul>
                  {items.map((it, i) =>
                    answers[i] === it.correct ? null : (
                      <li key={i}>
                        <strong>{it.q}</strong>
                        {it.source && <em> ({it.source})</em>}
                        <span>Resposta: {it.options[it.correct]}</span>
                        <span className={styles.reviewExplain}>{it.explain}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={retry}>
                Nova rodada
              </button>
              <button type="button" className={styles.primary} onClick={onClose}>
                Voltar ao assunto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
