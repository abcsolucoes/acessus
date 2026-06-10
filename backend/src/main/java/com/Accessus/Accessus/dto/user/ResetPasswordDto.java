package com.Accessus.Accessus.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordDto(
        @NotBlank @Email
        String email,

        @NotBlank @Size(min = 6, max = 6)
        String code,

        @NotBlank @Size(min = 8, max = 100)
        String password
) {
}
