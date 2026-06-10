package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.contact.ContactDTO;
import com.Accessus.Accessus.services.GooglePeopleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/contacts")
public class ContactController {

    private final GooglePeopleService service;

    public ContactController(GooglePeopleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ContactDTO>> list() throws IOException {
        return ResponseEntity.ok(service.listarContatos());
    }

    @PostMapping
    public ResponseEntity<ContactDTO> create(@RequestBody ContactDTO dto) throws IOException {
        if (dto.name() == null || dto.name().isBlank()
                || dto.telephone() == null || dto.telephone().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.criarContato(dto));
    }

    @PutMapping("/people/{contactId}")
    public ResponseEntity<ContactDTO> edit(
            @PathVariable String contactId,
            @RequestBody ContactDTO dto) throws IOException {
        return ResponseEntity.ok(service.editarContato("people/" + contactId, dto));
    }

    @DeleteMapping("/people/{contactId}")
    public ResponseEntity<Void> delete(@PathVariable String contactId) throws IOException {
        service.deletarContato("people/" + contactId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/normalize-phones")
    public ResponseEntity<String> normalizePhones() throws IOException {
        int total = service.normalizarTodosOsTelefones();
        return ResponseEntity.ok(total + " contatos atualizados");
    }
}
