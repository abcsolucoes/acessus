# Accessus

Sistema de gestão interna da **ABC Soluções em Vendas**. Centraliza RH, tickets internos, agenda de contatos e auditoria em uma única plataforma web com controle de acesso por perfil.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Módulos](#módulos)
- [Pré-requisitos](#pré-requisitos)
- [Configuração local](#configuração-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Deploy](#deploy)
- [Endpoints principais](#endpoints-principais)
- [Roles e permissões](#roles-e-permissões)
- [Integrações externas](#integrações-externas)

---

## Visão geral

O Accessus é composto por dois projetos separados:

| Projeto | Tecnologia | Caminho local |
|---|---|---|
| Backend | Java 25 + Spring Boot 4 | `Desktop/Accessus` |
| Frontend | React 18 + TypeScript + Vite | `Desktop/acessus` |

Em produção, o backend roda como serviço systemd e o frontend é servido pelo Nginx, ambos no servidor `192.168.10.222`.

---

## Stack

### Backend
- **Java 25** com **Spring Boot 4.0.5**
- **Spring Security** — autenticação JWT stateless (HS256)
- **Spring Data JPA + Hibernate 7** — ORM
- **PostgreSQL 18** (produção) / **H2** (desenvolvimento local)
- **Bucket4j** — rate limiting por IP
- **JavaMailSender** — e-mails HTML transacionais via SMTP Office365
- **Google People API v1** — integração com Google Contacts
- **Apache POI (XWPF)** — geração de relatórios `.docx`
- **Springdoc OpenAPI** — Swagger UI em `/swagger-ui.html`
- **Maven Wrapper** — build sem Maven instalado globalmente

### Frontend
- **React 18** + **TypeScript**
- **Vite** — bundler e dev server
- **React Router v6** — roteamento SPA
- **CSS Modules** com design tokens — sem biblioteca de UI externa

---

## Módulos

| Módulo | Rota | Acesso |
|---|---|---|
| Dashboard | `/` | Todos |
| Autenticação | `/login`, `/activate`, `/forgot-password` | Público |
| RH / Candidatos | `/rh` | ADMIN, RH |
| Formulário público | `/formulario/:token` | Público (token) |
| Contatos | `/contatos` | ADMIN, RH, OPERACIONAL, DP |
| Tickets | `/tickets` | Todos |
| Configurações | `/configuracoes` | ADMIN |
| Logs | `/logs` | ADMIN |

---

## Pré-requisitos

**Backend:**
- Java 25+
- Maven (ou usar o wrapper `mvnw.cmd` incluso no projeto)

**Frontend:**
- Node.js 18+
- npm

---

## Configuração local

### Backend

```bash
# Na raiz do projeto Accessus
./mvnw spring-boot:run
```

O perfil `test` é ativado por padrão — usa banco H2 em memória, sem e-mail real, sem Google API. A API sobe em `http://localhost:8080`.

> **Swagger UI:** `http://localhost:8080/swagger-ui.html`

### Frontend

```bash
# Na raiz do projeto acessus
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` apontando para o backend em `localhost:8080`.

---

## Variáveis de ambiente

Em produção, as variáveis ficam em `/opt/acessus/.env` carregado pelo systemd.

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT |
| `DB_USER` | Usuário do PostgreSQL |
| `DB_PASSWORD` | Senha do PostgreSQL |
| `MAIL_USERNAME` | E-mail remetente (Office365) |
| `MAIL_PASSWORD` | Senha do e-mail |
| `MAIL_FROM` | Endereço exibido como remetente |
| `GOOGLE_CLIENT_ID` | Client ID do OAuth2 do Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Client Secret do OAuth2 |
| `GOOGLE_REFRESH_TOKEN` | Refresh token para a Google People API |
| `BASE_URL` | URL pública do frontend (ex: `http://192.168.10.222`) |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas no CORS |

> **Refresh token Google:** expira após 6 meses sem uso. Para renovar, rodar `gerar_token.py` na área de trabalho, autorizar no browser com a conta dos contatos e atualizar `GOOGLE_REFRESH_TOKEN` no `.env` do servidor, depois `sudo systemctl restart acessus`.

---

## Deploy

O deploy é feito pelo script Python `deploy_accessus.py` na área de trabalho. Ele executa automaticamente:

1. Build do backend (`mvnw.cmd clean package -DskipTests`)
2. Build do frontend (`npm run build`)
3. Upload do `.jar` para `/opt/acessus/` via SFTP
4. Upload do `dist/` para o diretório do Nginx via SFTP
5. Restart do serviço via SSH (`sudo systemctl restart acessus`)

```bash
python deploy_accessus.py
```

**Logs do serviço em produção:**
```bash
sudo journalctl -u acessus -f
```

**Restart manual:**
```bash
sudo systemctl restart acessus
```

---

## Endpoints principais

### Usuários — `/users`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/users/login` | Público | Login, retorna JWT |
| POST | `/users/register` | ADMIN | Cria usuário e envia convite |
| POST | `/users/activate` | Público | Ativa conta com token do e-mail |
| POST | `/users/forgot-password` | Público | Envia código de reset por e-mail |
| POST | `/users/reset-password` | Público | Redefine senha com código |
| GET | `/users/me` | Autenticado | Dados do usuário logado |
| GET | `/users` | ADMIN | Lista todos os usuários |
| PUT | `/users/:id` | ADMIN | Edita nome, e-mail, departamento |
| PUT | `/users/:id/role` | ADMIN | Altera role do usuário |
| PATCH | `/users/:id/toggle` | ADMIN | Ativa/desativa conta |
| DELETE | `/users/:id` | ADMIN | Remove usuário |
| POST | `/users/:id/resend-invite` | ADMIN | Reenvia e-mail de ativação |

### Candidatos — `/candidates`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/candidates` | ADMIN, RH | Lista com paginação |
| POST | `/candidates` | ADMIN, RH | Cadastra candidato |
| PUT | `/candidates/:id` | ADMIN, RH | Edita candidato |
| DELETE | `/candidates/:id` | ADMIN, RH | Remove candidato |
| PATCH | `/candidates/changeStatus/:id` | Público | Muda status (formulário) |
| GET | `/candidates/public/:token` | Público | Valida acesso ao formulário |
| POST | `/candidates/:id/upload` | Público | Upload de documento |
| GET | `/candidates/:id/report` | ADMIN, RH | Gera relatório `.docx` |
| GET | `/candidates/:id/files` | ADMIN, RH | Download ZIP dos documentos |

### Tickets — `/tickets`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/tickets?filter=mine\|sector\|created\|all` | Autenticado | Lista com filtro e paginação |
| POST | `/tickets` | Autenticado | Abre novo ticket |
| GET | `/tickets/:id` | Autenticado | Detalhe do ticket |
| PATCH | `/tickets/:id/status` | Autenticado | Altera status |
| POST | `/tickets/:id/attachments` | Autenticado | Adiciona anexo |

### Contatos — `/contacts`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/contacts` | Autenticado | Lista todos os contatos do Google |
| POST | `/contacts` | Autenticado | Cria contato |
| PUT | `/contacts/people/:id` | Autenticado | Edita contato |
| DELETE | `/contacts/people/:id` | Autenticado | Remove contato |

### Logs — `/logs`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/logs?userName=&startDate=&endDate=` | ADMIN | Lista com filtros e paginação |

---

## Roles e permissões

| Role | Módulos disponíveis |
|---|---|
| `ADMIN` | Tudo |
| `RH` | RH, Contatos, Tickets |
| `OPERACIONAL` | Contatos, Tickets |
| `DP` | Contatos, Tickets |

**Regras de negócio de acesso a tickets:**
- Só vê/altera tickets em que é o responsável, do seu departamento, ou que criou
- ADMIN vê todos sem restrição
- ADMIN pode criar ticket em nome de outro usuário

---

## Integrações externas

### Google People API
Usada para o módulo de Contatos. A autenticação é OAuth2 com refresh token de longa duração.

- **Google Cloud Project:** My First Project (`warm-composite-497015-g5`)
- **Credencial:** Python Contacts Client (tipo: Desktop App)
- **Escopo:** `https://www.googleapis.com/auth/contacts`

### SMTP Office365
Usado para todos os e-mails transacionais do sistema:
- Ativação de conta
- Recuperação de senha
- Envio de formulário de admissão ao candidato
- Notificações de tickets (criação e mudança de status)

---

## Segurança

- JWT com expiração de 24h, assinado com HMAC-SHA256
- Senhas armazenadas com BCrypt
- Rate limiting por IP: 5 tentativas/min no login, 3/min no forgot-password
- Código de reset de senha: expira em 10 minutos, bloqueio após 4 tentativas erradas
- Upload de arquivos: validação de extensão + MIME type, bloqueio de path traversal
- CORS configurado via variável de ambiente
- Credenciais sensíveis exclusivamente em variáveis de ambiente
