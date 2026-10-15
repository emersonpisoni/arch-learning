import type { Topic } from '../../../types'

export const dadosRede: Topic[] = [
{ id: 'offline-first-mobile', stage: 'dados-rede', level: 'essencial', title: 'Offline-first e armazenamento local', short: 'Offline',
  resumo: `Guardar dados no aparelho para o app funcionar sem rede e sincronizar depois.`,
  porque: `Celulares perdem sinal no elevador, no metrô e na estrada. Um app que mostra tela branca sem internet parece quebrado; um que mostra os últimos dados e guarda as ações para depois parece confiável.`,
  como: [
    `Opções de armazenamento: <b>chave-valor</b> (AsyncStorage, MMKV, SharedPreferences, UserDefaults) para preferências; <b>SQLite</b> e camadas sobre ele (Room, Core Data/SwiftData, Drizzle, WatermelonDB) para dados estruturados; <b>arquivos</b> para mídia. Dados sensíveis vão para o armazenamento seguro, não para esses.`,
    `Padrão <b>offline-first</b>: a interface lê do banco local; a rede só atualiza o banco. Ações feitas offline entram numa <b>fila de saída</b> com ids gerados no cliente e são reenviadas quando a conexão volta, de forma <b>idempotente</b>. É preciso uma estratégia para <b>conflitos</b> (última escrita vence, mesclagem por campo, CRDTs) e para migrar o esquema local entre versões do app.`,
  ],
  conecta: [['rede-mobile', 'Detectar e lidar com a rede.'], ['frontend/local-first', 'A mesma ideia levada mais longe na web.'], ['backend/idempotencia', 'Reenviar ações sem duplicar.'], ['arquitetura/crdt', 'Mesclar alterações sem conflito.'], ['seguranca-mobile', 'Onde guardar dados sensíveis.']],
  front: `Bibliotecas de dados como TanStack Query têm persistência e mutações pausadas offline; num app pequeno, isso já dá boa parte do comportamento offline-first.`,
  ex: { lang: 'typescript', code: `// fila de ações feitas sem rede, reenviada quando a conexão volta
async function curtir(postId: string) {
  const acao = { id: crypto.randomUUID(), tipo: "curtir", postId, em: Date.now() };
  await db.insert(curtidas).values({ postId, pendente: true });   // UI atualiza na hora
  await db.insert(filaDeSaida).values(acao);
  sincronizar();
}

async function sincronizar() {
  if (!(await NetInfo.fetch()).isConnected) return;
  for (const acao of await db.select().from(filaDeSaida).orderBy(filaDeSaida.em)) {
    await api.post("/acoes", acao, { headers: { "Idempotency-Key": acao.id } });
    await db.delete(filaDeSaida).where(eq(filaDeSaida.id, acao.id));
  }
}

NetInfo.addEventListener((s) => s.isConnected && sincronizar());` },
  docs: [['Android · Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first'], ['Expo · SQLite', 'https://docs.expo.dev/versions/latest/sdk/sqlite/'], ['TanStack Query · Offline', 'https://tanstack.com/query/latest/docs/framework/react/guides/network-mode']],
  perguntas: [`Que telas do seu app deveriam funcionar sem internet?`, `O que acontece se a mesma ação offline for enviada duas vezes?`, `Como migrar o banco local quando o esquema muda numa versão nova do app?`] },

{ id: 'rede-mobile', stage: 'dados-rede', level: 'essencial', title: 'Rede no celular: conexões instáveis e consumo', short: 'Rede mobile',
  resumo: `Latência alta, troca de antena, plano de dados e bateria: o que muda nas requisições.`,
  porque: `A rede móvel tem latência maior e mais variável que o Wi-Fi do escritório, cai sem aviso e custa dinheiro e bateria. APIs e clientes pensados para rede boa ficam lentos, gastam dados e falham de maneiras difíceis de reproduzir.`,
  como: [
    `No cliente: <b>timeouts</b> explícitos, <b>retentativas com backoff</b> para erros transitórios, cancelamento de requisições de telas que saíram, <b>cache</b> HTTP e local, e compressão. Detecte o tipo de conexão para adiar downloads grandes até o Wi-Fi. Cada requisição acorda o rádio, que gasta bateria: agrupe chamadas.`,
    `Na API: menos idas e voltas (um BFF ou GraphQL que entrega o que a tela precisa), respostas menores, paginação por cursor, imagens em tamanhos adequados e suporte a <b>HTTP/2 e HTTP/3</b> (QUIC lida melhor com troca de rede). Teste com o <b>Network Link Conditioner</b> (iOS) ou o emulador Android simulando 3G e perda de pacotes.`,
  ],
  conecta: [['offline-first-mobile', 'Quando a rede some de vez.'], ['backend/gateway', 'Um BFF sob medida para o app.'], ['backend/idempotencia', 'Retentativas seguras.'], ['backend/http', 'HTTP/2, HTTP/3 e cache.'], ['arquitetura/resiliencia', 'Timeouts, retries e backoff.']],
  front: `As mesmas técnicas valem para a web mobile: o DevTools tem perfis de rede lenta e o <code>navigator.connection</code> informa (em alguns navegadores) o tipo de conexão.`,
  ex: { lang: 'typescript', code: `// requisição com timeout, cancelamento e retentativa com backoff
async function buscar<T>(url: string, signal?: AbortSignal, tentativa = 0): Promise<T> {
  const timeout = AbortSignal.timeout(10_000);
  try {
    const res = await fetch(url, { signal: AbortSignal.any([timeout, ...(signal ? [signal] : [])]) });
    if (res.status >= 500 && tentativa < 3) throw new Error("transitório");
    return res.json();
  } catch (erro) {
    if (signal?.aborted || tentativa >= 3) throw erro;
    const espera = 2 ** tentativa * 500 + Math.random() * 300;   // backoff com jitter
    await new Promise((r) => setTimeout(r, espera));
    return buscar(url, signal, tentativa + 1);
  }
}` },
  docs: [['Android · Optimize network access', 'https://developer.android.com/develop/connectivity/network-ops/network-access-optimization'], ['Apple · Network Link Conditioner', 'https://developer.apple.com/documentation/network/testing-your-app-under-different-network-conditions'], ['web.dev · Adaptive loading', 'https://web.dev/articles/adaptive-loading-cds-2019']],
  perguntas: [`Quantas requisições a tela inicial do seu app faz, e quantas poderiam ser uma só?`, `Como o app se comporta com 3G e 10% de perda de pacotes?`, `Por que agrupar requisições economiza bateria?`] },

{ id: 'push', stage: 'dados-rede', level: 'importante', title: 'Notificações push', short: 'Push',
  resumo: `Como o servidor alcança o usuário com o app fechado, via APNs e FCM.`,
  porque: `Notificações são o principal canal de retorno ao app, e também o principal motivo para usuários desinstalarem quando são excessivas. A entrega passa por serviços da Apple e do Google, com regras próprias de permissão, formato e confiabilidade.`,
  como: [
    `Fluxo: o app pede permissão, o sistema gera um <b>token do dispositivo</b>, o app envia esse token ao seu backend, e o backend envia a mensagem ao <b>APNs</b> (Apple) ou ao <b>FCM</b> (Firebase/Google), que a entrega ao aparelho. Tokens mudam e expiram: o backend precisa atualizá-los e remover os inválidos que os provedores devolverem.`,
    `Tipos: notificações <b>visíveis</b> (título e texto exibidos pelo sistema) e <b>silenciosas/de dados</b> (acordam o app para sincronizar, com entrega não garantida). Peça permissão no momento em que faz sentido, não na abertura do app; use <b>canais</b> (Android) e categorias para o usuário escolher o que recebe; inclua um link para a tela certa ao tocar.`,
  ],
  conecta: [['deep-links', 'Abrir a tela certa ao tocar na notificação.'], ['arquitetura/case-notificacoes', 'O lado servidor de um sistema de notificações.'], ['backend/filas', 'Enviar em massa sem travar a aplicação.'], ['permissoes-recursos', 'O momento certo de pedir permissão.']],
  front: `Na web, a Push API com service workers segue o mesmo modelo (permissão, inscrição, envio pelo servidor), e funciona também no iOS para PWAs instalados na tela inicial.`,
  ex: { lang: 'typescript', code: `// backend: enviar via FCM com firebase-admin e limpar tokens inválidos
const resposta = await messaging.sendEachForMulticast({
  tokens: tokensDoUsuario,
  notification: { title: "Pedido a caminho", body: "Chega hoje até as 18h" },
  data: { link: "meuapp://pedidos/8123" },          // tela aberta ao tocar
  android: { notification: { channelId: "pedidos" } },
});

resposta.responses.forEach((r, i) => {
  if (r.error?.code === "messaging/registration-token-not-registered") {
    removerToken(tokensDoUsuario[i]);              // app desinstalado ou token trocado
  }
});` },
  docs: [['Firebase · Cloud Messaging', 'https://firebase.google.com/docs/cloud-messaging'], ['Apple · User Notifications', 'https://developer.apple.com/documentation/usernotifications'], ['Expo · Push notifications', 'https://docs.expo.dev/push-notifications/overview/']],
  perguntas: [`Em que momento o seu app deveria pedir permissão de notificação?`, `Por que uma notificação silenciosa não serve para algo que precisa acontecer com certeza?`, `Quais notificações do seu produto o usuário deveria poder desligar separadamente?`] },
]
