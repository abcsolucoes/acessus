package com.Accessus.Accessus.dto.candidate;

import com.Accessus.Accessus.enums.CandidateStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ResponseCandidateDto(
        Long id,
        String name,
        String cpf,
        String email,
        String telephone,
        String position,
        LocalDate admissionDate,
        LocalDate birthDate,
        String zipcode,
        String addressNumber,
        String complement,
        CandidateStatus candidateStatus,
        Boolean formEnabled,
        String routeName,
        String teamName,
        LocalDateTime welcomeMessageSentAt,
        LocalDateTime routeDataSentAt,
        LocalDateTime dysrupRegisteredAt,
        LocalDateTime tiTicketCreatedAt,
        Boolean hasRoutePhoto
) {}
