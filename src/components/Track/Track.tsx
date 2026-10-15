import type { Status, Topic, Trilha } from '../../types'
import { LEVEL_LABEL, STATUS_LABEL, pad } from '../../lib/trilha'
import styles from './Track.module.css'

interface Props {
  trilha: Trilha
  isVisible: (t: Topic) => boolean
  statusOf: (id: string) => Status
  /** Último assunto aberto nesta trilha, destacado ao voltar */
  lastOpenedId?: string
  onOpen: (id: string) => void
  showPractice: boolean
  query: string
}

export function Track({ trilha, isVisible, statusOf, lastOpenedId, onOpen, showPractice, query }: Props) {
  const sections = trilha.stages
    .map((stage, i) => {
      const all = trilha.topics.filter((t) => t.stage === stage.id)
      return { stage, num: i + 1, all, visible: all.filter(isVisible) }
    })
    .filter((s) => s.visible.length > 0)

  if (sections.length === 0) {
    return (
      <div className={styles.empty}>
        Nenhum assunto encontrado{query && ` para "${query}"`}. Tente outro termo ou limpe os filtros.
      </div>
    )
  }

  return (
    <div>
      {sections.map(({ stage, num, all, visible }) => {
        const done = all.filter((t) => statusOf(t.id) === 'concluido').length
        const complete = done === all.length
        return (
          <section
            key={stage.id}
            className={`${styles.stage} ${complete ? styles.complete : ''}`}
            aria-labelledby={`st-${stage.id}`}
          >
            <div className={styles.station} aria-hidden="true">
              {pad(num)}
            </div>
            <div className={styles.body}>
              <div className={styles.head}>
                <h2 id={`st-${stage.id}`}>{stage.title}</h2>
                <span className={styles.count}>
                  {done}/{all.length} concluídos
                </span>
              </div>
              <p className={styles.desc}>{stage.desc}</p>

              <div className={styles.topics}>
                {visible.map((t) => (
                  <TopicCard
                    key={t.id}
                    trilhaId={trilha.id}
                    topic={t}
                    status={statusOf(t.id)}
                    lastOpened={t.id === lastOpenedId}
                    onOpen={onOpen}
                  />
                ))}
              </div>

              {showPractice && (
                <div className={styles.practice}>
                  <b>Pratique</b>
                  {stage.pratica}
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

interface CardProps {
  trilhaId: string
  topic: Topic
  status: Status
  lastOpened: boolean
  onOpen: (id: string) => void
}

function TopicCard({ trilhaId, topic, status, lastOpened, onOpen }: CardProps) {
  return (
    <a
      href={`#${trilhaId}/${topic.id}`}
      className={styles.topic}
      data-last={lastOpened}
      onClick={() => onOpen(topic.id)}
    >
      <span className={`${styles.level} lv-${topic.level}`}>{LEVEL_LABEL[topic.level]}</span>
      <span className={styles.topicTitle}>{topic.title}</span>
      <span className={styles.topicResumo}>{topic.resumo}</span>
      <span
        className={`${styles.status} ${styles[status]}`}
        title={STATUS_LABEL[status]}
        aria-label={STATUS_LABEL[status]}
      />
    </a>
  )
}
