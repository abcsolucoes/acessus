package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.candidate.RegisterCandidateDto;
import com.Accessus.Accessus.dto.candidate.ResponseCandidateDto;
import com.Accessus.Accessus.enums.CandidateStatus;
import com.Accessus.Accessus.services.CandidateService;
import com.Accessus.Accessus.services.FieldService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/candidates")
public class    CandidateController {
    @Autowired
    CandidateService candidateService;

    @Autowired
    FieldService fieldService;

    @GetMapping
    public ResponseEntity<Page<ResponseCandidateDto>> findAll(
            @RequestParam(required = false) CandidateStatus status,
            @PageableDefault(size = 20, sort = "id") Pageable pageable
    ) {
        return ResponseEntity.ok(candidateService.findAll(status, pageable));
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(candidateService.search(term, PageRequest.of(page, size)));
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

    @GetMapping("/{candidateId}/files/zip")
    public ResponseEntity<byte[]> downloadCandidateFilesZip(@PathVariable Long candidateId) {
        byte[] zip = candidateService.zipCandidateFiles(candidateId);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"arquivos-candidato-" + candidateId + ".zip\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zip);
    }

    @GetMapping("/validate")
    public ResponseEntity<ResponseCandidateDto> validate(@RequestParam String token) {
        return ResponseEntity.ok(candidateService.validateFormAccess(token));
    }
}
