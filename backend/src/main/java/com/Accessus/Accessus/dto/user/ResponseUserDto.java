package com.Accessus.Accessus.dto.user;

import com.Accessus.Accessus.enums.Department;

public record ResponseUserDto(
        Long id,
        String name,
        String email,
        String role,
        Boolean enabled,
        Department department
) {}
