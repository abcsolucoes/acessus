# Accessus

Sistema de gestão interna da **ABC Soluções em Vendas**. Centraliza RH (recrutamento e admissão), tickets internos, agenda de contatos, inventário de aparelhos corporativos e auditoria em uma única plataforma web, com controle de acesso por perfil de usuário.

## Estrutura do repositório

```
acessus/
├── backend/    # API REST — Java 25 + Spring Boot 4
└── frontend/   # Interface web — React 19 + TypeScript + Vite
```

## Módulos

| Módulo | Descrição | Acesso |
|---|---|---|
| Autenticação | Login JWT, ativação de conta, recuperação de senha | Todos |
| Dashboard | Navegação entre módulos filtrada por perfil | Todos |
| RH | Candidatos (cadastro, edição, exclusão, reenvio de formulário, ordenação por nome/data de admissão), campos dinâmicos de admissão (texto, data, documento ou seleção fixa), formulário público (com notificação por e-mail ao RH quando o candidato finaliza o envio), checklist pós-aprovação (Dysrup, WhatsApp, ticket de TI), relatório `.docx`, documentos enviados listados individualmente (download/exclusão avulsa, sem precisar do ZIP completo) | ADMIN, RH |
| Contatos | Agenda corporativa integrada com Google Contacts, com atalho para iniciar conversa no WhatsApp | ADMIN, RH, OPERACIONAL, DP |
| Tickets | Chamados internos com filtros (meus, meu setor, criados por mim, todos), anexos e notificação por e-mail | Todos |
| Inventário | Funcionários (importação de planilha do RH), aparelhos corporativos sincronizados do MDM Pulsus e linhas telefônicas (chip físico ou eSIM), com vínculo/desvínculo (manual, tela de Alocação, ou automático por nome) aparelho ↔ funcionário, vínculo/desvínculo de linha ↔ funcionário, contrato de comodato em PDF, e histórico de movimentações | TI |
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

Um `.env` na raiz do repo (copiado de `.env.example`, nunca commitado) é lido automaticamente na subida — não precisa exportar variável nenhuma na sessão do terminal antes de rodar.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173` apontando para o backend em `localhost:8080`.

## Deploy

O deploy é executado pelo script `deploy-acessus.ps1` (área de trabalho do desenvolvedor). Diferente de uma versão antiga que buildava local e subia os artefatos por SFTP, esse script funciona via Git:

1. `git add . / commit / push` do repositório local (`C:\Projetos\acessus`) — pergunta interativamente uma mensagem de commit e se a mudança foi no backend, frontend ou os dois.
2. Conecta na VPS via SSH (chave em `~/.ssh/acessus_deploy`, sem senha) e roda `git pull` em `/opt/acessus`.
3. Builda o que foi selecionado direto na VPS (`mvnw clean package -DskipTests` e/ou `npm run build`) e reinicia o serviço (`systemctl restart acessus`) e/ou recarrega o Nginx (`systemctl reload nginx`).

```powershell
cd C:\Projetos\acessus
.\deploy-acessus.ps1
```

Como o `npm run build` roda `tsc -b` antes do Vite, um erro de tipagem que passa batido no `npm run dev` local só aparece nesse momento — já aconteceu (ver histórico do repo) um erro de tipo do TypeScript que só a VPS pegou por estar numa versão mais estrita. Vale rodar `npx tsc -b` localmente antes de confiar num deploy silencioso.

## Variáveis de ambiente (produção)

As variáveis ficam em `/opt/acessus/.env` no servidor. Nenhum segredo deve ser commitado no repositório.

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave de assinatura dos tokens JWT |
| `DB_USER` / `DB_PASSWORD` | Credenciais do PostgreSQL |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | Credenciais SMTP Office365 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` | OAuth2 Google Contacts |
| `DYSRUP_TOKEN` / `DYSRUP_EMAIL` / `DYSRUP_PASSWORD` / `DYSRUP_EMPLOYER_CODE` | Integração com o sistema de roteirização Dysrup |
| `ZAPI_INSTANCE_ID` / `ZAPI_TOKEN` / `ZAPI_CLIENT_TOKEN` | Envio de mensagens no WhatsApp (Z-API) — as três são obrigatórias em produção |
| `PULSUS_TOKEN` | Sincronização de aparelhos corporativos com o MDM Pulsus |
| `DEV_EMAIL` | E-mails com permissão para gerenciar campos de admissão (escopo `ADMISSION`) |
| `BASE_URL` | URL pública do sistema |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas no CORS |
| `SOFFICE_PATH` | Caminho do executável do LibreOffice, usado para converter o contrato de comodato (`.docx`) em PDF. Opcional — o padrão `soffice` já funciona em produção (Linux) depois do `apt install libreoffice`; só é preciso setar no Windows local, apontando pro `soffice.exe` |

## Documentação detalhada

- [Backend — endpoints, segurança, integrações](backend/README.md)
- [Frontend — estrutura, páginas, serviços](frontend/README.md)
