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
│       ├── FuncionarioDetalhe/      # Hero, info, aparelhos vinculados, histórico — tela /inventario/funcionarios/:id
│       ├── InventarioAparelhos/     # Filtro, lista e paginação da tela de Aparelhos
│       ├── AparelhoDetalhe/         # Hero, info, funcionário vinculado, histórico — tela /inventario/aparelhos/:id
│       ├── InventarioAlocacao/      # Painéis de funcionário/aparelho, barra de vínculo, modal de sucesso (com download do contrato de comodato e atalho pro Youk)
│       ├── InventarioMovimentacoes/ # Filtro (mock), lista e paginação da tela de Movimentações — lista já real, ver abaixo
│       └── DesvincularModal.tsx     # Confirmação de desvínculo, reaproveitado por FuncionarioDetalhe e AparelhoDetalhe — chama a API de verdade, renderiza via portal (`createPortal`) pra não ficar preso dentro de uma seção com animação de transform
├── pages/
│   ├── Auth/                # Login, Activate, ForgotPassword
│   ├── Dashboard/
│   ├── RH/                  # Lista + Campos + Candidato (detalhe)
│   ├── Contatos/
│   ├── Tickets/              # Lista + TicketDetail
│   ├── Inventario/          # Visão geral + Funcionarios + FuncionarioDetalhe + Aparelhos + AparelhoDetalhe + Alocacao + Movimentacoes
│   ├── Configuracoes/
│   ├── Logs/
│   ├── Ajuda/
│   └── Formulario/          # Formulário público de admissão (sem login)
├── hooks/                    # Um pacote por módulo (RHHooks, TicketHooks, ContatosHooks, DashboardHooks, LogsHooks, FuncionarioHooks, AparelhoHooks, AlocacaoHooks, HistoricoHooks) — FuncionarioHooks/AparelhoHooks incluem também `useFuncionarioDetalhe`/`useAparelhoDetalhe`, usados pelas páginas de detalhe
├── services/
│   ├── api.ts                # apiFetch, authHeaders, decodeToken — base de toda chamada HTTP (apiFetch aceita timeout customizado por chamada, default 15s)
│   ├── RhServices/
│   ├── TicketServices/
│   ├── ContatosServices/
│   ├── LogsServices/
│   ├── FuncionarioService/
│   ├── AparelhoService/
│   └── HistoricoAparelhoService/
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
| `/inventario`, `/inventario/funcionarios`, `/inventario/funcionarios/:id`, `/inventario/aparelhos`, `/inventario/aparelhos/:id`, `/inventario/alocacao`, `/inventario/movimentacoes` | Inventario | Autenticado¹ |
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
Lista de candidatos com busca e filtro por status (mais recente primeiro — `GET /candidates` ordena por `id` decrescente), cadastro/edição/exclusão, reenvio de formulário, e uma página de detalhe (`/rh/:id`) com:
- Informações básicas, campos customizados e downloads de documentos — os botões de download (relatório `.docx` e ZIP de documentos, `CandidatoDownloads.tsx`) mostram um ícone girando e o texto "Gerando…" enquanto a chamada está em andamento (o ZIP pode demorar dependendo da quantidade de documento do candidato), e ficam desabilitados até a resposta voltar; erro real aparece via `Toast`, não só no console
- Mudança de status, com checklist automático pós-aprovação (cadastro na Dysrup, envio de boas-vindas e dados da rota via WhatsApp, abertura de ticket de TI)
- Gerenciamento de campos de admissão (`/rh/campos`, restrito a e-mails de desenvolvedor)

### Tickets
Filtros: **Para mim**, **Meu setor**, **Abertos por mim**, e **Todos** (só ADMIN). Cards de KPI por status no topo, lista paginada, upload de anexos.

### Contatos
Agenda sincronizada com Google Contacts. Ao cadastrar um contato novo, oferece abrir uma conversa no WhatsApp (`wa.me`) diretamente — não depende de API própria, é só um link.

### Inventário
Módulo com submenu de navegação (`InventarioSubnav`) entre 5 seções: Visão geral, Funcionários, Aparelhos, Alocação e Movimentações — todas já existem no `App.tsx`, todas com conteúdo real (Movimentações tem lista+paginação reais, mas o filtro dela ainda é só visual, ver abaixo). Funcionários e Aparelhos também ganharam uma página de detalhe cada (`/inventario/funcionarios/:id` e `/inventario/aparelhos/:id`), acessíveis clicando na linha correspondente nas respectivas listas — nenhuma delas aparece no `InventarioSubnav` (são páginas "filhas" de uma seção, não uma 6ª seção do menu, mesmo padrão de `/rh/:id` que também fica fora do menu do RH).

