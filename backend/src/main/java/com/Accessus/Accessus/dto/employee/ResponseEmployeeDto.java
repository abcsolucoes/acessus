package com.Accessus.Accessus.dto.employee;

import com.Accessus.Accessus.dto.device.ResponseDeviceDto;
import com.Accessus.Accessus.entities.Company;
import com.Accessus.Accessus.enums.EmployeeProfile;
import com.Accessus.Accessus.enums.EmployeeStatus;

import java.time.LocalDate;
import java.util.List;

public record ResponseEmployeeDto(
        Long id,
        Company company,
        String department,
        String cpf,
        String name,
        String position,
        String state,
        String city,
        LocalDate admissionDate,
        EmployeeStatus status,
        EmployeeProfile profile,
        LocalDate leaveStart,
        LocalDate leaveEnd,
        LocalDate vacationStart,
        LocalDate vacationEnd,
        boolean importManaged,
        List<ResponseDeviceDto> devices
        ) {
}
