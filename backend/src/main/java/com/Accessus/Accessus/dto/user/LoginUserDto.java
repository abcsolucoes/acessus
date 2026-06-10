package com.Accessus.Accessus.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginUserDto(
        @NotBlank @Email @Size(max = 150)
        String email,

        @NotBlank @Size(min = 8, max = 100)
        String password
) {
}
