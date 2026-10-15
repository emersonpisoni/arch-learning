import { useRef, useState } from 'react'
import styles from './TopicPage.module.css'

const COMMENT = /^\s*(\/\/|#|--)/

interface Props {
  lang: string
  code: string
}

export function CodeBlock({ lang, code }: Props) {
  const codeRef = useRef<HTMLElement>(null)
  const [label, setLabel] = useState('Copiar')

  const flash = (text: string) => {
    setLabel(text)
    setTimeout(() => setLabel('Copiar'), 1500)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      flash('Copiado')
    } catch {
      // sem permissão de clipboard: seleciona o texto para o Ctrl+C manual
      const range = document.createRange()
      range.selectNodeContents(codeRef.current!)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      flash('Selecionado')
    }
  }

  return (
    <div className={styles.code}>
      <div className={styles.codeBar}>
        <span>{lang}</span>
        <button type="button" onClick={copy}>
          {label}
        </button>
      </div>
      <pre>
        <code ref={codeRef}>
          {code.split('\n').map((line, i) => (
            <span key={i} className={COMMENT.test(line) ? styles.comment : undefined}>
              {line}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
