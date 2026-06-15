package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.ticket.CreateTicketDto;
import com.Accessus.Accessus.dto.ticket.ResponseTicketDto;
import com.Accessus.Accessus.dto.ticket.TicketAttachmentDto;
import com.Accessus.Accessus.enums.TicketStatus;
import com.Accessus.Accessus.services.TicketAttachmentService;
import com.Accessus.Accessus.services.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/tickets")
public class TicketController {
    @Autowired
    TicketService ticketService;

    @Autowired
    TicketAttachmentService attachmentService;

    @GetMapping
    public ResponseEntity<Page<ResponseTicketDto>> findAll(@RequestParam(defaultValue = "mine") String filter, @PageableDefault(size = 20, sort = "id", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ticketService.findForCurrentUser(filter, pageable));
    }

    @PostMapping
    public ResponseEntity<ResponseTicketDto> create(@RequestBody @Valid CreateTicketDto dto) {
        return ResponseEntity.ok(ticketService.create(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseTicketDto> changeStatus(@PathVariable Long id, @RequestBody TicketStatus newStatus) {
        return ResponseEntity.ok(ticketService.changeStatus(id, newStatus));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseTicketDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.findById(id));
    }

    // Recebe o arquivo via multipart/form-data
    // @RequestParam("file") mapeia o campo "file" do formulário
    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachmentDto> upload(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(attachmentService.upload(id, file));
    }

    // Devolve o arquivo para o browser abrir/baixar
    // Content-Disposition: inline → browser tenta exibir (imagem, PDF)
    // Content-Disposition: attachment → força download
    @GetMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Resource> download(
            @PathVariable Long id,
            @PathVariable Long attachmentId) throws Exception {
        Resource resource = attachmentService.download(id, attachmentId);
        String contentType = resource.getURL().openConnection().getContentType();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long id,
            @PathVariable Long attachmentId) throws Exception {
        attachmentService.delete(id, attachmentId);
        return ResponseEntity.noContent().build();
    }
}
