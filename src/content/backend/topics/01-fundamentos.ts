import type { Topic } from '../../../types'

export const fundamentos: Topic[] = [
{ id: 'internet', stage: 'fundamentos', level: 'essencial', title: 'Redes: IP, TCP e UDP', short: 'TCP/IP',
  resumo: `Como dois computadores se encontram e trocam bytes de forma confiável.`,
  porque: `Toda requisição feita por um navegador, um app ou outro serviço vira pacotes passando por roteadores. Quando alguém fala de timeout, porta bloqueada, latência ou "connection refused", está falando desta camada. Sem ela, HTTP, banco de dados e load balancer parecem mágica.`,
  como: [
    `Cada máquina na rede tem um <b>endereço IP</b> (ex.: <code>172.31.4.10</code>). Dentro da máquina, cada programa escuta em uma <b>porta</b>: o servidor web na 443, o Postgres na 5432, o Redis na 6379. O par IP + porta identifica exatamente com quem você está falando.`,
    `<b>TCP</b> garante entrega em ordem e sem perdas. Antes de enviar dados ele faz o <i>three-way handshake</i> (SYN, SYN-ACK, ACK) e reenvia pacotes perdidos. HTTP/1.1, HTTP/2, bancos de dados e a maioria das APIs usam TCP. <b>UDP</b> só dispara pacotes, sem garantias, e por isso é mais rápido: é usado em DNS, vídeo, jogos e no HTTP/3 (via QUIC).`,
    `Os dados descem e sobem por camadas (modelo TCP/IP): aplicação (HTTP), transporte (TCP/UDP), rede (IP) e enlace (Ethernet, Wi-Fi). Cada camada só conversa com a vizinha. É por isso que dá para trocar Wi-Fi por cabo sem mudar uma linha do seu código.`,
  ],
  conecta: [['dns', 'Traduz o nome do site em IP antes de qualquer conexão TCP.'], ['http', 'HTTP/1.1 e HTTP/2 rodam em cima de uma conexão TCP.'], ['redes-infra', 'Firewalls filtram tráfego por IP, porta e protocolo.'], ['load-balancer', 'Balanceadores L4 trabalham direto com conexões TCP.']],
  front: `No DevTools, aba Network, abra o "Timing" de uma requisição: "Initial connection" e "SSL" são os handshakes TCP e TLS. É por isso que reaproveitar conexões (keep-alive, HTTP/2) e usar <code>preconnect</code> deixa a página mais rápida.`,
  ex: { lang: 'bash', code: `# quem está escutando em quais portas na sua máquina
lsof -iTCP -sTCP:LISTEN -n -P

# testar se uma porta remota está aberta
nc -vz api.github.com 443

# ver o caminho dos pacotes até um host
traceroute github.com` },
  docs: [['Cloudflare · O que é TCP/IP', 'https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/'], ['Cloudflare · Modelo OSI', 'https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/'], ['High Performance Browser Networking (livro gratuito)', 'https://hpbn.co/']],
  perguntas: [`Qual a diferença entre receber "connection refused" e receber um timeout?`, `Por que o HTTP/3 trocou TCP por UDP (QUIC)?`, `Por que dois programas não podem escutar na mesma porta?`] },

{ id: 'dns', stage: 'fundamentos', level: 'essencial', title: 'DNS', short: 'DNS',
  resumo: `A agenda telefônica da internet: transforma api.empresa.com em um endereço IP.`,
  porque: `Deploy que "não funciona para alguns usuários", domínio novo que demora para aparecer, troca de servidor sem downtime: quase sempre há DNS envolvido. É também a primeira etapa de toda requisição.`,
  como: [
    `Quando o navegador precisa de <code>api.empresa.com</code>, pergunta a um <b>resolver</b> (do provedor de internet, ou públicos como 1.1.1.1 e 8.8.8.8). Ele consulta os servidores raiz, depois os do <code>.com</code>, depois os servidores <b>autoritativos</b> da empresa, e devolve o IP. A resposta fica em cache pelo tempo definido no <b>TTL</b>.`,
    `Registros mais comuns: <b>A/AAAA</b> (nome para IPv4/IPv6), <b>CNAME</b> (apelido que aponta para outro nome), <b>MX</b> (e-mail) e <b>TXT</b> (verificações de domínio, SPF). Em migrações, os times baixam o TTL alguns dias antes para que a troca de IP se propague rápido.`,
  ],
  conecta: [['internet', 'O DNS devolve o IP que o TCP usa para abrir a conexão.'], ['load-balancer', 'O domínio aponta para o load balancer, e não para cada servidor.'], ['cache', 'CDNs usam DNS para mandar o usuário ao servidor mais próximo.'], ['https-tls', 'O certificado TLS vale para um nome de domínio específico.']],
  front: `A variável <code>API_URL</code> de um front aponta para um nome DNS. As dicas <code>dns-prefetch</code> e <code>preconnect</code> no HTML existem para adiantar essa resolução antes do primeiro fetch.`,
  ex: { lang: 'bash', code: `dig api.github.com +short       # só o IP
dig github.com A                  # registro A completo
dig www.github.com CNAME          # para quem esse nome aponta
dig github.com +noall +answer     # resposta com o TTL restante` },
  docs: [['Cloudflare · O que é DNS', 'https://www.cloudflare.com/learning/dns/what-is-dns/'], ['How DNS Works (quadrinho)', 'https://howdns.works/'], ['MDN · dns-prefetch', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/dns-prefetch']],
  perguntas: [`Por que uma mudança de DNS não chega a todos os usuários ao mesmo tempo?`, `Qual a diferença entre um registro A e um CNAME?`, `Onde o DNS entra numa troca de servidor sem downtime?`] },

{ id: 'http', stage: 'fundamentos', level: 'essencial', title: 'HTTP', short: 'HTTP',
  resumo: `O protocolo de pedido e resposta que frontend e backend usam para conversar.`,
  porque: `É a língua comum entre front e back. Dominar métodos, status codes e headers resolve metade das discussões de integração: "devolve 400 ou 422?", "esse PUT pode ser repetido?", "quem define o cache?".`,
  como: [
    `Uma requisição tem <b>método</b> (GET, POST, PUT, PATCH, DELETE), <b>caminho</b>, <b>headers</b> e, às vezes, <b>corpo</b>. A resposta tem <b>status code</b>, headers e corpo. HTTP é <b>stateless</b>: cada requisição carrega tudo o que o servidor precisa saber, e é por isso que cookies e tokens existem.`,
    `Status por família: <b>2xx</b> sucesso; <b>3xx</b> redirecionamento; <b>4xx</b> erro de quem chamou (400 inválido, 401 não autenticado, 403 sem permissão, 404, 409 conflito, 422 validação, 429 excesso de requisições); <b>5xx</b> erro do servidor (500, 502 resposta ruim do servidor de trás, 503 indisponível, 504 timeout no gateway).`,
    `Métodos têm propriedades: GET, PUT e DELETE são <b>idempotentes</b> (repetir dá o mesmo resultado), POST não é. HTTP/2 multiplexa várias requisições numa só conexão, e o HTTP/3 roda sobre QUIC/UDP.`,
  ],
  conecta: [['rest', 'REST é um jeito de desenhar APIs usando os verbos e status do HTTP.'], ['https-tls', 'HTTPS é o mesmo HTTP dentro de um canal cifrado.'], ['cache', 'Headers como Cache-Control e ETag controlam o cache.'], ['cors', 'CORS é um conjunto de headers HTTP lidos pelo navegador.'], ['idempotencia', 'Saber quais métodos podem ser repetidos com segurança.']],
  front: `<code>fetch()</code> é HTTP puro. Um 502 ou 504 normalmente não é bug da API, e sim de quem está na frente dela (proxy, load balancer, gateway). Saber isso leva a conversa direto para o time certo.`,
  ex: { lang: 'http', code: `POST /api/pedidos HTTP/1.1
Host: loja.exemplo.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Idempotency-Key: 6f1c2a90

{"produtoId": 42, "quantidade": 2}

HTTP/1.1 201 Created
Location: /api/pedidos/981
Content-Type: application/json

{"id": 981, "status": "PENDENTE"}` },
  docs: [['MDN · Visão geral do HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview'], ['MDN · Status codes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status'], ['RFC 9110 · HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110']],
  perguntas: [`Qual a diferença entre 401 e 403?`, `Por que PUT é idempotente e POST não é?`, `O que significa um 502 vindo de um load balancer?`] },

{ id: 'https-tls', stage: 'fundamentos', level: 'essencial', title: 'HTTPS e TLS', short: 'TLS',
  resumo: `Criptografia e identidade: garante que você fala com o servidor certo e que ninguém lê o caminho.`,
  porque: `Sem HTTPS, senhas e tokens viajam em texto puro. Certificados expirados derrubam sistemas inteiros, e frases como "terminação TLS no load balancer" ou "mTLS entre serviços" aparecem em toda conversa de infra.`,
  como: [
    `No <b>handshake TLS</b>, o servidor apresenta um <b>certificado</b> assinado por uma autoridade certificadora (CA) em que o navegador confia. Cliente e servidor combinam uma chave usando criptografia assimétrica e depois passam a usar criptografia simétrica, bem mais rápida, no resto da conversa.`,
    `Em produção é comum fazer <b>terminação TLS</b> no load balancer ou proxy: ele decifra o tráfego e repassa para os servidores internos. Entre microsserviços, o <b>mTLS</b> faz os dois lados apresentarem certificado. O Let's Encrypt emite certificados gratuitos e renovados automaticamente pelo protocolo ACME.`,
  ],
  conecta: [['http', 'HTTPS é HTTP dentro de um túnel TLS.'], ['load-balancer', 'Lugar mais comum para terminar o TLS.'], ['redes-infra', 'Proxies reversos cuidam de certificados no lugar da aplicação.'], ['autenticacao', 'Tokens e cookies de sessão só são seguros num canal cifrado.']],
  front: `Cookies com a flag <code>Secure</code> só trafegam em HTTPS, e Service Workers, geolocalização e outras APIs do navegador exigem contexto seguro. Mixed content (página HTTPS chamando uma API HTTP) é bloqueado pelo navegador.`,
  ex: { lang: 'bash', code: `# ver para quem é o certificado, quem emitiu e a validade
openssl s_client -connect github.com:443 -servername github.com </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -issuer -dates` },
  docs: [['Cloudflare · O que é HTTPS', 'https://www.cloudflare.com/learning/ssl/what-is-https/'], ['Cloudflare · O handshake TLS', 'https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/'], ['Let\'s Encrypt · Como funciona', 'https://letsencrypt.org/how-it-works/']],
  perguntas: [`Por que o TLS usa criptografia assimétrica só no começo da conexão?`, `O que é terminação TLS e qual o trade-off de fazê-la no load balancer?`, `O que acontece com os usuários quando um certificado expira?`] },

{ id: 'linux', stage: 'fundamentos', level: 'importante', title: 'Linux e terminal', short: 'Linux',
  resumo: `O sistema operacional onde quase todo backend roda em produção.`,
  porque: `Servidores, containers e pipelines de CI rodam Linux. Ler logs, ver processos, checar memória e permissões de arquivo são tarefas do dia a dia de quem mantém um backend.`,
  como: [
    `Conceitos centrais: <b>processos</b> (cada programa em execução, com um PID), <b>sinais</b> (SIGTERM pede para encerrar, SIGKILL mata na hora), <b>permissões</b> (usuário, grupo, outros), <b>variáveis de ambiente</b>, <b>stdin/stdout/stderr</b> e pipes (<code>|</code>) para encadear comandos.`,
    `Comandos que resolvem a maior parte dos problemas: <code>ps</code>, <code>top</code> e <code>htop</code> (processos), <code>df</code> e <code>du</code> (disco), <code>free</code> (memória), <code>tail -f</code> e <code>grep</code> (logs), <code>curl</code> (testar APIs), <code>ssh</code> (acesso remoto), <code>systemctl</code> e <code>journalctl</code> (serviços).`,
  ],
  conecta: [['threads', 'O kernel é quem agenda processos e threads na CPU.'], ['docker', 'Containers são processos Linux isolados.'], ['observabilidade', 'Aplicações escrevem logs em stdout, coletados pela infra.'], ['segredos', 'Configuração e credenciais chegam por variáveis de ambiente.'], ['fundamentos/sistema-operacional', 'O que o kernel faz por trás dos comandos.']],
  front: `Um <code>npm run dev</code> é um processo que recebe SIGINT quando se aperta Ctrl+C. Em container, a aplicação precisa tratar SIGTERM para terminar as requisições em andamento antes de sair (graceful shutdown).`,
  ex: { lang: 'bash', code: `ps aux | grep node                      # processos node rodando
lsof -i :3000                           # quem está usando a porta 3000
tail -f /var/log/app.log | grep ERROR   # acompanhar erros ao vivo
curl -i https://api.github.com/zen      # status, headers e corpo
kill -TERM 4821                         # pedir para o processo encerrar` },
  docs: [['The Linux Command Line (livro gratuito)', 'https://linuxcommand.org/tlcl.php'], ['Linux Journey', 'https://linuxjourney.com/'], ['explainshell · explica qualquer comando', 'https://explainshell.com/']],
  perguntas: [`Qual a diferença entre SIGTERM e SIGKILL?`, `Para onde vai o que um programa escreve em stdout dentro de um container?`, `Como descobrir qual processo está ocupando a porta 3000?`] },
]
