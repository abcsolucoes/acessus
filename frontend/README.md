# Frontend — Accessus

Interface web do sistema Accessus. SPA construída com React 19 + TypeScript, sem dependência de biblioteca de UI externa — todo componente é CSS Modules bespoke.

## Stack

- **React 19** + **TypeScript**
- **Vite** — bundler e dev server
- **React Router v7** — roteamento client-side
- **CSS Modules** com design tokens — temas claro/escuro via variáveis CSS

## Estrutura

```
src/
├── components/
│   ├── Header/                  # Cabeçalho global — logo, módulo atual, menu do usuário, botão "Realizar Junção" (Dysrup)
│   ├── Toast/                   # Notificação flutuante
│   ├── ProtectedRoute/          # Guard de rota — token + role
│   ├── ThemeToggle/             # Alternância claro/escuro
│   ├── DashboardModuleNav/
│   ├── DashboardComponents/     # Banner, cards de módulos, ações recentes, dica
│   ├── RHComponents/
│   │   ├── RHList/              # Card de candidato, toolbar de busca/filtro
│   │   ├── Candidato/           # Hero, info, status, campos, downloads, checklist pós-aprovação, exclusão
│   │   ├── CandidateModal/      # Criar/editar candidato
│   │   ├── FieldModal/          # Adicionar campo customizado
│   │   └── DysrupConfirmModal/  # Confirmação de cadastro na Dysrup
│   ├── TicketComponents/        # Cards de KPI, lista, tabs de filtro, modal de criação
│   ├── ContatosComponents/      # Header, busca, lista, modal de "abrir no WhatsApp" (Z-API)
│   ├── LogsComponents/          # Header, filtro, tabela
│   └── InventarioComponents/
│       ├── InventarioSubnav/        # Navegação entre as 5 seções do módulo
│       ├── InventarioDashboard/     # Indicadores (KPIs) e alertas da Visão geral
│       ├── InventarioFuncionarios/  # Filtro, lista, paginação e modais da tela de Funcionários
│       │   ├── ImportarModal/           # Upload de planilha (.xls), resumo de novos/atualizados/pendentes
│       │   └── NovoFuncionarioModal/    # Cadastro manual (sócio/prestador de serviço)
│       ├── InventarioAparelhos/     # Filtro, lista e paginação da tela de Aparelhos
│       ├── InventarioAlocacao/      # Painéis de funcionário/aparelho, barra de vínculo, modal de sucesso
│       └── InventarioMovimentacoes/ # Filtro, lista e paginação da tela de Movimentações (mock, ver abaixo)
├── pages/
│   ├── Auth/                # Login, Activate, ForgotPassword
│   ├── Dashboard/
│   ├── RH/                  # Lista + Campos + Candidato (detalhe)
│   ├── Contatos/
│   ├── Tickets/              # Lista + TicketDetail
│   ├── Inventario/          # Visão geral + Funcionarios + Aparelhos + Alocacao + Movimentacoes
│   ├── Configuracoes/
│   ├── Logs/
│   ├── Ajuda/
│   └── Formulario/          # Formulário público de admissão (sem login)
├── hooks/                    # Um pacote por módulo (RHHooks, TicketHooks, ContatosHooks, DashboardHooks, LogsHooks, FuncionarioHooks, AparelhoHooks, AlocacaoHooks)
├── services/
│   ├── api.ts                # apiFetch, authHeaders, decodeToken — base de toda chamada HTTP (apiFetch aceita timeout customizado por chamada, default 15s)
│   ├── RhServices/
│   ├── TicketServices/
│   ├── ContatosServices/
│   ├── LogsServices/
│   ├── FuncionarioService/
│   └── AparelhoService/
├── styles/
│   └── global.css            # Design tokens e reset global
├── types/
│   └── index.ts               # Interfaces TypeScript compartilhadas
└── utils/
    └── format.ts               # Formatação de datas
```

> Convenção de módulo: cada domínio ganha um pacote próprio em `components/<Modulo>Components/`, `hooks/<Modulo>Hooks/` e `services/<Modulo>Services/`. Componentes reutilizados entre páginas do mesmo módulo (ex: `InventarioSubnav`) ficam em pasta própria com seu `style.module.css`; componentes usados numa página só importam o `style.module.css` da própria página.

## Rodando localmente

```bash
npm install
npm run dev       # dev server em http://localhost:5173
npm run build     # build de produção em dist/
```

## Autenticação

O JWT retornado pelo login é armazenado no `localStorage`. A função `decodeToken()` decodifica o payload diretamente no cliente (sem chamada à API) para leitura de `name`, `role` e `sub` (e-mail). Toda requisição autenticada inclui o header `Authorization: Bearer <token>` via `authHeaders()`. Uma resposta `401` limpa o token e redireciona para `/login` automaticamente.

## Rotas

