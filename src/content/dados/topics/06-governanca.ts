import type { Topic } from '../../../types'

export const governanca: Topic[] = [
{ id: 'retencao-anonimizacao', stage: 'governanca', level: 'essencial', title: 'Retenção, anonimização e exclusão', short: 'Retenção',
  resumo: `Quanto tempo guardar cada dado e como apagá-lo ou descaracterizá-lo de verdade.`,
  porque: `Dados guardados para sempre aumentam custo, risco de vazamento e obrigações legais. Quando um usuário pede a exclusão da conta, os dados dele estão no banco, em backups, logs, warehouse, ferramentas de terceiros e ambientes de teste.`,
  como: [
    `Defina <b>prazos de retenção</b> por tipo de dado e finalidade (pedidos podem ter prazo fiscal; logs de acesso, alguns meses) e automatize a remoção. <b>Anonimização</b> remove a possibilidade de identificar a pessoa de forma irreversível; <b>pseudonimização</b> troca identificadores por códigos, mas continua sendo dado pessoal porque é reversível com a chave.`,
    `Para exclusão do titular: mapeie onde os dados estão (catálogo), propague a exclusão por eventos para os outros sistemas, trate backups (expiração natural ou exclusão na restauração) e prefira <b>dados sintéticos</b> ou anonimizados em ambientes de teste. Técnicas: mascaramento, generalização (idade → faixa etária), agregação e remoção de campos.`,
  ],
  conecta: [['seguranca/lgpd', 'As obrigações legais por trás disso.'], ['governanca', 'Saber onde os dados estão.'], ['backup-banco', 'Backups também precisam respeitar a retenção.'], ['soft-delete-auditoria', 'Soft delete não é exclusão.']],
  front: `O fluxo de "excluir minha conta" no front dispara, por trás, a exclusão em vários sistemas. Vale entender o que acontece de fato antes de prometer algo na interface.`,
  ex: { lang: 'sql', code: `-- anonimizar um cliente que pediu exclusão, mantendo os pedidos para fins fiscais
UPDATE clientes
   SET nome = 'Cliente removido',
       email = 'removido+' || id || '@invalid',
       telefone = NULL,
       documento = NULL,
       anonimizado_em = now()
 WHERE id = 7;

-- retenção automática: logs de acesso com mais de 180 dias
DELETE FROM logs_acesso WHERE ocorrido_em < now() - interval '180 days';` },
  docs: [['ANPD · Documentos e publicações', 'https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/documentos-de-publicacoes'], ['ICO · Anonymisation guidance', 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/'], ['OWASP · User Privacy Protection Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html']],
  perguntas: [`Em quantos lugares estão os dados de um cliente do seu produto?`, `Qual a diferença entre anonimização e pseudonimização?`, `O que acontece com os dados de um usuário que excluiu a conta nos backups?`] },

{ id: 'governanca', stage: 'governanca', level: 'importante', title: 'Catálogo, linhagem e governança', short: 'Governança',
  resumo: `Saber que dados existem, o que significam, de onde vieram e quem pode usar.`,
  porque: `Em empresas com muitos sistemas, encontrar "a tabela certa" vira um problema, e ninguém sabe o impacto de mudar uma coluna. Governança evita dados duplicados, mal interpretados ou acessados por quem não deveria.`,
  como: [
    `Um <b>catálogo de dados</b> (DataHub, OpenMetadata, Unity Catalog) lista tabelas, colunas, descrições, donos e classificações (dado pessoal, sensível, público). A <b>linhagem</b> mostra de onde cada tabela vem e quem a consome, o que permite avaliar o impacto de uma mudança antes de fazê-la.`,
    `Controle de acesso por <b>classificação</b> (quem pode ver dados pessoais), mascaramento de colunas sensíveis no warehouse, <b>donos</b> para cada conjunto de dados e definição de padrões de nomes e qualidade. A abordagem de <b>data mesh</b> distribui a propriedade dos dados para os times de domínio, tratando dados como produto.`,
  ],
  conecta: [['qualidade-dados', 'Contratos e testes fazem parte da governança.'], ['metricas-bi', 'Definições únicas de métricas.'], ['seguranca/lgpd', 'Classificar dados pessoais é exigência prática da LGPD.'], ['arquitetura/conway', 'Data mesh aplica donos por domínio, como nos serviços.']],
  front: `Eventos de analytics do front também entram no catálogo: ter dono e descrição para cada evento evita que alguém o remova sem saber quem depende dele.`,
  ex: { lang: 'yaml', code: `# metadados de uma tabela num catálogo (exemplo genérico)
tabela: analytics.pedidos
dono: time-pagamentos
descricao: "Um registro por pedido pago, atualizado de hora em hora a partir do CDC."
colunas:
  - nome: cliente_email
    classificacao: dado_pessoal
    acesso: mascarado_para_analistas
  - nome: total_cents
    descricao: "Valor pago em centavos, sem frete."
linhagem:
  origem: [postgres.loja.pedidos, postgres.loja.clientes]
  consumidores: [dashboard.receita_diaria, modelo.previsao_demanda]` },
  docs: [['DataHub', 'https://docs.datahub.com/'], ['OpenMetadata', 'https://docs.open-metadata.org/'], ['Martin Fowler · Data Mesh Principles', 'https://martinfowler.com/articles/data-mesh-principles.html']],
  perguntas: [`Como alguém novo na empresa descobre qual tabela usar para "pedidos pagos"?`, `Quem seria afetado se uma coluna importante mudasse de significado?`, `Quais colunas do warehouse da sua empresa contêm dados pessoais?`] },
]
