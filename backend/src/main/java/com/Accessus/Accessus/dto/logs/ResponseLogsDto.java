package com.Accessus.Accessus.dto.logs;

import java.time.LocalDateTime;

public record ResponseLogsDto(
        Long id,
        String userName,
        String description,
        LocalDateTime createdAt
) {}
