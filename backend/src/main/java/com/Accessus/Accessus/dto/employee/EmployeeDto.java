package com.Accessus.Accessus.dto.employee;

import java.time.LocalDate;

public record EmployeeDto(
        Long id,
        String cpf,
        String name,
        String department,
        String position,
        String state,
        String city,
        LocalDate admissionDate,
        String status,
        String companyName
) {}
