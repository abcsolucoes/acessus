package com.Accessus.Accessus.services;

import com.Accessus.Accessus.dto.ticket.TicketAttachmentDto;
import com.Accessus.Accessus.entities.Ticket;
import com.Accessus.Accessus.entities.TicketAttachment;
import com.Accessus.Accessus.repositories.TicketAttachmentRepository;
import com.Accessus.Accessus.repositories.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TicketAttachmentService {

    private static final long MAX_SIZE = 15L * 1024 * 1024; // 15MB

    @Value("${app.upload-dir:uploads}")
    private String uploadBaseDir;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Transactional
    public TicketAttachmentDto upload(Long ticketId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("Arquivo muito grande. Máximo: 15MB");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket não encontrado"));

        // ── Monta o nome seguro do arquivo ───────────────────────────────────
        // Problema: o nome original pode ter caracteres especiais, espaços,
        // ou até "../../../etc/passwd" (path traversal attack).
        // Solução: gerar um nome único com UUID e manter só a extensão original.

        String original = file.getOriginalFilename();
        String extension = "";
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf(".")).toLowerCase();
        }

        // UUID garante nome único — nunca vai sobrescrever outro arquivo
        String safeFileName = UUID.randomUUID() + extension;

        // ── Cria a pasta se não existir ──────────────────────────────────────
        // Estrutura: uploads/tickets/{ticketId}/
        String dir = uploadBaseDir + "/tickets/" + ticketId;
        new File(dir).mkdirs();

        // ── Valida que o caminho final não sai da pasta (path traversal) ─────
        Path uploadDirPath = Paths.get(dir).toAbsolutePath();
        Path filePath = uploadDirPath.resolve(safeFileName).normalize();
        if (!filePath.startsWith(uploadDirPath)) {
            throw new IllegalArgumentException("Caminho de arquivo inválido");
        }

        // ── Salva o arquivo no disco ─────────────────────────────────────────
        // getInputStream() lê os bytes do arquivo recebido no request
        // StandardCopyOption.REPLACE_EXISTING: se já existir, sobrescreve
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // ── Salva referência no banco ────────────────────────────────────────
        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(original != null ? original : safeFileName); // nome legível para o usuário
        attachment.setFilePath(filePath.toString());                         // caminho real — só o backend usa
        attachment.setContentType(file.getContentType());
        attachment.setUploadedAt(LocalDateTime.now());

        attachmentRepository.save(attachment);

        return toDto(attachment);
    }

    // Devolve o arquivo como Resource para o Spring enviar na resposta HTTP
    // Resource é uma abstração do Spring que representa qualquer fonte de bytes
    public Resource download(Long ticketId, Long attachmentId) throws IOException {
        TicketAttachment attachment = attachmentRepository
                .findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Anexo não encontrado"));

        Path filePath = Paths.get(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Arquivo não encontrado no servidor");
        }

        return resource;
    }

    @Transactional
    public void delete(Long ticketId, Long attachmentId) throws IOException {
        TicketAttachment attachment = attachmentRepository
                .findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Anexo não encontrado"));

        // Remove o arquivo do disco antes de remover do banco
        Files.deleteIfExists(Paths.get(attachment.getFilePath()));

        attachmentRepository.delete(attachment);
    }

    public TicketAttachmentDto toDto(TicketAttachment a) {
        return new TicketAttachmentDto(a.getId(), a.getFileName(), a.getContentType(), a.getUploadedAt());
    }
}
