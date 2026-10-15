import type { Trilha } from '../../types'
import { pad } from '../../lib/trilha'
import styles from './Header.module.css'

interface Props {
  trilha: Trilha
  total: number
  done: number
  studying: number
  onSimulado: () => void
}

export function Header({ trilha, total, done, studying, onSimulado }: Props) {
  const pct = (n: number) => (n / total) * 100

  return (
    <header className={styles.top}>
      <div>
        <div className="eyebrow">
          <a className={styles.back} href="#">
            ← Todas as trilhas
          </a>{' '}
          / <b className={styles.crumb}>trilha {pad(trilha.numero)}</b>
        </div>
        <h1 className={styles.title}>
          Trilha <span>{trilha.title}</span>
        </h1>
        <p className={styles.lede}>{trilha.lede}</p>
      </div>

      <div className={styles.meter} aria-live="polite">
        <div className={styles.num}>
          <strong>{Math.round(pct(done))}%</strong>
          <span>
            {done} de {total} concluídos
          </span>
        </div>
        <div
          className={styles.bar}
          role="img"
          aria-label={`${done} concluídos, ${studying} estudando, de ${total}`}
        >
          <i className={styles.ok} style={{ width: `${pct(done)}%` }} />
          <i className={styles.wip} style={{ width: `${pct(studying)}%` }} />
        </div>
        <div className={styles.legend}>
          <span className={styles.kOk}>{done} concluídos</span>
          <span className={styles.kWip}>{studying} estudando</span>
          <span className={styles.kTodo}>{total - done - studying} a estudar</span>
        </div>
        <button type="button" className={styles.simulado} onClick={onSimulado}>
          Fazer simulado da trilha
        </button>
      </div>
    </header>
  )
}
