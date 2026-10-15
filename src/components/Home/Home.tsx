import { useEffect } from 'react'
import { countQuestions, pad, topicKey, type Catalog } from '../../lib/trilha'
import type { Progress } from '../../hooks/useProgress'
import styles from './Home.module.css'

interface Props {
  catalog: Catalog
  progress: Progress
}

const fmt = new Intl.NumberFormat('pt-BR')

export function Home({ catalog, progress }: Props) {
  useEffect(() => {
    document.title = 'Arch Learning'
    window.scrollTo(0, 0)
  }, [])

  const cards = catalog.trilhas.map((trilha) => {
    const total = trilha.topics.length
    const done = trilha.topics.filter((t) => progress.statusOf(topicKey(trilha.id, t.id)) === 'concluido').length
    const started = trilha.topics.some((t) => progress.statusOf(topicKey(trilha.id, t.id)) !== 'nenhum')
    return { trilha, total, done, started, questions: countQuestions(trilha) }
  })

  const allTopics = cards.reduce((s, c) => s + c.total, 0)
  const allDone = cards.reduce((s, c) => s + c.done, 0)
  const allQuestions = cards.reduce((s, c) => s + c.questions, 0)

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className="eyebrow">arch-learning</div>
        <h1>
          Entenda o software <span>de ponta a ponta</span>
        </h1>
        <p className={styles.lede}>
          Uma biblioteca de estudo para devs de qualquer área entenderem as partes de um sistema de software:
          backend, frontend, infraestrutura, arquitetura, dados, segurança e IA. Cada assunto termina com um quiz: você só conclui quando acerta.
        </p>
        <dl className={styles.stats}>
          <div>
            <dt>Trilhas</dt>
            <dd>{catalog.trilhas.length}</dd>
          </div>
          <div>
            <dt>Assuntos</dt>
            <dd>{fmt.format(allTopics)}</dd>
          </div>
          <div>
            <dt>Perguntas no quiz</dt>
            <dd>{fmt.format(allQuestions)}</dd>
          </div>
          <div>
            <dt>Concluídos por você</dt>
            <dd>
              {allDone}
              <small>/{allTopics}</small>
            </dd>
          </div>
        </dl>
      </header>

      <ul className={styles.grid}>
        {cards.map(({ trilha, total, done, started, questions }) => (
          <li key={trilha.id}>
            <a className={styles.card} href={`#${trilha.id}`}>
              <div className={styles.cardTop}>
                <span className={styles.num}>{pad(trilha.numero)}</span>
                <span className={styles.meta}>
                  {trilha.stages.length} etapas · {total} assuntos · {fmt.format(questions)} perguntas
                </span>
              </div>
              <h2>{trilha.title}</h2>
              <p>{trilha.lede}</p>
              <div className={styles.cardFoot}>
                <div className={styles.bar} aria-hidden="true">
                  <i style={{ width: `${(done / total) * 100}%` }} />
                </div>
                <span className={styles.cta}>
                  {done === total ? 'Concluída' : started ? `Continuar · ${done}/${total}` : 'Começar'} →
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <footer className={styles.foot}>Seu progresso fica salvo neste navegador.</footer>
    </div>
  )
}
