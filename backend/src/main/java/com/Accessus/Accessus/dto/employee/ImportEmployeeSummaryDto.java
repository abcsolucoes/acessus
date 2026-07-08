package com.Accessus.Accessus.dto.employee;

public record ImportEmployeeSummaryDto(
        int created,
        int updated,
        int errors,
        int flaggedForReview
) {}