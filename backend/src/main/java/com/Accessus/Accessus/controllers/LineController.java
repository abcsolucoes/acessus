package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.line.CreateLineDto;
import com.Accessus.Accessus.dto.line.LineImportResultDto;
import com.Accessus.Accessus.dto.line.LinkLineDto;
import com.Accessus.Accessus.dto.line.ResponseLineDto;
import com.Accessus.Accessus.enums.LineStatus;
import com.Accessus.Accessus.services.LineService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/lines")
public class LineController {
    @Autowired
    LineService lineService;

    @GetMapping
    public ResponseEntity<Page<ResponseLineDto>> findAll(
            @RequestParam(required = false) LineStatus status,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(lineService.findAll(status, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ResponseLineDto>> search(
            @RequestParam String term,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(lineService.search(term, pageable));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam(required = false) LineStatus status) {
        return ResponseEntity.ok(lineService.count(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseLineDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(lineService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ResponseLineDto> create(@RequestBody @Valid CreateLineDto dto) {
        return ResponseEntity.ok(lineService.create(dto));
    }

    @PatchMapping("/{id}/link")
    public ResponseEntity<ResponseLineDto> link(@PathVariable Long id, @RequestBody @Valid LinkLineDto dto) {
        return ResponseEntity.ok(lineService.link(id, dto.employeeId()));
    }

    @PatchMapping("/{id}/unlink")
    public ResponseEntity<ResponseLineDto> unlink(@PathVariable Long id) {
        return ResponseEntity.ok(lineService.unlink(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseLineDto> updateStatus(@PathVariable Long id, @RequestBody LineStatus status) {
        return ResponseEntity.ok(lineService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        lineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // TEMPORÁRIO — só para a migração única da planilha legada. Apagar junto com
    // LineService.importLegacySpreadsheet (e os helpers dela) e LineImportResultDto
    // depois que a carga inicial for feita e conferida.
    @PostMapping("/import-legacy")
    public ResponseEntity<LineImportResultDto> importLegacy(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(lineService.importLegacySpreadsheet(file));
    }
}
