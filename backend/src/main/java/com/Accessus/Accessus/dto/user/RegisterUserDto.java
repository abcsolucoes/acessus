package com.Accessus.Accessus.dto.user;

import com.Accessus.Accessus.enums.Department;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserDto(
        @NotBlank @Email @Size(max = 150)
        String email,

        @NotBlank @Size(min = 3, max = 100)
        String name,

        @NotBlank
        String role,

        Department department
) {
}
