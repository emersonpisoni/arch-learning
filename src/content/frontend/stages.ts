import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'navegador', title: 'Como o navegador funciona', desc: 'O caminho de uma URL até os pixels, e o que acontece entre um clique e a próxima pintura.',
    pratica: 'Grave um perfil na aba Performance do DevTools carregando uma página do seu projeto. Identifique as fases de parse, estilo, layout e pintura, e encontre a tarefa mais longa da thread principal.' },
  { id: 'interface', title: 'Fundamentos de interface', desc: 'CSS moderno, layout responsivo, formulários e roteamento: a base de qualquer interface web.',
    pratica: 'Refaça uma tela do seu app usando Grid e container queries, sem media queries de tela, e revise um formulário: rótulos, tipos de campo, autocomplete e mensagens de erro acessíveis.' },
  { id: 'renderizacao', title: 'Estratégias de renderização', desc: 'Onde e quando o HTML é gerado, e o que isso muda para o usuário e para a infraestrutura.',
    pratica: 'Crie a mesma página de produto em três versões (CSR, SSR e estática) e compare TTFB, LCP e o comportamento com JavaScript desativado.' },
  { id: 'performance', title: 'Performance', desc: 'Medir o que o usuário sente e otimizar carregamento, imagens, cache e execução.',
    pratica: 'Rode o Lighthouse e o painel de Web Vitals numa página real do seu produto, escolha a pior métrica e faça uma mudança que a melhore de forma mensurável.' },
  { id: 'acessibilidade', title: 'Acessibilidade', desc: 'Interfaces que funcionam para todas as pessoas, com qualquer forma de interação.',
    pratica: 'Navegue por um fluxo inteiro do seu produto só com o teclado e depois com um leitor de tela (VoiceOver ou NVDA). Anote e corrija os três problemas mais graves.' },
  { id: 'arquitetura-front', title: 'Arquitetura de front', desc: 'Organizar estado, dados, componentes e times em aplicações grandes.',
    pratica: 'Mapeie o estado da sua aplicação em quatro grupos (servidor, URL, formulário e interface) e verifique se cada um está na ferramenta certa.' },
  { id: 'build', title: 'Build e entrega', desc: 'Do código-fonte ao arquivo que chega ao navegador, e o que acontece depois.',
    pratica: 'Analise o bundle de produção do seu projeto com um visualizador (rollup-plugin-visualizer ou source-map-explorer), encontre a maior dependência e avalie se ela pode ser carregada sob demanda.' },
  { id: 'avancado', title: 'Frontend avançado', desc: 'Como os frameworks funcionam por dentro, trabalho pesado no navegador, gráficos, local-first, internacionalização, animações, Web Components e SEO.',
    pratica: 'Mova um processamento pesado do seu app para um Web Worker e meça o INP antes e depois; depois adicione uma View Transition entre a lista e o detalhe, respeitando prefers-reduced-motion.' },
]
