# Accessus

Sistema de gestão interna da **ABC Soluções em Vendas**. Centraliza RH, tickets internos, contatos corporativos e auditoria em uma plataforma web com controle de acesso por perfil de usuário.

## Estrutura do repositório

```
acessus/
├── backend/    # API REST — Java 25 + Spring Boot 4
└── frontend/   # Interface web — React 18 + TypeScript + Vite
```

## Módulos

| Módulo | Descrição | Acesso |
|---|---|---|
| Autenticação | Login JWT, ativação de conta, recuperação de senha | Todos |
| Dashboard | Navegação entre módulos filtrada por perfil | Todos |
| RH | Gestão de candidatos, formulário público de admissão, upload de documentos, relatório `.docx` | ADMIN, RH |
| Contatos | Agenda corporativa integrada com Google Contacts — CRUD com nomenclatura padronizada | ADMIN, RH, OPERACIONAL, DP |
| Tickets | Chamados internos com status, anexos e notificações por e-mail | Todos |
| Configurações | Gestão de usuários do sistema | ADMIN |
| Logs | Auditoria paginada e filtrável de todas as ações | ADMIN |

## Como rodar localmente

### Pré-requisitos

- Java 25+
- Node.js 18+
- npm

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Sobe em `http://localhost:8080` com banco H2 em memória (perfil `test`).
Swagger disponível em `http://localhost:8080/swagger-ui.html`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173` apontando para o backend em `localhost:8080`.

## Deploy

O deploy é executado pelo script `deploy_accessus.py` localizado na máquina do desenvolvedor. Ele faz o build dos dois projetos e sobe automaticamente para o servidor de produção via SSH/SFTP.

```bash
python deploy_accessus.py
```

## Variáveis de ambiente (produção)

As variáveis ficam em `/opt/acessus/.env` no servidor. Nenhum segredo deve ser commitado no repositório.

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave de assinatura dos tokens JWT |
| `DB_USER` / `DB_PASSWORD` | Credenciais do PostgreSQL |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Credenciais SMTP Office365 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` | OAuth2 Google Contacts |
| `BASE_URL` | URL pública do sistema |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas no CORS |

## Documentação detalhada

- [Backend — endpoints, segurança, integrações](backend/README.md)
- [Frontend — estrutura, páginas, serviços](frontend/README.md)
