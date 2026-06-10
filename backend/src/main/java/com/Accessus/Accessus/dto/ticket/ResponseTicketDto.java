package com.Accessus.Accessus.dto.ticket;

import com.Accessus.Accessus.dto.user.ResponseUserDto;
import com.Accessus.Accessus.enums.Department;
import com.Accessus.Accessus.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ResponseTicketDto(
        Long id,
        String title,
        String description,
        TicketStatus status,
        LocalDateTime createdAt,
        ResponseUserDto createdBy,
        Department department,
        ResponseUserDto assignedTo,
        List<TicketAttachmentDto> attachments
) {}
