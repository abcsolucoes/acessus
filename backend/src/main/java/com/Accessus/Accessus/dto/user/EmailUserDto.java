package com.Accessus.Accessus.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record EmailUserDto(
        @NotNull
        @Email
        String email
) {}
