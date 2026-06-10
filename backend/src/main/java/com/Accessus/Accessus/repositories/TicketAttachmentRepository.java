package com.Accessus.Accessus.repositories;

import com.Accessus.Accessus.entities.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

    // Busca um anexo pelo id garantindo que pertence ao ticket certo
    // Evita que alguém acesse anexo de outro ticket sabendo só o id do arquivo
    Optional<TicketAttachment> findByIdAndTicketId(Long id, Long ticketId);
}
