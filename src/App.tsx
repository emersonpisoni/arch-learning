import { useMemo } from 'react'
import { trilhas } from './content'
import { buildCatalog, topicKey } from './lib/trilha'
import { useProgress } from './hooks/useProgress'
import { useRoute } from './hooks/useRoute'
import { Home } from './components/Home/Home'
import { TrilhaView } from './components/TrilhaView/TrilhaView'
import { TopicPage } from './components/TopicPage/TopicPage'

export default function App() {
  const catalog = useMemo(() => buildCatalog(trilhas), [])
  const progress = useProgress()
  const { route } = useRoute(catalog)

  if (route.view === 'home') {
    return <Home catalog={catalog} progress={progress} />
  }

  if (route.view === 'topic') {
    return (
      <TopicPage
        entry={catalog.entries.get(topicKey(route.trilhaId, route.topicId))!}
        catalog={catalog}
        progress={progress}
      />
    )
  }

  return (
    <TrilhaView
      // remonta ao trocar de trilha: filtros começam do zero
      key={route.trilhaId}
      trilha={catalog.trilhaById.get(route.trilhaId)!}
      progress={progress}
    />
  )
}
