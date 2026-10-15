interface Props {
  html: string
}

/**
 * Renderiza um parágrafo com HTML simples (<b>, <i>, <code>).
 * O conteúdo vem só dos arquivos em src/content, escritos no próprio repo,
 * nunca de input do usuário.
 */
export function Rich({ html }: Props) {
  return <p dangerouslySetInnerHTML={{ __html: html }} />
}
