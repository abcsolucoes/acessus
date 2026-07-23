package com.Accessus.Accessus.dto.line;

import com.Accessus.Accessus.enums.LineStatus;
import com.Accessus.Accessus.enums.LineType;

public record ResponseLineDto(
        Long id,
        String number,
        String iccid,
        LineType type,
        LineStatus status,
        String notes,
        String employeeName,
        Long employeeId
) {
}
