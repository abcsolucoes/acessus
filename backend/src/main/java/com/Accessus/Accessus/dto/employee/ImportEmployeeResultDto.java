package com.Accessus.Accessus.dto.employee;

import com.Accessus.Accessus.entities.Employee;
import java.util.List;

public record ImportEmployeeResultDto(
        List<Employee> valid,
        List<ImportEmployeeErrorDto> errors
) {}