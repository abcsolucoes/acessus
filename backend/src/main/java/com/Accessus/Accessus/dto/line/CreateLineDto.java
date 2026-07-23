package com.Accessus.Accessus.dto.line;

import jakarta.validation.constraints.NotBlank;

public record CreateLineDto(
        @NotBlank
        String number,
        String iccid,
        String notes
) {}