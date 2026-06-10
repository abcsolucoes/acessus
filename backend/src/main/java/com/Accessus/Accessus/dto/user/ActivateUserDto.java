package com.Accessus.Accessus.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActivateUserDto(
        @NotBlank @Size(min = 8, max = 100)
        String password,

        @NotBlank
        String token
) {
}
