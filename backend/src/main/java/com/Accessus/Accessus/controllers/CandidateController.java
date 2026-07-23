package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.candidate.RegisterCandidateDto;
import com.Accessus.Accessus.dto.candidate.ResponseCandidateDto;
import com.Accessus.Accessus.enums.CandidateStatus;
import com.Accessus.Accessus.services.CandidateService;
import com.Accessus.Accessus.services.FieldService;
import com.Accessus.Accessus.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/candidates")
public class    CandidateController {
    @Autowired
    CandidateService candidateService;

    @Autowired
    FieldService fieldService;

    @Autowired
    UserService userService;

    // O sort vindo da URL (?sort=admissionDate,desc) não carrega null handling — sem isso,
    // NULL ordena diferente em cada banco (Postgres bota NULL primeiro no DESC, H2 bota por último).
    // Forçar nullsLast() em toda ordem deixa o comportamento igual em dev e produção; não tem
    // efeito em colunas sem null (id, name), então é seguro aplicar sempre, sem checar a propriedade.
    private Pageable withNullsLast(Pageable pageable) {
        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(pageable.getSort().stream().map(Sort.Order::nullsLast).toList())
        );
    }

    @GetMapping
    public ResponseEntity<Page<ResponseCandidateDto>> findAll(
            @RequestParam(required = false) CandidateStatus status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(candidateService.findAll(status, withNullsLast(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseCandidateDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.findById(id));
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseCandidateDto> register(
            @RequestPart("data") @Valid RegisterCandidateDto dto,
            @RequestParam(value = "routePhoto", required = false) MultipartFile routePhoto
    ) {
        return ResponseEntity.ok(candidateService.register(dto, routePhoto));
    }

    @GetMapping("/formCandidate/{id}")
    public ResponseEntity<String> formCandidate(@PathVariable Long id) {
        String link = candidateService.formCandidate(id);
        return ResponseEntity.ok(link);
    }

    @PostMapping("/{id}/resend-form")
    public ResponseEntity<Void> resendForm(@PathVariable Long id) {
        candidateService.resendForm(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/send-welcome")
    public ResponseEntity<Void> sendWelcome(@PathVariable Long id) {
        candidateService.sendWelcomeMessage(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/send-route")
    public ResponseEntity<Void> sendRoute(@PathVariable Long id) {
        candidateService.sendRouteNotification(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/create-ti-ticket")
    public ResponseEntity<Void> createTiTicket(@PathVariable Long id) {
        candidateService.createTiTicket(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        candidateService.delete(id);
        return ResponseEntity.ok("Usuário Deletado");
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseCandidateDto> update(
            @PathVariable Long id,
            @RequestPart("data") @Valid RegisterCandidateDto dto,
            @RequestParam(value = "routePhoto", required = false) MultipartFile routePhoto
    ) {
        return ResponseEntity.ok(candidateService.update(id, dto, routePhoto));
    }

    @PostMapping("/changeStatus/{id}")
    public ResponseEntity<ResponseCandidateDto> changeStatus(@PathVariable Long id, @RequestBody CandidateStatus status) {
        return ResponseEntity.ok(candidateService.changeStatus(status, id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ResponseCandidateDto>> search(
            @RequestParam String term,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(candidateService.search(term, withNullsLast(pageable)));
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> generateReport(@PathVariable Long id) {
        byte[] report = candidateService.generate(id);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"relatorio-candidato-" + id + ".docx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ))
                .body(report);
    }

    @GetMapping("/{id}/route-photo")
    public ResponseEntity<byte[]> getRoutePhoto(@PathVariable Long id) {
        var file = candidateService.getRoutePhoto(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(file.content());
    }

    @PostMapping("/{candidateId}/upload")
    public ResponseEntity<Void> upload(
            @PathVariable Long candidateId,
            @RequestParam("fieldId") Long fieldId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("token") String token
    ) {
        fieldService.validateCandidateToken(candidateId, token);
        candidateService.upload(candidateId, fieldId, file);
        return ResponseEntity.ok().build();
    }

    // Rota compartilhada por dois fluxos, igual changeStatus (ver CandidateService): o próprio
    // candidato excluindo um upload durante o formulário público (token) ou o RH excluindo um
    // documento direto na tela do candidato, já autenticado (sem token).
    @DeleteMapping("/{candidateId}/files/{valueId}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long candidateId,
            @PathVariable Long valueId,
            @RequestParam(required = false) String token
    ) {
        if (token != null) {
            fieldService.validateCandidateToken(candidateId, token);
        } else {
            userService.getAuthenticatedUser();
        }
        candidateService.deleteFile(candidateId, valueId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{candidateId}/files/zip")
    public ResponseEntity<StreamingResponseBody> downloadCandidateFilesZip(@PathVariable Long candidateId) {
        StreamingResponseBody body = outputStream -> candidateService.zipCandidateFiles(candidateId, outputStream);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"arquivos-candidato-" + candidateId + ".zip\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(body);
    }

    @GetMapping("/{candidateId}/files/{valueId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long candidateId, @PathVariable Long valueId) {
        var file = candidateService.getFile(candidateId, valueId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(file.content());
    }

    @GetMapping("/validate")
    public ResponseEntity<ResponseCandidateDto> validate(@RequestParam String token) {
        return ResponseEntity.ok(candidateService.validateFormAccess(token));
    }
}
