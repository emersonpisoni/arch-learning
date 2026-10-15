import { useCallback, useEffect, useState } from 'react'
import type { Catalog } from '../lib/trilha'

export type Route =
  | { view: 'home' }
  | { view: 'trilha'; trilhaId: string }
  | { view: 'topic'; trilhaId: string; topicId: string }

/**
 * Rotas pelo #hash, sem servidor:
 *   #               → tela inicial
 *   #backend        → mapa da trilha
 *   #backend/cors   → página de leitura do assunto
 */
function parse(hash: string, catalog: Catalog): Route {
  const [trilhaId, topicId] = decodeURIComponent(hash.replace(/^#\/?/, '')).split('/')
  if (catalog.trilhaById.has(trilhaId)) {
    if (topicId && catalog.entries.has(`${trilhaId}/${topicId}`)) return { view: 'topic', trilhaId, topicId }
    return { view: 'trilha', trilhaId }
  }
  // links antigos da primeira versão: #cors
  if (trilhaId && catalog.entries.has(`backend/${trilhaId}`)) return { view: 'topic', trilhaId: 'backend', topicId: trilhaId }
  return { view: 'home' }
}

export function useRoute(catalog: Catalog) {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash, catalog))

  useEffect(() => {
    const onHashChange = () => setRoute(parse(window.location.hash, catalog))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [catalog])

  const go = useCallback((path: string) => {
    window.location.hash = path
  }, [])

  return { route, go }
}
