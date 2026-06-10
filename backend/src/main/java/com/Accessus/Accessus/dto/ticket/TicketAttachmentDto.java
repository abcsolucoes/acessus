package com.Accessus.Accessus.dto.ticket;

import java.time.LocalDateTime;

// O frontend recebe id, nome e tipo — nunca o caminho real no disco
public record TicketAttachmentDto(
        Long id,
        String fileName,
        String contentType,
        LocalDateTime uploadedAt
) {}
