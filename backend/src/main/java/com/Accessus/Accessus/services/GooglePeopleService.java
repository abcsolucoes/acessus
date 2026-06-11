package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.contact.ContactDTO;
import com.google.api.services.people.v1.PeopleService;
import com.google.api.services.people.v1.model.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class GooglePeopleService {

    private final PeopleService peopleService;

    public GooglePeopleService(PeopleService peopleService) {
        this.peopleService = peopleService;
    }

    // ── Normalização de telefone ──────────────────────────────────────────────
    // Resultado: 015 + DDD (2 dígitos) + 9 + número (8 dígitos) = 14 dígitos
    public static String normalizarTelefone(String raw) {
        if (raw == null || raw.isBlank()) return raw;

        // Remove tudo que não é dígito
        String digits = raw.replaceAll("\\D", "");

        // Já está normalizado
        if (digits.startsWith("015") && digits.length() == 14) return raw;

        // Remove código do país +55 se presente (e tiver dígitos suficientes)
        if (digits.startsWith("55") && digits.length() >= 12) {
            digits = digits.substring(2);
        }

        // Com 10 dígitos (DDD + 8): adiciona o 9 após o DDD
        if (digits.length() == 10) {
            digits = digits.substring(0, 2) + "9" + digits.substring(2);
        }

        // Adiciona o prefixo da operadora
        return "015" + digits;
    }

    // ── Normaliza telefones de todos os contatos (execução única) ─────────────
    public int normalizarTodosOsTelefones() throws IOException {
        List<Person> todos = new ArrayList<>();
        String pageToken = null;

        do {
            ListConnectionsResponse response = peopleService.people().connections()
                    .list("people/me")
                    .setPersonFields("names,phoneNumbers,emailAddresses")
                    .setPageSize(1000)
                    .setPageToken(pageToken)
                    .execute();

            if (response.getConnections() != null) {
                todos.addAll(response.getConnections());
            }
            pageToken = response.getNextPageToken();
        } while (pageToken != null);

        int atualizados = 0;

        for (Person person : todos) {
            if (person.getPhoneNumbers() == null || person.getPhoneNumbers().isEmpty()) continue;

            String original   = person.getPhoneNumbers().get(0).getValue();
            String normalizado = normalizarTelefone(original);

            if (Objects.equals(original, normalizado)) continue; // já está correto

            person.setPhoneNumbers(List.of(
                    new PhoneNumber().setValue(normalizado).setType("mobile")
            ));

            try {
                peopleService.people()
                        .updateContact(person.getResourceName(), person)
                        .setUpdatePersonFields("phoneNumbers")
                        .execute();
                atualizados++;

                // Pausa breve para respeitar os rate limits da API do Google
                Thread.sleep(200);
            } catch (Exception e) {
                // Loga e continua — não aborta o processo por um contato com falha
                System.err.println("Falha ao atualizar " + person.getResourceName() + ": " + e.getMessage());
            }
        }

        return atualizados;
    }

    private ContactDTO normalizar(Person person) {

        String nome = "";
        String telefone = "";
        String email = "";

        if (person.getNames() != null && !person.getNames().isEmpty()) {
            Name n = person.getNames().get(0);
            nome = n.getDisplayName() != null
                    ? n.getDisplayName()
                    : n.getGivenName();
        }

        if (person.getPhoneNumbers() != null && !person.getPhoneNumbers().isEmpty()) {
            telefone = person.getPhoneNumbers().get(0).getValue();
        }

        if (person.getEmailAddresses() != null && !person.getEmailAddresses().isEmpty()) {
            email = person.getEmailAddresses().get(0).getValue();
        }

        return new ContactDTO(
                person.getResourceName(),
                nome,
                telefone,
                email
        );
    }

    public List<ContactDTO> listarContatos() throws IOException {

        List<Person> pessoas = new ArrayList<>();

        String pageToken = null;

        do {

            ListConnectionsResponse response =
                    peopleService.people().connections()
                            .list("people/me")
                            .setPersonFields("names,phoneNumbers,emailAddresses")
                            .setPageSize(1000)
                            .setPageToken(pageToken)
                            .execute();

            if (response.getConnections() != null) {
                pessoas.addAll(response.getConnections());
            }

            pageToken = response.getNextPageToken();

        } while (pageToken != null);

        List<ContactDTO> contatos = pessoas.stream()
                .map(this::normalizar)
                .sorted(Comparator.comparing(ContactDTO::name))
                .toList();

        return contatos;
    }

    public ContactDTO criarContato(ContactDTO dto) throws IOException {

        Person person = new Person();

        person.setNames(List.of(
                new Name().setGivenName(dto.name())
        ));

        person.setPhoneNumbers(List.of(
                new PhoneNumber()
                        .setValue(normalizarTelefone(dto.telephone()))
                        .setType("mobile")
        ));

        if (dto.email() != null && !dto.email().isBlank()) {
            person.setEmailAddresses(List.of(
                    new EmailAddress().setValue(dto.email())
            ));
        }

        Person created =
                peopleService.people()
                        .createContact(person)
                        .execute();

        return normalizar(created);
    }

    public ContactDTO editarContato(String resourceName, ContactDTO dto) throws IOException {

        Person atual =
                peopleService.people()
                        .get(resourceName)
                        .setPersonFields("names,phoneNumbers,emailAddresses")
                        .execute();

        if (dto.name() != null) {
            atual.setNames(List.of(
                    new Name().setGivenName(dto.name())
            ));
        }

        if (dto.telephone() != null) {
            atual.setPhoneNumbers(List.of(
                    new PhoneNumber()
                            .setValue(normalizarTelefone(dto.telephone()))
                            .setType("mobile")
            ));
        }

        if (dto.email() != null) {

            if (dto.email().isBlank()) {
                atual.setEmailAddresses(new ArrayList<>());
            } else {
                atual.setEmailAddresses(List.of(
                        new EmailAddress().setValue(dto.email())
                ));
            }
        }

        Person atualizado =
                peopleService.people()
                        .updateContact(resourceName, atual)
                        .setUpdatePersonFields("names,phoneNumbers,emailAddresses")
                        .execute();

        return normalizar(atualizado);
    }

    public ContactDTO buscarContato(String resourceName) throws IOException {
        Person p = peopleService.people()
                .get(resourceName)
                .setPersonFields("names,phoneNumbers,emailAddresses")
                .execute();
        return normalizar(p);
    }

    public void deletarContato(String resourceName) throws IOException {

        peopleService.people()
                .deleteContact(resourceName)
                .execute();
    }
}