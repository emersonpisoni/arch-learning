import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'producao', title: 'Bancos em produção', desc: 'O que muda quando o banco de dados atende tráfego real 24 horas por dia.',
    pratica: 'Num Postgres local, simule um deadlock com duas sessões, aplique uma migration que adiciona uma coluna com índice sem bloquear a tabela (CREATE INDEX CONCURRENTLY) e faça um backup e uma restauração completos.' },
  { id: 'modelagem', title: 'Modelagem avançada', desc: 'Escolhas de modelagem que aparecem em todo sistema real e são difíceis de corrigir depois.',
    pratica: 'Modele um sistema SaaS multi-tenant com histórico de alterações em pedidos: escolha a estratégia de isolamento entre clientes e implemente auditoria com uma tabela de histórico.' },
  { id: 'pipelines', title: 'Pipelines de dados', desc: 'Mover e transformar dados entre sistemas de forma confiável.',
    pratica: 'Monte um pipeline simples: capture mudanças da tabela de pedidos com Debezium (ou um job agendado), transforme e grave numa tabela de análise. Adicione um teste de qualidade que falha se houver pedidos sem cliente.' },
  { id: 'analytics', title: 'Analytics', desc: 'Separar o mundo transacional do analítico e transformar dados em métricas confiáveis.',
    pratica: 'Com DuckDB ou BigQuery Sandbox, modele uma tabela fato de pedidos e dimensões de cliente e produto, e responda: receita por mês, por categoria e por região.' },
  { id: 'busca', title: 'Busca e bancos especializados', desc: 'Quando o banco principal não é a ferramenta certa.',
    pratica: 'Indexe um catálogo de produtos no Elasticsearch ou no OpenSearch com analisador em português e implemente busca com erros de digitação e filtros por categoria.' },
  { id: 'governanca', title: 'Governança e ciclo de vida', desc: 'Saber que dados existem, de onde vieram, quem acessa e quando apagar.',
    pratica: 'Escolha uma tabela com dados pessoais e escreva: dono, finalidade, prazo de retenção, quem acessa e como seria a exclusão de um titular em todos os lugares onde esses dados aparecem.' },
  { id: 'avancado', title: 'Dados avançados', desc: 'O planejador por dentro, bancos distribuídos e de grafos, analytics em tempo real, dados para ML e migrações entre bancos.',
    pratica: 'Pegue a consulta mais lenta do seu sistema (pg_stat_statements), leia o EXPLAIN ANALYZE, encontre a diferença entre linhas estimadas e reais e corrija com o índice certo.' },
]
