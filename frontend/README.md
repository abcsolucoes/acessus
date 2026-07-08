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
│       └── InventarioFuncionarios/  # Filtro, lista e paginação da tela de Funcionários
├── pages/
│   ├── Auth/                # Login, Activate, ForgotPassword
│   ├── Dashboard/
│   ├── RH/                  # Lista + Campos + Candidato (detalhe)
│   ├── Contatos/
│   ├── Tickets/              # Lista + TicketDetail
│   ├── Inventario/          # Visão geral + Funcionarios
│   ├── Configuracoes/
│   ├── Logs/
│   ├── Ajuda/
│   └── Formulario/          # Formulário público de admissão (sem login)
├── hooks/                    # Um pacote por módulo (RHHooks, TicketHooks, ContatosHooks, DashboardHooks, LogsHooks)
├── services/
│   ├── api.ts                # apiFetch, authHeaders, decodeToken — base de toda chamada HTTP
│   ├── RhServices/
│   ├── TicketServices/
│   ├── ContatosServices/
│   └── LogsServices/
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
| `/inventario`, `/inventario/funcionarios` | Inventario | Autenticado¹ |
| `/contatos` | Contatos | Autenticado |
| `/ajuda` | Ajuda | Autenticado |
| `/tickets`, `/tickets/ticketDetail/:id` | Tickets | Autenticado |
| `/rh`, `/rh/:id`, `/rh/campos` | RH | ADMIN, RH |
| `/configuracoes` | Configuracoes | ADMIN |
| `/logs` | Logs | ADMIN |

¹ O backend restringe `/employees/**` a usuários do departamento TI, mas o menu/rota no frontend ainda não reflete essa restrição — qualquer usuário autenticado acessa a tela hoje.

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
Módulo novo, com submenu de navegação (`InventarioSubnav`) entre 5 seções: Visão geral, Funcionários, Aparelhos, Alocação e Movimentações. Hoje só **Visão geral** e **Funcionários** têm conteúdo — as outras três rotas ainda não existem no `App.tsx`.

- **Visão geral**: KPIs (funcionários ativos, aparelhos cadastrados, sem aparelho, disponíveis para alocação, afastados, etc.) e banners de alerta (ex: aparelhos a recolher de desligados).
- **Funcionários**: filtro, tabela (funcionário, departamento, cidade/UF, status do aparelho, tag do aparelho) e paginação.

**Importante:** essas telas são markup estático — os números e a lista de funcionários são mockados, ainda não conectados ao endpoint `POST /employees/import` nem a nenhuma rota `GET` real (o backend hoje só expõe a importação, não uma listagem). Conectar isso a dados reais é o próximo passo planejado.

### Logs
Auditoria com filtro por usuário e intervalo de datas, acesso restrito a ADMIN.
