package com.Accessus.Accessus.dto.device;

import com.Accessus.Accessus.enums.DeviceSituacao;

public record ResponseDeviceDto(
        Long id,
        Long pulsusId,
        String manufacturer,
        String model,
        String serialNumber,
        String group,
        String imei1,
        String imei2,
        String tagDevice,
        DeviceSituacao situacao,
        String employeeName,
        Long employeeId
) {
}
