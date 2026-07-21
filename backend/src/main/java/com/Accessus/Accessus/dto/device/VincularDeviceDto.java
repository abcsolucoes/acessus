package com.Accessus.Accessus.dto.device;

import jakarta.validation.constraints.NotNull;

public record VincularDeviceDto(
        @NotNull
        Long employeeId
) {}