| Rota | Página | Acesso |
|---|---|---|
| `/login`, `/forgot-password`, `/activate` | Auth | Público |
| `/formulario/:token` | Formulario | Público (token) |
| `/dashboard` | Dashboard | Autenticado |
| `/inventario`, `/inventario/funcionarios`, `/inventario/aparelhos`, `/inventario/alocacao`, `/inventario/movimentacoes` | Inventario | Autenticado¹ |
| `/contatos` | Contatos | Autenticado |
| `/ajuda` | Ajuda | Autenticado |
| `/tickets`, `/tickets/ticketDetail/:id` | Tickets | Autenticado |
| `/rh`, `/rh/:id`, `/rh/campos` | RH | ADMIN, RH |
| `/configuracoes` | Configuracoes | ADMIN |
| `/logs` | Logs | ADMIN |

¹ O backend restringe `/employee/**` a usuários do departamento TI, mas o menu/rota no frontend ainda não reflete essa restrição — qualquer usuário autenticado acessa a tela hoje (as chamadas à API é que retornam 403 pra quem não é TI).

## Perfis de acesso

| Role | Módulos visíveis |
|---|---|
| `ADMIN` | Todos |
| `RH` | RH, Contatos, Tickets |
| `OPERACIONAL` | Contatos, Tickets |
| `DP` | Contatos, Tickets |

O botão **"Realizar Junção"** no Header (dispara a consolidação de roteiros da Dysrup) é restrito por e-mail a uma lista fixa de usuários, independente de role. A tela **RH → Campos** só permite criar/remover campos de admissão para e-mails na lista de desenvolvedores (`VITE_DEV_EMAIL`).

## Módulos em detalhe

### RH
Lista de candidatos com busca e filtro por status, cadastro/edição/exclusão, reenvio de formulário, e uma página de detalhe (`/rh/:id`) com:
- Informações básicas, campos customizados e downloads de documentos
- Mudança de status, com checklist automático pós-aprovação (cadastro na Dysrup, envio de boas-vindas e dados da rota via WhatsApp, abertura de ticket de TI)
- Gerenciamento de campos de admissão (`/rh/campos`, restrito a e-mails de desenvolvedor)

### Tickets
Filtros: **Para mim**, **Meu setor**, **Abertos por mim**, e **Todos** (só ADMIN). Cards de KPI por status no topo, lista paginada, upload de anexos.

### Contatos
Agenda sincronizada com Google Contacts. Ao cadastrar um contato novo, oferece abrir uma conversa no WhatsApp (`wa.me`) diretamente — não depende de API própria, é só um link.

### Inventário
Módulo com submenu de navegação (`InventarioSubnav`) entre 5 seções: Visão geral, Funcionários, Aparelhos, Alocação e Movimentações — todas já existem no `App.tsx`. **Visão geral**, **Funcionários**, **Aparelhos** e **Alocação** têm conteúdo real; **Movimentações** ainda é só layout estático (ver abaixo).

- **Visão geral**: os KPIs "Funcionários ativos" e "Afastados" já vêm de dados reais (`GET /employee/count`, hook `useFuncionario`). Os KPIs de aparelho (cadastrados, sem aparelho, disponíveis p/ alocação etc.) e os banners de alerta continuam mockados — agora que a tela de Aparelhos existe, dá pra alimentá-los com dado real.
- **Funcionários**: lista real e paginada, ligada em `GET /employee` (hook `useFuncionario`). Inclui:
  - **Busca** por nome ou CPF (`GET /employee/search`), com debounce de 500ms — ao buscar, a página sempre volta pra 1 (`handleSetSearch`/`handleSetStatusFilter` no hook resetam a paginação a cada mudança de filtro).
  - **Filtro por status**: "Todos", "Afastados", "Com aparelho" e "Sem aparelho" funcionam de verdade (`hasDevice=true/false` na API); "Ajuda de custo" continua desabilitado (com tooltip) — não existe esse conceito na entidade `Device`/`Employee` ainda.
  - **Coluna de status do aparelho**: não é só "com"/"sem". Um `SERVICE_PROVIDER` (prestador de serviço) sem aparelho mostra badge neutro "Prestador de serviço" em vez de vermelho, porque não ter aparelho é esperado nesse perfil. Funcionário `DEMITIDO`, `AFASTADO`, de `FERIAS` ou `PENDENTE_REVISAO` sem aparelho também vira badge neutro com o próprio status (mesmos status que `EmployeeStatus.isActive()` já trata como "não ativo" no backend) — só quem está de fato ativo e não é freelancer aparece com o "Sem aparelho" vermelho (pendência de verdade). Ver `statusAparelho()` em `ListaFuncionarios.tsx`.
  - **Colunas TAG e ID Pulsus**: quando o funcionário tem aparelho vinculado, mostram `tagDevice` e `pulsusId` do primeiro aparelho da lista `f.devices`.
  - **Importar planilha** (`ImportarModal`) — upload de `.xls` exportado do Alter Data (`POST /employee/importSave`), upsert por CPF, resumo de novos/atualizados/pendentes de revisão ao final.
  - **Novo funcionário** (`NovoFuncionarioModal`) — cadastro manual de sócio ou prestador de serviço que não vem pela planilha (`POST /employee`). Só nome e CPF são obrigatórios; o formulário pede o perfil (Sócio ou Prestador de serviço); não pede empresa — todo cadastro manual é vinculado automaticamente no backend à mesma empresa usada pra marcar freelancer na importação.
  - **Exportar** (`useExportarFuncionarios`) — baixa um `.xlsx` com a base inteira de funcionários (`GET /employee/export`).
