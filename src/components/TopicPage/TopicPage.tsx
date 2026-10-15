import { useEffect, useRef, useState } from 'react'
import { LEVEL_LABEL, pad, resolveRef, topicKey, type Catalog, type TopicEntry } from '../../lib/trilha'
import { drawQuiz, passMark, QUIZ_SIZE } from '../../lib/quiz'
import type { Progress } from '../../hooks/useProgress'
import { QuizDialog } from '../Quiz/QuizDialog'
import { ConnectionGraph } from './ConnectionGraph'
import { CodeBlock } from './CodeBlock'
import { Rich } from './Rich'
import styles from './TopicPage.module.css'

interface Props {
  entry: TopicEntry
  catalog: Catalog
  progress: Progress
}

const SECOES = [
  { id: 'porque', titulo: 'Por que importa' },
  { id: 'como', titulo: 'Como funciona' },
  { id: 'conexoes', titulo: 'Com o que se comunica' },
  { id: 'front', titulo: 'Visão do frontend' },
  { id: 'pratica', titulo: 'Na prática' },
  { id: 'docs', titulo: 'Documentação' },
  { id: 'reflexao', titulo: 'Perguntas para refletir' },
] as const

/** Página de leitura de um assunto: o conteúdo ocupa o centro, sem distrações. */
export function TopicPage({ entry, catalog, progress }: Props) {
  const { topic, stage, trilha } = entry
  const { statusOf, quizOf, setStatus, recordQuiz } = progress
  const status = statusOf(entry.key)
  const quizResult = quizOf(entry.key)
  const pool = trilha.quiz[topic.id] ?? []
  const quizSize = Math.min(QUIZ_SIZE, pool.length)
  const [quizAberto, setQuizAberto] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const index = trilha.topics.indexOf(topic)
  const vizinho = (i: number) => {
    const t = trilha.topics[i]
    return t && catalog.entries.get(topicKey(trilha.id, t.id))
  }
  const prev = vizinho(index - 1)
  const next = vizinho(index + 1)

  const links = topic.conecta
    .map(([ref, why]) => ({ target: catalog.entries.get(resolveRef(trilha.id, ref)), why }))
    .filter((l): l is { target: TopicEntry; why: string } => Boolean(l.target))
  const backlinks = catalog.backlinks.get(entry.key) ?? []
  const outraTrilha = (e: TopicEntry) => (e.trilha.id === trilha.id ? null : e.trilha.title)

  // Cada assunto começa no topo, com o foco no título (leitores de tela anunciam a página nova).
  useEffect(() => {
    window.scrollTo(0, 0)
    titleRef.current?.focus({ preventScroll: true })
    document.title = `${topic.title} · Trilha ${trilha.title}`
  }, [entry.key, topic.title, trilha.title])

  const irPara = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className={styles.page}>
      <nav className={styles.topbar} aria-label="Navegação">
        <a className={styles.back} href={`#${trilha.id}`}>
          ← Trilha {trilha.title}
        </a>
        <span className={styles.position}>
          Assunto {index + 1} de {trilha.topics.length}
        </span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className="eyebrow">
            Etapa {pad(stage.num)} · {stage.title} ·{' '}
            <span className={`lv-${topic.level}`}>{LEVEL_LABEL[topic.level]}</span>
          </span>
          <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
            {topic.title}
          </h1>
          <p className={styles.resumo}>{topic.resumo}</p>

          <div className={styles.progressBox}>
            <div className={styles.seg} role="group" aria-label="Meu status neste assunto">
              {(['nenhum', 'estudando'] as const).map((s) => (
                <button key={s} type="button" data-s={s} aria-pressed={status === s} onClick={() => setStatus(entry.key, s)}>
                  {s === 'nenhum' ? 'Não iniciei' : 'Estudando'}
                </button>
              ))}
              <span className={styles.doneTag} data-done={status === 'concluido'}>
                {status === 'concluido' ? '✓ Concluído' : 'Concluído via quiz'}
              </span>
            </div>

            {quizSize > 0 ? (
              <div className={styles.quizBox} data-done={status === 'concluido'}>
                <p>
                  {status === 'concluido' ? (
                    <>
                      Você passou no quiz
                      {quizResult && (
                        <>
                          {' '}
                          com <b>{quizResult.best}/{quizResult.total}</b>
                        </>
                      )}
                      .
                    </>
                  ) : (
                    <>
                      Para concluir, acerte <b>{passMark(quizSize)} de {quizSize}</b> perguntas sorteadas sobre este assunto.
                      {quizResult && ` Sua melhor tentativa: ${quizResult.best}/${quizResult.total}.`}
                    </>
                  )}
                </p>
                <button type="button" onClick={() => setQuizAberto(true)}>
                  {status === 'concluido' ? 'Refazer quiz' : 'Fazer quiz'}
                </button>
              </div>
            ) : (
              <div className={styles.quizBox}>
                <p>Este assunto ainda não tem quiz.</p>
                <button type="button" onClick={() => setStatus(entry.key, 'concluido')}>
                  Marcar como concluído
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <article className={styles.article}>
          <section id="porque" className={styles.sec}>
            <h2>Por que importa</h2>
            <Rich html={topic.porque} />
          </section>

          <section id="como" className={styles.sec}>
            <h2>Como funciona</h2>
            {topic.como.map((p, i) => (
              <Rich key={i} html={p} />
            ))}
          </section>

          <section id="conexoes" className={styles.sec}>
            <h2>Com o que se comunica</h2>
            <ConnectionGraph entry={entry} links={links.map((l) => l.target)} statusOf={statusOf} onSelect={(k) => (window.location.hash = k)} />
            <ul className={styles.rel}>
              {links.map(({ target, why }) => (
                <li key={target.key}>
                  <a href={`#${target.key}`}>
                    <strong>
                      {target.topic.title}
                      {outraTrilha(target) && <em className={styles.ext}>Trilha {outraTrilha(target)} ↗</em>}
                    </strong>
                    <span>{why}</span>
                  </a>
                </li>
              ))}
            </ul>
            {backlinks.length > 0 && (
              <div className={styles.backlinksBox}>
                <h3>Também citado em</h3>
                <div className={styles.backlinks}>
                  {backlinks.map((o) => (
                    <a key={o.key} href={`#${o.key}`} className="chip">
                      {o.topic.title}
                      {outraTrilha(o) && <span className={styles.chipExt}>{outraTrilha(o)}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section id="front" className={`${styles.sec} ${styles.front}`}>
            <h2>Visão do frontend</h2>
            <Rich html={topic.front} />
          </section>

          <section id="pratica" className={styles.sec}>
            <h2>Na prática</h2>
            <CodeBlock lang={topic.ex.lang} code={topic.ex.code} />
          </section>

          <section id="docs" className={styles.sec}>
            <h2>Documentação</h2>
            <ul className={styles.docs}>
              {topic.docs.map(([label, url]) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <span className={styles.docTitle}>{label}</span>
                    <span className={styles.docHost}>{new URL(url).hostname.replace(/^www\./, '')} ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section id="reflexao" className={styles.sec}>
            <h2>Perguntas para refletir</h2>
            <ul className={styles.questions}>
              {topic.perguntas.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </section>

          <section className={styles.final}>
            <p>Terminou a leitura? Teste o que aprendeu para concluir o assunto.</p>
            {quizSize > 0 && (
              <button type="button" onClick={() => setQuizAberto(true)}>
                {status === 'concluido' ? 'Refazer quiz' : 'Fazer quiz'}
              </button>
            )}
          </section>

          <nav className={styles.nav} aria-label="Navegar entre assuntos">
            {prev ? (
              <a href={`#${prev.key}`}>
                <small>Anterior</small>
                <span>{prev.topic.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a href={`#${next.key}`} className={styles.navNext}>
                <small>Próximo</small>
                <span>{next.topic.title}</span>
              </a>
            ) : (
              <a href={`#${trilha.id}`} className={styles.navNext}>
                <small>Fim da trilha</small>
                <span>Voltar para a trilha</span>
              </a>
            )}
          </nav>
        </article>

        <aside className={styles.toc} aria-label="Nesta página">
          <div className={styles.tocInner}>
            <span className="eyebrow">Nesta página</span>
            <ul>
              {SECOES.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => irPara(s.id)}>
                    {s.titulo}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {quizAberto && (
        <QuizDialog
          eyebrow={`Quiz · ${stage.title}`}
          title={topic.title}
          makeItems={() => drawQuiz(pool)}
          passLabel="O assunto foi marcado como concluído."
          failLabel="Releia o assunto e tente de novo: as perguntas e a ordem mudam a cada rodada."
          passMark={passMark}
          onFinish={(score, total) => {
            if (statusOf(entry.key) === 'nenhum') setStatus(entry.key, 'estudando')
            recordQuiz(entry.key, score, total, score >= passMark(total))
          }}
          onClose={() => setQuizAberto(false)}
        />
      )}
    </div>
  )
}
