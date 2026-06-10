package com.Accessus.Accessus.dto.candidate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InviteCandidateDto(
        @NotNull
        @Email
        String email,

        @NotNull
        @Size(min = 3)
        String name
) {}
