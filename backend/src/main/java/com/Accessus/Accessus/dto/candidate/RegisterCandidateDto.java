package com.Accessus.Accessus.dto.candidate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record RegisterCandidateDto(
        @NotBlank @Email @Size(max = 150)
        String email,

        @NotBlank @Size(min = 3, max = 100)
        String name,

        @NotBlank @CPF
        String cpf,

        @NotBlank @Size(min = 8, max = 20)
        String telephone,

        @NotBlank @Size(max = 100)
        String position,

        @NotNull
        LocalDate admissionDate,

        @Size(max = 100)
        String routeName,

        @Size(max = 150)
        String teamName
) {}
