package com.Accessus.Accessus.controllers;

import com.Accessus.Accessus.dto.fieldValue.FieldValueResponseDto;
import com.Accessus.Accessus.dto.fieldValue.SaveFieldValuesDto;
import com.Accessus.Accessus.services.FieldService;
import com.Accessus.Accessus.services.FieldValueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/fieldValue")
public class FieldValueController {
    @Autowired
    FieldValueService fieldValueService;

    @Autowired
    FieldService fieldService;

    @PostMapping("/{candidateId}/values")
    public ResponseEntity<Void> saveValues(
            @PathVariable Long candidateId,
            @RequestParam String token,
            @RequestBody SaveFieldValuesDto dto) {
        fieldService.validateCandidateToken(candidateId, token);
        fieldValueService.saveFieldValues(candidateId, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{candidateId}/values")
    public ResponseEntity<List<FieldValueResponseDto>> findValues(
            @PathVariable Long candidateId,
            @RequestParam String token) {
        fieldService.validateCandidateToken(candidateId, token);
        return ResponseEntity.ok(fieldValueService.findValuesByCandidate(candidateId));
    }
}
