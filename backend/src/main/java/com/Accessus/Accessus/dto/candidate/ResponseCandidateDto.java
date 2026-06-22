package com.Accessus.Accessus.dto.candidate;

import com.Accessus.Accessus.enums.CandidateStatus;

import java.time.LocalDate;

public record ResponseCandidateDto(
        Long id,
        String name,
        String cpf,
        String email,
        String telephone,
        String position,
        LocalDate admissionDate,
        CandidateStatus candidateStatus,
        Boolean formEnabled,
        String routeName,
        String teamName
) {}
