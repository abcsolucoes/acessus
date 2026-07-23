package com.Accessus.Accessus.dto.line;

import com.Accessus.Accessus.enums.LineStatus;

public record ResponseLineDto(
        Long id,
        String number,
        String iccid,
        LineStatus status,
        String notes,
        String employeeName,
        Long employeeId
) {
}