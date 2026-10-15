import type { Topic } from '../../../types'

export const tecnologias: Topic[] = [
{ id: 'react-native', stage: 'tecnologias', level: 'essencial', title: 'React Native e Expo', short: 'React Native',
  resumo: `Apps nativos escritos em React e TypeScript, e o Expo como plataforma em volta.`,
  porque: `React Native permite que times que já usam React construam apps para iOS e Android com uma base de código, renderizando componentes nativos de verdade. O Expo removeu boa parte da dificuldade de configurar, construir e publicar.`,
  como: [
    `O código JavaScript roda num motor (<b>Hermes</b>) e descreve a interface com componentes como <code>&lt;View&gt;</code> e <code>&lt;Text&gt;</code>, que viram views nativas. Na <b>nova arquitetura</b>, o <b>JSI</b> permite chamadas diretas entre JS e código nativo, o <b>Fabric</b> é o novo renderizador e os <b>Turbo Modules</b> carregam módulos nativos sob demanda.`,
    `O <b>Expo</b> oferece SDK com módulos prontos (câmera, notificações, arquivos), roteamento por arquivos (<b>Expo Router</b>), builds na nuvem (<b>EAS Build</b>), publicação (<b>EAS Submit</b>) e atualizações OTA (<b>EAS Update</b>). Quando um recurso não existe, escreve-se um módulo nativo em Swift/Kotlin. Estilos usam um subconjunto de CSS com Flexbox, sem cascata.`,
  ],
  conecta: [['abordagens', 'Quando React Native é a escolha certa.'], ['ota-versoes', 'Atualizar o JavaScript sem passar pela loja.'], ['perf-mobile', 'Listas, thread de JS e animações.'], ['frontend/reatividade', 'O modelo de componentes do React.']],
  front: `Hooks, estado, React Query, Zod e boa parte da lógica de negócio de um app React web funcionam igual; o que muda são os componentes de interface, a navegação e o acesso ao sistema.`,
  ex: { lang: 'tsx', code: `// app/pedidos/[id].tsx com Expo Router: a rota vem do nome do arquivo
import { useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function DetalhePedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useQuery({ queryKey: ["pedido", id], queryFn: () => api.pedido(id) });

  return (
    <View style={styles.tela}>
      <Text style={styles.titulo}>Pedido {data?.numero}</Text>
      <Pressable onPress={() => rastrear(id)} accessibilityRole="button">
        <Text>Rastrear entrega</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: "700" },
});` },
  docs: [['React Native · Documentação', 'https://reactnative.dev/docs/getting-started'], ['React Native · Nova arquitetura', 'https://reactnative.dev/architecture/landing-page'], ['Expo · Documentação', 'https://docs.expo.dev/']],
  perguntas: [`Que parte de um app React web poderia ser reaproveitada num app React Native?`, `Quando seria preciso escrever um módulo nativo?`, `O que o Expo resolve que o React Native puro deixa para você?`] },

{ id: 'flutter', stage: 'tecnologias', level: 'importante', title: 'Flutter', short: 'Flutter',
  resumo: `Multiplataforma com Dart e um motor de renderização próprio que desenha cada pixel.`,
  porque: `Flutter é uma das tecnologias mobile mais usadas e segue um caminho diferente do React Native: em vez de usar componentes nativos, desenha a interface inteira. Entender isso explica suas vantagens (consistência entre plataformas) e limites.`,
  como: [
    `A interface é uma árvore de <b>widgets</b> imutáveis; o framework compara árvores e o motor (<b>Impeller</b>) desenha tudo numa tela, como um jogo. Por isso o visual é idêntico em iOS, Android, web e desktop, e animações são fluidas, mas os componentes "imitam" os nativos (Material e Cupertino) em vez de usá-los.`,
    `<b>Dart</b> compila antecipadamente (AOT) para código nativo nas versões de produção e usa compilação JIT com <b>hot reload</b> no desenvolvimento. Gerência de estado por soluções como Provider, Riverpod e Bloc. Recursos do sistema são acessados por <b>plugins</b> e <b>platform channels</b> que chamam código Swift/Kotlin.`,
  ],
  conecta: [['abordagens', 'Comparar com nativo e React Native.'], ['react-native', 'A outra abordagem multiplataforma.'], ['fundamentos/compiladores', 'AOT e JIT na prática.'], ['frontend/graficos-web', 'Renderizar tudo num canvas tem os mesmos trade-offs.']],
  front: `O modelo de widgets declarativos é muito parecido com componentes React: a tela é uma função do estado, e o framework calcula o que mudou.`,
  ex: { lang: 'dart', code: `class ContadorDeItens extends StatefulWidget {
  const ContadorDeItens({super.key});
  @override
  State<ContadorDeItens> createState() => _ContadorState();
}

class _ContadorState extends State<ContadorDeItens> {
  int itens = 0;

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Text('Itens no carrinho: $itens'),
      IconButton(
        icon: const Icon(Icons.add),
        tooltip: 'Adicionar item',
        onPressed: () => setState(() => itens++),   // reconstrói o widget
      ),
    ]);
  }
}` },
  docs: [['Flutter · Documentação', 'https://docs.flutter.dev/'], ['Flutter · Architectural overview', 'https://docs.flutter.dev/resources/architectural-overview'], ['Dart · Language tour', 'https://dart.dev/language']],
  perguntas: [`Que vantagem e que desvantagem vêm de desenhar a interface inteira?`, `Por que o Flutter compila AOT em produção e usa JIT no desenvolvimento?`, `Como o Flutter acessa um recurso nativo que não tem plugin?`] },

{ id: 'nativo-moderno', stage: 'tecnologias', level: 'importante', title: 'Nativo moderno: SwiftUI e Jetpack Compose', short: 'Nativo',
  resumo: `As interfaces declarativas oficiais da Apple e do Google.`,
  porque: `Mesmo times multiplataforma esbarram no código nativo: módulos, widgets da tela inicial, extensões e integrações profundas. E os frameworks nativos atuais são declarativos, com ideias muito próximas das de React e Flutter.`,
  como: [
    `<b>SwiftUI</b> (iOS) e <b>Jetpack Compose</b> (Android) descrevem a interface como funções do estado. Quando o estado muda (<code>@State</code>/<code>@Observable</code> no Swift, <code>remember</code>/<code>mutableStateOf</code> no Compose), o framework recompõe só as partes afetadas. Swift e Kotlin têm tipagem forte, null safety e concorrência estruturada (<code>async/await</code> no Swift, corrotinas no Kotlin).`,
    `Ferramentas: <b>Xcode</b> com Instruments para iOS (exige macOS para compilar) e <b>Android Studio</b> com o Profiler para Android. Dependências por Swift Package Manager e Gradle. Recursos que só existem no nativo: widgets da tela inicial, Live Activities, extensões de compartilhamento, App Clips e Instant Apps.`,
  ],
  conecta: [['abordagens', 'Quando o nativo compensa duas bases de código.'], ['permissoes-recursos', 'O acesso direto às APIs do sistema.'], ['fundamentos/paradigmas', 'Programação declarativa e funcional.'], ['frontend/reatividade', 'O mesmo modelo reativo dos frameworks web.']],
  front: `Lendo um componente SwiftUI ou Compose, quem conhece React reconhece quase tudo: estado local, propriedades, composição e listas declarativas.`,
  ex: { lang: 'kotlin', code: `// Jetpack Compose: a tela é uma função do estado
@Composable
fun ListaDePedidos(viewModel: PedidosViewModel = viewModel()) {
    val pedidos by viewModel.pedidos.collectAsStateWithLifecycle()

    LazyColumn {                                   // só compõe o que está visível
        items(pedidos, key = { it.id }) { pedido ->
            ListItem(
                headlineContent = { Text("Pedido \${pedido.numero}") },
                supportingContent = { Text(pedido.status) },
                modifier = Modifier.clickable { viewModel.abrir(pedido.id) },
            )
        }
    }
}` },
  docs: [['Apple · SwiftUI', 'https://developer.apple.com/documentation/swiftui'], ['Android · Jetpack Compose', 'https://developer.android.com/compose'], ['Swift · The Swift Programming Language', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/']],
  perguntas: [`Que recurso do seu produto só seria possível com código nativo?`, `Em que SwiftUI e Compose se parecem com React?`, `Por que compilar para iOS exige um Mac?`] },
]
