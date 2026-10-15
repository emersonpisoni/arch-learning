import type { KeyboardEvent } from 'react'
import type { Status } from '../../types'
import type { TopicEntry } from '../../lib/trilha'
import styles from './TopicPage.module.css'

const W = 380
const H = 220
const CX = W / 2
const CY = H / 2
const RX = 122
const RY = 78

/** Largura aproximada da pílula a partir do número de caracteres do rótulo. */
const pillWidth = (label: string) => Math.round(label.length * 6.9 + 24)

interface Props {
  entry: TopicEntry
  links: TopicEntry[]
  statusOf: (key: string) => Status
  onSelect: (key: string) => void
}

/**
 * O assunto atual no centro e os relacionados numa elipse ao redor.
 * Assuntos de outra trilha aparecem com borda tracejada e uma seta.
 */
export function ConnectionGraph({ entry, links, statusOf, onSelect }: Props) {
  const nodes = links.map((target, i) => {
    const angle = ((-90 + (i * 360) / links.length) * Math.PI) / 180
    const external = target.trilha.id !== entry.trilha.id
    const label = external ? `${target.topic.short} ↗` : target.topic.short
    return { target, label, external, x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle), w: pillWidth(label) }
  })
  const centerW = pillWidth(entry.topic.short) + 8

  const onKey = (e: KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(key)
    }
  }

  return (
    <svg
      className={styles.graph}
      viewBox={`0 0 ${W} ${H}`}
      role="group"
      aria-label={`Assuntos conectados a ${entry.topic.title}`}
    >
      {nodes.map((n) => (
        <line key={`l-${n.target.key}`} x1={CX} y1={CY} x2={n.x} y2={n.y} />
      ))}

      {nodes.map((n) => (
        <g
          key={n.target.key}
          className={[
            styles.gnode,
            statusOf(n.target.key) === 'concluido' && styles.gdone,
            n.external && styles.gext,
          ]
            .filter(Boolean)
            .join(' ')}
          tabIndex={0}
          role="button"
          aria-label={`Abrir ${n.target.topic.title}${n.external ? `, da trilha ${n.target.trilha.title}` : ''}`}
          onClick={() => onSelect(n.target.key)}
          onKeyDown={(e) => onKey(e, n.target.key)}
        >
          <rect x={n.x - n.w / 2} y={n.y - 13} width={n.w} height={26} rx={13} />
          <text x={n.x} y={n.y + 4} textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}

      <g className={styles.gcenter}>
        <rect x={CX - centerW / 2} y={CY - 15} width={centerW} height={30} rx={15} />
        <text x={CX} y={CY + 4} textAnchor="middle">
          {entry.topic.short}
        </text>
      </g>
    </svg>
  )
}
