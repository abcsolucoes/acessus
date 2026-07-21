package com.Accessus.Accessus.dto.history;

import com.Accessus.Accessus.dto.device.ResponseDeviceDto;
import com.Accessus.Accessus.dto.employee.ResponseEmployeeDto;
import com.Accessus.Accessus.enums.HistoryAction;

import java.time.LocalDateTime;

public record ResponseHistoryDto(
        Long id,
        ResponseDeviceDto device,
        ResponseEmployeeDto employee,
        HistoryAction actionType,
        LocalDateTime createdAt
) {
}