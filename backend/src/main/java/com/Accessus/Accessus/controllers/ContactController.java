package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.contact.ContactDTO;
import com.Accessus.Accessus.services.GooglePeopleService;
import com.Accessus.Accessus.services.LinhasVivoSyncService;
import com.Accessus.Accessus.services.LogsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/contacts")
public class ContactController {

    private final GooglePeopleService service;

    @Autowired
    private LinhasVivoSyncService linhasVivoSyncService;

    @Autowired
    private LogsService logsService;

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
        ContactDTO created = service.criarContato(dto);
        logsService.createLog("criou o contato de " + created.name() + ", número " + created.telephone());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/people/{contactId}")
    public ResponseEntity<ContactDTO> edit(
            @PathVariable String contactId,
            @RequestBody ContactDTO dto) throws IOException {
        ContactDTO antes = service.buscarContato("people/" + contactId);
        ContactDTO updated = service.editarContato("people/" + contactId, dto);

        StringBuilder alteracoes = new StringBuilder();
        if (!antes.name().equals(updated.name()))
            alteracoes.append("nome: ").append(antes.name()).append(" → ").append(updated.name()).append("; ");
        if (antes.telephone() != null && !antes.telephone().equals(updated.telephone()))
            alteracoes.append("número: ").append(antes.telephone()).append(" → ").append(updated.telephone()).append("; ");
        String emailAntes = antes.email() != null ? antes.email() : "";
        String emailDepois = updated.email() != null ? updated.email() : "";
        if (!emailAntes.equals(emailDepois))
            alteracoes.append("email: ").append(emailAntes.isBlank() ? "(vazio)" : emailAntes)
                    .append(" → ").append(emailDepois.isBlank() ? "(vazio)" : emailDepois).append("; ");

        String msg = "editou o contato de " + updated.name() + ", número " + updated.telephone();
        if (!alteracoes.isEmpty())
            msg += " (Alteração: " + alteracoes.toString().replaceAll("; $", "") + ")";

        logsService.createLog(msg);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/people/{contactId}")
    public ResponseEntity<Void> delete(@PathVariable String contactId) throws IOException {
        ContactDTO contato = service.buscarContato("people/" + contactId);
        service.deletarContato("people/" + contactId);
        logsService.createLog("excluiu o contato de " + contato.name() + ", número " + contato.telephone());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/normalize-phones")
    public ResponseEntity<String> normalizePhones() throws IOException {
        int total = service.normalizarTodosOsTelefones();
        return ResponseEntity.ok(total + " contatos atualizados");
    }

    private static final Set<String> SYNC_AUTORIZADOS = Set.of(
            "guilherme.lima@solucoesabc.com.br",
            "gabriel.silva@solucoesabc.com.br",
            "gabriel.oliveira@solucoesabc.com.br"
    );

    @PostMapping("/sync-linhas-vivo")
    public ResponseEntity<String> syncLinhasVivo(Authentication auth) {
        String email = auth.getName();
        if (!SYNC_AUTORIZADOS.contains(email)) {
            return ResponseEntity.status(403).body("Sem permissão para executar esta ação");
        }
        logsService.createLog("iniciou sincronização manual Linhas Vivo");
        linhasVivoSyncService.sincronizarAsync(email);
        return ResponseEntity.accepted().body("Sincronização iniciada. Pode levar alguns minutos — acompanhe pelos logs do sistema.");
    }
}
