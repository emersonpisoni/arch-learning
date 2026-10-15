import type { Topic } from '../../../types'

export const qualidade: Topic[] = [
{ id: 'perf-mobile', stage: 'qualidade', level: 'essencial', title: 'Performance mobile', short: 'Performance',
  resumo: `Inicialização rápida, rolagem sem engasgos e respeito à bateria e à memória.`,
  porque: `Boa parte dos usuários tem aparelhos de entrada, bem mais lentos que os celulares de quem desenvolve. Inicialização lenta e listas que engasgam aparecem nas avaliações das lojas e nas métricas que as lojas usam para ranquear apps.`,
  como: [
    `<b>Inicialização</b>: a frio (processo novo) e a quente. Adie tudo que não é necessário para a primeira tela, carregue módulos sob demanda e evite trabalho síncrono no início. <b>Fluidez</b>: a 60 Hz cada quadro tem cerca de 16 ms (8 ms a 120 Hz); trabalho pesado na thread principal causa quadros perdidos (<b>jank</b>). Listas longas precisam de virtualização (FlatList/FlashList, LazyColumn, List).`,
    `Animações rodam fora da thread de JS (Reanimated, driver nativo) ou no próprio motor. Imagens no tamanho exibido, com cache. Meça em <b>aparelho real e de entrada</b>, em build de produção: Android Vitals e o Play Console mostram ANRs e quadros lentos; Xcode Instruments e MetricKit no iOS. Tamanho do app também importa: afeta downloads e desistências.`,
  ],
  conecta: [['ciclo-vida-app', 'Inicialização a frio e a quente.'], ['react-native', 'A thread de JS e a nova arquitetura.'], ['frontend/perf-runtime', 'Os mesmos princípios na web.'], ['crashes-analytics', 'Métricas de performance coletadas em campo.'], ['frontend/medicao', 'Laboratório versus campo.']],
  front: `É o mesmo raciocínio dos Core Web Vitals: medir em campo, em aparelhos reais, e otimizar o que o usuário sente (tempo até a primeira tela útil e respostas a toques).`,
  ex: { lang: 'tsx', code: `// lista longa: FlashList recicla as células em vez de criar milhares
<FlashList
  data={pedidos}
  estimatedItemSize={72}
  keyExtractor={(p) => p.id}
  renderItem={({ item }) => <LinhaPedido pedido={item} />}   // componente memoizado
/>

// animação na thread de UI com Reanimated: não trava se o JS estiver ocupado
const deslocamento = useSharedValue(0);
const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: deslocamento.value }] }));
deslocamento.value = withSpring(120);` },
  docs: [['Android · App performance', 'https://developer.android.com/topic/performance/overview'], ['Apple · Improving your app’s performance', 'https://developer.apple.com/documentation/xcode/improving-your-app-s-performance'], ['React Native · Performance overview', 'https://reactnative.dev/docs/performance']],
  perguntas: [`Qual o tempo de inicialização do seu app num aparelho de entrada?`, `O que roda na thread principal quando a lista rola?`, `Por que medir em build de desenvolvimento engana?`] },

{ id: 'a11y-mobile', stage: 'qualidade', level: 'importante', title: 'Acessibilidade mobile', short: 'A11y mobile',
  resumo: `Leitores de tela, fonte dinâmica, contraste e alternativas a gestos.`,
  porque: `Muitas pessoas usam o celular com VoiceOver, TalkBack, fontes grandes ou controle por voz. Leis de acessibilidade se aplicam também a apps, e as plataformas oferecem quase tudo pronto, desde que o app use os componentes e as propriedades corretas.`,
  como: [
    `Cada elemento interativo precisa de <b>rótulo</b>, <b>papel</b> (botão, link, cabeçalho) e <b>estado</b> (selecionado, desabilitado): <code>accessibilityLabel</code>/<code>accessibilityRole</code> no React Native, <code>contentDescription</code>/<code>semantics</code> no Android, <code>accessibilityLabel</code>/traits no iOS. A <b>ordem de leitura</b> deve seguir a lógica da tela.`,
    `Suporte a <b>fonte dinâmica</b> (Dynamic Type, escala de fonte do Android) sem cortar textos; contraste suficiente; alvos de toque grandes; alternativas a gestos complexos (deslizar para apagar também deve existir como botão); respeito a "reduzir movimento". Teste usando o leitor de tela de verdade e com os scanners de acessibilidade das plataformas.`,
  ],
  conecta: [['frontend/a11y-fundamentos', 'Os mesmos princípios da WCAG.'], ['frontend/aria', 'Papéis, nomes e estados, como no ARIA.'], ['ui-mobile', 'Alvos de toque e tamanhos.'], ['testes-mobile', 'Verificar acessibilidade nos testes.']],
  front: `As props de acessibilidade do React Native correspondem quase uma a uma ao ARIA da web: <code>accessibilityRole</code> é o <code>role</code>, <code>accessibilityLabel</code> é o <code>aria-label</code> e <code>accessibilityState</code> reúne <code>aria-checked</code>, <code>aria-disabled</code> e afins.`,
  ex: { lang: 'tsx', code: `<Pressable
  onPress={alternarFavorito}
  accessibilityRole="button"
  accessibilityLabel={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
  accessibilityState={{ selected: favorito }}
  hitSlop={12}                               // aumenta a área de toque sem mudar o visual
>
  <Icone nome={favorito ? "coracao-cheio" : "coracao"} />
</Pressable>

<Text maxFontSizeMultiplier={2}>            {/* acompanha a fonte do sistema, com limite */}
  Entrega prevista para amanhã
</Text>` },
  docs: [['Apple · Accessibility', 'https://developer.apple.com/accessibility/'], ['Android · Make apps more accessible', 'https://developer.android.com/guide/topics/ui/accessibility/apps'], ['React Native · Accessibility', 'https://reactnative.dev/docs/accessibility']],
  perguntas: [`Você consegue completar o fluxo principal do seu app só com o leitor de tela?`, `O que quebra na sua interface com a maior fonte do sistema?`, `Que gesto do seu app não tem alternativa para quem não consegue fazê-lo?`] },

{ id: 'testes-mobile', stage: 'qualidade', level: 'importante', title: 'Testes em mobile', short: 'Testes',
  resumo: `Da unidade ao teste ponta a ponta em aparelhos reais, sem uma suíte lenta e instável.`,
  porque: `Bugs mobile são caros: depois de publicada, uma versão com defeito fica nos aparelhos até o usuário atualizar. E a variedade de aparelhos, versões de sistema e tamanhos de tela é enorme.`,
  como: [
    `Pirâmide adaptada: muitos <b>testes de unidade</b> na lógica (Jest, XCTest, JUnit), <b>testes de componente</b> (React Native Testing Library, testes de Compose e SwiftUI) e poucos <b>testes ponta a ponta</b> (Maestro, Detox, Appium, XCUITest, Espresso) cobrindo os fluxos críticos.`,
    `Emuladores e simuladores servem para a maior parte; <b>fazendas de aparelhos</b> (Firebase Test Lab, BrowserStack, AWS Device Farm) cobrem aparelhos reais variados. Testes de <b>snapshot visual</b> pegam regressões de layout. Distribua versões de teste (TestFlight, teste interno do Play) para pessoas reais antes do lançamento.`,
  ],
  conecta: [['frontend/testes-front', 'A mesma estratégia de testes do front.'], ['backend/testes', 'Os fundamentos de testes automatizados.'], ['lojas-publicacao', 'Canais de teste das lojas.'], ['a11y-mobile', 'Verificar acessibilidade automaticamente.']],
  front: `React Native Testing Library tem a mesma filosofia da Testing Library web: encontrar elementos como o usuário encontra (texto, papel, rótulo) e não pela estrutura interna.`,
  ex: { lang: 'yaml', code: `# Maestro: fluxo de login ponta a ponta, legível e pouco instável
appId: com.exemplo.loja
---
- launchApp:
    clearState: true
- tapOn: "Entrar"
- tapOn:
    id: "campo-email"
- inputText: "teste@exemplo.com"
- tapOn: "Senha"
- inputText: "\${SENHA_TESTE}"
- tapOn: "Continuar"
- assertVisible: "Olá, Ana"` },
  docs: [['Maestro · Documentação', 'https://docs.maestro.dev/'], ['React Native Testing Library', 'https://callstack.github.io/react-native-testing-library/'], ['Android · Test apps on Android', 'https://developer.android.com/training/testing']],
  perguntas: [`Quais são os três fluxos do seu app que mais precisam de teste ponta a ponta?`, `Em quantos aparelhos diferentes o seu app é testado antes de cada versão?`, `Por que um bug mobile em produção custa mais que um bug web?`] },
]
