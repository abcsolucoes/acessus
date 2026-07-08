package com.Accessus.Accessus.dto.employee;

public record ImportEmployeeErrorDto(
        int rowNumber,
        String cpf,
        String reason
) {}