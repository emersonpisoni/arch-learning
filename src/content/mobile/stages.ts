import type { Stage } from '../../types'

// A ordem do array é a ordem das etapas na trilha.
export const stages: Stage[] = [
  { id: 'fundamentos', title: 'Fundamentos de mobile', desc: 'O que muda quando o software roda num aparelho no bolso de alguém.',
    pratica: 'Escolha um app que você usa todo dia e anote: o que acontece quando você sai e volta, quando perde o sinal e quando gira a tela. Compare com o que a documentação de ciclo de vida da plataforma descreve.' },
  { id: 'tecnologias', title: 'Tecnologias', desc: 'Nativo, React Native, Flutter: como cada abordagem desenha a tela e conversa com o sistema.',
    pratica: 'Crie o mesmo app pequeno (uma lista com detalhe e um formulário) em Expo e em uma segunda tecnologia. Compare tempo de setup, tamanho do app e a experiência de depurar.' },
  { id: 'dados-rede', title: 'Dados e rede', desc: 'Funcionar sem internet, lidar com conexões ruins e alcançar o usuário fora do app.',
    pratica: 'Faça a lista do seu app funcionar em modo avião: cache local, fila de ações pendentes e sincronização quando a rede volta. Teste com o simulador de rede ruim.' },
  { id: 'qualidade', title: 'Qualidade', desc: 'Performance, acessibilidade e testes em aparelhos reais.',
    pratica: 'Meça o tempo de inicialização e a fluidez da lista principal num aparelho Android de entrada. Ative o leitor de tela (VoiceOver ou TalkBack) e complete o fluxo principal sem olhar a tela.' },
  { id: 'entrega', title: 'Entrega e operação', desc: 'Publicar nas lojas, conviver com versões antigas e saber o que acontece nos aparelhos.',
    pratica: 'Monte um pipeline que gera o build, publica num canal de testes (TestFlight ou teste interno do Google Play) e envia crashes para uma ferramenta de monitoramento.' },
  { id: 'plataforma', title: 'Plataforma e segurança', desc: 'Permissões, recursos do aparelho, links que abrem o app e proteção de dados no dispositivo.',
    pratica: 'Configure um universal link / app link que abre uma tela específica do app, e mova um token de autenticação para o Keychain/Keystore.' },
]
