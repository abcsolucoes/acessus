package com.Accessus.Accessus.dto.employee;

import java.time.LocalDate;

public record ImportEmployeeDto(
        String companyCnpj,      // col 0: Empresa CNPJ/CPF — chave pra localizar a empresa
        String department,       // col 1: Departamento
        String cpf,               // col 2: CPF
        String name,               // col 3: Nome do Funcionário
        String position,          // col 4: Função
        String state,              // col 5: UF
        String city,                // col 6: Cidade
        LocalDate admissionDate,  // col 7: Admissão
        String status,             // col 8: Situação Funcionário
        LocalDate leaveStart,      // col 9: Início Afastamento
        LocalDate leaveEnd,        // col 10: Fim Afastamento
        LocalDate vacationStart,  // col 11: Início Férias
        LocalDate vacationEnd     // col 12: Fim Férias
) {
}
