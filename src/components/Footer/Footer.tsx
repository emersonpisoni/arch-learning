import { useEffect, useState } from 'react'
import styles from './Footer.module.css'

interface Props {
  trilhaTitle: string
  onReset: () => void
}

export function Footer({ trilhaTitle, onReset }: Props) {
  // Zerar pede um segundo clique em até 3 s, para evitar acidentes.
  const [armed, setArmed] = useState(false)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    if (!armed) return
    const id = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(id)
  }, [armed])

  const handleClick = () => {
    if (!armed) {
      setArmed(true)
      setCleared(false)
      return
    }
    onReset()
    setArmed(false)
    setCleared(true)
  }

  return (
    <footer className={styles.foot}>
      <span>Seu progresso fica salvo neste navegador.</span>
      <button type="button" onClick={handleClick}>
        {armed
          ? 'Clique de novo para confirmar'
          : cleared
            ? 'Progresso zerado'
            : `Zerar progresso da trilha ${trilhaTitle}`}
      </button>
    </footer>
  )
}
