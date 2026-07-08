# Accessus — Backend

API REST do sistema Accessus. Java 25 + Spring Boot 4, com JWT stateless, PostgreSQL em produção e integrações com Google Contacts, Dysrup (roteirização) e Z-API (WhatsApp).

---

## Sumário

- [Stack](#stack)
- [Módulos e rotas do frontend](#módulos-e-rotas-do-frontend)
- [Pré-requisitos](#pré-requisitos)
- [Configuração local](#configuração-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Deploy](#deploy)
- [Endpoints](#endpoints)
- [Roles e permissões](#roles-e-permissões)
- [Integrações externas](#integrações-externas)
- [Segurança](#segurança)

---

## Stack

- **Java 25** com **Spring Boot 4.0.5**
- **Spring Security** — autenticação JWT stateless (HS256)
- **Spring Data JPA + Hibernate 7** — ORM (`ddl-auto: update`, sem Flyway/Liquibase)
- **PostgreSQL 18** (produção) / **H2** (desenvolvimento local, perfil `test`)
- **Bucket4j** — rate limiting por IP
- **JavaMailSender** — e-mails HTML transacionais via SMTP Office365
- **Google People API v1** — integração com Google Contacts
- **Apache POI** — geração de relatórios `.docx` (XWPF) e leitura/escrita de planilhas Excel (SS/XSSF)
- **jxl (JExcelApi)** — leitura de arquivos `.xls` legados que o parser padrão do POI rejeita (comum em exportações de sistemas de terceiros)
- **Springdoc OpenAPI** — Swagger UI em `/swagger-ui.html`
- **Maven Wrapper** — build sem Maven instalado globalmente

---

## Módulos e rotas do frontend

| Módulo | Rota | Acesso |
|---|---|---|
| Dashboard | `/dashboard` | Todos |
| Autenticação | `/login`, `/activate`, `/forgot-password` | Público |
| RH / Candidatos | `/rh`, `/rh/:id`, `/rh/campos` | ADMIN, RH |
| Formulário público de admissão | `/formulario/:token` | Público (token) |
| Contatos | `/contatos` | Todos (autenticado) |
| Tickets | `/tickets`, `/tickets/ticketDetail/:id` | Todos (autenticado) |
| Inventário | `/inventario`, `/inventario/funcionarios` | Todos no front¹, restrito a `DEPT_TI` no backend |
| Configurações | `/configuracoes` | ADMIN |
| Logs | `/logs` | ADMIN |

¹ A tela ainda não tem restrição de menu no frontend — qualquer usuário autenticado enxerga o módulo, mas as chamadas de API (`/employees/**`) só funcionam para usuários do departamento TI. Alinhar isso é um ajuste pendente no frontend.

---

## Pré-requisitos

- Java 25+
- Maven (ou usar o wrapper `mvnw`/`mvnw.cmd` incluso no projeto)

---

## Configuração local

```bash
./mvnw spring-boot:run
```

O perfil `test` é ativado por padrão — usa banco H2 em memória, sem e-mail real, sem Google/Dysrup/Z-API reais. A API sobe em `http://localhost:8080`.

> **Swagger UI:** `http://localhost:8080/swagger-ui.html`
> **H2 Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:testdb`)

---

## Variáveis de ambiente

Em produção, as variáveis ficam em `/opt/acessus/.env`, carregado pelo systemd.

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT |
| `DB_USER` / `DB_PASSWORD` | Credenciais do PostgreSQL |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | Credenciais e remetente do SMTP Office365 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REFRESH_TOKEN` | OAuth2 para a Google People API |
| `DYSRUP_TOKEN` / `DYSRUP_EMAIL` / `DYSRUP_PASSWORD` / `DYSRUP_EMPLOYER_CODE` | Autenticação com o sistema Dysrup (roteirização) |
| `ZAPI_INSTANCE_ID` / `ZAPI_TOKEN` / `ZAPI_CLIENT_TOKEN` | Envio de mensagens WhatsApp via Z-API |
| `DEV_EMAIL` | Lista de e-mails (separados por vírgula) com permissão de gerenciar campos de admissão (`FieldScope.ADMISSION`) |
| `BASE_URL` | URL pública do frontend |
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

**Logs do serviço em produção:** `sudo journalctl -u acessus -f`
**Restart manual:** `sudo systemctl restart acessus`

---

## Endpoints

### Usuários — `/users`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/users/login` | Público | Login, retorna JWT |
| POST | `/users/activate` | Público | Ativa conta com token do e-mail |
| POST | `/users/forgot-password` | Público | Envia código de reset por e-mail |
| POST | `/users/reset-password` | Público | Redefine senha com código |
| GET | `/users/me` | Autenticado | Dados do usuário logado |
| GET | `/users/assignable` | Autenticado | Lista usuários disponíveis para atribuição (tickets) |
| GET | `/users` | ADMIN | Lista todos os usuários |
| POST | `/users/register` | ADMIN | Cria usuário e envia convite |
| POST | `/users/:id/resend-invite` | ADMIN | Reenvia e-mail de ativação |
| PUT | `/users/:id` | ADMIN | Edita nome/e-mail |
| PUT | `/users/:id/role` | ADMIN | Altera role/departamento |
| PATCH | `/users/:id/toggle` | ADMIN | Ativa/desativa conta |
| DELETE | `/users/:id` | ADMIN | Remove usuário |

### Candidatos — `/candidates`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/candidates` | ADMIN, RH | Lista com paginação, filtro por `status` |
| GET | `/candidates/search` | ADMIN, RH | Busca por termo, paginada |
| GET | `/candidates/:id` | ADMIN, RH | Detalhe do candidato |
| GET | `/candidates/:id/report` | ADMIN, RH | Gera relatório `.docx` |
| GET | `/candidates/:id/route-photo` | ADMIN, RH | Download da foto da rota |
| GET | `/candidates/:id/files/zip` | ADMIN, RH | Download ZIP com todos os documentos |
| GET | `/candidates/formCandidate/:id` | ADMIN, RH | Link do formulário de admissão |
| GET | `/candidates/validate` | Público | Valida token de acesso ao formulário |
| POST | `/candidates/register` | Público | Cadastro inicial (multipart) |
| POST | `/candidates/changeStatus/:id` | Público | Muda status (usado pelo fluxo do formulário) |
| POST | `/candidates/:id/upload` | Público (token) | Upload de documento vinculado a um campo |
| POST | `/candidates/:id/resend-form` | ADMIN, RH | Reenvia o link do formulário por e-mail |
| POST | `/candidates/:id/send-welcome` | ADMIN, RH | Envia instruções de acesso à Dysrup via WhatsApp |
| POST | `/candidates/:id/send-route` | ADMIN, RH | Notifica a equipe sobre a rota do candidato (Z-API) |
| POST | `/candidates/:id/create-ti-ticket` | ADMIN, RH | Abre ticket de TI automaticamente (provisionamento de aparelho) |
| PUT | `/candidates/:id` | ADMIN, RH | Edita candidato (multipart) |
| DELETE | `/candidates/delete/:id` | ADMIN, RH | Remove candidato |
| DELETE | `/candidates/:id/files/:valueId` | Público (token) | Remove documento enviado |

### Campos dinâmicos — `/field` e `/fieldValue`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/field` | ADMIN, RH | Lista todos os campos |
| GET | `/field/:candidateId` | ADMIN, RH | Campos aplicáveis a um candidato |
| GET | `/field/public/:candidateId` | Público (token) | Campos do formulário público |
| POST | `/field/create` | ADMIN, RH¹ | Cria campo |
| DELETE | `/field/:id` | ADMIN, RH¹ | Remove campo |
| GET | `/fieldValue/:candidateId/values` | Público (token) | Respostas já preenchidas |
| POST | `/fieldValue/:candidateId/values` | Público (token) | Salva respostas do formulário |

¹ Campos com escopo `ADMISSION` (globais, sincronizados com colunas do candidato) só podem ser criados/removidos por e-mails na lista `DEV_EMAIL`. Campos com escopo `CANDIDATE` (específicos de um candidato) são livres para ADMIN/RH.

### Tickets — `/tickets`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/tickets?filter=mine\|sector\|created\|all` | Autenticado | Lista com filtro e paginação (`all` só para ADMIN) |
| GET | `/tickets/:id` | Autenticado | Detalhe do ticket |
| GET | `/tickets/:id/attachments/:attachmentId` | Autenticado | Download de anexo |
| POST | `/tickets` | Autenticado | Abre novo ticket (por departamento ou pessoa específica) |
| POST | `/tickets/:id/attachments` | Autenticado | Adiciona anexo (multipart) |
| PUT | `/tickets/:id/status` | Autenticado | Altera status |
| DELETE | `/tickets/:id/attachments/:attachmentId` | Autenticado | Remove anexo |

Ao criar um ticket sem responsável específico, a notificação por e-mail vai para a lista fixa de e-mails do departamento (TI, RH ou DP), configurada em `TicketService`.

### Contatos — `/contacts`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/contacts` | Autenticado | Lista todos os contatos do Google |
| POST | `/contacts` | Autenticado | Cria contato |
| POST | `/contacts/normalize-phones` | Autenticado | Normaliza formato de telefone em massa |
| PUT | `/contacts/people/:id` | Autenticado | Edita contato |
| DELETE | `/contacts/people/:id` | Autenticado | Remove contato |

### Logs — `/logs`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/logs/me` | Autenticado | Logs do próprio usuário |
| GET | `/logs?userName=&startDate=&endDate=` | ADMIN | Lista com filtros e paginação |

### Dysrup — `/dysrup`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/dysrup/itineraries` | Autenticado | Lista roteiros/equipes ativos (cache de 1h) |
| GET | `/dysrup/cep` | Público | Consulta endereço por CEP |
| GET | `/dysrup/coordenadas` | Autenticado | Latitude/longitude a partir de um CEP |
| POST | `/dysrup/gerar-juncao` | Autenticado | Dispara a geração assíncrona do consolidado de roteiros (enviado por e-mail) |
| POST | `/dysrup/registrar-candidato/:candidateId` | Autenticado | Registra o candidato na Dysrup |

### Funcionários (Inventário) — `/employees`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/employees?status=&page=&size=` | `DEPT_TI` | Lista funcionários paginada, com filtro opcional por `status` |
| POST | `/employees/import` | `DEPT_TI` | Importa planilha (`.xls`/`.xlsx`) de funcionários — parse, validação, upsert por CPF |
| PATCH | `/employees/:id/status` | `DEPT_TI` | Ajusta manualmente o status de um funcionário (`{ "status": "DEMITIDO" }`) |

`GET /employees` segue o mesmo padrão de paginação de `/candidates` (Spring `Pageable`, página/tamanho/ordenação via query string, `sort=name` por padrão, `size=20`). Sem `status`, lista todo mundo; com `status`, filtra por um valor de `EmployeeStatus` (ex: `?status=PENDENTE_REVISAO` pra achar quem precisa de revisão manual).

A resposta da importação traz `{ created, updated, errors, flaggedForReview }`. Cada importação gera um registro em `tb_employee_import_log` com o resumo e o horário, usado para saber há quanto tempo a base foi atualizada pela última vez.

`Company` (empresas do grupo) não tem endpoint próprio — é uma tabela de referência semeada automaticamente na primeira subida da aplicação (`DataInitializer`), casada por CNPJ (normalizado, só dígitos) durante o import de funcionários.

**Situação do funcionário:** a planilha traz a coluna "Situação Funcionário", mapeada para o enum `EmployeeStatus` — `ATIVO`, `EXPERIENCIA`, `FERIAS`, `FERIAS_VENCIDAS`, `AFASTADO`, `ATESTADO_MEDICO_VENCIDO`, `AVISO_PREVIO` e `DEMITIDO`. Todos exceto `DEMITIDO` contam como vínculo ativo para o negócio (`EmployeeStatus.isActive()`), inclusive período de experiência. Um valor de situação não reconhecido vira erro de linha na importação em vez de ser ignorado silenciosamente.

**Funcionário sumido da planilha (`PENDENTE_REVISAO`):** o sistema de origem sempre exporta o quadro ativo completo, mas a lista de demitidos é limitada a uma janela de 1 mês — então um desligamento mais antigo nunca aparece explicitamente como `DEMITIDO`. Para tratar isso, toda importação compara os CPFs recebidos com a base atual: quem estava cadastrado, não é `DEMITIDO` e não veio nesta planilha é marcado como `PENDENTE_REVISAO` (contabilizado em `flaggedForReview`) para confirmação manual do TI — pode ser desligamento fora da janela, mudança de empresa/CNPJ ou falha pontual na exportação. Se o funcionário reaparecer numa importação futura, o status é reclassificado normalmente e a pendência se resolve sozinha. `PENDENTE_REVISAO` também não conta como ativo.

**Ajuste manual de status:** `PATCH /employees/:id/status` cobre os casos que a importação sozinha não resolve — confirmar um `PENDENTE_REVISAO` como `DEMITIDO`, reverter um `PENDENTE_REVISAO` que na verdade segue ativo (sumiu da planilha por engano) de volta pro status real, ou reativar um `DEMITIDO` que foi recontratado antes de reaparecer numa importação. Aceita qualquer valor de `EmployeeStatus`, sem restrição de transição — quem decide se a mudança faz sentido é o TI, não a API. Uma vez setado manualmente, o status só muda de novo se: (a) o CPF reaparecer numa importação futura (é reclassificado normalmente), ou (b) alguém alterar de novo manualmente.

---

## Roles e permissões

| Role | Módulos disponíveis |
|---|---|
| `ADMIN` | Tudo |
| `RH` | RH, Contatos, Tickets |
| `OPERACIONAL` | Contatos, Tickets |
| `DP` | Contatos, Tickets |

Além de `role`, o `User` também expõe o **departamento** como uma authority Spring Security (`DEPT_<departamento>`, ex: `DEPT_TI`). Isso permite restringir rotas por departamento além de por role — usado hoje em `/employees/**`, que exige `DEPT_TI` independente da role do usuário.

**Regras de negócio de acesso a tickets:**
- Só vê/altera tickets em que é o responsável, do seu departamento, ou que criou
- ADMIN vê todos sem restrição
- ADMIN pode criar ticket em nome de outro usuário

---

## Integrações externas

### Google People API
Usada no módulo de Contatos. Autenticação OAuth2 com refresh token de longa duração.
- **Escopo:** `https://www.googleapis.com/auth/contacts`

### SMTP Office365
Usado para e-mails transacionais: ativação de conta, recuperação de senha, envio/reenvio de formulário de admissão, notificações de ticket e o consolidado de roteiros gerado pela "junção".

### Dysrup
Sistema externo de roteirização/gestão de equipes de campo. A integração:
- Busca roteiros/equipes ativos para vincular ao candidato aprovado
- Registra o candidato como usuário na Dysrup
- Consulta CEP e geolocalização
- **"Junção"**: consolida os roteiros de todas as equipes ativas (baixados individualmente da Dysrup) em uma única planilha, com deduplicação de lojas, e envia por e-mail. Processo assíncrono, disparado manualmente pelo botão "Realizar Junção" no cabeçalho da aplicação.

Autenticação com a Dysrup usa um token estático (`DYSRUP_TOKEN`) com fallback para login dinâmico (e-mail + senha) e re-autenticação automática em respostas `401`.

### Z-API (WhatsApp)
Usado para notificar a equipe quando um candidato é vinculado a uma rota (com foto, se disponível) e para enviar as credenciais de acesso da Dysrup ao candidato.

---

## Segurança

- JWT com expiração de 24h, assinado com HMAC-SHA256
- Senhas armazenadas com BCrypt
- Rate limiting por IP: 5 tentativas/min no login, 3/min no forgot-password
- Código de reset de senha: expira em 10 minutos, bloqueio após 4 tentativas erradas
- Upload de arquivos: validação de extensão + MIME type, bloqueio de path traversal
- Autorização por role (`ROLE_*`) e por departamento (`DEPT_*`) via Spring Security
- CORS configurado via variável de ambiente
- Credenciais sensíveis exclusivamente em variáveis de ambiente
