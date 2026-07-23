# Accessus — Backend

API REST do sistema Accessus. Java 25 + Spring Boot 4, com JWT stateless, PostgreSQL em produção e integrações com Google Contacts, Dysrup (roteirização), Z-API (WhatsApp) e Pulsus (MDM de aparelhos).

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
- **jxl (JExcelApi)** — leitura de arquivos `.xls` legados que o parser padrão do POI rejeita (comum em exportações de sistemas de terceiros, ex: a planilha de funcionários do RH)
- **LibreOffice headless** (processo externo, via `ProcessBuilder`) — conversão do contrato de comodato de `.docx` para PDF
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
| Inventário | `/inventario`, `/inventario/funcionarios`, `/inventario/funcionarios/:id`, `/inventario/aparelhos`, `/inventario/aparelhos/:id`, `/inventario/linhas`, `/inventario/linhas/:id`, `/inventario/alocacao`, `/inventario/movimentacoes` | Todos no front¹, restrito a `DEPT_TI` no backend (`/employee/**` e `/lines/**` já têm a restrição — `/devices/**` e `/deviceHistory/**` ainda não, ver nota² abaixo) |
| Configurações | `/configuracoes` | ADMIN |
| Logs | `/logs` | ADMIN |

¹ A tela ainda não tem restrição de menu no frontend — qualquer usuário autenticado enxerga o módulo, mas as chamadas de API (`/employee/**`, `/lines/**`) só funcionam para usuários do departamento TI. Alinhar isso (esconder o menu de quem não é TI) é o único ajuste pendente no frontend — as telas de Funcionários, Aparelhos, Linhas, Alocação e Movimentações já estão ligadas em dados reais, assim como as páginas de detalhe (`/inventario/funcionarios/:id`, `/inventario/aparelhos/:id` e `/inventario/linhas/:id`), incluindo o botão "Desvincular" e o download do contrato de comodato nelas (ver seção de Endpoints e `frontend/README.md`).

² `/devices/**` e `/deviceHistory/**` caem no `.anyRequest().authenticated()` genérico do `SecurityConfig` — qualquer usuário logado (não só TI) pode listar/vincular aparelhos ou ver o histórico hoje. Diferente de `/employee/**`, que já tem a restrição `DEPT_TI` explícita. Ajuste pendente.

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

`spring.config.import=optional:file:../.env[.properties]` (em `application.properties`) faz o Spring ler o `.env` da raiz do repo como se fosse um `.properties` — as variáveis de dev (`JWT_SECRET`, `SOFFICE_PATH` etc.) não precisam ser exportadas na sessão do terminal, só existirem nesse arquivo. Caminho do Windows no `.env` precisa usar `/` em vez de `\` (barra invertida é caractere de escape em `.properties` e quebra o valor silenciosamente).

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
| `ZAPI_INSTANCE_ID` / `ZAPI_TOKEN` / `ZAPI_CLIENT_TOKEN` | Envio de mensagens WhatsApp via Z-API — as três são obrigatórias em produção (sem valor default; a aplicação não sobe se alguma faltar) |
| `PULSUS_TOKEN` | Token estático (header `ApiToken`) para a API do MDM Pulsus |
| `DEV_EMAIL` | Lista de e-mails (separados por vírgula) com permissão de gerenciar campos de admissão (`FieldScope.ADMISSION`) |
| `BASE_URL` | URL pública do frontend |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas no CORS |
| `SOFFICE_PATH` | Caminho do executável do LibreOffice (conversão do contrato de comodato pra PDF). Padrão `soffice`, funciona sozinho em produção depois do `apt install libreoffice` — só precisa ser setado no Windows local, apontando pro `soffice.exe` (com `/`, não `\`) |

> **Refresh token Google:** expira após 6 meses sem uso. Para renovar, rodar `gerar_token.py` na área de trabalho, autorizar no browser com a conta dos contatos e atualizar `GOOGLE_REFRESH_TOKEN` no `.env` do servidor, depois `sudo systemctl restart acessus`.

---

## Deploy

O deploy é feito pelo script `deploy-acessus.ps1` (área de trabalho). Ele commita/dá push do repositório local, depois conecta na VPS via SSH (chave `~/.ssh/acessus_deploy`) e roda `git pull` + `mvnw clean package -DskipTests` + `systemctl restart acessus` direto lá — não builda mais localmente nem sobe artefato por SFTP (ver [README raiz](../README.md#deploy) para o fluxo completo, incluindo o frontend).

```powershell
.\deploy-acessus.ps1
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
| GET | `/candidates` | ADMIN, RH | Lista com paginação e filtro por `status`. Aceita `sort=campo,direção` (Spring padrão) — default `id,desc`; `nullsLast()` é forçado em toda ordem (ver nota¹ abaixo) |
| GET | `/candidates/search` | ADMIN, RH | Busca por termo, paginada, mesmo suporte a `sort` do endpoint acima |
| GET | `/candidates/:id` | ADMIN, RH | Detalhe do candidato |
| GET | `/candidates/:id/report` | ADMIN, RH | Gera relatório `.docx` |
| GET | `/candidates/:id/route-photo` | ADMIN, RH | Download da foto da rota |
| GET | `/candidates/:id/files/zip` | ADMIN, RH | Download de todos os documentos em ZIP, em streaming (ver nota² abaixo) |
| GET | `/candidates/:id/files/:valueId` | ADMIN, RH | Download de um documento específico, sem precisar do ZIP completo |
| GET | `/candidates/formCandidate/:id` | ADMIN, RH | Link do formulário de admissão |
| GET | `/candidates/validate` | Público | Valida token de acesso ao formulário |
| POST | `/candidates/register` | Público | Cadastro inicial (multipart) |
| POST | `/candidates/changeStatus/:id` | Público³ | Muda status (usado pelo fluxo do formulário) |
| POST | `/candidates/:id/upload` | Público (token) | Upload de documento vinculado a um campo — imagens JPG/PNG são redimensionadas antes de salvar (ver nota⁴ abaixo) |
| POST | `/candidates/:id/resend-form` | ADMIN, RH | Reenvia o link do formulário por e-mail |
| POST | `/candidates/:id/send-welcome` | ADMIN, RH | Envia instruções de acesso à Dysrup via WhatsApp |
| POST | `/candidates/:id/send-route` | ADMIN, RH | Notifica a equipe sobre a rota do candidato (Z-API) |
| POST | `/candidates/:id/create-ti-ticket` | ADMIN, RH | Abre ticket de TI automaticamente (provisionamento de aparelho) |
| PUT | `/candidates/:id` | ADMIN, RH | Edita candidato (multipart) |
| DELETE | `/candidates/delete/:id` | ADMIN, RH | Remove candidato⁵ |
| DELETE | `/candidates/:id/files/:valueId` | Público (token) ou ADMIN/RH³ | Remove documento enviado — pelo próprio candidato no formulário (com token) ou pelo RH direto na tela do candidato (autenticado, sem token) |

