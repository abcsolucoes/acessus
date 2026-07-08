package com.Accessus.Accessus.dto.employee;

import jakarta.validation.constraints.NotBlank;

public record UpdateEmployeeStatusDto(
        @NotBlank
        String status
) {}
