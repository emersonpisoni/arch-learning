import type { Topic } from '../../../types'

export const sistemas: Topic[] = [
{ id: 'shell-scripting', stage: 'sistemas', level: 'essencial', title: 'Shell script e automação', short: 'Shell script',
  resumo: `Transformar tarefas repetidas no terminal em scripts confiáveis.`,
  porque: `Quase toda automação de infraestrutura começa com um script: preparar uma máquina, rodar um backup, checar se um serviço está de pé. Pipelines de CI também são, no fundo, sequências de comandos de shell.`,
  como: [
    `Um script Bash é uma lista de comandos com variáveis, condicionais (<code>if</code>), laços (<code>for</code>, <code>while</code>) e funções. O <b>código de saída</b> de cada comando (0 = sucesso) é o que permite encadear passos com <code>&&</code> ou parar quando algo falha.`,
    `Comece todo script com <code>set -euo pipefail</code>: <code>-e</code> para no primeiro erro, <code>-u</code> acusa variáveis não definidas e <code>pipefail</code> não esconde falhas no meio de um pipe. Sempre coloque variáveis entre aspas (<code>"$arquivo"</code>) para não quebrar com espaços. O ShellCheck aponta a maioria dos erros comuns.`,
    `Tarefas periódicas são agendadas com <b>cron</b> (ou timers do systemd). Quando o script passa de umas 100 linhas ou precisa de estruturas de dados, costuma valer a pena migrar para Python ou Go.`,
  ],
  conecta: [['backend/linux', 'Scripts combinam os comandos básicos do Linux.'], ['processos-recursos', 'Scripts de diagnóstico leem CPU, memória e disco.'], ['pipelines', 'Os passos de um pipeline de CI são comandos de shell.'], ['config-management', 'Quando scripts crescem demais, ferramentas declarativas assumem.']],
  front: `Os <code>scripts</code> de um <code>package.json</code> são comandos de shell. Entender códigos de saída explica por que um <code>npm test</code> que falha interrompe o pipeline.`,
  ex: { lang: 'bash', code: `#!/usr/bin/env bash
set -euo pipefail

URL="\${1:-https://api.exemplo.com/health}"
LIMITE_DISCO=90

uso=$(df / --output=pcent | tail -1 | tr -dc '0-9')
if (( uso > LIMITE_DISCO )); then
  echo "ALERTA: disco em \${uso}%" >&2
fi

if ! curl -fsS --max-time 5 "$URL" > /dev/null; then
  echo "ALERTA: health check falhou em $URL" >&2
  exit 1
fi
echo "ok"

# crontab -e  →  */5 * * * * /opt/scripts/check.sh >> /var/log/check.log 2>&1` },
  docs: [['GNU Bash Manual', 'https://www.gnu.org/software/bash/manual/bash.html'], ['ShellCheck', 'https://www.shellcheck.net/'], ['crontab.guru · montar expressões cron', 'https://crontab.guru/']],
  perguntas: [`Que tarefa manual do seu time poderia virar um script hoje?`, `Por que "set -e" sozinho não pega erros no meio de um pipe?`, `Em que ponto um script deveria virar um programa em outra linguagem?`] },

{ id: 'processos-recursos', stage: 'sistemas', level: 'essencial', title: 'CPU, memória, disco e I/O', short: 'Recursos',
  resumo: `Entender os recursos de uma máquina e diagnosticar qual deles está no limite.`,
  porque: `"O servidor está lento" quase sempre significa que um recurso acabou: CPU, memória, disco ou rede. Saber qual é o primeiro passo de qualquer investigação e de qualquer decisão de dimensionamento.`,
  como: [
    `<b>CPU</b>: o <i>load average</i> mostra quantos processos querem rodar; acima do número de núcleos, há fila. <b>Memória</b>: quando acaba, o kernel usa swap (lento) ou o <b>OOM killer</b> mata processos, o que é comum em containers com limite baixo. <b>Disco</b>: espaço cheio (<code>df</code>) e também <b>inodes</b> esgotados derrubam aplicações. <b>I/O</b>: disco lento aparece como alto <i>iowait</i>.`,
    `Ferramentas: <code>top</code>/<code>htop</code> (visão geral), <code>free -h</code> (memória), <code>df -h</code> e <code>du</code> (disco), <code>iostat</code> e <code>vmstat</code> (I/O), <code>ss</code> (conexões). O método <b>USE</b> organiza a investigação: para cada recurso, olhe <b>U</b>tilização, <b>S</b>aturação e <b>E</b>rros.`,
  ],
  conecta: [['backend/threads', 'Threads e processos disputam a CPU.'], ['capacidade', 'Dimensionar é decidir quanto de cada recurso é preciso.'], ['alertas', 'Saturação de recursos vira alerta.'], ['k8s-config', 'Requests e limits de containers reservam CPU e memória.']],
  front: `O Performance Monitor do DevTools mostra CPU e memória da aba; vazamento de memória no front tem o mesmo comportamento no servidor: o consumo cresce até algo quebrar.`,
  ex: { lang: 'bash', code: `uptime                 # load average dos últimos 1, 5 e 15 min
nproc                  # quantos núcleos a máquina tem
free -h                # memória usada, livre e em cache
df -h && df -i         # espaço em disco e inodes
iostat -xz 1 3         # utilização e espera de I/O por disco
dmesg | grep -i oom    # processos mortos por falta de memória` },
  docs: [['Brendan Gregg · The USE Method', 'https://www.brendangregg.com/usemethod.html'], ['Brendan Gregg · Linux Performance', 'https://www.brendangregg.com/linuxperf.html'], ['man7 · proc(5)', 'https://man7.org/linux/man-pages/man5/proc.5.html']],
  perguntas: [`Um load average de 8 é alto numa máquina com 16 núcleos?`, `Por que o disco pode "encher" mesmo com espaço livre?`, `O que acontece quando um container passa do limite de memória?`] },

{ id: 'redes-linux', stage: 'sistemas', level: 'essencial', title: 'IPs, sub-redes e CIDR', short: 'CIDR',
  resumo: `Como endereços são divididos em redes e como o tráfego encontra o caminho.`,
  porque: `Criar uma VPC, liberar acesso no firewall ou conectar duas redes exige ler notação como <code>10.0.0.0/16</code>. Faixas que se sobrepõem são uma causa clássica de VPN e peering que não funcionam.`,
  como: [
    `Um IPv4 tem 32 bits. Na notação <b>CIDR</b>, o número depois da barra diz quantos bits identificam a rede: <code>/24</code> deixa 8 bits para hosts (256 endereços), <code>/16</code> deixa 16 (65.536). As faixas <b>privadas</b> (<code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>) não são roteadas na internet.`,
    `A <b>tabela de rotas</b> decide para onde cada pacote vai: dentro da sub-rede, direto; fora dela, para o <b>gateway</b>. Ferramentas: <code>ip addr</code>, <code>ip route</code>, <code>ss -tlnp</code> (portas abertas), <code>dig</code>, <code>traceroute</code> e <code>tcpdump</code> para ver os pacotes de verdade.`,
  ],
  conecta: [['backend/internet', 'A base: IP, TCP e portas.'], ['backend/redes-infra', 'VPCs e subnets são divididas em faixas CIDR.'], ['regioes-az', 'Cada zona costuma ter sua própria subnet.'], ['k8s-rede', 'Pods e services recebem IPs de faixas internas.']],
  front: `O servidor de desenvolvimento em <code>0.0.0.0</code> aceita conexões de qualquer interface (por isso o celular na mesma rede acessa); em <code>127.0.0.1</code>, só da própria máquina.`,
  ex: { lang: 'texto', code: `10.0.0.0/16      → 10.0.0.0 a 10.0.255.255   (65.536 endereços, a VPC)
10.0.1.0/24      → 10.0.1.0 a 10.0.1.255     (256, subnet pública)
10.0.2.0/24      → 10.0.2.0 a 10.0.2.255     (256, subnet privada)

$ ip route
default via 10.0.1.1 dev eth0      # fora da rede: vai para o gateway
10.0.1.0/24 dev eth0 scope link    # dentro da subnet: entrega direta` },
  docs: [['Cloudflare · O que é uma sub-rede', 'https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/'], ['RFC 1918 · Endereços privados', 'https://www.rfc-editor.org/rfc/rfc1918'], ['AWS · Dimensionamento de VPC e subnets', 'https://docs.aws.amazon.com/vpc/latest/userguide/vpc-cidr-blocks.html']],
  perguntas: [`Quantos endereços cabem num /20?`, `Por que duas VPCs com a mesma faixa CIDR não podem ser conectadas por peering?`, `Qual a diferença entre escutar em 0.0.0.0 e em 127.0.0.1?`] },

{ id: 'ssh', stage: 'sistemas', level: 'importante', title: 'SSH e acesso remoto', short: 'SSH',
  resumo: `Acessar e operar servidores remotos com segurança.`,
  porque: `SSH é a porta de entrada para máquinas, a forma como o Git autentica e a base de túneis para alcançar bancos em redes privadas. Configuração ruim de SSH é um dos alvos mais atacados da internet.`,
  como: [
    `Prefira <b>chaves</b> a senhas: a chave privada fica com você, a pública vai para <code>~/.ssh/authorized_keys</code> no servidor. Gere com <code>ssh-keygen -t ed25519</code>. No servidor, desative login por senha e login direto de root.`,
    `Recursos úteis: <code>~/.ssh/config</code> com apelidos, <b>bastion/jump host</b> (<code>ssh -J</code>) para chegar a máquinas privadas, e <b>túnel</b> (<code>ssh -L 5432:db.interno:5432 bastion</code>) para acessar um banco privado pela porta local. Em nuvem, alternativas como AWS SSM e IAP evitam abrir a porta 22.`,
  ],
  conecta: [['backend/linux', 'Depois de conectar, o trabalho é no terminal Linux.'], ['iam', 'Acesso a máquinas também deve passar por identidade e auditoria.'], ['backend/redes-infra', 'Bastions dão acesso a subnets privadas.'], ['seguranca/hardening', 'Endurecer o SSH faz parte do hardening do servidor.']],
  front: `Clonar repositórios com <code>git@github.com:...</code> já é usar SSH com chave. A chave pública cadastrada no GitHub segue o mesmo modelo dos servidores.`,
  ex: { lang: 'bash', code: `ssh-keygen -t ed25519 -C "voce@empresa.com"

# ~/.ssh/config
Host bastion
  HostName 203.0.113.10
  User ubuntu
Host api-privada
  HostName 10.0.2.15
  User ubuntu
  ProxyJump bastion

ssh api-privada                                   # passa pelo bastion
ssh -L 5432:db.interno:5432 bastion               # banco privado em localhost:5432` },
  docs: [['OpenSSH · Manual', 'https://www.openssh.com/manual.html'], ['GitHub · Conectar com SSH', 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh'], ['SSH Academy', 'https://www.ssh.com/academy/ssh']],
  perguntas: [`Por que desativar o login por senha no SSH?`, `Como acessar um banco que está numa subnet privada a partir da sua máquina?`, `Que alternativas existem para não expor a porta 22?`] },

{ id: 'systemd', stage: 'sistemas', level: 'aprofundar', title: 'Serviços com systemd', short: 'systemd',
  resumo: `Manter processos rodando como serviços, com reinício automático e logs.`,
  porque: `Fora do mundo de containers, aplicações em VMs rodam como serviços do systemd. Mesmo com Kubernetes, nós, agentes e o próprio runtime de containers são gerenciados por ele.`,
  como: [
    `Um <b>unit file</b> descreve como iniciar o processo, com qual usuário, quais variáveis de ambiente e a política de <code>Restart=</code>. Comandos: <code>systemctl start|stop|restart|status</code>, <code>systemctl enable</code> para iniciar no boot.`,
    `Os logs vão para o <b>journal</b>, lido com <code>journalctl -u meu-servico -f</code>. Timers do systemd substituem o cron com logs e dependências melhores.`,
  ],
  conecta: [['backend/linux', 'Processos, sinais e usuários do Linux.'], ['shell-scripting', 'Timers do systemd agendam scripts.'], ['kubernetes', 'Kubernetes faz por containers o que o systemd faz por processos.']],
  front: `É o equivalente de produção ao <code>pm2</code> ou ao <code>nodemon</code>: manter o processo vivo e reiniciá-lo se cair.`,
  ex: { lang: 'ini', code: `# /etc/systemd/system/api.service
[Unit]
Description=API de pedidos
After=network-online.target

[Service]
User=app
WorkingDirectory=/opt/api
EnvironmentFile=/etc/api.env
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target

# systemctl enable --now api && journalctl -u api -f` },
  docs: [['systemd · systemd.service', 'https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html'], ['DigitalOcean · Systemd essentials', 'https://www.digitalocean.com/community/tutorials/systemd-essentials-working-with-services-units-and-the-journal'], ['Arch Wiki · systemd', 'https://wiki.archlinux.org/title/Systemd']],
  perguntas: [`O que Restart=on-failure faz quando o processo termina com erro?`, `Por que rodar a aplicação com um usuário próprio e não como root?`, `Qual a vantagem de timers do systemd sobre o cron?`] },
]
