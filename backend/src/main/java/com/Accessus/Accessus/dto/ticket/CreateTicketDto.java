package com.Accessus.Accessus.dto.ticket;

import com.Accessus.Accessus.enums.Department;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTicketDto(
        @NotBlank @Size(max = 150)
        String title,

        @NotBlank
        String description,

        // Destino: deve ter department OU assignedToId (validado no service)
        Department department,
        Long assignedToId,

        Long applicantId
) {}
