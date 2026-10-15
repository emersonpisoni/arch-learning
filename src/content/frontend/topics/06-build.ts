import type { Topic } from '../../../types'

export const build: Topic[] = [
{ id: 'bundlers', stage: 'build', level: 'essencial', title: 'Bundlers e ferramentas de build', short: 'Bundlers',
  resumo: `Vite, webpack, esbuild, Rollup e afins: o que fazem entre o código-fonte e o navegador.`,
  porque: `Build lento atrasa o time inteiro, e configuração mal entendida gera bundles enormes. Saber o que o bundler faz ajuda a diagnosticar problemas de tamanho, cache e compatibilidade.`,
  como: [
    `Um bundler parte dos <b>pontos de entrada</b>, segue os imports e monta o <b>grafo de módulos</b>. No caminho, <b>transforma</b> (TypeScript, JSX, CSS Modules), <b>otimiza</b> (minificação, tree shaking, divisão em chunks, hash nos nomes) e gera <b>source maps</b> para depuração.`,
    `O <b>Vite</b> usa ESM nativo no desenvolvimento (sem empacotar, por isso inicia rápido) e um bundler para produção (Rollup, e mais recentemente Rolldown). <b>webpack</b> é o mais configurável e ainda comum em projetos maduros. <b>esbuild</b>, <b>SWC</b> e <b>Rolldown</b>, escritos em Go e Rust, tornaram transformações dezenas de vezes mais rápidas.`,
  ],
  conecta: [['modulos-js', 'O bundler trabalha sobre ESM.'], ['carregamento', 'Gera os chunks do code splitting.'], ['cache-assets', 'O hash no nome permite cache imutável.'], ['devops/pipelines', 'O build roda no CI.'], ['fundamentos/compiladores', 'AST, transformações e geração de código.']],
  front: `O comando <code>vite build</code> gera o mesmo tipo de artefato que o backend: uma pasta imutável, versionada pelo hash, pronta para ir para a CDN.`,
  ex: { lang: 'typescript', code: `// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ filename: "stats.html" })], // mapa do bundle
  build: {
    sourcemap: true,                    // para depurar erros de produção
    rollupOptions: {
      output: {
        manualChunks: { vendor: ["react", "react-dom"] }, // cache separado
      },
    },
  },
});` },
  docs: [['Vite · Guia', 'https://vite.dev/guide/'], ['Vite · Por que Vite', 'https://vite.dev/guide/why.html'], ['webpack · Conceitos', 'https://webpack.js.org/concepts/'], ['esbuild', 'https://esbuild.github.io/']],
  perguntas: [`Por que o servidor de desenvolvimento do Vite inicia mais rápido que o do webpack?`, `O que entra no chunk vendor do seu projeto?`, `Para que servem os source maps em produção?`] },

{ id: 'modulos-js', stage: 'build', level: 'importante', title: 'ESM, CommonJS e tree shaking', short: 'Módulos',
  resumo: `Os sistemas de módulos do JavaScript e por que eles afetam o tamanho do bundle.`,
  porque: `Erros como "require is not defined" ou "Cannot use import statement outside a module", e bibliotecas que não são reduzidas no build, vêm da convivência entre ESM e CommonJS.`,
  como: [
    `<b>ESM</b> (<code>import</code>/<code>export</code>) é o padrão da linguagem: imports estáticos, analisáveis antes da execução, com <code>import()</code> dinâmico para carregar sob demanda. <b>CommonJS</b> (<code>require</code>/<code>module.exports</code>) é o formato histórico do Node, dinâmico e síncrono. No Node, o campo <code>"type": "module"</code> e as extensões <code>.mjs</code> e <code>.cjs</code> definem qual é usado.`,
    `<b>Tree shaking</b> remove exports não usados, e só funciona bem com ESM, porque imports estáticos permitem saber o que é usado. Bibliotecas ajudam declarando <code>"sideEffects": false</code> e campos <code>exports</code> no package.json. Imports como <code>import _ from "lodash"</code> trazem tudo; <code>import debounce from "lodash-es/debounce"</code> traz só o necessário.`,
  ],
  conecta: [['bundlers', 'O bundler aplica o tree shaking.'], ['carregamento', 'import() dinâmico cria chunks.'], ['backend/linguagem', 'O Node suporta os dois formatos.']],
  front: `Ao escolher uma biblioteca, veja no bundlephobia ou no pkg-size se ela é ESM e "tree-shakeable"; isso diz quanto ela vai realmente pesar no seu bundle.`,
  ex: { lang: 'javascript', code: `// ESM: estático, permite tree shaking
import { formatarData } from "./datas.js";
export function rotulo(d) { return formatarData(d); }

// CommonJS: dinâmico, difícil de otimizar
const { formatarData } = require("./datas");
module.exports = { rotulo };

// package.json de uma biblioteca
{
  "type": "module",
  "exports": { ".": { "import": "./dist/index.js", "require": "./dist/index.cjs" } },
  "sideEffects": false
}` },
  docs: [['MDN · JavaScript modules', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'], ['Node.js · Modules: packages', 'https://nodejs.org/api/packages.html'], ['webpack · Tree shaking', 'https://webpack.js.org/guides/tree-shaking/']],
  perguntas: [`Por que tree shaking funciona melhor com ESM?`, `Que dependência do seu projeto é importada inteira sem necessidade?`, `O que o campo "sideEffects": false informa ao bundler?`] },

{ id: 'deploy-front', stage: 'build', level: 'essencial', title: 'Deploy de front', short: 'Deploy de front',
  resumo: `Publicar o front com segurança: estático na CDN, servidor de SSR, previews e rollback.`,
  porque: `O deploy do front tem armadilhas próprias: cache de HTML, chunks que somem, variáveis de ambiente embutidas no build e coordenação com mudanças de API.`,
  como: [
    `<b>Front estático</b> (SPA, SSG): o build vai para object storage ou uma plataforma (Vercel, Netlify, Cloudflare Pages) atrás de uma CDN; rollback é apontar para o build anterior. <b>Front com SSR</b>: roda como servidor ou funções, com os mesmos cuidados de qualquer serviço (health check, escala, logs).`,
    `Boas práticas: <b>preview por pull request</b>; variáveis de ambiente públicas são embutidas no build, então configurações por ambiente exigem build por ambiente ou um <code>config.json</code> carregado em tempo de execução; manter os assets anteriores por um tempo; e publicar mudanças de front e de API em ordem compatível (API primeiro, aceitando o front antigo).`,
  ],
  conecta: [['devops/estrategias-deploy', 'Canary e rollback também valem para o front.'], ['devops/ambientes', 'Previews são ambientes efêmeros.'], ['cache-assets', 'Cache de HTML e assets no deploy.'], ['arquitetura/evolucao-apis', 'Front e API mudam em momentos diferentes.']],
  front: `Mostrar a versão (SHA do commit) num endpoint ou no console do navegador facilita confirmar o que está no ar quando alguém reporta um bug.`,
  ex: { lang: 'yaml', code: `# GitHub Actions: build e deploy de um front estático para S3 + CloudFront
- run: npm ci && npm run build
  env: { VITE_APP_VERSION: "\${{ github.sha }}" }
- run: aws s3 sync dist/assets s3://loja-front/assets --cache-control "public,max-age=31536000,immutable"
- run: aws s3 cp dist/index.html s3://loja-front/index.html --cache-control "no-cache"
- run: aws cloudfront create-invalidation --distribution-id \${{ vars.CF_ID }} --paths "/index.html"
# assets antigos não são apagados: abas abertas continuam funcionando` },
  docs: [['Vite · Deploying a static site', 'https://vite.dev/guide/static-deploy.html'], ['Vercel · Preview deployments', 'https://vercel.com/docs/deployments/preview-deployments'], ['Vite · Env variables and modes', 'https://vite.dev/guide/env-and-mode.html']],
  perguntas: [`Como o seu time faz rollback do front hoje?`, `Por que variáveis VITE_* exigem um build por ambiente?`, `Em que ordem publicar uma mudança que envolve front e API?`] },

{ id: 'observabilidade-front', stage: 'build', level: 'importante', title: 'Erros e monitoramento no front', short: 'Observabilidade front',
  resumo: `Saber quando o front quebra para usuários reais e conseguir investigar.`,
  porque: `Erros de JavaScript em produção raramente chegam como reclamação; o usuário só desiste. Sem monitoramento, o front é a parte menos visível do sistema para o restante da empresa.`,
  como: [
    `Ferramentas como <b>Sentry</b>, Datadog RUM e New Relic capturam <b>erros</b> (com stack trace desminificado por source maps), <b>breadcrumbs</b> (o que o usuário fez antes), <b>replay de sessão</b> e <b>métricas de performance</b> reais. Error boundaries no React evitam tela branca e reportam o erro.`,
    `Ligue front e back: propague <code>traceparent</code> nas requisições para ver no mesmo trace o clique e a query no banco; inclua a versão do front em cada evento. Cuide da privacidade: mascare campos sensíveis em replays e não envie dados pessoais nos logs.`,
  ],
  conecta: [['backend/observabilidade', 'Logs, métricas e traces do lado do servidor.'], ['medicao', 'RUM de performance.'], ['devops/alertas', 'Erros novos e frequentes viram alerta.'], ['seguranca/lgpd', 'Replays e logs podem conter dados pessoais.']],
  front: `Erros como "ResizeObserver loop" ou de extensões do navegador geram muito ruído; configure filtros para que o painel mostre o que realmente afeta os usuários.`,
  ex: { lang: 'typescript', code: `import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  release: import.meta.env.VITE_APP_VERSION,            // liga erros à versão publicada
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllInputs: true })],
  tracePropagationTargets: [/^https:\\/\\/api\\.loja\\.com/], // envia traceparent para a API
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export const App = Sentry.withErrorBoundary(Rotas, { fallback: <TelaDeErro /> });` },
  docs: [['Sentry · React', 'https://docs.sentry.io/platforms/javascript/guides/react/'], ['React · Error boundaries', 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary'], ['OpenTelemetry · JavaScript no navegador', 'https://opentelemetry.io/docs/languages/js/getting-started/browser/']],
  perguntas: [`Como você descobre hoje que o front quebrou para algum usuário?`, `Por que enviar source maps para a ferramenta de erros?`, `Que dados devem ser mascarados num replay de sessão?`] },
]