¹ O `sort` da URL (ex: `?sort=admissionDate,desc`) não carrega null handling — sem forçar `nullsLast()` em `CandidateController`, candidato sem `admissionDate` preenchida ordenava em posições diferentes dependendo do banco (Postgres bota `NULL` primeiro num `DESC`, H2 bota por último). Como não tem efeito em colunas sem `NULL` (`id`, `name`), é aplicado em toda ordem recebida, sem checar qual campo é.

² `FileStorageService.zipCandidateFiles` escreve direto na resposta HTTP via `StreamingResponseBody` em vez de montar o ZIP inteiro num `ByteArrayOutputStream` primeiro — o navegador recebe o primeiro byte assim que o primeiro arquivo é lido, em vez de esperar tudo pronto. Isso expôs uma pegadinha clássica de Spring Security com dispatch assíncrono: `JwtAuthFilter` (um `OncePerRequestFilter`) não reautentica por padrão nesse segundo dispatch (`shouldNotFilterAsyncDispatch()` é `true` por padrão), então o `SecurityContext` ficava vazio e o `AuthorizationFilter` negava acesso já com a resposta parcialmente enviada — a conexão era cortada no meio (`ERR_INCOMPLETE_CHUNKED_ENCODING` no navegador). Corrigido sobrescrevendo `shouldNotFilterAsyncDispatch()` pra `false` no filtro. Qualquer endpoint futuro que use `StreamingResponseBody` já se beneficia dessa correção.

