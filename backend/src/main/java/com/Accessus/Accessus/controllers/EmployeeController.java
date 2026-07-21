package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.employee.CreateEmployeeDto;
import com.Accessus.Accessus.dto.employee.ResponseEmployeeDto;
import com.Accessus.Accessus.dto.employee.SummarySaveDto;
import com.Accessus.Accessus.entities.Company;
import com.Accessus.Accessus.enums.EmployeeStatus;
import com.Accessus.Accessus.services.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/employee")
public class EmployeeController {
    @Autowired
    EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<Page<ResponseEmployeeDto>> findAll(
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) Boolean ativos,
            @RequestParam(required = false) Boolean hasDevice,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        return ResponseEntity.ok(employeeService.findAll(status, ativos, hasDevice, pageable));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ResponseEmployeeDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.findById(id));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(required = false) Boolean ativos
    ) {
        return ResponseEntity.ok(employeeService.count(status, ativos));
    }

    @PostMapping(value = "/importSave", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SummarySaveDto> importSave(@RequestParam MultipartFile file) throws IOException {
        return ResponseEntity.ok(employeeService.importSave(file));
    }

    @PostMapping
    public ResponseEntity<ResponseEmployeeDto> create(@RequestBody @Valid CreateEmployeeDto dto) {
        return ResponseEntity.ok(employeeService.create(dto));
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> companies() {
        return ResponseEntity.ok(employeeService.listCompanies());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseEmployeeDto> changeStatus(
            @PathVariable Long id,
            @RequestBody EmployeeStatus status
    ) {
        return ResponseEntity.ok(employeeService.changeStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ResponseEmployeeDto>> search(
            @RequestParam String term,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        return ResponseEntity.ok(employeeService.search(term, pageable));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export() throws IOException {
        byte[] file = employeeService.export();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=funcionarios.xlsx")
                .body(file);
    }
}
