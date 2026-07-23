package com.Accessus.Accessus.dto.line;

import com.Accessus.Accessus.enums.LineType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateLineDto(
        @NotBlank
        String number,
        String iccid,
        @NotNull
        LineType type,
        String notes
) {}