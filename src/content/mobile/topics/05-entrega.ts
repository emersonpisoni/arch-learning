import type { Topic } from '../../../types'

export const entrega: Topic[] = [
{ id: 'lojas-publicacao', stage: 'entrega', level: 'essencial', title: 'Publicação nas lojas', short: 'Lojas',
  resumo: `Assinatura, revisão, canais de teste e lançamento gradual na App Store e no Google Play.`,
  porque: `No mobile, não basta fazer deploy: cada versão passa por assinatura, revisão da loja e adoção gradual pelos usuários. Desconhecer as regras atrasa lançamentos e pode tirar o app do ar.`,
  como: [
    `Cada build é <b>assinado</b> com certificados e perfis (iOS) ou chave de upload (Android); perder essas chaves é um problema sério. O Android usa o formato <b>AAB</b> e a loja gera os APKs por aparelho. Antes do público, versões vão para <b>canais de teste</b>: TestFlight, testes interno, fechado e aberto do Play.`,
    `A <b>revisão</b> verifica diretrizes (privacidade, pagamentos dentro do app, conteúdo, permissões justificadas). Use <b>lançamento gradual</b> (phased release, staged rollout) para liberar para uma porcentagem de usuários e pausar se surgirem crashes. Automatize com <b>fastlane</b> ou EAS: build, assinatura, metadados, capturas de tela e envio.`,
  ],
  conecta: [['ota-versoes', 'O que dá para atualizar sem nova revisão.'], ['crashes-analytics', 'Decidir se o lançamento gradual continua.'], ['devops/estrategias-deploy', 'Canary e rollout gradual, no servidor.'], ['devops/pipelines', 'Automatizar o build e o envio.']],
  front: `Um PWA é publicado como qualquer site, sem revisão; já um app híbrido ou React Native segue todas as regras das lojas, inclusive as de pagamento.`,
  ex: { lang: 'ruby', code: `# fastlane/Fastfile: build e envio para o canal de testes
lane :beta do
  increment_build_number
  match(type: "appstore")                    # certificados guardados num repositório privado
  build_app(scheme: "Loja")
  upload_to_testflight(changelog: "Correções no checkout")
end

platform :android do
  lane :beta do
    gradle(task: "bundle", build_type: "Release")
    upload_to_play_store(track: "internal", rollout: "0.2")   # 20% do canal
  end
end` },
  docs: [['Apple · App Review Guidelines', 'https://developer.apple.com/app-store/review/guidelines/'], ['Google Play · Publicar o app', 'https://developer.android.com/studio/publish'], ['fastlane · Documentação', 'https://docs.fastlane.tools/']],
  perguntas: [`Onde estão guardadas as chaves de assinatura do seu app, e quem tem acesso?`, `Quanto tempo leva hoje entre o merge e o app nas mãos dos usuários?`, `Que regra de revisão das lojas afetaria o seu produto?`] },

{ id: 'ota-versoes', stage: 'entrega', level: 'importante', title: 'Atualizações OTA e versões antigas', short: 'Versões',
  resumo: `Atualizar sem passar pela loja, forçar atualização e manter a API compatível com apps antigos.`,
  porque: `Diferente da web, versões antigas do app continuam em uso por meses ou anos. Cada mudança na API precisa considerar quem não atualizou, e às vezes é preciso corrigir algo urgente sem esperar a revisão da loja.`,
  como: [
    `<b>OTA (over-the-air)</b>: em React Native e Expo, é possível publicar um novo pacote de JavaScript e assets (EAS Update) que o app baixa na próxima abertura, sem passar pela loja, desde que o código nativo não mude e a mudança respeite as diretrizes das lojas. Use canais, lançamento gradual e rollback como num deploy.`,
    `<b>Versões antigas</b>: a API deve ser retrocompatível ou versionada; o app envia a própria versão em cada requisição; o servidor pode responder com uma <b>atualização obrigatória</b> quando uma versão fica insustentável. <b>Configuração remota</b> e feature flags permitem ligar e desligar funcionalidades sem nova versão.`,
  ],
  conecta: [['lojas-publicacao', 'O caminho normal de atualização.'], ['arquitetura/evolucao-apis', 'Evoluir a API sem quebrar clientes antigos.'], ['backend/feature-flags', 'Ligar e desligar funcionalidades remotamente.'], ['react-native', 'Por que o JavaScript pode ser atualizado à parte.']],
  front: `É a diferença mais importante para quem vem da web: lá o usuário sempre carrega a última versão; no app, o backend precisa conviver com várias versões ao mesmo tempo.`,
  ex: { lang: 'typescript', code: `// backend: barrar versões que não funcionam mais com a API
const VERSAO_MINIMA = { ios: "4.12.0", android: "4.12.0" };

app.use((req, res, next) => {
  const plataforma = req.header("X-App-Platform") as "ios" | "android" | undefined;
  const versao = req.header("X-App-Version");
  if (plataforma && versao && semver.lt(versao, VERSAO_MINIMA[plataforma])) {
    return res.status(426).json({
      codigo: "ATUALIZACAO_OBRIGATORIA",
      loja: plataforma === "ios" ? URL_APP_STORE : URL_PLAY_STORE,
    });
  }
  next();
});` },
  docs: [['Expo · EAS Update', 'https://docs.expo.dev/eas-update/introduction/'], ['Android · In-app updates', 'https://developer.android.com/guide/playcore/in-app-updates'], ['Firebase · Remote Config', 'https://firebase.google.com/docs/remote-config']],
  perguntas: [`Quantas versões do seu app estão em uso hoje, e qual a mais antiga?`, `Que mudança na API quebraria apps que não foram atualizados?`, `Quando uma atualização OTA não é suficiente?`] },

{ id: 'crashes-analytics', stage: 'entrega', level: 'importante', title: 'Crashes, monitoramento e analytics', short: 'Monitoramento',
  resumo: `Saber o que acontece nos aparelhos: travamentos, erros, performance e uso.`,
  porque: `Você não tem acesso aos aparelhos dos usuários. Sem monitoramento, a primeira notícia de um crash vem de uma avaliação de uma estrela; e a taxa de sessões sem crash é uma das métricas que as lojas observam.`,
  como: [
    `Ferramentas de crash (Firebase Crashlytics, Sentry, Bugsnag) capturam travamentos nativos e erros de JavaScript com o contexto do aparelho. É preciso enviar os <b>símbolos de depuração</b> (dSYM no iOS, mapping do R8/ProGuard no Android, source maps no JS) para ver a pilha legível. Métricas-chave: <b>sessões e usuários sem crash</b>, <b>ANRs</b> (app sem responder, Android), tempo de inicialização.`,
    `<b>Analytics de produto</b> registra eventos de uso com um plano de eventos definido, respeitando consentimento e as regras de privacidade das lojas (App Tracking Transparency no iOS, formulário de segurança de dados no Play). Relacione crashes com a versão do app para decidir se um lançamento gradual deve parar.`,
  ],
  conecta: [['frontend/observabilidade-front', 'O mesmo trabalho na web: erros e source maps.'], ['backend/observabilidade', 'Ligar o erro do app ao trace do servidor.'], ['dados/eventos-analytics', 'Plano de eventos e tracking.'], ['lojas-publicacao', 'Pausar lançamentos com base nos crashes.'], ['seguranca/lgpd', 'Consentimento e dados coletados.']],
  front: `Source maps têm o mesmo papel dos símbolos de depuração nativos: sem eles, a pilha do erro em produção é ilegível.`,
  ex: { lang: 'typescript', code: `// Sentry no React Native: erros, performance e contexto do usuário
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  release: \`loja@\${Application.nativeApplicationVersion}\`,
  tracesSampleRate: 0.2,                       // 20% das sessões com performance
  beforeSend(evento) {
    delete evento.user?.email;                 // não envie dados pessoais
    return evento;
  },
});

Sentry.setTag("plano", usuario.plano);
Sentry.addBreadcrumb({ category: "checkout", message: "Pagamento iniciado" });` },
  docs: [['Firebase · Crashlytics', 'https://firebase.google.com/docs/crashlytics'], ['Sentry · React Native', 'https://docs.sentry.io/platforms/react-native/'], ['Android · Android vitals', 'https://developer.android.com/topic/performance/vitals']],
  perguntas: [`Qual a taxa de sessões sem crash do seu app hoje?`, `Os crashes do seu app aparecem com a pilha legível?`, `Que dado do usuário o seu monitoramento envia e não deveria?`] },
]
