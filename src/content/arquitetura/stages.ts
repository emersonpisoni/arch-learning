import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'fundamentos', title: 'Pensar como arquiteto', desc: 'O que é arquitetura, o que guia as decisões e por que tudo é trade-off.',
    pratica: 'Escolha um sistema que você conhece e liste os cinco requisitos não funcionais mais importantes dele, com um número para cada (ex.: p95 < 300 ms). Depois aponte uma decisão de arquitetura que existe por causa de cada um.' },
  { id: 'estilos', title: 'Estilos de arquitetura', desc: 'Formas de organizar um sistema inteiro, além do monolito versus microsserviços.',
    pratica: 'Pegue um monolito (pode ser um projeto seu) e desenhe como você o dividiria em módulos com fronteiras claras. Indique qual módulo seria o primeiro candidato a virar serviço, e por quê.' },
  { id: 'comunicacao', title: 'Comunicação entre partes', desc: 'Como serviços conversam sem que a falha de um derrube todos.',
    pratica: 'Numa API que chama outra, adicione timeout, retry com backoff e circuit breaker. Use um servidor que demora 5 s para responder e observe o comportamento antes e depois.' },
  { id: 'escala-dados', title: 'Dados em escala', desc: 'Replicar, particionar e cachear quando um banco só não basta.',
    pratica: 'Faça a estimativa de capacidade de um sistema de fotos com 10 milhões de usuários ativos por dia: requisições por segundo, armazenamento por ano e banda. Use números redondos e escreva as premissas.' },
  { id: 'decisoes', title: 'Documentar e decidir', desc: 'Comunicar arquitetura com diagramas e registrar o porquê das decisões.',
    pratica: 'Desenhe os diagramas C4 de contexto e de containers do sistema em que você trabalha e escreva um ADR para uma decisão recente do time.' },
  { id: 'casos', title: 'Estudos de caso de system design', desc: 'Aplicar tudo em problemas clássicos de entrevista e do dia a dia.',
    pratica: 'Escolha um dos casos, defina requisitos e números, desenhe a solução em 45 minutos e depois compare com as referências da documentação de cada caso.' },
  { id: 'avancado', title: 'Sistemas distribuídos avançados', desc: 'Consenso, tempo, colaboração em tempo real, células e múltiplas regiões, mais dois estudos de caso.',
    pratica: 'Rode a visualização do Raft e provoque uma partição de rede; depois implemente um contador compartilhado com Yjs entre duas abas do navegador e desligue a rede de uma delas.' },
]
