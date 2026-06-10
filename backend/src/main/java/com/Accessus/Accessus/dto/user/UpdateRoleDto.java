package com.Accessus.Accessus.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UpdateRoleDto(
        @NotBlank
        String role
) {}
