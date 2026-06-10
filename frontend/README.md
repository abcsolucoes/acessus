# Frontend — Accessus

Interface web do sistema Accessus. SPA construída com React 18 + TypeScript, sem dependência de biblioteca de UI externa.

## Stack

- **React 18** + **TypeScript**
- **Vite** — bundler e dev server
- **React Router v6** — roteamento client-side
- **CSS Modules** com design tokens — temas claro/escuro via variáveis CSS

## Estrutura

```
src/
├── components/       # Header, Toast, ProtectedRoute, ThemeToggle
├── pages/
│   ├── Auth/         # Login, Activate, ForgotPassword
│   ├── Dashboard/
│   ├── RH/           # Candidatos, Campos, modais
│   ├── Contatos/     # Lista + ContactModal
│   ├── Tickets/      # Lista + TicketDetail
│   ├── Configuracoes/
│   ├── Logs/
│   └── Formulario/   # Formulário público de admissão (sem login)
├── services/
│   └── api.ts        # apiFetch, authHeaders, decodeToken
├── styles/
│   └── global.css    # Design tokens e reset global
├── types/
│   └── index.ts      # Interfaces TypeScript (User, Ticket, Candidate…)
└── utils/
    └── format.ts     # Formatação de datas
```

## Rodando localmente

```bash
npm install
npm run dev       # dev server em http://localhost:5173
npm run build     # build de produção em dist/
```

## Autenticação

O JWT retornado pelo login é armazenado no `localStorage`. A função `decodeToken()` decodifica o payload diretamente no cliente (sem chamada à API) para leitura de `name`, `role` e `sub` (e-mail). Toda requisição autenticada inclui o header `Authorization: Bearer <token>` via `authHeaders()`.

## Perfis de acesso

As páginas protegidas usam o componente `ProtectedRoute` com verificação de role. O Dashboard filtra os cards de módulos pela role do usuário logado.

| Role | Módulos visíveis |
|---|---|
| `ADMIN` | Todos |
| `RH` | RH, Contatos, Tickets |
| `OPERACIONAL` | Contatos, Tickets |
| `DP` | Contatos, Tickets |
