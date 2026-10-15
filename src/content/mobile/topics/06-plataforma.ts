import type { Topic } from '../../../types'

export const plataforma: Topic[] = [
{ id: 'permissoes-recursos', stage: 'plataforma', level: 'importante', title: 'Permissões e recursos do aparelho', short: 'Permissões',
  resumo: `Câmera, localização, contatos, biometria: como pedir acesso e usar com responsabilidade.`,
  porque: `Os recursos do aparelho são o que diferencia um app de um site, e também onde a privacidade do usuário está mais exposta. As plataformas exigem permissão explícita e justificativa, e as lojas rejeitam apps que pedem mais do que usam.`,
  como: [
    `Permissões são pedidas <b>em tempo de execução</b>, no contexto (pedir a câmera quando a pessoa toca em "escanear", não ao abrir o app). Explique antes o motivo, trate a recusa com uma alternativa e saiba que, depois de negar algumas vezes, só as configurações do sistema reabrem a opção. No iOS, cada permissão exige um texto de justificativa no <code>Info.plist</code>.`,
    `Níveis mais finos: localização <b>aproximada</b> ou precisa, só <b>durante o uso</b> ou sempre; acesso a fotos <b>selecionadas</b> em vez de toda a galeria. Prefira seletores do sistema (photo picker, seletor de contatos), que dispensam permissão. <b>Biometria</b> (Face ID, impressão digital) não entrega a digital ao app: só confirma a pessoa e libera uma chave guardada com segurança.`,
  ],
  conecta: [['seguranca-mobile', 'Biometria e armazenamento seguro.'], ['push', 'A permissão de notificação.'], ['seguranca/lgpd', 'Coletar só o necessário.'], ['nativo-moderno', 'APIs do sistema.']],
  front: `Na web, a Permissions API e as APIs de câmera, geolocalização e WebAuthn seguem o mesmo princípio: pedir no momento da ação e oferecer alternativa quando a pessoa recusa.`,
  ex: { lang: 'tsx', code: `// pedir a câmera só quando a pessoa quer escanear
async function escanearCodigo() {
  const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();

  if (status === "granted") return navegar("Scanner");

  if (!canAskAgain) {
    // já negou antes: só pelas configurações do sistema
    return mostrarAviso("Para escanear, permita a câmera nas configurações.", {
      acao: { rotulo: "Abrir configurações", onPress: () => Linking.openSettings() },
    });
  }
  mostrarAviso("Você pode digitar o código manualmente.");   // alternativa
}` },
  docs: [['Android · Permissions on Android', 'https://developer.android.com/guide/topics/permissions/overview'], ['Apple · Requesting access to protected resources', 'https://developer.apple.com/documentation/uikit/requesting-access-to-protected-resources'], ['Expo · Permissions', 'https://docs.expo.dev/guides/permissions/']],
  perguntas: [`Que permissões o seu app pede, e todas são realmente necessárias?`, `O que acontece no seu app quando a pessoa nega uma permissão?`, `Que permissão poderia ser trocada por um seletor do sistema?`] },

{ id: 'deep-links', stage: 'plataforma', level: 'importante', title: 'Deep links, universal links e app links', short: 'Deep links',
  resumo: `Links que abrem uma tela específica do app, ou o site quando o app não está instalado.`,
  porque: `Links de e-mail, notificações, campanhas e compartilhamento precisam levar à tela certa. Sem isso, a pessoa cai na tela inicial e se perde; com uma configuração errada, outro app pode capturar os seus links.`,
  como: [
    `<b>Esquemas próprios</b> (<code>meuapp://pedidos/42</code>) são simples, mas qualquer app pode registrar o mesmo esquema. <b>Universal Links</b> (iOS) e <b>App Links</b> (Android) usam URLs <code>https</code> do seu domínio, verificadas por arquivos publicados no site (<code>apple-app-site-association</code> e <code>assetlinks.json</code>): se o app está instalado, ele abre; se não, o navegador abre o site.`,
    `O app mapeia a URL para a tela da navegação, valida os parâmetros (um link é entrada não confiável) e trata o caso de exigir login antes de chegar ao destino. <b>Deferred deep links</b> lembram o destino mesmo depois de instalar o app pela loja.`,
  ],
  conecta: [['ui-mobile', 'A navegação que o link precisa reconstruir.'], ['push', 'Notificações que abrem uma tela.'], ['seguranca-mobile', 'Links como entrada não confiável.'], ['frontend/roteamento', 'URLs que refletem a tela, como na web.']],
  front: `É o roteamento da web levado ao app: se o site e o app usam as mesmas URLs para as mesmas telas, qualquer link compartilhado funciona nos dois.`,
  ex: { lang: 'json', code: `// https://loja.exemplo.com/.well-known/apple-app-site-association
{
  "applinks": {
    "details": [{
      "appIDs": ["ABCDE12345.com.exemplo.loja"],
      "components": [
        { "/": "/pedidos/*", "comment": "abre o detalhe do pedido no app" },
        { "/": "/conta/*" }
      ]
    }]
  }
}

// https://loja.exemplo.com/.well-known/assetlinks.json (Android)
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": { "namespace": "android_app", "package_name": "com.exemplo.loja",
              "sha256_cert_fingerprints": ["14:6D:E9:..."] }
}]` },
  docs: [['Apple · Supporting universal links', 'https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app'], ['Android · About App Links', 'https://developer.android.com/training/app-links'], ['Expo · Linking', 'https://docs.expo.dev/linking/overview/']],
  perguntas: [`Que links do seu produto deveriam abrir direto no app?`, `Por que um esquema próprio (meuapp://) é menos seguro que um universal link?`, `O que acontece quando um link exige login e a pessoa não está logada?`] },

{ id: 'seguranca-mobile', stage: 'plataforma', level: 'importante', title: 'Segurança no app', short: 'Segurança',
  resumo: `Armazenamento seguro, segredos, engenharia reversa e comunicação com o servidor.`,
  porque: `O app roda num aparelho que você não controla: pode estar com root ou jailbreak, ser descompilado ou ter o tráfego interceptado. Tudo que está dentro do pacote deve ser tratado como público.`,
  como: [
    `Tokens e dados sensíveis vão para o <b>Keychain</b> (iOS) ou o <b>Keystore</b> com armazenamento criptografado (Android), nunca para AsyncStorage ou SharedPreferences comuns. <b>Nenhum segredo de servidor</b> deve estar no app: chaves embutidas são extraídas em minutos; a chamada a serviços pagos passa pelo seu backend. Use OAuth com <b>PKCE</b> no navegador do sistema para login.`,
    `Comunicação só por HTTPS (ATS no iOS, network security config no Android); <b>certificate pinning</b> dificulta interceptação, mas exige plano para troca de certificados. <b>Atestação</b> do app (App Attest, Play Integrity) ajuda o backend a saber que a requisição vem do app legítimo. Ofuscação atrasa, mas não impede, a engenharia reversa. Referência: <b>OWASP MASVS</b>.`,
  ],
  conecta: [['seguranca/oauth-a-fundo', 'OAuth com PKCE para apps.'], ['seguranca/tokens-sessoes', 'Ciclo de vida de tokens.'], ['backend/segredos', 'Segredos ficam no servidor.'], ['deep-links', 'Links são entrada não confiável.'], ['seguranca/fraude-abuso', 'Atestação contra automação e abuso.']],
  front: `A regra é a mesma do bundle JavaScript na web: o que vai para o cliente é público. A diferença é que o app ainda oferece cofres do sistema (Keychain/Keystore) para guardar tokens com mais proteção.`,
  ex: { lang: 'typescript', code: `import * as SecureStore from "expo-secure-store";

// guarda o refresh token no Keychain / Keystore
await SecureStore.setItemAsync("refresh_token", token, {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,  // não vai para backups
});

// ERRADO: chave de um serviço pago dentro do app
// const openai = new OpenAI({ apiKey: "sk-..." });
// CERTO: o app chama o seu backend, que guarda a chave e aplica limites
const resposta = await api.post("/assistente", { pergunta });` },
  docs: [['OWASP · MASVS', 'https://mas.owasp.org/MASVS/'], ['OWASP · Mobile Application Security Testing Guide', 'https://mas.owasp.org/MASTG/'], ['Android · Play Integrity API', 'https://developer.android.com/google/play/integrity']],
  perguntas: [`Onde o seu app guarda os tokens de autenticação?`, `Que chave ou segredo está hoje dentro do pacote do app?`, `O que acontece com o app quando o certificado do servidor com pinning é trocado?`] },
]
