import { useEffect, useLayoutEffect, useState } from 'react'
import type { Topic, Trilha } from '../../types'
import { matchesQuery, topicKey } from '../../lib/trilha'
import { passMark, SIMULADO_SIZE, shuffle, toItem } from '../../lib/quiz'
import type { Progress } from '../../hooks/useProgress'
import { Header } from '../Header/Header'
import { Filters, type LevelFilter } from '../Filters/Filters'
import { Track } from '../Track/Track'
import { Footer } from '../Footer/Footer'
import { QuizDialog } from '../Quiz/QuizDialog'
import styles from './TrilhaView.module.css'

/** Lembra, por trilha, a rolagem e o último assunto aberto, para voltar ao mesmo ponto. */
const memoria = new Map<string, { scrollY: number; ultimo?: string }>()

interface Props {
  trilha: Trilha
  progress: Progress
}

export function TrilhaView({ trilha, progress }: Props) {
  const { statusOf, resetTrilha } = progress
  const lembrado = memoria.get(trilha.id)

  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<LevelFilter>('todos')
  const [hideDone, setHideDone] = useState(false)
  const [simulado, setSimulado] = useState(false)

  useEffect(() => {
    document.title = `Trilha ${trilha.title} · Arch Learning`
  }, [trilha])

  // Ao voltar de um assunto, restaura a rolagem de onde a pessoa estava.
  useLayoutEffect(() => {
    window.scrollTo(0, memoria.get(trilha.id)?.scrollY ?? 0)
  }, [trilha.id])

  const abrirAssunto = (id: string) => memoria.set(trilha.id, { scrollY: window.scrollY, ultimo: id })

  const localStatus = (id: string) => statusOf(topicKey(trilha.id, id))

  const isVisible = (t: Topic) =>
    (level === 'todos' || t.level === level) &&
    !(hideDone && localStatus(t.id) === 'concluido') &&
    matchesQuery(t, query)

  const done = trilha.topics.filter((t) => localStatus(t.id) === 'concluido').length
  const studying = trilha.topics.filter((t) => localStatus(t.id) === 'estudando').length

  const makeSimulado = () =>
    shuffle(trilha.topics.flatMap((t) => (trilha.quiz[t.id] ?? []).map((question) => ({ question, t }))))
      .slice(0, SIMULADO_SIZE)
      .map(({ question, t }) => toItem(question, t.title))

  return (
    <div className={styles.page}>
      <Header trilha={trilha} total={trilha.topics.length} done={done} studying={studying} onSimulado={() => setSimulado(true)} />

      <Filters query={query} onQuery={setQuery} level={level} onLevel={setLevel} hideDone={hideDone} onHideDone={setHideDone} />

      <main className={styles.main}>
        <Track
          trilha={trilha}
          isVisible={isVisible}
          statusOf={localStatus}
          lastOpenedId={lembrado?.ultimo}
          onOpen={abrirAssunto}
          showPractice={!query && level === 'todos'}
          query={query}
        />
      </main>

      <Footer trilhaTitle={trilha.title} onReset={() => resetTrilha(trilha.id)} />

      {simulado && (
        <QuizDialog
          eyebrow={`Simulado · ${SIMULADO_SIZE} perguntas sorteadas`}
          title={`Trilha ${trilha.title}`}
          makeItems={makeSimulado}
          passLabel="Bom resultado. O simulado não altera o status dos assuntos."
          failLabel="Veja de quais assuntos vieram os erros e faça o quiz deles."
          passMark={passMark}
          onClose={() => setSimulado(false)}
        />
      )}
    </div>
  )
}
