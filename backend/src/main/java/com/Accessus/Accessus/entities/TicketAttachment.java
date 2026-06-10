package com.Accessus.Accessus.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_ticket_attachment")
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Qual ticket esse anexo pertence
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    // Nome original do arquivo — ex: "print_erro.png"
    // É o que o usuário vai ver na tela
    private String fileName;

    // Caminho completo no disco — ex: "/opt/acessus/uploads/tickets/3/print_erro.png"
    // Nunca exposto ao frontend, só o backend usa para ler o arquivo
    private String filePath;

    // Tipo do arquivo — ex: "image/png", "application/pdf"
    // Usado para o browser saber como abrir/exibir o arquivo
    private String contentType;

    private LocalDateTime uploadedAt;

    public TicketAttachment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
