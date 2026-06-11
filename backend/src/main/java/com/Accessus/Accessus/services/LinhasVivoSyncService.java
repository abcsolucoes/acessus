package com.Accessus.Accessus.services;

import com.google.api.services.people.v1.PeopleService;
import com.google.api.services.people.v1.model.*;
import com.google.api.services.people.v1.model.Name;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.*;

@Service
public class LinhasVivoSyncService {

    private static final Logger log = LoggerFactory.getLogger(LinhasVivoSyncService.class);
    private static final String GRUPO_NOME = "Linhas Corporativas Vivo";

    @Autowired
    private SharePointService sharePointService;

    @Autowired
    private PeopleService peopleService;

    // ── Agendamento: toda noite às 22h ────────────────────────────────────────
    @Scheduled(cron = "0 0 22 * * *")
    public void sincronizarAgendado() {
        try {
            int[] resultado = sincronizar();
            log.info("Sync Linhas Vivo: {} criados, {} atualizados, {} removidos",
                    resultado[0], resultado[1], resultado[2]);
        } catch (Exception e) {
            log.error("Erro no sync Linhas Vivo: {}", e.getMessage(), e);
        }
    }

    // ── Execução manual (chamada pelo controller) ─────────────────────────────
    public int[] sincronizar() throws Exception {
        Map<String, String> planilha = lerPlanilha();
        String grupoResourceName = encontrarOuCriarGrupo();
        Map<String, String> contatosGrupo = listarContatosDoGrupo(grupoResourceName);

        int criados = 0, atualizados = 0, removidos = 0;

        // Cria contatos novos (sem adicionar ao grupo ainda)
        List<String> novosResourceNames = new ArrayList<>();
        for (Map.Entry<String, String> entry : planilha.entrySet()) {
            String nome = entry.getKey();
            String telefone = entry.getValue();

            if (contatosGrupo.containsKey(nome)) {
                String telefoneSalvo = contatosGrupo.get(nome);
                if (!telefone.equals(telefoneSalvo)) {
                    atualizarTelefone(nome, telefone, grupoResourceName);
                    atualizados++;
                    Thread.sleep(200);
                }
            } else {
                Person criado = criarContato(nome, telefone);
                novosResourceNames.add(criado.getResourceName());
                criados++;
                Thread.sleep(200);
            }
        }

        // Adiciona todos os novos ao grupo em lotes de 200
        for (int i = 0; i < novosResourceNames.size(); i += 200) {
            List<String> lote = novosResourceNames.subList(i, Math.min(i + 200, novosResourceNames.size()));
            peopleService.contactGroups().members()
                    .modify(grupoResourceName, new ModifyContactGroupMembersRequest()
                            .setResourceNamesToAdd(lote))
                    .execute();
            Thread.sleep(500);
        }

        // Remove contatos que saíram da planilha
        for (String nome : contatosGrupo.keySet()) {
            if (!planilha.containsKey(nome)) {
                removerDoGrupo(nome, grupoResourceName);
                removidos++;
                Thread.sleep(200);
            }
        }

        return new int[]{criados, atualizados, removidos};
    }