- **Visão geral**: os KPIs "Funcionários ativos" e "Afastados" já vêm de dados reais (`GET /employee/count`, hook `useFuncionario`). Os KPIs de aparelho (cadastrados, sem aparelho, disponíveis p/ alocação etc.) e os banners de alerta continuam mockados — agora que a tela de Aparelhos existe, dá pra alimentá-los com dado real.
- **Funcionários**: lista real e paginada, ligada em `GET /employee` (hook `useFuncionario`). Inclui:
  - **Busca** por nome ou CPF (`GET /employee/search`), com debounce de 500ms — ao buscar, a página sempre volta pra 1 (`handleSetSearch`/`handleSetStatusFilter` no hook resetam a paginação a cada mudança de filtro).
  - **Filtro por status**: "Todos", "Afastados", "Com aparelho" e "Sem aparelho" funcionam de verdade (`hasDevice=true/false` na API); "Ajuda de custo" continua desabilitado (com tooltip) — não existe esse conceito na entidade `Device`/`Employee` ainda.
  - **Coluna de status do aparelho**: não é só "com"/"sem". Um `SERVICE_PROVIDER` (prestador de serviço) sem aparelho mostra badge neutro "Prestador de serviço" em vez de vermelho, porque não ter aparelho é esperado nesse perfil. Funcionário `DEMITIDO`, `AFASTADO`, de `FERIAS` ou `PENDENTE_REVISAO` sem aparelho também vira badge neutro com o próprio status (mesmos status que `EmployeeStatus.isActive()` já trata como "não ativo" no backend) — só quem está de fato ativo e não é freelancer aparece com o "Sem aparelho" vermelho (pendência de verdade). Ver `statusAparelho()` em `ListaFuncionarios.tsx`.
  - **Colunas TAG e ID Pulsus**: quando o funcionário tem aparelho vinculado, mostram `tagDevice` e `pulsusId` do primeiro aparelho da lista `f.devices`.
  - **Importar planilha** (`ImportarModal`) — upload de `.xls` exportado do Alter Data (`POST /employee/importSave`), upsert por CPF, resumo de novos/atualizados/pendentes de revisão ao final.
  - **Novo funcionário** (`NovoFuncionarioModal`) — cadastro manual de sócio ou prestador de serviço que não vem pela planilha (`POST /employee`). Só nome e CPF são obrigatórios; o formulário pede o perfil (Sócio ou Prestador de serviço); não pede empresa — todo cadastro manual é vinculado automaticamente no backend à mesma empresa usada pra marcar freelancer na importação.
  - **Exportar** (`useExportarFuncionarios`) — baixa um `.xlsx` com a base inteira de funcionários (`GET /employee/export`).
  - **Detalhe do funcionário** (`/inventario/funcionarios/:id`, hook `useFuncionarioDetalhe`) — hero (nome, cargo, status, perfil), seção de informações (CPF, empresa, departamento, cidade/UF, admissão), aparelhos vinculados (specs completos: ID Pulsus, TAG, IMEIs, com botões "Ver na Pulsus" e "Detalhes do aparelho") e histórico de movimentações em formato de timeline, com paginação (`GET /deviceHistory/employee/:id`). Cada aparelho vinculado tem um botão **"Desvincular"** que abre o `DesvincularModal` — confirma, chama `PATCH /devices/:id/desvincular` (ver `backend/README.md`), e ao concluir o hook `refetch()` recarrega o funcionário e o histórico de uma vez (a página inteira usa uma única chamada de `useFuncionarioDetalhe`, sem duplicar fetch).
