import type { Topic } from '../../../types'

export const fundamentos: Topic[] = [
{ id: 'abordagens', stage: 'fundamentos', level: 'essencial', title: 'Nativo, multiplataforma ou web', short: 'Abordagens',
  resumo: `As formas de construir um app de celular e o que cada uma troca entre si.`,
  porque: `É a primeira decisão de qualquer projeto mobile e uma das mais caras de reverter. Ela define quem consegue trabalhar no app, quanto código é compartilhado, quão perto do sistema operacional você chega e quanto custa manter duas plataformas.`,
  como: [
    `<b>Nativo</b>: Swift/SwiftUI no iOS e Kotlin/Jetpack Compose no Android. Acesso total e imediato às APIs do sistema e a melhor integração visual, ao custo de duas bases de código. <b>Multiplataforma</b>: <b>React Native</b> (JavaScript/TypeScript renderizando componentes nativos) e <b>Flutter</b> (Dart, com motor de renderização próprio) compartilham a maior parte do código. <b>Kotlin Multiplatform</b> compartilha a lógica e mantém interfaces nativas.`,
    `<b>Web</b>: um PWA roda no navegador, instala na tela inicial e evita as lojas, mas tem acesso limitado a recursos (principalmente no iOS). Apps <b>híbridos</b> (Capacitor, Ionic) empacotam uma aplicação web numa WebView. Critérios para decidir: competências do time, necessidade de recursos nativos, exigência de performance, prazo e quantas pessoas vão manter o app.`,
  ],
  conecta: [['react-native', 'A opção multiplataforma mais próxima de quem já usa React.'], ['flutter', 'Multiplataforma com renderização própria.'], ['nativo-moderno', 'SwiftUI e Jetpack Compose.'], ['frontend/service-workers', 'A base de um PWA.'], ['arquitetura/trade-offs', 'Decidir com critérios explícitos.']],
  front: `Um PWA bem feito (service worker, manifest, offline) às vezes resolve o problema sem um app nas lojas; vale testar essa hipótese antes de começar um projeto mobile.`,
  ex: { lang: 'text', code: `Critério                     Nativo   React Native   Flutter   PWA
Código compartilhado          não       ~85-95%       ~90-95%   100%
Acesso a APIs do sistema      total     alto (módulos) alto      limitado
Visual nativo da plataforma   sim       sim            imitado   não
Aproveita time web/React      não       sim            não       sim
Distribuição                  lojas     lojas          lojas     link / navegador
Atualizar sem passar na loja  não       JS via OTA     limitado  sempre` },
  docs: [['React Native · Introdução', 'https://reactnative.dev/docs/getting-started'], ['Flutter · Documentação', 'https://docs.flutter.dev/'], ['Kotlin Multiplatform', 'https://kotlinlang.org/docs/multiplatform.html'], ['web.dev · Progressive Web Apps', 'https://web.dev/explore/progressive-web-apps']],
  perguntas: [`Que recurso nativo o seu produto realmente precisa?`, `O que o time atual já sabe fazer, e quanto isso pesa na decisão?`, `Um PWA resolveria o problema sem passar pelas lojas?`] },

{ id: 'ciclo-vida-app', stage: 'fundamentos', level: 'essencial', title: 'Ciclo de vida do app', short: 'Ciclo de vida',
  resumo: `Primeiro plano, segundo plano, suspensão e morte do processo, e como o app sobrevive a tudo isso.`,
  porque: `No celular o sistema operacional manda: ele pausa, suspende e mata apps para economizar bateria e memória. Um app que não trata essas transições perde o que o usuário digitou, repete requisições ou trava ao voltar.`,
  como: [
    `Estados típicos: <b>ativo</b> (em primeiro plano), <b>inativo</b> (uma ligação ou a central de notificações por cima), <b>segundo plano</b> (pouco tempo para terminar tarefas) e <b>suspenso</b> (na memória, sem executar). O sistema pode <b>encerrar o processo</b> a qualquer momento em segundo plano, sem aviso; ao voltar, o app precisa restaurar o estado como se nada tivesse acontecido.`,
    `Boas práticas: salvar rascunhos e posição de navegação ao ir para segundo plano; atualizar dados ao voltar para primeiro plano; pausar animações, câmera e localização quando não visíveis. Trabalho em segundo plano usa APIs específicas e limitadas (<b>WorkManager</b> no Android, <b>BGTaskScheduler</b> no iOS), que o sistema agenda quando achar melhor.`,
  ],
  conecta: [['offline-first-mobile', 'Guardar estado localmente para sobreviver à morte do processo.'], ['perf-mobile', 'Tempo de inicialização a frio e a quente.'], ['backend/graceful-shutdown', 'O mesmo problema no servidor: terminar bem quando o sistema manda parar.'], ['frontend/storage-browser', 'O equivalente web: abas descartadas e Page Lifecycle.']],
  front: `Navegadores também congelam e descartam abas em segundo plano (Page Lifecycle API); o evento <code>visibilitychange</code> é o lugar certo para salvar estado, tanto na web quanto num app React Native com <code>AppState</code>.`,
  ex: { lang: 'tsx', code: `// React Native: reagir às mudanças de estado do app
useEffect(() => {
  const sub = AppState.addEventListener("change", (estado) => {
    if (estado === "background") {
      salvarRascunho(rascunhoAtual);      // o processo pode morrer depois daqui
      pausarLocalizacao();
    }
    if (estado === "active") {
      queryClient.invalidateQueries();    // dados podem estar velhos
    }
  });
  return () => sub.remove();
}, [rascunhoAtual]);` },
  docs: [['Android · Ciclo de vida da activity', 'https://developer.android.com/guide/components/activities/activity-lifecycle'], ['Apple · Managing your app’s life cycle', 'https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle'], ['React Native · AppState', 'https://reactnative.dev/docs/appstate']],
  perguntas: [`O que o seu app perde se o sistema matar o processo enquanto ele está em segundo plano?`, `Por que não dá para confiar em tarefas longas rodando em segundo plano?`, `Que recursos o seu app deveria pausar quando sai da tela?`] },

{ id: 'ui-mobile', stage: 'fundamentos', level: 'essencial', title: 'Interfaces mobile: toque, navegação e telas', short: 'UI mobile',
  resumo: `Padrões de interface para telas pequenas, dedos e muitos tamanhos de aparelho.`,
  porque: `Uma interface pensada para mouse e tela grande falha no celular: alvos pequenos demais, conteúdo escondido atrás do teclado, gestos que brigam com o sistema. Seguir as convenções de cada plataforma faz o app parecer "certo" para quem usa.`,
  como: [
    `<b>Alvos de toque</b> com pelo menos 44×44 pt (iOS) ou 48×48 dp (Android). <b>Áreas seguras</b> (safe areas) evitam o entalhe, a ilha dinâmica e a barra de gestos. O <b>teclado</b> cobre parte da tela: o conteúdo precisa rolar ou se ajustar. Unidades independentes de densidade (pt, dp) mantêm tamanhos consistentes entre telas com densidades diferentes.`,
    `<b>Navegação</b>: pilha (empilhar e voltar), abas inferiores para as seções principais e modais para tarefas curtas. Respeite os gestos do sistema (voltar deslizando no iOS, botão/gesto de voltar no Android). Guias oficiais: <b>Human Interface Guidelines</b> (Apple) e <b>Material Design</b> (Google). Suporte a modo escuro, tamanhos de fonte do sistema e orientação.`,
  ],
  conecta: [['frontend/layout-responsivo', 'A mesma ideia de layout flexível, com outras unidades.'], ['a11y-mobile', 'Tamanho de fonte dinâmico e leitores de tela.'], ['frontend/design-system', 'Componentes e tokens compartilhados entre plataformas.'], ['deep-links', 'Links que abrem uma tela específica da navegação.']],
  front: `Na web mobile, <code>env(safe-area-inset-*)</code> no CSS e <code>viewport-fit=cover</code> resolvem o mesmo problema das áreas seguras, e <code>inputmode</code> escolhe o teclado certo.`,
  ex: { lang: 'tsx', code: `// React Native + React Navigation: abas na base, pilha dentro de cada aba
const Tabs = createBottomTabNavigator();
const PedidosStack = createNativeStackNavigator();

function Pedidos() {
  return (
    <PedidosStack.Navigator>
      <PedidosStack.Screen name="Lista" component={ListaDePedidos} />
      <PedidosStack.Screen name="Detalhe" component={DetalheDoPedido} />
    </PedidosStack.Navigator>
  );
}

export function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tabs.Navigator>
          <Tabs.Screen name="Início" component={Inicio} />
          <Tabs.Screen name="Pedidos" component={Pedidos} />
        </Tabs.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}` },
  docs: [['Apple · Human Interface Guidelines', 'https://developer.apple.com/design/human-interface-guidelines/'], ['Material Design 3', 'https://m3.material.io/'], ['React Navigation', 'https://reactnavigation.org/docs/getting-started']],
  perguntas: [`Que botões do seu app são pequenos demais para um dedo?`, `O que acontece com o formulário principal quando o teclado aparece?`, `Por que copiar a navegação do iOS no Android (ou o contrário) incomoda os usuários?`] },
]
