package com.Accessus.Accessus.dto.employee;

import com.Accessus.Accessus.enums.EmployeeProfile;
import com.Accessus.Accessus.enums.EmployeeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

// Cadastro manual (sócio ou prestador de serviço que não vem pela planilha do RH).
// Só nome e CPF são obrigatórios de fato — o resto é preenchido quando disponível.
// Empresa não entra aqui: todo cadastro manual é vinculado automaticamente à
// empresa de código 00009 (ver EmployeeService.create).
public record CreateEmployeeDto(
        @NotBlank @Size(min = 3, max = 100)
        String name,

        @NotBlank @CPF
        String cpf,

        @NotNull
        EmployeeProfile profile,

        String department,

        String position,

        @Size(min = 2, max = 2)
        String state,

        String city,

        LocalDate admissionDate,

        EmployeeStatus status
) {
}
