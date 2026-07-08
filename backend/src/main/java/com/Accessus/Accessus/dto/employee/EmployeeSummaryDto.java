package com.Accessus.Accessus.dto.employee;

import java.util.Map;

public record EmployeeSummaryDto(
        long total,
        long active,
        Map<String, Long> byStatus
) {}