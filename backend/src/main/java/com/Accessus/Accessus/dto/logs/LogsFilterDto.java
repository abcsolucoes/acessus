package com.Accessus.Accessus.dto.logs;

import java.time.LocalDate;

public record LogsFilterDto(
        String userName,
        LocalDate startDate,
        LocalDate endDate
) {}
