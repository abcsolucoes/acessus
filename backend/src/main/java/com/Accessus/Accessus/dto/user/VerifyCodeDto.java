package com.Accessus.Accessus.dto.user;

public record VerifyCodeDto(
        String email,
        String code
) {}