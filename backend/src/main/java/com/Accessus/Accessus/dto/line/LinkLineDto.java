package com.Accessus.Accessus.dto.line;

import jakarta.validation.constraints.NotNull;

public record LinkLineDto(
        @NotNull
        Long employeeId
) {}