- **Aparelhos**: lista real e paginada, ligada em `GET /devices` (hook `useAparelhos`). Mostra modelo/fabricante, serial, grupo, funcionário vinculado (se houver), TAG, situação (`Em uso`/`Disponível`/`Em manutenção`/`Sem usuário identificado`) e ID Pulsus — a linha inteira é clicável, leva pra `/inventario/aparelhos/:id` (sem coluna de "Detalhes" separada). **Filtro por situação** (pills: Todos/Em uso/Disponível/Em manutenção/Sem usuário) usa `situacao=` na API. **Busca** por serial, TAG ou ID Pulsus (`GET /devices/search`), com debounce de 500ms. Botão **"Sincronizar com Pulsus"** dispara `POST /devices/sync` direto da tela — a chamada usa um timeout de 60s em vez do padrão de 15s do `apiFetch`, porque o sync é síncrono/bloqueante de propósito e pode passar de 30s (decisão consciente: evita condição de corrida com edição concorrente e garante dado sempre atualizado na hora, ver [backend/README.md](../backend/README.md#aparelhos-inventário--devices)).
  - **Detalhe do aparelho** (`/inventario/aparelhos/:id`, hook `useAparelhoDetalhe`) — hero (modelo, fabricante/grupo, situação, serial, botão "Ver na Pulsus"), specs (ID Pulsus, TAG, serial, grupo, IMEIs), funcionário vinculado (card com nome + link pro perfil dele, ou estado vazio com CTA pra Alocação) e histórico de movimentações em timeline, com paginação (`GET /deviceHistory/device/:id`). Mesma ação do funcionário: o botão **"Desvincular"** no card do funcionário vinculado chama a API de verdade e recarrega aparelho + histórico via `refetch()`.
- **Alocação**: fluxo pra vincular manualmente um funcionário sem aparelho a um aparelho disponível, pra quando o matching automático do sync não resolve. Reaproveita os hooks que já existem em vez de duplicar fetch: `useFuncionario('SEM_APARELHO')` e `useAparelhos('DISPONIVEL')` (ambos os hooks aceitam um filtro inicial opcional, default `"ALL"`, sem quebrar quem já os chama sem argumento). Um hook novo, `useAlocacao`, cuida só do que é específico dessa tela — seleção de funcionário/aparelho e a ação de vincular — sem duplicar a busca de dados.
  - **Dois painéis lado a lado** (funcionários à esquerda, aparelhos à direita), cada um com busca, paginação própria e seleção por clique (rádio visual).
  - **Furo conhecido de backend:** `/employee/search` e `/devices/search` não aceitam `hasDevice`/`situacao` junto com o termo de busca — buscando, o resultado pode trazer gente/aparelho fora do filtro esperado. Contornado no front: `PainelFuncionarios`/`PainelAparelhos` filtram o resultado (`f.devices.length === 0`, `d.situacao === 'DISPONIVEL'`) depois que a API responde, antes de renderizar. Efeito colateral aceito: durante uma busca ativa, os contadores de paginação/"pendentes" podem ficar levemente imprecisos (calculados sobre o resultado bruto da busca, antes do filtro extra do front) — por isso os badges "X pendentes"/"X disponíveis" no topo da tela **congelam** no último valor correto enquanto há texto na busca (`totalSemAparelho`/`totalDisponiveis` só atualizam quando o campo de busca está vazio), em vez de mostrar esse número impreciso.
  - **Vincular** (`PATCH /devices/:id/vincular`, `vincularAparelho` em `aparelhoApi.ts`) atualiza o vínculo no Accessus e empurra nome/TAG pra Pulsus na mesma chamada (ver `backend/README.md`). Ao concluir, abre o `VinculoSucessoModal` com 3 próximos passos: **Baixar contrato de comodato** (`baixarContratoComodato`, chama `GET /devices/:id/comodato-contract`, com estado de carregando/erro próprio), **Documentos no Youk** (só abre `https://manager.youk.com.br/envioDocs` numa aba nova — não tem integração automática com a API do Youk ainda) e **Grupo no Pulsus** (o lembrete que já existia, `https://app.pulsus.mobi/devices/{pulsusId}` — porque a API da Pulsus não permite trocar o **grupo** do aparelho pela API, só o backend Accessus atualiza nome/TAG).
- **Movimentações**: lista e paginação reais, ligadas em `GET /deviceHistory` (hook `useHistorico`, sem filtro nenhum passado pra API ainda). Mostra data/hora, ação (badge "Alocação"/"Devolução" com ícone), funcionário (avatar + nome + departamento) e aparelho (modelo + TAG) de cada movimentação. O **filtro** (busca + período + pills Todas/Alocações/Devoluções) continua **só layout** — inputs sem `value`/`onChange`, sem estado nenhum — porque o backend ainda não aceita filtro por texto/data/tipo em `/deviceHistory` (ver `backend/README.md`).

Acesso restrito a `DEPT_TI` no backend para `/employee/**` (ver nota¹ acima) — o frontend ainda não esconde o menu de quem não é TI, só as chamadas à API falham com 403. `/devices/**` e `/deviceHistory/**` ainda nem têm essa restrição no backend (qualquer autenticado acessa hoje).

Tanto `ListaFuncionarios.tsx` quanto `ListaAparelhos.tsx` não têm mais coluna de "Detalhes"/"Histórico" — a linha inteira da tabela é clicável (`onClick` no `<tr>` + `useNavigate`, `cursor: pointer` via CSS) e leva pra página de detalhe correspondente.

### Logs
Auditoria com filtro por usuário e intervalo de datas, acesso restrito a ADMIN.