    // ── Lê a planilha do SharePoint ───────────────────────────────────────────
    private Map<String, String> lerPlanilha() throws Exception {
        byte[] bytes = sharePointService.downloadLinhasVivo();

        Map<String, String> resultado = new LinkedHashMap<>();

        try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = wb.getSheet("linhas_vivo");
            if (sheet == null) throw new RuntimeException("Aba 'linhas_vivo' não encontrada");

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String usuario = getCellString(row.getCell(2)); // coluna C: USUÁRIO
                String numeroRaw = getCellString(row.getCell(1)); // coluna B: NÚMERO

                if (usuario == null || usuario.isBlank()) continue;
                if ("DISPONIVEL".equalsIgnoreCase(usuario)) continue;
                if ("REATIVAR".equalsIgnoreCase(usuario)) continue;
                if ("DISPONIVEL VER CHIP".equalsIgnoreCase(usuario)) continue;
                if ("DISPONIVEL RH".equalsIgnoreCase(usuario)) continue;
                if (numeroRaw == null || numeroRaw.isBlank()) continue;

                String telefone = GooglePeopleService.normalizarTelefone(numeroRaw);
                resultado.put(normalizeNome(usuario), telefone);
            }
        }

        return resultado;
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                yield String.valueOf((long) val);
            }
            case FORMULA -> switch (cell.getCachedFormulaResultType()) {
                case STRING -> cell.getRichStringCellValue().getString().trim();
                case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
                default -> null;
            };
            default -> null;
        };
    }

    private String normalizeNome(String nome) {
        if (nome == null) return null;
        return nome.trim().toUpperCase();
    }

    // ── Grupo de contatos ─────────────────────────────────────────────────────
    private String encontrarOuCriarGrupo() throws Exception {
        ListContactGroupsResponse response = peopleService.contactGroups().list().execute();

        if (response.getContactGroups() != null) {
            for (ContactGroup g : response.getContactGroups()) {
                if (GRUPO_NOME.equals(g.getName())) {
                    return g.getResourceName();
                }
            }
        }

        // Cria o grupo se não existir
        ContactGroup novoGrupo = peopleService.contactGroups()
                .create(new CreateContactGroupRequest()
                        .setContactGroup(new ContactGroup().setName(GRUPO_NOME)))
                .execute();

        log.info("Grupo '{}' criado: {}", GRUPO_NOME, novoGrupo.getResourceName());
        return novoGrupo.getResourceName();
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> listarContatosDoGrupo(String grupoResourceName) throws Exception {
        Map<String, String> resultado = new LinkedHashMap<>();

        // Busca membros do grupo
        ContactGroup grupo = peopleService.contactGroups()
                .get(grupoResourceName)
                .setMaxMembers(1000)
                .execute();

        if (grupo.getMemberResourceNames() == null || grupo.getMemberResourceNames().isEmpty()) {
            return resultado;
        }

        // Busca detalhes dos membros em lotes de 50
        List<String> membros = grupo.getMemberResourceNames();
        for (int i = 0; i < membros.size(); i += 50) {
            List<String> lote = membros.subList(i, Math.min(i + 50, membros.size()));

            GetPeopleResponse resp = peopleService.people()
                    .getBatchGet()
                    .setResourceNames(lote)
                    .setPersonFields("names,phoneNumbers")
                    .execute();

            if (resp.getResponses() == null) continue;

            for (PersonResponse pr : resp.getResponses()) {
                Person p = pr.getPerson();
                if (p == null) continue;

                String nome = p.getNames() != null && !p.getNames().isEmpty()
                        ? normalizeNome(p.getNames().get(0).getDisplayName()) : null;
                String tel = p.getPhoneNumbers() != null && !p.getPhoneNumbers().isEmpty()
                        ? p.getPhoneNumbers().get(0).getValue() : "";

                if (nome != null) resultado.put(nome, tel);
            }
        }

        return resultado;
    }

    private Person criarContato(String nome, String telefone) throws Exception {
        Person person = new Person()
                .setNames(List.of(new Name().setGivenName(nome)))
                .setPhoneNumbers(List.of(new PhoneNumber().setValue(telefone).setType("mobile")));
        return peopleService.people().createContact(person).execute();
    }

    private void atualizarTelefone(String nome, String novoTelefone, String grupoResourceName) throws Exception {
        Map<String, Person> pessoasPorNome = buscarPessoaNoGrupo(grupoResourceName);
        Person person = pessoasPorNome.get(nome);
        if (person == null) return;

        person.setPhoneNumbers(List.of(new PhoneNumber().setValue(novoTelefone).setType("mobile")));

        peopleService.people()
                .updateContact(person.getResourceName(), person)
                .setUpdatePersonFields("phoneNumbers")
                .execute();
    }

    private void removerDoGrupo(String nome, String grupoResourceName) throws Exception {
        Map<String, Person> pessoasPorNome = buscarPessoaNoGrupo(grupoResourceName);
        Person person = pessoasPorNome.get(nome);
        if (person == null) return;

        peopleService.contactGroups().members()
                .modify(grupoResourceName, new ModifyContactGroupMembersRequest()
                        .setResourceNamesToRemove(List.of(person.getResourceName())))
                .execute();
    }

    private Map<String, Person> buscarPessoaNoGrupo(String grupoResourceName) throws Exception {
        Map<String, Person> resultado = new LinkedHashMap<>();

        ContactGroup grupo = peopleService.contactGroups()
                .get(grupoResourceName)
                .setMaxMembers(1000)
                .execute();

        if (grupo.getMemberResourceNames() == null) return resultado;

        List<String> membros = grupo.getMemberResourceNames();
        for (int i = 0; i < membros.size(); i += 50) {
            List<String> lote = membros.subList(i, Math.min(i + 50, membros.size()));

            GetPeopleResponse resp = peopleService.people()
                    .getBatchGet()
                    .setResourceNames(lote)
                    .setPersonFields("names,phoneNumbers")
                    .execute();

            if (resp.getResponses() == null) continue;

            for (PersonResponse pr : resp.getResponses()) {
                Person p = pr.getPerson();
                if (p == null || p.getNames() == null || p.getNames().isEmpty()) continue;
                String nome = normalizeNome(p.getNames().get(0).getDisplayName());
                resultado.put(nome, p);
            }
        }

        return resultado;
    }
}
