package com.Accessus.Accessus.dto.candidate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

// Só nome/cpf/telefone são obrigatórios no cadastro — o resto (inclusive dados de
// endereço/nascimento/e-mail) o próprio candidato preenche depois no formulário de
// admissão. Esses campos continuam aqui (opcionais) porque o RH pode editar/corrigir
// os dados do candidato mais tarde, reaproveitando o mesmo DTO.
public record RegisterCandidateDto(
        // @Email sozinho aceita "usuario@dominio" sem TLD (sintaxe válida pela RFC, mas a
        // Dysrup rejeita — exige domínio com ponto, ex: dominio.com). O Pattern cobre esse caso.
        @Email @Size(max = 150)
        @Pattern(regexp = "^$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$", message = "E-mail precisa ter um domínio válido (ex: nome@dominio.com)")
        String email,

        @NotBlank @Size(min = 3, max = 100)
        String name,

        @NotBlank @CPF
        String cpf,

        @NotBlank @Size(min = 8, max = 20)
        String telephone,

        @Size(max = 100)
        String position,

        LocalDate admissionDate,

        LocalDate birthDate,

        @Size(max = 9)
        String zipcode,

        @Size(max = 20)
        String addressNumber,

        @Size(max = 100)
        String complement,

        @Size(max = 100)
        String routeName,

        @Size(max = 150)
        String teamName
) {}