- **Aparelhos**: lista real e paginada, ligada em `GET /devices` (hook `useAparelhos`). Mostra modelo/fabricante, serial, grupo, funcionário vinculado (se houver), TAG, situação (`Em uso`/`Disponível`/`Em manutenção`/`Sem usuário identificado`) e ID Pulsus. **Filtro por situação** (pills: Todos/Em uso/Disponível/Em manutenção/Sem usuário) usa `situacao=` na API. **Busca** por serial, TAG ou ID Pulsus (`GET /devices/search`), com debounce de 500ms. Botão **"Sincronizar com Pulsus"** dispara `POST /devices/sync` direto da tela — a chamada usa um timeout de 60s em vez do padrão de 15s do `apiFetch`, porque o sync é síncrono/bloqueante de propósito e pode passar de 30s (decisão consciente: evita condição de corrida com edição concorrente e garante dado sempre atualizado na hora, ver [backend/README.md](../backend/README.md#aparelhos-inventário--devices)).
- **Alocação**: fluxo pra vincular manualmente um funcionário sem aparelho a um aparelho disponível, pra quando o matching automático do sync não resolve. Reaproveita os hooks que já existem em vez de duplicar fetch: `useFuncionario('SEM_APARELHO')` e `useAparelhos('DISPONIVEL')` (ambos os hooks aceitam um filtro inicial opcional, default `"ALL"`, sem quebrar quem já os chama sem argumento). Um hook novo, `useAlocacao`, cuida só do que é específico dessa tela — seleção de funcionário/aparelho e a ação de vincular — sem duplicar a busca de dados.
  - **Dois painéis lado a lado** (funcionários à esquerda, aparelhos à direita), cada um com busca, paginação própria e seleção por clique (rádio visual).
  - **Furo conhecido de backend:** `/employee/search` e `/devices/search` não aceitam `hasDevice`/`situacao` junto com o termo de busca — buscando, o resultado pode trazer gente/aparelho fora do filtro esperado. Contornado no front: `PainelFuncionarios`/`PainelAparelhos` filtram o resultado (`f.devices.length === 0`, `d.situacao === 'DISPONIVEL'`) depois que a API responde, antes de renderizar. Efeito colateral aceito: durante uma busca ativa, os contadores de paginação/"pendentes" podem ficar levemente imprecisos (calculados sobre o resultado bruto da busca, antes do filtro extra do front) — por isso os badges "X pendentes"/"X disponíveis" no topo da tela **congelam** no último valor correto enquanto há texto na busca (`totalSemAparelho`/`totalDisponiveis` só atualizam quando o campo de busca está vazio), em vez de mostrar esse número impreciso.
  - **Vincular** (`PATCH /devices/:id/vincular`, `vincularAparelho` em `aparelhoApi.ts`) atualiza o vínculo no Accessus e empurra nome/TAG pra Pulsus na mesma chamada (ver `backend/README.md`). Ao concluir, abre o `VinculoSucessoModal` com o aparelho/funcionário vinculados e um botão que leva direto pra `https://app.pulsus.mobi/devices/{pulsusId}` — porque a API da Pulsus não permite trocar o **grupo** do aparelho (só o backend Accessus atualiza nome/TAG), então mover o grupo continua manual e o modal existe justamente pra isso não ser esquecido/perdido.
- **Movimentações**: hoje é **só layout** (markup + CSS Modules, sem hook/estado/fetch) — filtro (busca + período + pills Todas/Alocações/Devoluções) e tabela com 5 linhas de exemplo fixas no JSX. Pensado pra consumir `GET /deviceHistory` quando for implementado de verdade (ver `backend/README.md`), mas ainda não está ligado em nada.

Acesso restrito a `DEPT_TI` no backend para `/employee/**` (ver nota¹ acima) — o frontend ainda não esconde o menu de quem não é TI, só as chamadas à API falham com 403. `/devices/**` e `/deviceHistory/**` ainda nem têm essa restrição no backend (qualquer autenticado acessa hoje).

### Logs
Auditoria com filtro por usuário e intervalo de datas, acesso restrito a ADMIN.
