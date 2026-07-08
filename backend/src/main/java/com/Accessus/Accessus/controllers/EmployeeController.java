package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.employee.EmployeeDto;
import com.Accessus.Accessus.dto.employee.EmployeeSummaryDto;
import com.Accessus.Accessus.dto.employee.ImportEmployeeSummaryDto;
import com.Accessus.Accessus.dto.employee.UpdateEmployeeStatusDto;
import com.Accessus.Accessus.enums.EmployeeStatus;
import com.Accessus.Accessus.services.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/employees")
public class EmployeeController {
    @Autowired
    EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<Page<EmployeeDto>> findAll(
            @RequestParam(required = false) EmployeeStatus status,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        return ResponseEntity.ok(employeeService.findAll(status, pageable));
    }

    @GetMapping("/summary")
    public ResponseEntity<EmployeeSummaryDto> summary() {
        return ResponseEntity.ok(employeeService.summary());
    }

    @PostMapping("/import")
    public ResponseEntity<ImportEmployeeSummaryDto> importEmployees(
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(employeeService.importEmployees(file));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeeDto> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateEmployeeStatusDto dto
    ) {
        return ResponseEntity.ok(employeeService.updateStatus(id, dto.status()));
    }
}