³ `changeStatus` e a exclusão de um documento são compartilhados por dois fluxos bem diferentes: o RH agindo autenticado, e o próprio candidato pelo formulário público sem login. A rota é `permitAll` no `SecurityConfig`; quem decide se aceita é o próprio método, olhando se veio um `token` (fluxo público, valida contra o candidato) ou se existe um `Authentication` real no contexto de segurança (`UserService.getAuthenticatedUser()`, fluxo autenticado). Pra `changeStatus`, `CandidateService.changeStatus` além disso decide o que registrar: se o principal é um `User` real (RH/ADMIN), grava o log de auditoria de sempre; se é o anônimo padrão do Spring Security (candidato via formulário, `PENDING` → `UNDER_ANALYSIS`), pula o log — tentar buscar um usuário logado nesse caso (`getAuthenticatedUser()`) derrubava a transação inteira com 401 (candidato completava o formulário e o envio final travava) — em vez disso, dispara um e-mail avisando o RH que o candidato concluiu o envio (ver seção [SMTP Office365](#smtp-office365) abaixo).

⁴ `FileStorageService.resizeIfLarge` reduz JPG/PNG cujo maior lado passa de 1600px (via `javax.imageio`, sem dependência nova) e recomprime JPEG em qualidade 82% — fotos de câmera de celular (3-10MB) costumavam deixar o download do ZIP completo bem lento; uma foto de documento não precisa de resolução de câmera pra ficar legível. Qualquer falha na leitura/decodificação (formato inesperado, arquivo corrompido) cai no catch e mantém o arquivo original — resize é otimização, nunca bloqueia o upload. HEIC/WEBP ficam de fora (Java não decodifica sem plugin externo).

⁵ Antes de apagar o `Candidate`, `CandidateService.delete` remove primeiro todo `FieldValue` dele (via `FileStorageService.deleteFieldValueFile`, que também apaga o arquivo físico de cada documento) e todo `Field` de escopo `CANDIDATE` vinculado a ele. Sem isso, o delete quebrava com violação de FK (`field_value_tb`/`field_tb` → `tb_promoter`) em qualquer candidato que já tivesse algum campo, documento ou campo customizado preenchido — ou seja, na prática quase todos.

### Campos dinâmicos — `/field` e `/fieldValue`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/field` | ADMIN, RH | Lista só os campos padrão (`ADMISSION`) — usado pela tela "Gerenciar campos" |
| GET | `/field/:candidateId` | ADMIN, RH | Campos aplicáveis a um candidato (`ADMISSION` + `CANDIDATE` dele) |
| GET | `/field/public/:candidateId` | Público (token) | Campos do formulário público |
| POST | `/field/create` | ADMIN, RH¹ | Cria campo |
| PUT | `/field/:id` | ADMIN, RH¹ | Edita campo (nome, tamanho, etapa, opções, ativo/inativo — **não** o tipo, ver nota² abaixo) |
| DELETE | `/field/:id` | ADMIN, RH¹ | Remove campo |
| GET | `/fieldValue/:candidateId/values` | Público (token) | Respostas já preenchidas |
| POST | `/fieldValue/:candidateId/values` | Público (token) | Salva respostas do formulário |
| GET | `/fieldValue/:candidateId/documents` | ADMIN, RH | Só os `FieldValue` de campos `DOC` do candidato, autenticado (sem token) — usado pra listar os documentos enviados na tela do candidato, com download/exclusão individual |

¹ Campos com escopo `ADMISSION` (globais, sincronizados com colunas do candidato) só podem ser criados/editados/removidos por e-mails na lista `DEV_EMAIL`. Campos com escopo `CANDIDATE` (específicos de um candidato) são livres para ADMIN/RH.

² `UpdateFieldDto` não inclui `fieldType` de propósito — trocar o tipo de um campo que já tem valores salvos não faz sentido semântico (ex: virar `DOC` não tem fluxo de upload associado aos valores antigos já gravados como texto). O tipo é fixo desde a criação.

**Tipos de campo (`FieldType`):** `TEXT`, `DOC`, `DATE` e `SELECT` (seleção fixa). Campo `SELECT` guarda as opções em `Field.fieldOptions`, uma string separada por vírgula (ex: `"Pai/Mãe,Irmão(ã),Cônjuge,Outro"`) — sem tabela própria, de propósito, dado o volume pequeno de opções por campo. Ver `frontend/README.md` para a convenção de UI quando a opção "Outro" é escolhida.

**Etapas (`Steps`):** `personalData`, `address`, `docs`, `dependentsDocs`, `bankDetails`, `transport`, `emergencyContact` — cada uma vira uma seção no formulário público e no relatório `.docx` (ver `ReportGenerator` abaixo). `transport` e `emergencyContact` foram adicionadas pra cobrir transporte (linha de ônibus, cartão) e contato de emergência com grau de parentesco — esse último campo (`SELECT`) tomou o lugar de 2 campos de texto livre que já existiam soltos em `personalData` (nome/telefone do contato de emergência), agora reorganizados numa etapa própria.

Campo do tipo `DOC` aceita até 5 arquivos por campo (`MAX_FILES_PER_FIELD` em `FileStorageService`) — cada upload (`POST /candidates/:id/upload`, ver tabela de Candidatos acima) cria uma nova linha em `FieldValue` em vez de substituir a existente; `field_value_tb` não tem mais constraint única de `(candidate_id, field_id)` por causa disso (removida quando a fila foi implementada). Campo de Texto/Data/Seleção continua com um valor só, garantido pela aplicação (`FieldValueService`), não pelo banco.

**Relatório (`ReportGenerator`):** agrupa os `FieldValue` por `Field` antes de montar os cards do `.docx` — um campo `DOC` com vários arquivos (até 5) gera **um card só**, listando os nomes dos arquivos, em vez de um card duplicado por arquivo mostrando "Não informado" (bug corrigido; a causa era ler `fieldValue.getValue()`, que é sempre `null` em campo `DOC` — o nome do arquivo fica em `getFileName()`).

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

### Funcionários (Inventário) — `/employee`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/employee?status=&ativos=&hasDevice=&page=&size=` | `DEPT_TI` | Lista funcionários paginada |
| GET | `/employee/:id` | `DEPT_TI` | Detalhe de um funcionário (usado pela tela `/inventario/funcionarios/:id`) |
| GET | `/employee/search?term=&page=&size=` | `DEPT_TI` | Busca por nome ou CPF — termo só com dígitos busca por CPF, qualquer outra coisa busca por nome (mesmo padrão do `/candidates/search`) |
| GET | `/employee/count?status=&ativos=` | `DEPT_TI` | Mesmos filtros do `GET /employee`, mas devolve só a contagem (usado pelos KPIs do dashboard do Inventário) |
| GET | `/employee/export` | `DEPT_TI` | Gera e devolve um `.xlsx` com a base inteira de funcionários (sem filtro por enquanto — exporta tudo, independente do que estiver filtrado na tela) |
| GET | `/employee/companies` | `DEPT_TI` | Lista as empresas cadastradas — hoje sem uso no frontend (era usado no cadastro manual, que deixou de escolher empresa, ver abaixo) |
| POST | `/employee/importSave` | `DEPT_TI` | Importa planilha (`.xls`) de funcionários — parse, upsert por CPF, marca quem saiu da planilha como `PENDENTE_REVISAO` |
| POST | `/employee` | `DEPT_TI` | Cadastro manual (sócio ou prestador de serviço fora da planilha) — só `name`, `cpf` e `profile` são obrigatórios |
| PATCH | `/employee/:id/status` | `DEPT_TI` | Ajusta manualmente o status de um funcionário (corpo: string JSON pura, ex: `"DEMITIDO"`, sem wrapper) |
| DELETE | `/employee/:id` | `DEPT_TI` | Remove um funcionário — só permitido se `importManaged = false` (cadastro manual) |

`GET /employee` segue paginação padrão do Spring Data (`page`, `size`, `sort`, default `sort=name`, `size=20`). O filtro `status` casa com um valor exato do `EmployeeStatus`; `ativos=true` filtra pelo grupo de status que `EmployeeStatus.isActive()` considera ativo (não é só o valor literal `ATIVO` — ver abaixo); `hasDevice=true/false` filtra por ter ou não pelo menos um `Device` vinculado (`Employee.devices`, ver seção Aparelhos). Os três parâmetros de filtro são mutuamente exclusivos, nessa ordem de prioridade: `ativos` > `status` > `hasDevice` — se mais de um vier na mesma chamada, só o de maior prioridade é aplicado.

Cada item retornado por `GET /employee`/`GET /employee/search` inclui um campo `devices: ResponseDeviceDto[]` (ver seção Aparelhos abaixo) — lista vazia quando o funcionário não tem aparelho vinculado.

**Leitura/escrita de Excel:** vive num `ExcelService` separado do `EmployeeService`, de propósito — ele não sabe o que é `Employee`, só lê/escreve planilha genericamente (`List<Map<String,String>>` pra leitura, `List<String>` colunas + `List<List<String>>` linhas pra escrita). `EmployeeService.importSave` chama `ExcelService.converter` (leitura via **jxl**, porque a planilha real do RH — exportada do sistema Alter Data — é rejeitada pelo parser padrão do Apache POI); `EmployeeService.export` chama `ExcelService.gerar` (escrita via Apache POI `XSSFWorkbook`, formato `.xlsx`).

A importação faz upsert por CPF: quem já existe é atualizado, quem não existe é criado. Retorna `{ updated, created, flaggedForReview }`. Se uma linha tiver CPF vazio ou `Situação Funcionário` não mapeada, a importação inteira falha (400, sem persistir nada) — comportamento tudo-ou-nada, roda dentro de uma única transação.

**Situação do funcionário:** a planilha traz a coluna "Situação Funcionário", mapeada via `STATUS_POR_TEXTO` (em `EmployeeService`) pro enum `EmployeeStatus`. Só `FERIAS`, `AFASTADO` e `DEMITIDO` são gravados com o valor real da planilha — "Em Contrato de Experiência", "Férias Vencidas", "Atestado Médico Vencido" e "Aviso Prévio" são **colapsados pra `ATIVO`** na importação, porque a distinção não é usada em nenhuma regra do sistema (só teria valor se alguém precisasse filtrar/relatar especificamente por elas). O enum `EmployeeStatus` continua tendo `EXPERIENCIA`, `FERIAS_VENCIDAS`, `ATESTADO_MEDICO_VENCIDO` e `AVISO_PREVIO` como valores válidos — eles só não são mais produzidos pela importação automática, mas continuam aceitos no ajuste manual (`PATCH /employee/:id/status`), caso o TI queira usá-los por algum motivo específico. `EmployeeStatus.isActive()` considera ativo tudo, exceto `DEMITIDO`, `PENDENTE_REVISAO`, `FERIAS` e `AFASTADO`. Um valor de situação não reconhecido na planilha vira erro na importação em vez de ser ignorado silenciosamente.

**Funcionário sumido da planilha (`PENDENTE_REVISAO`):** o sistema de origem (Alter Data) exporta o quadro ativo completo, mas a lista de demitidos é limitada a uma janela de tempo — um desligamento fora dessa janela nunca aparece como `DEMITIDO`. Toda importação compara os CPFs recebidos com a base atual: quem estava cadastrado, é `importManaged = true`, não é `DEMITIDO` nem já `PENDENTE_REVISAO`, e não veio na planilha atual, é marcado como `PENDENTE_REVISAO`. Se reaparecer numa importação futura, o status é reclassificado normalmente e a pendência se resolve sozinha. Funcionários cadastrados manualmente (`importManaged = false`) nunca entram nessa verificação — eles simplesmente não estão na planilha por definição, não "sumiram" de lugar nenhum.

**Perfil do funcionário (`EmployeeProfile`):** `EMPLOYEE`, `PARTNER` ou `SERVICE_PROVIDER`. Todo funcionário importado pela planilha recebe `EMPLOYEE`, com duas exceções que marcam `SERVICE_PROVIDER`: a coluna `Empresa` da planilha (código interno do Alter Data, não CNPJ — ver `Company` abaixo) trazendo o valor `00009` (prestador de serviço/freelancer que aparece no RH vinculado a essa empresa específica), **ou** a coluna `Departamento` começando com o prefixo `"Z - Exclusivos"` (`PREFIXO_EQUIPE_EXCLUSIVOS` em `EmployeeService`) — equipe que é prestador de serviço independente de qual empresa/código venha na planilha. O cadastro manual (`POST /employee`) sempre exige escolher `PARTNER` ou `SERVICE_PROVIDER` explicitamente — não existe cadastro manual de `EMPLOYEE`.

**Ajuste manual de status:** `PATCH /employee/:id/status` cobre os casos que a importação sozinha não resolve — confirmar um `PENDENTE_REVISAO` como `DEMITIDO`, revertê-lo pro status real (se sumiu da planilha por engano), ou reativar um `DEMITIDO` que voltou antes de reaparecer numa importação. Aceita qualquer valor de `EmployeeStatus`, sem restrição de transição — quem decide se a mudança faz sentido é o TI, não a API.

**Cadastro manual (`POST /employee`):** cobre sócio e prestador de serviço que não vêm pela planilha. Só `name`, `cpf` e `profile` são obrigatórios — `department`, `position`, `state`, `city`, `admissionDate` e `status` são opcionais (`status` cai pra `ATIVO` se omitido). A empresa **não é escolhida** no cadastro — todo cadastro manual é vinculado automaticamente à empresa de código `00009` (a mesma usada pra marcar prestador de serviço na importação). `importManaged` fica sempre `false`.

**Exclusão (`DELETE /employee/:id`):** só remove funcionários com `importManaged = false`. Excluir alguém que veio da planilha retorna 400 — a fonte da verdade desses registros é a planilha, não a API.

`Company` ganhou um campo `code` — a planilha de funcionários trouxe uma coluna `Empresa` com o código interno do Alter Data no lugar do CNPJ, então a importação passou a casar a empresa pelo código, não mais pelo CNPJ normalizado (o método `findByCnpj` foi removido, sem uso). `ABC SOLUCOES EM VENDAS LTDA` (código `00004`) e `ABC SOLUÇÕES` (código `00009`) são a mesma empresa legal (mesmo CNPJ) — o Alter Data já trata como registros separados, e mantemos essa separação aqui também, porque é o que sustenta a distinção de `profile`. `Company` é semeada automaticamente na primeira subida da aplicação (`DataInitializer`) — **atenção**: o seed só roda se a tabela estiver vazia, então bancos que já tinham as 6 empresas antigas (ex: produção) não recebem a 7ª linha (`00009`) automaticamente; precisa de um insert manual até isso ser resolvido.

### Aparelhos (Inventário) — `/devices`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/devices?situacao=&page=&size=` | Autenticado² | Lista aparelhos paginada (default `sort=id`, `size=20`), filtro opcional por `DeviceSituacao` exato |
| GET | `/devices/search?term=&page=&size=` | Autenticado² | Busca por substring (case-insensitive) em `serialNumber`, `tagDevice` ou `pulsusId` — os três com `OR` na mesma query. **Não aceita `situacao` junto** — buscar e filtrar por situação ao mesmo tempo não é suportado no backend (a tela de Alocação contorna isso filtrando o resultado no front, ver `frontend/README.md`) |
| GET | `/devices/:id` | Autenticado² | Detalhe de um aparelho (usado pela tela `/inventario/aparelhos/:id`) |
| POST | `/devices/sync` | Autenticado² | Sincroniza a base de aparelhos com o Pulsus (upsert), síncrono/bloqueante |
| PATCH | `/devices/:id/vincular` | Autenticado² | Vincula manualmente um aparelho a um funcionário (corpo: `{ employeeId }`) — ver detalhes abaixo |
| PATCH | `/devices/:id/desvincular` | Autenticado² | Desvincula o aparelho do funcionário atual — ver detalhes abaixo |
| GET | `/devices/:id/comodato-contract` | Autenticado² | Gera e devolve o contrato de comodato em PDF — ver seção [Contrato de comodato](#contrato-de-comodato-inventário) abaixo |

² Ver nota² na seção de rotas do frontend — `/devices/**` ainda não tem a restrição `DEPT_TI` que `/employee/**` já tem.

**Entidade `Device`:** `pulsusId` (id do aparelho na Pulsus, `unique`), `manufacturer`, `model`, `serialNumber`, `group` (nome do grupo Pulsus, coluna `device_group` porque `GROUP` é palavra reservada em SQL), `imei1`/`imei2`, `tagDevice` (valor de `user.identifier` na Pulsus — texto livre, não confiável/único), `situacao` (enum `DeviceSituacao`) e `employee` (`@ManyToOne`, FK `employee_id`, nullable).

`ResponseDeviceDto` (usado por `GET /devices`, `/devices/search` e `/devices/:id`) inclui `employeeName` e `employeeId` (ambos `null` quando o aparelho não está vinculado) — o `employeeId` foi adicionado especificamente para o front conseguir linkar direto pra `/inventario/funcionarios/:id` a partir de um aparelho, sem precisar de uma segunda chamada.

**`DeviceSituacao`:** `EM_USO`, `DISPONIVEL`, `MANUTENCAO`, `SEM_USUARIO_IDENTIFICADO`. Não é um campo booleano por situação de propósito — cada situação nova (ex: uma futura `SUCATA`) é só mais um valor de enum e um `else if` no matching, não uma coluna nova.

**Sincronização (`POST /devices/sync`):** busca todos os aparelhos na Pulsus (`PulsusService.getDevices()`, paginando sozinho via `max_id` até a página vir com menos de 500 registros — sem isso, aparelhos com id baixo/mais antigos nunca eram sincronizados) e faz upsert por `pulsusId` em `DeviceService.syncDevices()`. Pra cada aparelho:
1. Concatena `user.first_name` + `user.last_name` do Pulsus e normaliza (maiúsculo, sem acento, sem espaço não separável `U+00A0` — artefato comum de copy/paste de planilha que sobrevive a `trim()`/`\s` comuns do Java).
2. Se o nome normalizado contém `"MANUTENCAO"` → `situacao = MANUTENCAO`. Senão, se contém `"DISPONIVEL"` → `situacao = DISPONIVEL`. Em ambos os casos, não tenta vincular funcionário.
3. Senão, tenta casar com um `Employee` pelo nome completo normalizado. Achou exatamente 1 → `EM_USO` e vincula. Achou 0 ou mais de 1 (nome ambíguo, loga aviso) → `SEM_USUARIO_IDENTIFICADO`, sem vínculo.

Esse matching é **só por nome** — não existe hoje nenhum identificador confiável em comum entre Pulsus e a base de funcionários (CPF, matrícula) pra usar como chave. Nome ambíguo ou sem correspondência nunca é resolvido automaticamente, fica sinalizado (`SEM_USUARIO_IDENTIFICADO`) pra revisão manual — o sistema não arrisca vincular errado.

É importante rodar o sync de funcionários (`POST /employee/importSave`) **antes** do sync de aparelhos — se `tb_employee` estiver vazia ou desatualizada no momento do sync, nenhum aparelho casa com ninguém.

**Performance:** o `GET /devices` da Pulsus sem filtro é lento pra bases grandes (30s+ observado em produção) — por isso `PulsusService` usa um timeout maior que o padrão. Decisão consciente: o sync **não** é assíncrono nem agendado (`@Scheduled`), mesmo sendo lento. Rodar em background arriscaria condição de corrida com edição concorrente de funcionário/aparelho, e depender de um agendamento não serve pra quando o TI precisa do dado mais atualizado possível numa urgência (aparelho perdido/roubado, por exemplo).

**Vínculo manual (`PATCH /devices/:id/vincular`):** cobre o caso que o sync automático não resolve — associar manualmente um funcionário sem aparelho a um aparelho disponível (usado pela tela Inventário → Alocação). `DeviceService.vincular()`:
1. Busca `Device` (pelo `id` interno do Accessus, não o `pulsusId`) e `Employee` pelos ids recebidos.
2. Chama `PulsusService.updateDevice(pulsusId, body)` — um `PUT /devices/update/{id}` na API da Pulsus, escrevendo `user_attributes.first_name`/`last_name` (nome do funcionário, dividido no primeiro espaço) e `user_attributes.identifier` (a TAG atual do aparelho). **O `identifier` precisa ser sempre reenviado** mesmo sem mudar — esse endpoint da Pulsus substitui o objeto `user_attributes` inteiro, não faz merge parcial; omitir um campo apaga o valor existente na Pulsus.
3. Atualiza `Device.employee` e `Device.situacao = EM_USO` no próprio banco do Accessus, sem esperar o próximo `/devices/sync`.
4. Grava uma entrada de auditoria genérica via `LogsService.createLog(...)` (aparece em `/logs`) **e** uma entrada estruturada via `DeviceHistoryService.createNewHistory(...)` (ver seção [Histórico de movimentações](#histórico-de-movimentações-inventário--devicehistory) abaixo) — os dois convivem, não são redundantes: `/logs` é auditoria livre-texto do sistema todo, `DeviceHistory` é o histórico estruturado e consultável por aparelho/funcionário.

**Desvínculo (`PATCH /devices/:id/desvincular`):** o inverso do `vincular()` — usado pelo botão "Desvincular" nas telas de detalhe de Funcionário e Aparelho. `DeviceService.desvincular()`:
1. Exige que o `Device` já tenha um `employee` vinculado (senão, 400).
2. Atualiza o nome do aparelho na Pulsus para `"<rótulo do modelo> DISPONIVEL"` (ex: `"A12 DISPONIVEL"`, `"MOTO G35 DISPONIVEL"`) via `PulsusService.updateDevice`, reenviando a `identifier` (TAG) atual — mesma pegadinha do `vincular()`, o endpoint da Pulsus substitui `user_attributes` inteiro. Isso é **obrigatório**, não cosmético: sem isso, o próximo `POST /devices/sync` encontraria o nome do mesmo funcionário ainda gravado na Pulsus e re-vincularia sozinho (matching por nome), desfazendo o desvínculo.
3. Zera `Device.employee` e volta `Device.situacao` para `DISPONIVEL` no banco do Accessus.
4. Grava log de auditoria e uma entrada `DeviceHistory` com `HistoryAction.DEALLOCATION` (ver seção de histórico abaixo).

O rótulo do modelo (`"A12"`, `"A15"`, `"MOTO G35"`, `"REDMI 15C"`) vem de `DeviceModelCatalog` (ver seção [Contrato de comodato](#contrato-de-comodato-inventário) abaixo) — modelo fora da lista conhecida usa o próprio `device.getModel()` como rótulo, garantindo que o nome gravado na Pulsus nunca vire acidentalmente o nome de uma pessoa.

**Limitação conhecida da API da Pulsus:** não existe campo/endpoint pra trocar **o grupo** de um aparelho pela API — o schema `UpdateUser` da Pulsus só aceita `group_attributes.pin` (o PIN de tela do grupo atual), e `/groups` só tem `GET` (sem `POST`/`PUT` pra mover aparelho entre grupos). Confirmado testando direto na API (schema oficial do Swagger da Pulsus). Ou seja: o `vincular()` deixa o aparelho pronto pro **matching por nome** funcionar no próximo sync, mas a troca de grupo continua manual, direto na interface da Pulsus — por isso o frontend mostra um lembrete disso após vincular (ver `VinculoSucessoModal` no `frontend/README.md`).

### Contrato de comodato (Inventário)

`GET /devices/:id/comodato-contract` gera o "Contrato de Comodato de Aparelho Celular" em PDF pro par aparelho↔funcionário vinculado, pra download direto do navegador (nada fica salvo no servidor depois da resposta). Usado pelo botão "Baixar contrato de comodato" no `VinculoSucessoModal` (ver `frontend/README.md`).

**`ComodatoContractGenerator`** (`document/`): carrega o template `.docx` do classpath (`resources/templates/CONTRATO_DE_COMODATO_DE_APARELHO_CELULAR.docx`) e substitui os marcadores `${MARCADOR}` por dado real de `Employee`/`Company`/`Device` — mesma técnica de "juntar todos os runs do parágrafo antes de substituir" que o `ReportGenerator` não precisa (aqui é necessária porque o Word costuma quebrar um único marcador em vários `runs`, ex: `${MODELO}` virou `${` / `MODELO` / `}` em 3 runs separados no template real).

**`DeviceModelCatalog`** (`services/`): tabela única de modelo → rótulo + valor do comodato, hardcoded (não existe essa informação em nenhum lugar do sistema — nem `Device` nem Pulsus trazem preço). Usada tanto pelo `${VALOR}` do contrato quanto pelo rótulo gravado na Pulsus no desvínculo (ver acima). Modelo fora da lista cai no valor padrão (300) e usa o próprio `device.getModel()` como rótulo.

**`PdfConversionService`** (`services/`): converte o `.docx` gerado em PDF chamando `soffice --headless --convert-to pdf` via `ProcessBuilder` (caminho configurável por `SOFFICE_PATH`, ver Variáveis de ambiente). Todas as conversões passam por um `ExecutorService` de thread única — funciona como fila (uma de cada vez), porque rodar duas instâncias do LibreOffice headless em paralelo no mesmo host costuma travar por disputa do profile. Escreve o `.docx`/`.pdf` num diretório temporário e apaga tudo logo depois de ler os bytes pra memória.

### Histórico de movimentações (Inventário) — `/deviceHistory`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/deviceHistory?page=&size=` | Autenticado² | Lista todas as movimentações (alocação/devolução) paginadas, sem filtro ainda |
| GET | `/deviceHistory/employee/:employeeId?page=&size=` | Autenticado² | Movimentações de um funcionário específico, mais recentes primeiro (usado pela tela `/inventario/funcionarios/:id`) |
| GET | `/deviceHistory/device/:deviceId?page=&size=` | Autenticado² | Movimentações de um aparelho específico, mais recentes primeiro (usado pela tela `/inventario/aparelhos/:id`) |

**Entidade `DeviceHistory`:** `device` (`@ManyToOne`), `employee` (`@ManyToOne`), `actionType` (enum `HistoryAction`: `ALLOCATION`, `DEALLOCATION`) e `createdAt`. `ALLOCATION` é criada em `DeviceService.vincular()`, `DEALLOCATION` em `DeviceService.desvincular()` — o botão "Desvincular" nas telas de detalhe (Funcionário e Aparelho) já chama a API de verdade (ver seção [Aparelhos](#aparelhos-inventário--devices) acima), não é mais só visual.

`ResponseHistoryDto` embute `ResponseDeviceDto`/`ResponseEmployeeDto` (os mesmos DTOs achatados usados em `/devices` e `/employee`), montados em `DeviceHistoryService` sem depender de `DeviceService`/`EmployeeService` como bean autowired pro `device` (pra evitar um ciclo de dependência, já que `DeviceService` autowira `DeviceHistoryService` para gravar o histórico em `vincular()`) — só o `employee` reaproveita `EmployeeService.toDto(...)` diretamente, sem ciclo nesse caso.

`DeviceHistoryRepository` tem `findByDeviceIdOrderByCreatedAtDesc`/`findByEmployeeIdOrderByCreatedAtDesc`, hoje expostos pelos dois endpoints acima. Ainda não há filtro por período (`de`/`até`) nem por `actionType` em nenhum dos três endpoints — a tela Inventário → Movimentações já lista dados reais paginados, mas os campos de busca/data/tipo do filtro dela continuam só visuais (ver `frontend/README.md`).

Propositalmente **sem** coleção `@OneToMany<DeviceHistory>` em `Device`/`Employee` (ex: `device.getHistorico()`) — cresce sem limite e não pagina bem carregado via entidade; a consulta é sempre direto pelo repositório.

### Linhas (Inventário) — `/lines`
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/lines?status=&page=&size=` | `DEPT_TI` | Lista linhas paginada (default `sort=id`, `size=20`), filtro opcional por `LineStatus` exato |
| GET | `/lines/search?term=&page=&size=` | `DEPT_TI` | Busca por número ou ICCID (substring, case-insensitive) — não busca por nome do funcionário vinculado |
| GET | `/lines/count?status=` | `DEPT_TI` | Contagem com o mesmo filtro do `GET /lines` |
| GET | `/lines/:id` | `DEPT_TI` | Detalhe de uma linha |
| POST | `/lines` | `DEPT_TI` | Cadastra linha nova (`number` obrigatório, único; `iccid` opcional, único se informado) — nasce com `status = AVAILABLE` |
| PATCH | `/lines/:id/link` | `DEPT_TI` | Vincula a linha a um funcionário (corpo: `{ employeeId }`), muda `status` pra `IN_USE` |
| PATCH | `/lines/:id/unlink` | `DEPT_TI` | Desvincula do funcionário atual, volta `status` pra `AVAILABLE` — exige que esteja vinculada |
| PATCH | `/lines/:id/status` | `DEPT_TI` | Ajusta manualmente o status (corpo: string JSON pura, ex: `"REACTIVATE"`, sem wrapper) — ver regra de `IN_USE`/desvínculo automático abaixo |
| PATCH | `/lines/:id/notes` | `DEPT_TI` | Edita as observações (corpo: `{ "notes": "..." }` — ver nota¹ abaixo sobre por que não é string crua) |
| DELETE | `/lines/:id` | `DEPT_TI` | Remove a linha — só permitido se não estiver vinculada a ninguém |
| POST | `/lines/import-legacy` | `DEPT_TI` | **Temporário** — importa a planilha legada "Gestão de linhas e aparelhos.xlsx" (aba `linhas_vivo`), upsert por número. Remover (`LineService.importLegacySpreadsheet` + os 3 helpers privados dela, `LineImportResultDto` e esse endpoint) depois que a carga inicial for feita e conferida |

`/lines/**` já nasceu com a restrição `DEPT_TI` (`SecurityConfig`, `.hasAuthority("DEPT_TI")`), diferente de `/devices/**`/`/deviceHistory/**` que ainda estão abertos a qualquer autenticado (ver nota² na seção de Aparelhos).

**Entidade `Line`:** `number` (único), `iccid` (chip, nullable — sempre `null` quando `type = ESIM`, ver abaixo), `type` (enum `LineType`: `CHIP` ou `ESIM`), `notes`, `employee` (`@ManyToOne`, FK `employee_id`, nullable) e `status` (enum `LineStatus`: `IN_USE`, `AVAILABLE`, `REACTIVATE`, `UNAVAILABLE`).

**`LineType` (`CHIP`/`ESIM`)** existe só pra classificar a linha — hoje não muda nenhuma regra de vínculo (chegou a existir uma versão que também guardava um `Device` pra linha eSIM, revertida: o vínculo é sempre só com `Employee`, independente do tipo). No frontend, linha eSIM mostra o texto "eSIM" no lugar do ICCID, já que esse tipo nunca tem um chip físico rastreável (ver `frontend/README.md`).

**`IN_USE` só é alcançável vinculando um funcionário** (`PATCH /lines/:id/link`) — `LineService.updateStatus` rejeita `IN_USE` explicitamente (400) e, ao aplicar qualquer um dos outros três status, sempre limpa `employee` primeiro (mesmo que já estivesse vazio) — não faz sentido a linha continuar "com alguém" enquanto o status diz outra coisa. Efeito colateral: trocar o status de uma linha `IN_USE` desvincula o funcionário como parte da mesma operação; o frontend avisa isso antes de aplicar (ver `frontend/README.md`).

¹ A primeira versão de `PATCH /lines/:id/notes` recebia `@RequestBody String notes` direto — mas o `StringHttpMessageConverter` do Spring não passa esse corpo pelo Jackson quando o parâmetro é `String` puro (diferente de um enum, ex: `LineStatus` no `/status` acima, que sempre passa), então as aspas do JSON enviado pelo cliente iam parar dentro do próprio texto salvo (`"Nota original"` literal, aspas incluídas). Resolvido envolvendo num record (`UpdateNotesDto { notes }`) — aí o Jackson entra em ação normalmente, como em qualquer outro DTO.

**Frontend:** as telas (`/inventario/linhas`, `/inventario/linhas/:id`) já estão ligadas na API de verdade — `LinhaService/linhaApi.ts` e os hooks `useLinhas`/`useLinhaDetalhe` (ver `frontend/README.md`). Cobre listar/buscar/paginar, cadastrar, vincular/desvincular, editar observações inline e trocar status, com a regra de desvínculo automático acima refletida na UI (aviso antes de trocar, "Em uso" fora das opções). O import legado continua manual via Swagger/Insomnia — não tem botão no frontend, de propósito, já que é uma migração de uma vez só.

---

## Roles e permissões

| Role | Módulos disponíveis |
|---|---|
| `ADMIN` | Tudo |
| `RH` | RH, Contatos, Tickets |
| `OPERACIONAL` | Contatos, Tickets |
| `DP` | Contatos, Tickets |

Além de `role`, o `User` também expõe o **departamento** como uma authority Spring Security (`DEPT_<departamento>`, ex: `DEPT_TI`). Isso permite restringir rotas por departamento além de por role — usado hoje em `/employee/**`, que exige `DEPT_TI` independente da role do usuário.

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
Usado para e-mails transacionais: ativação de conta, recuperação de senha, envio/reenvio de formulário de admissão, notificações de ticket, o consolidado de roteiros gerado pela "junção" e o aviso ao RH quando o candidato finaliza o envio do formulário público.

`CandidateService.changeStatus` dispara esse último para uma lista fixa de e-mails (`FORM_SUBMITTED_EMAILS`, hardcoded no service, mesmo padrão do `EMAILS_FOR_AREA` do `TicketService`) sempre que o próprio candidato conclui o formulário — não quando o RH altera o status manualmente pela tela. Envolto em `try/catch`: uma falha no SMTP não impede o candidato de concluir o envio.

### Dysrup
Sistema externo de roteirização/gestão de equipes de campo. A integração:
- Busca roteiros/equipes ativos para vincular ao candidato aprovado
- Registra o candidato como usuário na Dysrup
- Consulta CEP e geolocalização
- **"Junção"**: consolida os roteiros de todas as equipes ativas (baixados individualmente da Dysrup) em uma única planilha, com deduplicação de lojas, e envia por e-mail. Processo assíncrono, disparado manualmente pelo botão "Realizar Junção" no cabeçalho da aplicação.

Autenticação com a Dysrup usa um token estático (`DYSRUP_TOKEN`) com fallback para login dinâmico (e-mail + senha) e re-autenticação automática em respostas `401`.

### Z-API (WhatsApp)
Usado para notificar a equipe quando um candidato é vinculado a uma rota (com foto, se disponível) e para enviar as credenciais de acesso da Dysrup ao candidato. Além disso, `CandidateService.register()` dispara automaticamente uma mensagem de boas-vindas com o link do formulário de admissão pro telefone do candidato assim que ele é cadastrado (não é opcional, é parte do próprio fluxo de cadastro) — esse envio é `try/catch`ado e só loga o erro em caso de falha, pra uma instabilidade da Z-API não derrubar a resposta HTTP do cadastro (o candidato já foi salvo antes desse envio).

A conta Z-API pode ter a segurança "Client-Token" habilitada (Segurança, no menu da conta Z-API) — quando habilitada, toda chamada precisa do header `Client-Token` além do token da instância na própria URL; sem ele, a Z-API responde `400 {"error":"your client-token is not configured"}`. `ZAPI_CLIENT_TOKEN` é obrigatória em produção (`application-prod.properties`) justamente por causa disso — se ausente, a aplicação recusa subir em vez de falhar silenciosamente só na hora de mandar mensagem.

### Pulsus (MDM)
Sistema externo de gestão de dispositivos móveis (MDM) usado pelo módulo Aparelhos do Inventário. `PulsusService` consome `GET https://api.pulsus.mobi/v1/devices` (autenticação por header estático `ApiToken`, sem OAuth) com paginação própria via `max_id`, e `PUT https://api.pulsus.mobi/v1/devices/update/{id}` pra escrever nome/TAG de usuário no vínculo manual. Ver seção [Aparelhos](#aparelhos-inventário--devices) para detalhes do matching, sincronização e da limitação conhecida (API não permite trocar grupo do aparelho).

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
