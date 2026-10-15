import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'sistemas', title: 'Sistemas e redes na prática', desc: 'O chão onde tudo roda: processos, recursos da máquina, redes e acesso remoto.',
    pratica: 'Suba uma VM barata (ou um container Ubuntu), acesse por SSH com chave, escreva um script que verifica disco, memória e uma URL de health check e agende com cron.' },
  { id: 'cloud', title: 'Nuvem', desc: 'Os blocos que os provedores oferecem e como escolher entre eles.',
    pratica: 'Numa conta gratuita, crie um bucket para servir um site estático atrás de uma CDN e uma função serverless que responde a /api/hello. Configure um usuário IAM com o mínimo de permissões.' },
  { id: 'containers', title: 'Containers e Kubernetes', desc: 'Empacotar, orquestrar e expor aplicações em containers.',
    pratica: 'Com kind ou minikube, faça o deploy de uma API com 3 réplicas, um Service, um Ingress, um ConfigMap e probes. Mate um pod e observe o Kubernetes recriá-lo.' },
  { id: 'iac', title: 'Infraestrutura como código', desc: 'Descrever a infraestrutura em arquivos versionados, revisados e reproduzíveis.',
    pratica: 'Escreva com Terraform um bucket e uma fila, guarde o state remotamente, mude uma configuração e leia o plan antes de aplicar. Depois destrua tudo com um comando.' },
  { id: 'entrega', title: 'Entrega de software', desc: 'Do commit ao ambiente de produção, com segurança e velocidade.',
    pratica: 'Monte um pipeline que roda testes em paralelo com cache de dependências, gera uma imagem versionada pelo SHA do commit e faz deploy em staging automaticamente e em produção com aprovação.' },
  { id: 'sre', title: 'Confiabilidade (SRE)', desc: 'Manter o sistema no ar, medir o que importa e aprender com falhas.',
    pratica: 'Defina um SLO para uma API, crie um alerta de burn rate, simule um incidente derrubando uma dependência e escreva um postmortem sem culpados.' },
  { id: 'avancado', title: 'Plataforma e operação avançada', desc: 'Plataformas internas, operators, políticas como código, tráfego global e telemetria em escala.',
    pratica: 'Crie uma política de Kyverno em modo de auditoria e um pipeline do OpenTelemetry Collector que remove um atributo sensível e faz amostragem por cauda; verifique o resultado no Grafana Tempo local.' },
]
